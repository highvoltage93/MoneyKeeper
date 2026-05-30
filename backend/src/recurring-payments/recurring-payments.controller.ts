import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { CreateRecurringPaymentDto } from "./dto/create-recurring-payment.dto";
import { UpdateRecurringPaymentDto } from "./dto/update-recurring-payment.dto";
import { RecurringPaymentsService } from "./recurring-payments.service";

@Controller("recurring-payments")
export class RecurringPaymentsController {
  constructor(private readonly recurringPaymentsService: RecurringPaymentsService) {}

  @Get()
  findAll() {
    return this.recurringPaymentsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateRecurringPaymentDto) {
    return this.recurringPaymentsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateRecurringPaymentDto) {
    return this.recurringPaymentsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.recurringPaymentsService.remove(id);
  }
}
