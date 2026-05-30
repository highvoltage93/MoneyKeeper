import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export type TransactionType = "expense" | "income" | "transfer";
export type CategoryType = "expense" | "income";

export type AccountItem = {
    id: string;
    name: string;
    type: "cash" | "card" | "deposit" | "credit" | "investment";
    currency: "UAH" | "USD" | "EUR";
    balance: number;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    group: "personal" | "savings" | "shared";
};

export type CategoryItem = {
    id: string;
    label: string;
    type: CategoryType;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
    colors: [string, string];
};

export type BudgetItem = {
    id: string;
    category: string;
    amount: number;
    alertAt: number;
    color: string;
};

export type GoalItem = {
    id: string;
    title: string;
    target: number;
    saved: number;
    deadline: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
};

export type RecurringPaymentItem = {
    id: string;
    title: string;
    amount: number;
    category: string;
    nextDate: string;
    frequency: string;
    alertDays: number;
    icon: keyof typeof MaterialIcons.glyphMap;
};

export const APP_PRIMARY = "#2E75B6";
export const APP_INCOME = "#27AE60";
export const APP_EXPENSE = "#E74C3C";
export const APP_BG = "#F5F7FB";
export const APP_TEXT = "#1A1A2E";

export const APP_GRADIENTS = {
    screen: ["#F5F7FB", "#EAF4FF", "#F4EEF9"] as [string, string, string],
    ocean: ["#2E75B6", "#16A085"] as [string, string],
    violet: ["#7F53AC", "#647DEE"] as [string, string],
    sunset: ["#E74C3C", "#F39C12"] as [string, string],
    mint: ["#27AE60", "#16A085"] as [string, string],
    ink: ["#101828", "#2E75B6", "#16A085"] as [string, string, string],
    softBlue: ["#FFFFFF", "#EEF7FF"] as [string, string],
    softMint: ["#FFFFFF", "#ECFFF6"] as [string, string],
    softRose: ["#FFFFFF", "#FFF0ED"] as [string, string],
    softViolet: ["#FFFFFF", "#F1EDFF"] as [string, string],
} as const;

