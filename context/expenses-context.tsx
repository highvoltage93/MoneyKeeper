import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { INITIAL_ACCOUNTS, type TransactionType } from "@/shared/config";
import { convertToBase, toISODate, transactionValue } from "@/shared/finance";

export type Expense = {
    id: string;
    name: string;
    category: string;
    amount: string;
    date: string;
    icon?: string;
    type: TransactionType;
    accountId: string;
    currency: "UAH" | "USD" | "EUR";
    note?: string;
    tags?: string[];
};

function dateInCurrentMonth(day: number) {
    const now = new Date();
    return toISODate(new Date(now.getFullYear(), now.getMonth(), day));
}

function dateInPreviousMonth(day: number) {
    const now = new Date();
    const previousLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    return toISODate(new Date(now.getFullYear(), now.getMonth() - 1, Math.min(day, previousLastDay)));
}

const INITIAL_EXPENSES: Expense[] = [
    {
        id: "tx-001",
        name: "Зарплата",
        category: "Зарплата",
        amount: "42000",
        date: dateInCurrentMonth(2),
        icon: "attach-money",
        type: "income",
        accountId: "mono",
        currency: "UAH",
        tags: ["робота"],
    },
    {
        id: "tx-002",
        name: "Сільпо",
        category: "Продукти",
        amount: "2450",
        date: dateInCurrentMonth(7),
        icon: "shopping-cart",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
        note: "Тижнева закупка",
        tags: ["дім"],
    },
    {
        id: "tx-003",
        name: "Обід з командою",
        category: "Їжа",
        amount: "1320",
        date: dateInCurrentMonth(12),
        icon: "restaurant",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
        tags: ["робота"],
    },
    {
        id: "tx-004",
        name: "Метро та таксі",
        category: "Транспорт",
        amount: "780",
        date: dateInCurrentMonth(15),
        icon: "directions-car",
        type: "expense",
        accountId: "cash",
        currency: "UAH",
    },
    {
        id: "tx-005",
        name: "Комунальні платежі",
        category: "Комунальні",
        amount: "1800",
        date: dateInCurrentMonth(18),
        icon: "bolt",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
    },
    {
        id: "tx-006",
        name: "Netflix",
        category: "Дозвілля",
        amount: "299",
        date: dateInCurrentMonth(21),
        icon: "movie",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
        tags: ["підписка"],
    },
    {
        id: "tx-007",
        name: "Фриланс проєкт",
        category: "Фриланс",
        amount: "11800",
        date: dateInCurrentMonth(24),
        icon: "work",
        type: "income",
        accountId: "mono",
        currency: "UAH",
    },
    {
        id: "tx-101",
        name: "Зарплата",
        category: "Зарплата",
        amount: "40000",
        date: dateInPreviousMonth(2),
        icon: "attach-money",
        type: "income",
        accountId: "mono",
        currency: "UAH",
    },
    {
        id: "tx-102",
        name: "Ресторани",
        category: "Їжа",
        amount: "3900",
        date: dateInPreviousMonth(5),
        icon: "restaurant",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
    },
    {
        id: "tx-103",
        name: "Таксі та пальне",
        category: "Транспорт",
        amount: "1150",
        date: dateInPreviousMonth(10),
        icon: "directions-car",
        type: "expense",
        accountId: "cash",
        currency: "UAH",
    },
    {
        id: "tx-104",
        name: "Комунальні",
        category: "Комунальні",
        amount: "2100",
        date: dateInPreviousMonth(18),
        icon: "bolt",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
    },
    {
        id: "tx-105",
        name: "Кав'ярні",
        category: "Кафе",
        amount: "1260",
        date: dateInPreviousMonth(24),
        icon: "local-cafe",
        type: "expense",
        accountId: "mono",
        currency: "UAH",
    },
];

type ExpensesContextValue = {
    expenses: Expense[];
    addExpense: (expense: Omit<Expense, "id">) => void;
    updateExpense: (id: string, data: Partial<Omit<Expense, "id">>) => void;
    deleteExpense: (id: string) => void;
    totalAmount: number;
    totalIncome: number;
    netAmount: number;
    totalBalance: number;
};

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

    const addExpense = useCallback((expense: Omit<Expense, "id">) => {
        setExpenses((prev) => [
            {
                ...expense,
                id: Date.now().toString(),
            },
            ...prev,
        ]);
    }, []);

    const updateExpense = useCallback((id: string, data: Partial<Omit<Expense, "id">>) => {
        setExpenses((prev) => prev.map((expense) => (expense.id === id ? { ...expense, ...data } : expense)));
    }, []);

    const deleteExpense = useCallback((id: string) => {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    }, []);

    const totals = useMemo(() => {
        const totalIncome = expenses.reduce((sum, expense) => {
            if (expense.type !== "income") return sum;
            return sum + convertToBase(Number(expense.amount) || 0, expense.currency);
        }, 0);
        const totalAmount = expenses.reduce((sum, expense) => {
            if (expense.type !== "expense") return sum;
            return sum + convertToBase(Number(expense.amount) || 0, expense.currency);
        }, 0);
        const accountBase = INITIAL_ACCOUNTS.reduce((sum, account) => sum + convertToBase(account.balance, account.currency), 0);
        const netAmount = expenses.reduce((sum, expense) => sum + convertToBase(transactionValue(expense), expense.currency), 0);

        return {
            totalAmount,
            totalIncome,
            netAmount,
            totalBalance: accountBase + netAmount,
        };
    }, [expenses]);

    return (
        <ExpensesContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, ...totals }}>
            {children}
        </ExpensesContext.Provider>
    );
}

export function useExpenses() {
    const ctx = useContext(ExpensesContext);
    if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
    return ctx;
}
