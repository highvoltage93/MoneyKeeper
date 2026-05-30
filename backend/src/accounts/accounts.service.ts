import { Injectable, NotFoundException } from "@nestjs/common";
import type { Account } from "@prisma/client";

import { decimalToString } from "../common/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const accounts = await this.prisma.account.findMany({
      orderBy: [{ group: "asc" }, { createdAt: "asc" }],
    });
    return accounts.map((account) => this.serialize(account));
  }

  async create(dto: CreateAccountDto) {
    const account = await this.prisma.account.create({
      data: dto,
    });
    return this.serialize(account);
  }

  async update(id: string, dto: UpdateAccountDto) {
    await this.ensureExists(id);
    const account = await this.prisma.account.update({
      where: { id },
      data: dto,
    });
    return this.serialize(account);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.account.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const account = await this.prisma.account.findUnique({ where: { id }, select: { id: true } });
    if (!account) throw new NotFoundException("Account not found");
  }

  private serialize(account: Account) {
    return {
      ...account,
      balance: decimalToString(account.balance),
    };
  }
}
