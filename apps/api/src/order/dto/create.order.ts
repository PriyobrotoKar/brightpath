import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  course: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsNumberString()
  @IsNotEmpty()
  phone: string;
}
