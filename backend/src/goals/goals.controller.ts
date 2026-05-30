import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { CreateGoalDto } from "./dto/create-goal.dto";
import { UpdateGoalDto } from "./dto/update-goal.dto";
import { GoalsService } from "./goals.service";

@Controller("goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll() {
    return this.goalsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGoalDto) {
    return this.goalsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.goalsService.remove(id);
  }
}
