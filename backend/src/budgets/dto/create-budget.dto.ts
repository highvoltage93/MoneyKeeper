import { IsHexColor, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsString()
  categoryLabel!: string;

  @Matches(/^\d+([.,]\d{1,2})?$/)
  amount!: string;

  @IsInt()
  @Min(1)
  @Max(100)
  alertAt!: number;

  @IsHexColor()
  color!: string;
}
