import { Injectable, NotFoundException } from "@nestjs/common";
import type { Goal } from "@prisma/client";

import { dateToISODate, decimalToString, parseDateOnly } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGoalDto } from "./dto/create-goal.dto";
import { UpdateGoalDto } from "./dto/update-goal.dto";

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const goals = await this.prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
    return goals.map((goal) => this.serialize(goal));
  }

  async create(dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        title: dto.title,
        target: dto.target.replace(",", "."),
        saved: dto.saved.replace(",", "."),
        deadline: parseDateOnly(dto.deadline),
        icon: dto.icon,
        color: dto.color,
      },
    });
    return this.serialize(goal);
  }

  async update(id: string, dto: UpdateGoalDto) {
    await this.ensureExists(id);
    const goal = await this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        target: dto.target?.replace(",", "."),
        saved: dto.saved?.replace(",", "."),
        deadline: dto.deadline ? parseDateOnly(dto.deadline) : undefined,
        icon: dto.icon,
        color: dto.color,
      },
    });
    return this.serialize(goal);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.goal.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id }, select: { id: true } });
    if (!goal) throw new NotFoundException("Goal not found");
  }

  private serialize(goal: Goal) {
    return {
      ...goal,
      target: decimalToString(goal.target),
      saved: decimalToString(goal.saved),
      deadline: dateToISODate(goal.deadline),
    };
  }
}
