import { BadRequestException, Body, Controller, Get, HttpCode, Patch, Post, Request, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { CreateUserResponseDto } from '../api/users/dto/create-user-response.dto'
import { AuthService } from './auth.service'
import { ChangePasswordDto } from './dto/change-password.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { ForgotPasswordResultDto } from './dto/result/forgot-password.dto'
import { LoginUserResultDto } from './dto/result/login-user.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { LoginAuthGuard } from './login-auth.guard'
import { ROLE } from './roles/role.enum'
import { MinRole } from './roles/roles.decorator'
import { RolesGuard } from './roles/roles.guard'
import { JwtRefreshGuard } from './jwt-refresh.guard'
import { RegisterDto } from './dto/register.dto'
import { capitalize } from '../utils/common'
import { Entities } from '../api/common/enums'
import { configService } from '../config/config.service'

@Controller(Entities.AUTH)
@ApiTags(capitalize(Entities.AUTH))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LoginAuthGuard)
  @ApiResponse({ type: LoginUserResultDto, description: 'Login user' })
  async login(@Request() request, @Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(request.user)
  }

  @Get('refresh-token')
  @UseGuards(JwtAuthGuard, JwtRefreshGuard)
  @ApiOkResponse({ type: LoginUserResultDto, description: 'Refresh token' })
  async refresh(@Request() request) {
    return await this.authService.refreshToken(request.user?.sub, request.headers.authorization)
  }

  // TODO: remove in production
  @Post('register')
  @ApiCreatedResponse({ type: CreateUserResponseDto, description: 'Register user' })
  async register(@Body() data: RegisterDto): Promise<LoginUserResultDto> {
    if (configService.getEnvName() === 'production') {
      throw new BadRequestException('This endpoint does not work on the product')
    }

    return await this.authService.register(data)
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiResponse({ type: ForgotPasswordResultDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResultDto> {
    return await this.authService.forgotPassword(forgotPasswordDto)
  }

  @Patch('change-password')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource. Check user role' })
  @MinRole(ROLE.STUDENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto, req.user)
  }
}
