import { Injectable, NotFoundException } from "@nestjs/common";
import { CategoryType, type Category } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: CategoryType) {
    const categories = await this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
    });
    return categories.map((category) => this.serialize(category));
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        ...dto,
        gradientFrom: dto.gradientFrom ?? dto.color,
        gradientTo: dto.gradientTo ?? "#101828",
      },
    });
    return this.serialize(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const current = await this.ensureExists(id);
    const nextColor = dto.color ?? current.color;
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        gradientFrom: dto.gradientFrom ?? dto.color ?? current.gradientFrom ?? nextColor,
        gradientTo: dto.gradientTo ?? current.gradientTo ?? "#101828",
      },
    });
    return this.serialize(category);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.category.delete({ where: { id } });
    return { id };
  }

  async findByLabel(label: string, type?: CategoryType) {
    return this.prisma.category.findFirst({
      where: {
        label,
        ...(type ? { type } : {}),
      },
    });
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  private serialize(category: Category) {
    return {
      ...category,
      colors: [category.gradientFrom, category.gradientTo],
    };
  }
}
