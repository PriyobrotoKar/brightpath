import { IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Role } from '@brightpath/db';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsUrl()
  @IsOptional()
  profilePicture?: string;
}
