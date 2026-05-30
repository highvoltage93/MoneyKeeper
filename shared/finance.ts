import type { AccountItem, TransactionType } from "@/shared/config";
import type { Expense } from "@/context/expenses-context";

export const BASE_CURRENCY = "UAH";
export const USD_TO_UAH = 41.12;
export const EUR_TO_UAH = 44.6;

export function toISODate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function parseDateString(value: string) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? new Date() : new Date(parsed);
}

export function formatDisplayDate(value: string) {
    return parseDateString(value).toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function formatCurrency(amount: number, currency = BASE_CURRENCY, hidden = false) {
    if (hidden) return "••••••";

    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "UAH" ? 0 : 2,
    }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = BASE_CURRENCY) {
    const abs = Math.abs(amount);
    if (abs >= 1000000) return `${(amount / 1000000).toFixed(1)} млн ${currency}`;
    if (abs >= 1000) return `${(amount / 1000).toFixed(1)} тис. ${currency}`;
    return formatCurrency(amount, currency);
}

export function convertToBase(amount: number, currency: string) {
    if (currency === "USD") return amount * USD_TO_UAH;
    if (currency === "EUR") return amount * EUR_TO_UAH;
    return amount;
}

export function transactionValue(transaction: Expense) {
    const amount = Number(transaction.amount) || 0;
    if (transaction.type === "income") return amount;
    if (transaction.type === "transfer") return 0;
    return -amount;
}

export function absoluteTransactionAmount(transaction: Expense) {
    return Number(transaction.amount) || 0;
}

export function isExpenseType(type?: TransactionType) {
    return type === "expense" || !type;
}

export function startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function isInRange(date: Date, start: Date, end: Date) {
    return date >= start && date <= end;
}

export function filterByMonth(transactions: Expense[], date = new Date()) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return transactions.filter((transaction) => isInRange(parseDateString(transaction.date), start, end));
}

export function sumTransactions(transactions: Expense[], type?: TransactionType) {
    return transactions.reduce((sum, transaction) => {
        if (type && transaction.type !== type) return sum;
        if (!type) return sum + transactionValue(transaction);
        return sum + absoluteTransactionAmount(transaction);
    }, 0);
}

export function getAccountBalance(account: AccountItem, transactions: Expense[]) {
    const delta = transactions.reduce((sum, transaction) => {
        if (transaction.accountId !== account.id) return sum;
        return sum + transactionValue(transaction);
    }, 0);

    return account.balance + delta;
}

export function getCurrentAndPreviousMonthToDate(now = new Date()) {
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    const previousEndDay = Math.min(now.getDate(), previousLastDay);
    const previousStart = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
    const previousEnd = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), previousEndDay, 23, 59, 59, 999);

    return { currentStart, currentEnd, previousStart, previousEnd };
}

export function calculateMonthToDateComparison(transactions: Expense[], now = new Date()) {
    const { currentStart, currentEnd, previousStart, previousEnd } = getCurrentAndPreviousMonthToDate(now);
    const current = transactions.reduce((sum, transaction) => {
        const date = parseDateString(transaction.date);
        if (transaction.type !== "expense" || !isInRange(date, currentStart, currentEnd)) return sum;
        return sum + absoluteTransactionAmount(transaction);
    }, 0);
    const previous = transactions.reduce((sum, transaction) => {
        const date = parseDateString(transaction.date);
        if (transaction.type !== "expense" || !isInRange(date, previousStart, previousEnd)) return sum;
        return sum + absoluteTransactionAmount(transaction);
    }, 0);
    const delta = current - previous;
    const percent = previous > 0 ? (delta / previous) * 100 : 0;

    return { current, previous, delta, percent, isBetter: delta <= 0, previousEnd };
}

export function categoryTotals(transactions: Expense[], type: TransactionType = "expense") {
    const totals = new Map<string, number>();
    transactions.forEach((transaction) => {
        if (transaction.type !== type) return;
        totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + absoluteTransactionAmount(transaction));
    });

    return Array.from(totals.entries())
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);
}

export function lastMonths(count: number, from = new Date()) {
    return Array.from({ length: count }, (_, index) => {
        const offset = count - 1 - index;
        return new Date(from.getFullYear(), from.getMonth() - offset, 1);
    });
}
