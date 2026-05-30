import { Module } from "@nestjs/common";

import { CategoriesModule } from "../categories/categories.module";
import { RecurringPaymentsController } from "./recurring-payments.controller";
import { RecurringPaymentsService } from "./recurring-payments.service";

@Module({
  imports: [CategoriesModule],
  controllers: [RecurringPaymentsController],
  providers: [RecurringPaymentsService],
})
export class RecurringPaymentsModule {}
