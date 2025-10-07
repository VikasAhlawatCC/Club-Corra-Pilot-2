import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { UserGuard } from '../common/guards/user.guard'
import { IsEmail, IsString } from 'class-validator'
import { UserLoginDto, UserVerifyOtpDto } from './dto/user-login.dto'

class AdminLoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Admin endpoints
  @Post('admin/login')
  async adminLogin(@Body() body: AdminLoginDto) {
    try {
      const result = await this.authService.adminLogin(body)
      return result
    } catch (error) {
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/verify')
  async adminVerify(@Request() req: any) {
    return this.authService.adminVerify(req.user)
  }

  // User endpoints
  @Post('login-signup')
  async userLoginSignup(@Body() body: UserLoginDto) {
    try {
      const result = await this.authService.userLoginSignup(body)
      return result
    } catch (error) {
      throw error
    }
  }

  @Post('verify-otp')
  async userVerifyOtp(@Body() body: UserVerifyOtpDto) {
    try {
      const result = await this.authService.userVerifyOtp(body)
      return result
    } catch (error) {
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, UserGuard)
  @Post('user/verify')
  async userVerify(@Request() req: any) {
    return this.authService.userVerify(req.user)
  }
}


