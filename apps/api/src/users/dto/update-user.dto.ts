import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}

export class UpdateUserEmailDto {
  @IsEmail()
  email!: string;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

export class UpdatePaymentDetailsDto {
  @IsOptional()
  @IsString()
  upiId?: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;
}
