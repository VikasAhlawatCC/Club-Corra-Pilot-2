import { Module } from '@nestjs/common'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { AdminGuard } from './guards/admin.guard'
import { S3Service } from './s3/s3.service'

@Module({
  providers: [JwtAuthGuard, AdminGuard, S3Service],
  exports: [JwtAuthGuard, AdminGuard, S3Service],
})
export class CommonModule {}


