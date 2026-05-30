import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { BudgetsService } from "./budgets.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";

@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll() {
    return this.budgetsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.budgetsService.remove(id);
  }
}
