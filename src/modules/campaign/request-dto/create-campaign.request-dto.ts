import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateCampaignRequestDto {
  @IsString({ message: 'Campaign name must be a string' })
  @IsNotEmpty({ message: 'Campaign name is required' })
  @MaxLength(100, { message: 'Campaign name must not exceed 100 characters' })
  name: string;

  @IsInt({ message: 'Total must be an integer number' })
  @IsPositive({ message: 'Total must be a positive number' })
  total: number;
}