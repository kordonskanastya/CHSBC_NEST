import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '../api/users/entities/user.entity'
import { UsersService } from '../api/users/users.service'
import { configService } from '../config/config.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ForgotPasswordResultDto } from './dto/result/forgot-password.dto'
import { LoginUserResultDto } from './dto/result/login-user.dto'
import { MailerService } from '@nestjs-modules/mailer'
import { SentMessageInfo } from 'nodemailer'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcrypt'
import { plainToClass } from 'class-transformer'
import { TokenDto } from './dto/token.dto'
import { SendMailDto } from './dto/send-mail.dto'
import { AuthUserDto } from './dto/auth-user.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    public readonly mailerService: MailerService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user: User = await this.usersService.findOneByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Логін або пароль введено невірно,перевірте і спробуйте знову.')
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      return user
    }

    throw new UnauthorizedException('Логін або пароль введено невірно,перевірте і спробуйте знову.')
  }

  createRefreshToken(id: number) {
    return this.jwtService.sign(
      {
        sub: id,
        refresh: true,
      },
      {
        expiresIn: configService.getJWTRefreshTokenLifetime(),
      },
    )
  }

  async login({ id, role }: AuthUserDto) {
    const refreshToken = this.createRefreshToken(id)

    await this.usersService.addRefreshToken(id, refreshToken)

    const user = await this.usersService.findOne(id)

    return plainToClass(
      LoginUserResultDto,
      {
        accessToken: this.jwtService.sign({
          sub: id,
          role,
        }),
        refreshToken,
        ...user,
      },
      {
        excludeExtraneousValues: true,
      },
    )
  }

  async refreshToken(id: number, authorization: string): Promise<LoginUserResultDto> {
    const requestToken = authorization.replace(/^Bearer /, '')

    await this.usersService.removeRefreshToken(id, requestToken)

    const user = await this.usersService.findOne(id)

    return this.login(
      plainToClass(AuthUserDto, user, {
        excludeExtraneousValues: true,
      }),
    )
  }

  async register(data: RegisterDto): Promise<LoginUserResultDto> {
    const user = await this.usersService.create(data)
    return await this.login(user)
  }

  async sendMailCreatePassword(user: SendMailDto) {
    if (!user.email) {
      return
    }

    try {
      const info: SentMessageInfo = await this.mailerService.sendMail({
        from: configService.getMailFrom(),
        to: user.email,
        subject: 'Create Password',
        html: `
            <h3>Hello ${user.firstName} ${user.lastName}!</h3>
            <p>Password: ${user.password}</p>
        `,
      })

      if (info.accepted.length > 0) {
        this.logger.debug(
          'Email was sent: ' +
            (info['messageId'] ? 'id: ' + info['messageId'] : '') +
            ' ' +
            (info['response'] ? '| response: ' + info['response'] : ''),
        )
      }
    } catch (err) {
      this.logger.error(err)
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResultDto> {
    const user = await this.usersService.findOneByEmail(forgotPasswordDto.email)

    if (!user) {
      throw new NotFoundException('Користувача з таким email не знайдено')
    }

    if (!user.email) {
      throw new BadRequestException('Не знайдено жодної електронної адреси для цього користувача.')
    }

    const password = Buffer.from(Math.random().toString()).toString('base64').substring(0, 8)

    user.password = password

    await user.hashPassword()

    await user.save({
      data: {
        user,
      },
    })

    try {
      const info: SentMessageInfo = await this.mailerService.sendMail({
        from: configService.getMailFrom(),
        to: user.email,
        subject: 'Forgot Password',
        html: `
            <h3>Hello ${user.firstName} ${user.lastName}!</h3>
            <p>Password: ${password}</p>
        `,
      })

      const result: ForgotPasswordResultDto = {
        success: info.accepted ? info.accepted.length > 0 : false,
        message: 'The email with the recovery link is sent',
      }

      if (result.success) {
        this.logger.debug(
          'Email was sent: ' +
            (info['messageId'] ? 'id: ' + info['messageId'] : '') +
            ' ' +
            (info['response'] ? '| response: ' + info['response'] : ''),
        )
      }

      return result
    } catch (err) {
      this.logger.error(err)

      return {
        success: false,
        message: JSON.stringify(err),
      }
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userData: TokenDto) {
    const user = await this.usersService.findOneByEmail(changePasswordDto.email)
    if (!user) {
      throw new BadRequestException(`Користувача з email ${changePasswordDto.email} не знайдено`)
    }
    if (await bcrypt.compare(changePasswordDto.oldPassword, user.password)) {
      return await this.usersService.update(user.id, { password: changePasswordDto.newPassword }, userData)
    } else {
      throw new BadRequestException('Старий пароль не співпадає')
    }
  }
}
