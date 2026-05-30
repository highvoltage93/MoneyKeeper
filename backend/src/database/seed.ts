import { AccountGroup, AccountType, CategoryType, Currency, PrismaClient, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dateInCurrentMonth(day: number) {
  const now = new Date();
  return toISODate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day)));
}

function dateInPreviousMonth(day: number) {
  const now = new Date();
  const previousLastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
  return toISODate(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, Math.min(day, previousLastDay))));
}

const accounts = [
  {
    id: "mono",
    name: "ПривтБанк",
    type: AccountType.card,
    currency: Currency.UAH,
    balance: "36240",
    icon: "credit-card",
    color: "#2E75B6",
    group: AccountGroup.personal,
  },
  {
    id: "cash",
    name: "Готівка",
    type: AccountType.cash,
    currency: Currency.UAH,
    balance: "8400",
    icon: "account-balance-wallet",
    color: "#16A085",
    group: AccountGroup.personal,
  },
  {
    id: "savings",
    name: "Накопичення",
    type: AccountType.deposit,
    currency: Currency.UAH,
    balance: "27500",
    icon: "account-balance",
    color: "#F39C12",
    group: AccountGroup.savings,
  },
  {
    id: "usd",
    name: "USD резерв",
    type: AccountType.cash,
    currency: Currency.USD,
    balance: "820",
    icon: "currency-exchange",
    color: "#8E44AD",
    group: AccountGroup.savings,
  },
];

const categories = [
  ["food", "Їжа", CategoryType.expense, "restaurant", "#E74C3C", "#FF8A65"],
  ["groceries", "Продукти", CategoryType.expense, "shopping-cart", "#27AE60", "#7ED957"],
  ["transport", "Транспорт", CategoryType.expense, "directions-car", "#2E75B6", "#5DADE2"],
  ["taxi", "Таксі", CategoryType.expense, "local-taxi", "#F1C40F", "#F39C12"],
  ["home", "Дім", CategoryType.expense, "home", "#34495E", "#5D6D7E"],
  ["utilities", "Комунальні", CategoryType.expense, "bolt", "#F39C12", "#F7DC6F"],
  ["mobile", "Зв'язок", CategoryType.expense, "smartphone", "#3498DB", "#85C1E9"],
  ["health", "Здоров'я", CategoryType.expense, "local-hospital", "#16A085", "#48C9B0"],
  ["pharmacy", "Аптека", CategoryType.expense, "local-pharmacy", "#1ABC9C", "#76D7C4"],
  ["sport", "Спорт", CategoryType.expense, "fitness-center", "#D35400", "#F5B041"],
  ["cafe", "Кафе", CategoryType.expense, "local-cafe", "#A04000", "#D68910"],
  ["entertainment", "Дозвілля", CategoryType.expense, "movie", "#9B59B6", "#C39BD3"],
  ["travel", "Подорожі", CategoryType.expense, "flight", "#00A8A8", "#45B7D1"],
  ["clothes", "Одяг", CategoryType.expense, "checkroom", "#D81B60", "#F06292"],
  ["gifts", "Подарунки", CategoryType.expense, "card-giftcard", "#E67E22", "#F8C471"],
  ["education", "Навчання", CategoryType.expense, "school", "#2874A6", "#5499C7"],
  ["pets", "Тварини", CategoryType.expense, "pets", "#7D3C98", "#BB8FCE"],
  ["beauty", "Догляд", CategoryType.expense, "spa", "#C2185B", "#F48FB1"],
  ["insurance", "Страхування", CategoryType.expense, "health-and-safety", "#148F77", "#52BE80"],
  ["family", "Сім'я", CategoryType.expense, "groups", "#B9770E", "#F4D03F"],
  ["tax", "Податки", CategoryType.expense, "account-balance", "#CB4335", "#EC7063"],
  ["others", "Інше", CategoryType.expense, "more-horiz", "#5D6D7E", "#99A3A4"],
  ["salary", "Зарплата", CategoryType.income, "attach-money", "#27AE60", "#58D68D"],
  ["freelance", "Фриланс", CategoryType.income, "work", "#2E75B6", "#85C1E9"],
  ["bonus", "Бонус", CategoryType.income, "star", "#F39C12", "#F7DC6F"],
  ["gift-income", "Подарунок", CategoryType.income, "card-giftcard", "#D81B60", "#F06292"],
  ["refund", "Повернення", CategoryType.income, "replay", "#16A085", "#48C9B0"],
  ["sale", "Продаж", CategoryType.income, "store", "#8E44AD", "#C39BD3"],
  ["interest", "Відсотки", CategoryType.income, "account-balance", "#117A65", "#45B39D"],
  ["investment", "Інвестиції", CategoryType.income, "trending-up", "#2471A3", "#5DADE2"],
] as const;

const budgets = [
  { id: "food-budget", categoryLabel: "Їжа", amount: "6200", alertAt: 80, color: "#E74C3C" },
  { id: "transport-budget", categoryLabel: "Транспорт", amount: "2600", alertAt: 80, color: "#2E75B6" },
  { id: "utilities-budget", categoryLabel: "Комунальні", amount: "3200", alertAt: 80, color: "#F39C12" },
  { id: "cafe-budget", categoryLabel: "Кафе", amount: "1800", alertAt: 80, color: "#A04000" },
];

const goals = [
  { id: "car", title: "Резервний фонд", target: "50000", saved: "31500", deadline: "2026-12-31", icon: "shield", color: "#2E75B6" },
  { id: "vacation", title: "Подорож до Італії", target: "36000", saved: "14800", deadline: "2026-09-15", icon: "flight", color: "#16A085" },
];

