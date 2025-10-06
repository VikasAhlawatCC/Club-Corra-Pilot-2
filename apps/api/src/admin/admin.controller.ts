import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { AdminGuard } from '../common/guards/admin.guard'

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  @Get('health')
  health() {
    return { ok: true }
  }
}


