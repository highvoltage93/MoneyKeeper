import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoryType, Prisma, TransactionType, type Category } from "@prisma/client";

import { CategoriesService } from "../categories/categories.service";
import { dateToISODate, decimalToString, parseDateOnly } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";

type TransactionWithRelations = Prisma.TransactionGetPayload<{
  include: {
    account: true;
    category: true;
  };
}>;

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(query: QueryTransactionsDto) {
    const transactions = await this.prisma.transaction.findMany({
      where: this.buildWhere(query),
      include: { account: true, category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return transactions.map((transaction) => this.serialize(transaction));
  }

  async create(dto: CreateTransactionDto) {
    const category = await this.resolveCategory(dto.categoryId, dto.categoryLabel, this.toCategoryType(dto.type));
    const transaction = await this.prisma.transaction.create({
      data: {
        name: dto.name,
        type: dto.type,
        amount: dto.amount.replace(",", "."),
        date: parseDateOnly(dto.date),
        currency: dto.currency,
        accountId: dto.accountId,
        categoryId: dto.categoryId ?? category?.id,
        categoryLabel: dto.categoryLabel ?? category?.label,
        icon: dto.icon ?? category?.icon,
        note: dto.note,
        tags: dto.tags ?? [],
      },
      include: { account: true, category: true },
    });
    return this.serialize(transaction);
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const current = await this.prisma.transaction.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Transaction not found");

    const nextType = dto.type ?? current.type;
    const shouldResolveCategory = dto.categoryId !== undefined || dto.categoryLabel !== undefined || dto.type !== undefined;
    const category = shouldResolveCategory
      ? await this.resolveCategory(dto.categoryId, dto.categoryLabel ?? current.categoryLabel ?? undefined, this.toCategoryType(nextType))
      : undefined;

    const data: Prisma.TransactionUncheckedUpdateInput = {
      name: dto.name,
      type: dto.type,
      amount: dto.amount?.replace(",", "."),
      date: dto.date ? parseDateOnly(dto.date) : undefined,
      currency: dto.currency,
      accountId: dto.accountId,
      categoryId: dto.categoryId ?? category?.id,
      categoryLabel: dto.categoryLabel ?? category?.label,
      icon: dto.icon ?? category?.icon,
      note: dto.note,
      tags: dto.tags,
    };

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data,
      include: { account: true, category: true },
    });
    return this.serialize(transaction);
  }

  async remove(id: string) {
    const current = await this.prisma.transaction.findUnique({ where: { id }, select: { id: true } });
    if (!current) throw new NotFoundException("Transaction not found");

    await this.prisma.transaction.delete({ where: { id } });
    return { id };
  }

  buildWhere(query: QueryTransactionsDto): Prisma.TransactionWhereInput {
    return {
      ...(query.type ? { type: query.type } : {}),
      ...(query.accountId ? { accountId: query.accountId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.categoryLabel ? { categoryLabel: query.categoryLabel } : {}),
      ...(query.categoryType ? { category: { type: query.categoryType } } : {}),
      ...this.buildDateFilter(query.from, query.to),
    };
  }

  serialize(transaction: TransactionWithRelations) {
    return {
      ...transaction,
      amount: decimalToString(transaction.amount),
      date: dateToISODate(transaction.date),
      categoryLabel: transaction.categoryLabel ?? transaction.category?.label ?? null,
    };
  }

  private buildDateFilter(from?: string, to?: string): Prisma.TransactionWhereInput {
    if (!from && !to) return {};
    return {
      date: {
        ...(from ? { gte: parseDateOnly(from) } : {}),
        ...(to ? { lte: parseDateOnly(to) } : {}),
      },
    };
  }

  private async resolveCategory(categoryId?: string, categoryLabel?: string, categoryType?: CategoryType): Promise<Category | null> {
    if (categoryId) {
      return this.prisma.category.findUnique({ where: { id: categoryId } });
    }
    if (!categoryLabel) return null;
    return this.categoriesService.findByLabel(categoryLabel, categoryType);
  }

  private toCategoryType(type: TransactionType): CategoryType | undefined {
    if (type === TransactionType.transfer) return undefined;
    return type === TransactionType.income ? CategoryType.income : CategoryType.expense;
  }
}
