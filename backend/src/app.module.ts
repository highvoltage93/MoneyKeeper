import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AccountsModule } from "./accounts/accounts.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { BudgetsModule } from "./budgets/budgets.module";
import { CategoriesModule } from "./categories/categories.module";
import { GoalsModule } from "./goals/goals.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RecurringPaymentsModule } from "./recurring-payments/recurring-payments.module";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    RecurringPaymentsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
