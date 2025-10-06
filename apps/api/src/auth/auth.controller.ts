import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'
import { IsEmail, IsString } from 'class-validator'

class AdminLoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

@Controller('auth/admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async adminLogin(@Body() body: AdminLoginDto) {
    try {
      const result = await this.authService.adminLogin(body)
      return result
    } catch (error) {
      throw error
    }
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('verify')
  async verify(@Request() req: any) {
    return this.authService.adminVerify(req.user)
  }
}


