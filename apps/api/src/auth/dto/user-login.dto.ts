import { IsString, IsNotEmpty, IsMobilePhone } from 'class-validator'

export class UserLoginDto {
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  mobileNumber!: string
}

export class UserVerifyOtpDto {
  @IsMobilePhone('en-IN')
  @IsNotEmpty()
  mobileNumber!: string

  @IsString()
  @IsNotEmpty()
  otp!: string
}
