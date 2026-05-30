import { IsHexColor, IsString, Matches } from "class-validator";

export class CreateGoalDto {
  @IsString()
  title!: string;

  @Matches(/^\d+([.,]\d{1,2})?$/)
  target!: string;

  @Matches(/^\d+([.,]\d{1,2})?$/)
  saved!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  deadline!: string;

  @IsString()
  icon!: string;

  @IsHexColor()
  color!: string;
}
