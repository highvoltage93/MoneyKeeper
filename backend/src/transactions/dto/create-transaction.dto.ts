import { Currency, TransactionType } from "@prisma/client";
import { IsArray, IsEnum, IsOptional, IsString, Matches } from "class-validator";

export class CreateTransactionDto {
  @IsString()
  name!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @Matches(/^\d+([.,]\d{1,2})?$/)
  amount!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsEnum(Currency)
  currency!: Currency;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