export const INITIAL_ACCOUNTS: AccountItem[] = [
    {
        id: "mono",
        name: "ПривтБанк",
        type: "card",
        currency: "UAH",
        balance: 36240,
        icon: "credit-card",
        color: "#2E75B6",
        group: "personal",
    },
    {
        id: "cash",
        name: "Готівка",
        type: "cash",
        currency: "UAH",
        balance: 8400,
        icon: "account-balance-wallet",
        color: "#16A085",
        group: "personal",
    },
    {
        id: "savings",
        name: "Накопичення",
        type: "deposit",
        currency: "UAH",
        balance: 27500,
        icon: "account-balance",
        color: "#F39C12",
        group: "savings",
    },
    {
        id: "usd",
        name: "USD резерв",
        type: "cash",
        currency: "USD",
        balance: 820,
        icon: "currency-exchange",
        color: "#8E44AD",
        group: "savings",
    },
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
    { id: "food", label: "Їжа", type: "expense", icon: "restaurant", color: "#E74C3C", colors: ["#E74C3C", "#FF8A65"] },
    { id: "groceries", label: "Продукти", type: "expense", icon: "shopping-cart", color: "#27AE60", colors: ["#27AE60", "#7ED957"] },
    { id: "transport", label: "Транспорт", type: "expense", icon: "directions-car", color: "#2E75B6", colors: ["#2E75B6", "#5DADE2"] },
    { id: "taxi", label: "Таксі", type: "expense", icon: "local-taxi", color: "#F1C40F", colors: ["#F1C40F", "#F39C12"] },
    { id: "home", label: "Дім", type: "expense", icon: "home", color: "#34495E", colors: ["#34495E", "#5D6D7E"] },
    { id: "utilities", label: "Комунальні", type: "expense", icon: "bolt", color: "#F39C12", colors: ["#F39C12", "#F7DC6F"] },
    { id: "mobile", label: "Зв'язок", type: "expense", icon: "smartphone", color: "#3498DB", colors: ["#3498DB", "#85C1E9"] },
    { id: "health", label: "Здоров'я", type: "expense", icon: "local-hospital", color: "#16A085", colors: ["#16A085", "#48C9B0"] },
    { id: "pharmacy", label: "Аптека", type: "expense", icon: "local-pharmacy", color: "#1ABC9C", colors: ["#1ABC9C", "#76D7C4"] },
    { id: "sport", label: "Спорт", type: "expense", icon: "fitness-center", color: "#D35400", colors: ["#D35400", "#F5B041"] },
    { id: "cafe", label: "Кафе", type: "expense", icon: "local-cafe", color: "#A04000", colors: ["#A04000", "#D68910"] },
    { id: "entertainment", label: "Дозвілля", type: "expense", icon: "movie", color: "#9B59B6", colors: ["#9B59B6", "#C39BD3"] },
    { id: "travel", label: "Подорожі", type: "expense", icon: "flight", color: "#00A8A8", colors: ["#00A8A8", "#45B7D1"] },
    { id: "clothes", label: "Одяг", type: "expense", icon: "checkroom", color: "#D81B60", colors: ["#D81B60", "#F06292"] },
    { id: "gifts", label: "Подарунки", type: "expense", icon: "card-giftcard", color: "#E67E22", colors: ["#E67E22", "#F8C471"] },
    { id: "education", label: "Навчання", type: "expense", icon: "school", color: "#2874A6", colors: ["#2874A6", "#5499C7"] },
    { id: "pets", label: "Тварини", type: "expense", icon: "pets", color: "#7D3C98", colors: ["#7D3C98", "#BB8FCE"] },
    { id: "beauty", label: "Догляд", type: "expense", icon: "spa", color: "#C2185B", colors: ["#C2185B", "#F48FB1"] },
    { id: "insurance", label: "Страхування", type: "expense", icon: "health-and-safety", color: "#148F77", colors: ["#148F77", "#52BE80"] },
    { id: "family", label: "Сім'я", type: "expense", icon: "groups", color: "#B9770E", colors: ["#B9770E", "#F4D03F"] },
    { id: "tax", label: "Податки", type: "expense", icon: "account-balance", color: "#CB4335", colors: ["#CB4335", "#EC7063"] },
    { id: "others", label: "Інше", type: "expense", icon: "more-horiz", color: "#5D6D7E", colors: ["#5D6D7E", "#99A3A4"] },
    { id: "salary", label: "Зарплата", type: "income", icon: "attach-money", color: "#27AE60", colors: ["#27AE60", "#58D68D"] },
    { id: "freelance", label: "Фриланс", type: "income", icon: "work", color: "#2E75B6", colors: ["#2E75B6", "#85C1E9"] },
    { id: "bonus", label: "Бонус", type: "income", icon: "star", color: "#F39C12", colors: ["#F39C12", "#F7DC6F"] },
    { id: "gift-income", label: "Подарунок", type: "income", icon: "card-giftcard", color: "#D81B60", colors: ["#D81B60", "#F06292"] },
    { id: "refund", label: "Повернення", type: "income", icon: "replay", color: "#16A085", colors: ["#16A085", "#48C9B0"] },
    { id: "sale", label: "Продаж", type: "income", icon: "store", color: "#8E44AD", colors: ["#8E44AD", "#C39BD3"] },
    { id: "interest", label: "Відсотки", type: "income", icon: "account-balance", color: "#117A65", colors: ["#117A65", "#45B39D"] },
    { id: "investment", label: "Інвестиції", type: "income", icon: "trending-up", color: "#2471A3", colors: ["#2471A3", "#5DADE2"] },
];

export const INITIAL_BUDGETS: BudgetItem[] = [
    { id: "food-budget", category: "Їжа", amount: 6200, alertAt: 80, color: "#E74C3C" },
    { id: "transport-budget", category: "Транспорт", amount: 2600, alertAt: 80, color: "#2E75B6" },
    { id: "utilities-budget", category: "Комунальні", amount: 3200, alertAt: 80, color: "#F39C12" },
    { id: "cafe-budget", category: "Кафе", amount: 1800, alertAt: 80, color: "#A04000" },
];

export const INITIAL_GOALS: GoalItem[] = [
    { id: "car", title: "Резервний фонд", target: 50000, saved: 31500, deadline: "31.12.2026", icon: "shield", color: "#2E75B6" },
    { id: "vacation", title: "Подорож до Італії", target: 36000, saved: 14800, deadline: "15.09.2026", icon: "flight", color: "#16A085" },
];

export const INITIAL_RECURRING_PAYMENTS: RecurringPaymentItem[] = [
    { id: "netflix", title: "Netflix", amount: 299, category: "Дозвілля", nextDate: "2026-06-03", frequency: "щомісяця", alertDays: 3, icon: "movie" },
    { id: "gym", title: "Спортзал", amount: 1200, category: "Спорт", nextDate: "2026-06-07", frequency: "щомісяця", alertDays: 3, icon: "fitness-center" },
    { id: "internet", title: "Домашній інтернет", amount: 350, category: "Зв'язок", nextDate: "2026-06-10", frequency: "щомісяця", alertDays: 1, icon: "wifi" },
];
