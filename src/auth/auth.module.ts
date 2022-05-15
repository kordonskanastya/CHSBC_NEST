import { forwardRef, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../api/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { jwtConstants } from './constants'
import { JwtAuthStrategy } from './jwt-auth.strategy'
import { LocalStrategy } from './local.strategy'
import { MailerModule } from '@nestjs-modules/mailer'
import { configService } from '../config/config.service'

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: configService.getJWTTokenLifetime(),
      },
    }),
    MailerModule.forRoot({
      transport: {
        service: configService.getMailService(),
        host: configService.getMailHost(),
        port: configService.getMailPort(),
        secure: configService.getMailSecure(),
        auth: {
          user: configService.getMailAuthUser(),
          pass: configService.getMailAuthPassword(),
        },
      },
      defaults: {
        from: configService.getMailFrom(),
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtAuthStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
