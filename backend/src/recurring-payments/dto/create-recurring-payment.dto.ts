import { IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

export class CreateRecurringPaymentDto {
  @IsString()
  title!: string;

  @Matches(/^\d+([.,]\d{1,2})?$/)
  amount!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  categoryLabel!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  nextDate!: string;

  @IsString()
  frequency!: string;

  @IsInt()
  @Min(0)
  alertDays!: number;

  @IsString()
  icon!: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
