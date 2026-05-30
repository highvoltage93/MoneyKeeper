import { CategoryType } from "@prisma/client";
import { IsEnum, IsHexColor, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  label!: string;

  @IsEnum(CategoryType)
  type!: CategoryType;

  @IsString()
  icon!: string;

  @IsHexColor()
  color!: string;

  @IsOptional()
  @IsHexColor()
  gradientFrom?: string;

  @IsOptional()
  @IsHexColor()
  gradientTo?: string;
}
