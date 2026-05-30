import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";

import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() query: QueryTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.transactionsService.remove(id);
  }
}
