import { AccountGroup, AccountType, Currency } from "@prisma/client";
import { IsEnum, IsHexColor, IsNumber, IsString, Min } from "class-validator";

export class CreateAccountDto {
  @IsString()
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;

  @IsEnum(Currency)
  currency!: Currency;

  @IsNumber()
  @Min(0)
  balance!: number;

  @IsString()
  icon!: string;

  @IsHexColor()
  color!: string;

  @IsEnum(AccountGroup)
  group!: AccountGroup;
}
