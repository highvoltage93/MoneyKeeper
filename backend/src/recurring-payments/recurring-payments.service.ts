import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoryType, Prisma, type RecurringPayment } from "@prisma/client";

import { CategoriesService } from "../categories/categories.service";
import { dateToISODate, decimalToString, parseDateOnly } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRecurringPaymentDto } from "./dto/create-recurring-payment.dto";
import { UpdateRecurringPaymentDto } from "./dto/update-recurring-payment.dto";

@Injectable()
export class RecurringPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    const payments = await this.prisma.recurringPayment.findMany({
      include: { category: true, account: true },
      orderBy: { nextDate: "asc" },
    });
    return payments.map((payment) => this.serialize(payment));
  }

  async create(dto: CreateRecurringPaymentDto) {
    const category = dto.categoryId ? null : await this.categoriesService.findByLabel(dto.categoryLabel, CategoryType.expense);
    const payment = await this.prisma.recurringPayment.create({
      data: {
        title: dto.title,
        amount: dto.amount.replace(",", "."),
        categoryId: dto.categoryId ?? category?.id,
        categoryLabel: dto.categoryLabel,
        nextDate: parseDateOnly(dto.nextDate),
        frequency: dto.frequency,
        alertDays: dto.alertDays,
        icon: dto.icon,
        accountId: dto.accountId,
      },
      include: { category: true, account: true },
    });
    return this.serialize(payment);
  }

  async update(id: string, dto: UpdateRecurringPaymentDto) {
    await this.ensureExists(id);
    const category = dto.categoryId || !dto.categoryLabel ? null : await this.categoriesService.findByLabel(dto.categoryLabel, CategoryType.expense);
    const data: Prisma.RecurringPaymentUncheckedUpdateInput = {
      title: dto.title,
      amount: dto.amount?.replace(",", "."),
      categoryId: dto.categoryId ?? category?.id,
      categoryLabel: dto.categoryLabel,
      nextDate: dto.nextDate ? parseDateOnly(dto.nextDate) : undefined,
      frequency: dto.frequency,
      alertDays: dto.alertDays,
      icon: dto.icon,
      accountId: dto.accountId,
    };

    const payment = await this.prisma.recurringPayment.update({
      where: { id },
      data,
      include: { category: true, account: true },
    });
    return this.serialize(payment);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.recurringPayment.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const payment = await this.prisma.recurringPayment.findUnique({ where: { id }, select: { id: true } });
    if (!payment) throw new NotFoundException("Recurring payment not found");
  }

  private serialize(payment: RecurringPayment & { category?: { label: string } | null }) {
    return {
      ...payment,
      amount: decimalToString(payment.amount),
      categoryLabel: payment.categoryLabel ?? payment.category?.label,
      nextDate: dateToISODate(payment.nextDate),
    };
  }
}
