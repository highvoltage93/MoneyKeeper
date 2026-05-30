import { CategoryType, TransactionType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Matches } from "class-validator";

export class QueryTransactionsDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

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
  @IsEnum(CategoryType)
  categoryType?: CategoryType;
}
