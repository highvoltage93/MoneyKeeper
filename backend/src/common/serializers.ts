import type { Prisma } from "@prisma/client";

export function decimalToString(value: Prisma.Decimal | number | string) {
  return value.toString();
}

export function dateToISODate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toDateRange(from?: string, to?: string) {
  const now = new Date();
  const start = from ? parseDateOnly(from) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = to ? parseDateOnly(to) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return { start, end };
}
