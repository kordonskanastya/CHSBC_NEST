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
        subject: 'SYSTEM MANAGEMENT EDUCATION TRAJECTORY',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{
            box-sizing: border-box;
        }
        .content{
            width: 100%;
            background: #003366;
        }
        .header{
           padding: 30px 15px;
        }
        .header_img{
            border: none;
            text-align: center;
            margin: 0 auto;
            display: block;
        }
        .info_block{
            width: calc(100% - 2px);
            background: white;
            border: 1px solid #003366;
        }
        #info_blocK_title{
            padding: 10px;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
        }
        #info_block_subtitle{
            font-size: 18px;
            font-weight: 300;
            text-align: center;
            padding: 0 10px;
        }
        .LinkToSite{
            color: #003366;
            font-weight: 700;
            font-size: 20px;
            text-underline-position: under;
        }
        .LinkToSite:hover,
        .LinkToSite:active,
        .LinkToSite:focus {
            color: #011224;
            font-weight: 700;
        }
        .info_block_subtitle_left_and_top{
            font-size: 18px;
            font-weight: 300;
            text-align: left;
            padding: 30px 10px 0 10px;
        }
        .info_block_subtitle_left{
            font-size: 18px;
            font-weight: 300;
            text-align: left;
            padding: 0 10px;
        }
        .footer{
            background: #003366;
            padding: 15px 10px;
        }
        .info_blocK_title_white{
            padding: 10px;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
            color: white;
        }
        .links{
            display: block;
            text-align: center;
 
        }
        .links > a {
            margin-left: 20px;
            display: inline-block;
        }
        .icon{
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: inline-block;
        }
    </style>
</head>
<body>
<div class="content">
    <header class="header">
        <img class="header_img" src="https://ltdfoto.ru/images/2022/10/07/logo1e769e1a436c4b798.png" alt="ЧЕРКАСЬКИЙ ДЕРЖАВНИЙ БІЗНЕС - КОЛЕДЖ" />
    </header>
    <div class="info_block">
        <h3 class="info_block_subtitle_left">Привіт <b>${user.firstName} ${user.lastName}</b>, ми раді тебе вітати в нашій електроній системі SMET</h3>
        <h3 class="info_block_subtitle_left">Нам надійшов запит на створення для тебе нового <b>паролю</b></h3>
        <h3 class="info_block_subtitle_left">Для того щоб його використати тобі потрібно перейти в <a class="LinkToSite" href="http://csbcstage.web.app"> SMET</a></h3>
        <h3 class="info_block_subtitle_left_and_top">Нові логін та пароль для авторизації в системі:</h3>
        <h3 class="info_block_subtitle_left">Логін: ${user.email}</h3>
        <h3 class="info_block_subtitle_left">Пароль: ${user.password}</h3>
        <h3 class="info_block_subtitle_left_and_top">Дякуємо. З повагою ЧДБК</h3>
    </div>
    <div class="footer">
        <h1 class="info_blocK_title_white">Наші ресурси: </h1>
        <div class="links">
            <a  href="http://csbc.edu.ua/"><img class="icon" src="https://img.icons8.com/external-flaticons-flat-flat-icons/40/000000/external-college-university-flaticons-flat-flat-icons.png" alt="ЧДБК" border="0" /></a>
            <a  href="http://78.137.2.119:1919/m72/"><img class="icon" src="https://img.icons8.com/color/48/000000/moodle.png" alt="Moodle" border="0" /></a>
            <a  href="http://78.137.2.119:2929/"><img class="icon" src="https://img.icons8.com/nolan/40/moodle.png" alt="Moodle 2022" border="0" /></a>
            <a  href="https://www.youtube.com/channel/UCEpgZ7OwaEQdM5toM-AR7PA"><img class="icon" src="https://img.icons8.com/plasticine/40/000000/youtube-play--v2.png" alt="Youtube" border="0" /></a>
            <a  href="https://www.facebook.com/CHSBC2021/"><img class="icon" src="https://img.icons8.com/plasticine/40/000000/facebook-new.png" alt="Facebook" border="0" /></a>
            <a  href="https://www.instagram.com/csbc.edu.ua/"><img class="icon" src="https://img.icons8.com/fluency/40/000000/instagram-new.png" alt="Instagram" border="0" /></a>
        </div>
 
    </div>
