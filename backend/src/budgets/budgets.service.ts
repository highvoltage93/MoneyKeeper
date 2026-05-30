import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoryType, Prisma, type Budget } from "@prisma/client";

import { CategoriesService } from "../categories/categories.service";
import { decimalToString } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    const budgets = await this.prisma.budget.findMany({
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });
    return budgets.map((budget) => this.serialize(budget));
  }

  async create(dto: CreateBudgetDto) {
    const category = dto.categoryId ? null : await this.categoriesService.findByLabel(dto.categoryLabel, CategoryType.expense);
    const budget = await this.prisma.budget.create({
      data: {
        categoryId: dto.categoryId ?? category?.id,
        categoryLabel: dto.categoryLabel,
        amount: dto.amount.replace(",", "."),
        alertAt: dto.alertAt,
        color: dto.color,
      },
      include: { category: true },
    });
    return this.serialize(budget);
  }

  async update(id: string, dto: UpdateBudgetDto) {
    await this.ensureExists(id);
    const category = dto.categoryId || !dto.categoryLabel ? null : await this.categoriesService.findByLabel(dto.categoryLabel, CategoryType.expense);
    const data: Prisma.BudgetUncheckedUpdateInput = {
      categoryId: dto.categoryId ?? category?.id,
      categoryLabel: dto.categoryLabel,
      amount: dto.amount?.replace(",", "."),
      alertAt: dto.alertAt,
      color: dto.color,
    };

    const budget = await this.prisma.budget.update({
      where: { id },
      data,
      include: { category: true },
    });
    return this.serialize(budget);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.budget.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id }, select: { id: true } });
    if (!budget) throw new NotFoundException("Budget not found");
  }

  private serialize(budget: Budget & { category?: { label: string } | null }) {
    return {
      ...budget,
      categoryLabel: budget.categoryLabel ?? budget.category?.label,
      amount: decimalToString(budget.amount),
    };
  }
}
