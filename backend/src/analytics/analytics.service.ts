import { Injectable } from "@nestjs/common";
import { TransactionType } from "@prisma/client";

import { dateToISODate, parseDateOnly, toDateRange } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: AnalyticsQueryDto) {
    const { start, end } = toDateRange(query.from, query.to);
    const transactions = await this.prisma.transaction.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: { category: true },
      orderBy: { date: "asc" },
    });

    const totals = transactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === TransactionType.income) acc.income += amount;
        if (transaction.type === TransactionType.expense) acc.expense += amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    const byCategory = new Map<string, { amount: number; color: string; icon: string | null }>();
    for (const transaction of transactions) {
      if (transaction.type !== TransactionType.expense) continue;
      const label = transaction.categoryLabel ?? transaction.category?.label ?? "Інше";
      const current = byCategory.get(label) ?? {
        amount: 0,
        color: transaction.category?.color ?? "#2E75B6",
        icon: transaction.category?.icon ?? transaction.icon ?? null,
      };
      current.amount += Number(transaction.amount);
      byCategory.set(label, current);
    }

    return {
      range: {
        from: dateToISODate(start),
        to: dateToISODate(end),
      },
      totals: {
        income: totals.income,
        expense: totals.expense,
        net: totals.income - totals.expense,
      },
      byCategory: Array.from(byCategory.entries())
        .map(([category, value]) => ({ category, ...value }))
        .sort((a, b) => b.amount - a.amount),
      cumulative: this.buildCumulativeSeries(start, end, transactions),
      sixMonthCumulative: await this.buildSixMonthCumulative(end),
    };
  }

  private buildCumulativeSeries(
    start: Date,
    end: Date,
    transactions: Array<{ date: Date; type: TransactionType; amount: { toString(): string } }>,
  ) {
    const byDate = new Map<string, { income: number; expense: number }>();
    for (const transaction of transactions) {
      const key = dateToISODate(transaction.date);
      const current = byDate.get(key) ?? { income: 0, expense: 0 };
      const amount = Number(transaction.amount);
      if (transaction.type === TransactionType.income) current.income += amount;
      if (transaction.type === TransactionType.expense) current.expense += amount;
      byDate.set(key, current);
    }

    let expenseCumulative = 0;
    let incomeCumulative = 0;
    return this.eachDate(start, end).map((date) => {
      const key = dateToISODate(date);
      const value = byDate.get(key) ?? { income: 0, expense: 0 };
      expenseCumulative += value.expense;
      incomeCumulative += value.income;
      return {
        date: key,
        income: value.income,
        expense: value.expense,
        incomeCumulative,
        expenseCumulative,
        netCumulative: incomeCumulative - expenseCumulative,
      };
    });
  }

  private async buildSixMonthCumulative(anchorDate: Date) {
    const day = anchorDate.getUTCDate();
    const monthRanges = Array.from({ length: 6 }, (_, index) => {
      const monthStart = new Date(Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth() - index, 1));
      const lastDay = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0)).getUTCDate();
      const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), Math.min(day, lastDay)));
      return { monthStart, monthEnd };
    }).reverse();

    const firstStart = monthRanges[0]?.monthStart ?? anchorDate;
    const lastEnd = monthRanges[monthRanges.length - 1]?.monthEnd ?? anchorDate;
    const expenses = await this.prisma.transaction.findMany({
      where: {
        type: TransactionType.expense,
        date: {
          gte: firstStart,
          lte: lastEnd,
        },
      },
      orderBy: { date: "asc" },
    });

    return monthRanges.map(({ monthStart, monthEnd }) => {
      const monthExpenses = expenses.filter((transaction) => transaction.date >= monthStart && transaction.date <= monthEnd);
      const cumulative = this.buildCumulativeSeries(monthStart, monthEnd, monthExpenses);
      return {
        month: `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}`,
        from: dateToISODate(monthStart),
        to: dateToISODate(monthEnd),
        total: cumulative.at(-1)?.expenseCumulative ?? 0,
        points: cumulative.map((point) => ({
          day: Number(point.date.slice(-2)),
          date: point.date,
          amount: point.expenseCumulative,
        })),
      };
    });
  }

  private eachDate(start: Date, end: Date) {
    const dates: Date[] = [];
    const cursor = parseDateOnly(dateToISODate(start));
    const last = parseDateOnly(dateToISODate(end));
    while (cursor <= last) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return dates;
  }
}