</div>
</body>
</body>
</html>`,
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
        subject: 'SYSTEM MANAGEMENT EDUCATION TRAJECTORY',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{
            box-sizing: border-box;
        }
        .content{
            width: 100%;
            background: #003366;
        }
        .header{
           padding: 30px 15px;
        }
        .header_img{
            border: none;
            text-align: center;
            margin: 0 auto;
            display: block;
        }
        .info_block{
            width: calc(100% - 2px);
            background: white;
            border: 1px solid #003366;
        }
        #info_blocK_title{
            padding: 10px;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
        }
        #info_block_subtitle{
            font-size: 18px;
            font-weight: 300;
            text-align: center;
            padding: 0 10px;
        }
        .LinkToSite{
            color: #003366;
            font-weight: 700;
            font-size: 20px;
            text-underline-position: under;
        }
        .LinkToSite:hover,
        .LinkToSite:active,
        .LinkToSite:focus {
            color: #011224;
            font-weight: 700;
        }
        .info_block_subtitle_left_and_top{
            font-size: 18px;
            font-weight: 300;
            text-align: left;
            padding: 30px 10px 0 10px;
        }
        .info_block_subtitle_left{
            font-size: 18px;
            font-weight: 300;
            text-align: left;
            padding: 0 10px;
        }
        .footer{
            background: #003366;
            padding: 15px 10px;
        }
        .info_blocK_title_white{
            padding: 10px;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
            color: white;
        }
        .links{
            display: block;
            text-align: center;
 
        }
        .links > a {
            margin-left: 20px;
            display: inline-block;
        }
        .icon{
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: inline-block;
        }
    </style>
</head>
<body>
<div class="content">
    <header class="header">
        <img class="header_img" src="https://ltdfoto.ru/images/2022/10/07/logo1e769e1a436c4b798.png" alt="ЧЕРКАСЬКИЙ ДЕРЖАВНИЙ БІЗНЕС - КОЛЕДЖ" />
    </header>
    <div class="info_block">
        <h3 class="info_block_subtitle_left">Привіт <b>${user.firstName} ${user.lastName}</b>, ми раді тебе вітати в нашій електроній системі SMET</h3>
        <h3 class="info_block_subtitle_left">Нам надійшов запит на створення для тебе нового <b>паролю</b></h3>
        <h3 class="info_block_subtitle_left">Для того щоб його використати тобі потрібно перейти в <a class="LinkToSite" href="http://csbcstage.web.app"> SMET</a></h3>
        <h3 class="info_block_subtitle_left_and_top">Нові логін та пароль для авторизації в системі:</h3>
        <h3 class="info_block_subtitle_left">Логін: ${user.email}</h3>
        <h3 class="info_block_subtitle_left">Пароль: ${password}</h3>
        <h3 class="info_block_subtitle_left_and_top">Дякуємо. З повагою ЧДБК</h3>
    </div>
    <div class="footer">
        <h1 class="info_blocK_title_white">Наші ресурси: </h1>
        <div class="links">
            <a  href="http://csbc.edu.ua/"><img class="icon" src="https://img.icons8.com/external-flaticons-flat-flat-icons/40/000000/external-college-university-flaticons-flat-flat-icons.png" alt="ЧДБК" border="0" /></a>
            <a  href="http://78.137.2.119:1919/m72/"><img class="icon" src="https://img.icons8.com/color/48/000000/moodle.png" alt="Moodle" border="0" /></a>
            <a  href="http://78.137.2.119:2929/"><img class="icon" src="https://img.icons8.com/nolan/40/moodle.png" alt="Moodle 2022" border="0" /></a>
            <a  href="https://www.youtube.com/channel/UCEpgZ7OwaEQdM5toM-AR7PA"><img class="icon" src="https://img.icons8.com/plasticine/40/000000/youtube-play--v2.png" alt="Youtube" border="0" /></a>
            <a  href="https://www.facebook.com/CHSBC2021/"><img class="icon" src="https://img.icons8.com/plasticine/40/000000/facebook-new.png" alt="Facebook" border="0" /></a>
            <a  href="https://www.instagram.com/csbc.edu.ua/"><img class="icon" src="https://img.icons8.com/fluency/40/000000/instagram-new.png" alt="Instagram" border="0" /></a>
        </div>
 
    </div>
</div>
</body>
</body>
</html>`,
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