const recurringPayments = [
  { id: "netflix", title: "Netflix", amount: "299", categoryLabel: "Дозвілля", nextDate: "2026-06-03", frequency: "щомісяця", alertDays: 3, icon: "movie", accountId: "mono" },
  { id: "gym", title: "Спортзал", amount: "1200", categoryLabel: "Спорт", nextDate: "2026-06-07", frequency: "щомісяця", alertDays: 3, icon: "fitness-center", accountId: "mono" },
  { id: "internet", title: "Домашній інтернет", amount: "350", categoryLabel: "Зв'язок", nextDate: "2026-06-10", frequency: "щомісяця", alertDays: 1, icon: "wifi", accountId: "mono" },
];

function transactions(categoryIdByLabel: Map<string, string>) {
  return [
    {
      id: "tx-001",
      name: "Зарплата",
      categoryLabel: "Зарплата",
      amount: "42000",
      date: dateInCurrentMonth(2),
      icon: "attach-money",
      type: TransactionType.income,
      accountId: "mono",
      currency: Currency.UAH,
      tags: ["робота"],
    },
    {
      id: "tx-002",
      name: "Сільпо",
      categoryLabel: "Продукти",
      amount: "2450",
      date: dateInCurrentMonth(7),
      icon: "shopping-cart",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      note: "Тижнева закупка",
      tags: ["дім"],
    },
    {
      id: "tx-003",
      name: "Обід з командою",
      categoryLabel: "Їжа",
      amount: "1320",
      date: dateInCurrentMonth(12),
      icon: "restaurant",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: ["робота"],
    },
    {
      id: "tx-004",
      name: "Метро та таксі",
      categoryLabel: "Транспорт",
      amount: "780",
      date: dateInCurrentMonth(15),
      icon: "directions-car",
      type: TransactionType.expense,
      accountId: "cash",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-005",
      name: "Комунальні платежі",
      categoryLabel: "Комунальні",
      amount: "1800",
      date: dateInCurrentMonth(18),
      icon: "bolt",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-006",
      name: "Netflix",
      categoryLabel: "Дозвілля",
      amount: "299",
      date: dateInCurrentMonth(21),
      icon: "movie",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: ["підписка"],
    },
    {
      id: "tx-007",
      name: "Фриланс проєкт",
      categoryLabel: "Фриланс",
      amount: "11800",
      date: dateInCurrentMonth(24),
      icon: "work",
      type: TransactionType.income,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-101",
      name: "Зарплата",
      categoryLabel: "Зарплата",
      amount: "40000",
      date: dateInPreviousMonth(2),
      icon: "attach-money",
      type: TransactionType.income,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-102",
      name: "Ресторани",
      categoryLabel: "Їжа",
      amount: "3900",
      date: dateInPreviousMonth(5),
      icon: "restaurant",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-103",
      name: "Таксі та пальне",
      categoryLabel: "Транспорт",
      amount: "1150",
      date: dateInPreviousMonth(10),
      icon: "directions-car",
      type: TransactionType.expense,
      accountId: "cash",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-104",
      name: "Комунальні",
      categoryLabel: "Комунальні",
      amount: "2100",
      date: dateInPreviousMonth(18),
      icon: "bolt",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
    {
      id: "tx-105",
      name: "Кав'ярні",
      categoryLabel: "Кафе",
      amount: "1260",
      date: dateInPreviousMonth(24),
      icon: "local-cafe",
      type: TransactionType.expense,
      accountId: "mono",
      currency: Currency.UAH,
      tags: [],
    },
  ].map((transaction) => ({
    ...transaction,
    categoryId: categoryIdByLabel.get(transaction.categoryLabel),
    date: parseDateOnly(transaction.date),
  }));
}

async function main() {
  for (const account of accounts) {
    await prisma.account.upsert({
      where: { id: account.id },
      update: account,
      create: account,
    });
  }

  for (const [id, label, type, icon, color, gradientTo] of categories) {
    await prisma.category.upsert({
      where: { id },
      update: {
        label,
        type,
        icon,
        color,
        gradientFrom: color,
        gradientTo,
      },
      create: {
        id,
        label,
        type,
        icon,
        color,
        gradientFrom: color,
        gradientTo,
      },
    });
  }

  const persistedCategories = await prisma.category.findMany({ select: { id: true, label: true } });
  const categoryIdByLabel = new Map(persistedCategories.map((category) => [category.label, category.id]));

  for (const budget of budgets) {
    await prisma.budget.upsert({
      where: { id: budget.id },
      update: {
        ...budget,
        categoryId: categoryIdByLabel.get(budget.categoryLabel),
      },
      create: {
        ...budget,
        categoryId: categoryIdByLabel.get(budget.categoryLabel),
      },
    });
  }

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {
        ...goal,
        deadline: parseDateOnly(goal.deadline),
      },
      create: {
        ...goal,
        deadline: parseDateOnly(goal.deadline),
      },
    });
  }

  for (const payment of recurringPayments) {
    await prisma.recurringPayment.upsert({
      where: { id: payment.id },
      update: {
        ...payment,
        categoryId: categoryIdByLabel.get(payment.categoryLabel),
        nextDate: parseDateOnly(payment.nextDate),
      },
      create: {
        ...payment,
        categoryId: categoryIdByLabel.get(payment.categoryLabel),
        nextDate: parseDateOnly(payment.nextDate),
      },
    });
  }

  for (const transaction of transactions(categoryIdByLabel)) {
    await prisma.transaction.upsert({
      where: { id: transaction.id },
      update: transaction,
      create: transaction,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
