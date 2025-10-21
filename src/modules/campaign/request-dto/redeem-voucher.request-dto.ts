import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemVoucherRequestDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID v4' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString({ message: 'Idempotency key must be a string' })
  @IsNotEmpty({ message: 'Idempotency key is required' })
  idempotencyKey: string;
}
