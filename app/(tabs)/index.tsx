import { useExpenses, type Expense } from "@/context/expenses-context";
import { useCategories } from "@/context/categories-context";
import {
    APP_BG,
    APP_EXPENSE,
    APP_GRADIENTS,
    APP_INCOME,
    APP_PRIMARY,
    APP_TEXT,
    INITIAL_ACCOUNTS,
    INITIAL_BUDGETS,
    type AccountItem,
} from "@/shared/config";
import {
    absoluteTransactionAmount,
    calculateMonthToDateComparison,
    categoryTotals,
    convertToBase,
    filterByMonth,
    formatCompactCurrency,
    formatCurrency,
    formatDisplayDate,
    getAccountBalance,
    parseDateString,
    sumTransactions,
} from "@/shared/finance";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function SectionHeader({ title, action }: { title: string; action?: string }) {
    return (
        <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {title}
            </ThemedText>
            {action ? <ThemedText style={styles.sectionAction}>{action}</ThemedText> : null}
        </View>
    );
}

function StatTile({
    icon,
    label,
    value,
    color,
}: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <LinearGradient colors={["#FFFFFF", `${color}12`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statTile}>
            <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
                <MaterialIcons name={icon} size={20} color={color} />
            </View>
            <ThemedText style={styles.statLabel}>{label}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue} numberOfLines={1}>
                {value}
            </ThemedText>
        </LinearGradient>
    );
}

function MiniBarChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);

    return (
        <View style={styles.miniChart}>
            {data.map((value, index) => (
                <View key={`${value}-${index}`} style={styles.miniBarTrack}>
                    <View style={[styles.miniBar, { height: `${Math.max(12, (value / max) * 100)}%` }]} />
                </View>
            ))}
        </View>
    );
}

function accountTypeLabel(type: AccountItem["type"]) {
    const labels: Record<AccountItem["type"], string> = {
        cash: "Готівка",
        card: "Картка",
        deposit: "Депозит",
        credit: "Кредит",
        investment: "Інвестиції",
    };

    return labels[type];
}

function DashboardAccountCard({
    account,
    balance,
    share,
    baseBalance,
    chartData,
    hidden,
}: {
    account: AccountItem;
    balance: number;
    share: number;
    baseBalance: number;
    chartData: number[];
    hidden: boolean;
}) {
    return (
        <LinearGradient colors={[account.color, "#101828"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.accountHeroCard}>
            <View style={styles.accountHeroTop}>
                <View style={styles.accountHeroIcon}>
                    <MaterialIcons name={account.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.accountHeroMeta}>
                    <ThemedText type="defaultSemiBold" style={styles.accountHeroName} numberOfLines={1}>
                        {account.name}
                    </ThemedText>
                    <ThemedText style={styles.accountHeroType}>
                        {accountTypeLabel(account.type)} · {account.currency}
                    </ThemedText>
                </View>
                <View style={styles.accountSharePill}>
                    <ThemedText style={styles.accountShareText}>{share.toFixed(0)}%</ThemedText>
                </View>
            </View>

            <ThemedText type="title" style={styles.accountHeroBalance} numberOfLines={1}>
                {formatCurrency(balance, account.currency, hidden)}
            </ThemedText>

            <View style={styles.accountHeroFooter}>
                <View>
                    <ThemedText style={styles.accountHeroCaption}>В базовій валюті</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.accountHeroBaseValue}>
                        {hidden ? "••••" : formatCurrency(baseBalance)}
                    </ThemedText>
                </View>
                <MiniBarChart data={chartData} />
            </View>
        </LinearGradient>
    );
}

function ProgressLine({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
    const progress = total > 0 ? Math.min(amount / total, 1) : 0;

    return (
        <View style={styles.progressLine}>
            <View style={styles.progressMeta}>
                <ThemedText type="defaultSemiBold" style={styles.progressLabel}>
                    {label}
                </ThemedText>
                <ThemedText style={styles.progressValue}>{formatCurrency(amount)}</ThemedText>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

function TransactionRow({ transaction, onPress }: { transaction: Expense; onPress: () => void }) {
    const isIncome = transaction.type === "income";
    const isTransfer = transaction.type === "transfer";
    const color = isIncome ? APP_INCOME : isTransfer ? APP_PRIMARY : APP_EXPENSE;
    const sign = isIncome ? "+" : isTransfer ? "" : "-";

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.78}>
            <LinearGradient colors={["#FFFFFF", `${color}0F`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.transactionRow}>
            <View style={[styles.transactionIcon, { backgroundColor: `${color}16` }]}>
                <MaterialIcons name={(transaction.icon ?? "receipt") as keyof typeof MaterialIcons.glyphMap} size={22} color={color} />
            </View>
            <View style={styles.transactionBody}>
                <ThemedText type="defaultSemiBold" style={styles.transactionName} numberOfLines={1}>
                    {transaction.name}
                </ThemedText>
                <ThemedText style={styles.transactionDate} numberOfLines={1}>
                    {transaction.category} · {formatDisplayDate(transaction.date)}
                </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={[styles.transactionAmount, { color }]}>
                {sign}
                {formatCompactCurrency(absoluteTransactionAmount(transaction), transaction.currency)}
            </ThemedText>
            </LinearGradient>
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { categories } = useCategories();
    const { expenses } = useExpenses();
    const [isHidden, setIsHidden] = useState(false);
    const now = useMemo(() => new Date(), []);

    const monthTransactions = useMemo(() => filterByMonth(expenses, now), [expenses, now]);
    const monthExpenses = useMemo(() => sumTransactions(monthTransactions, "expense"), [monthTransactions]);
    const monthIncome = useMemo(() => sumTransactions(monthTransactions, "income"), [monthTransactions]);
    const savings = monthIncome - monthExpenses;
    const comparison = useMemo(() => calculateMonthToDateComparison(expenses, now), [expenses, now]);

    const categoryMap = useMemo(() => new Map(categories.map((category) => [category.label, category])), [categories]);
    const topCategories = useMemo(() => categoryTotals(monthTransactions, "expense").slice(0, 3), [monthTransactions]);
    const topCategoryMax = topCategories[0]?.amount ?? 1;

    const recentTransactions = useMemo(() => {
        return [...expenses]
            .sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime())
            .slice(0, 20);
    }, [expenses]);

    const accountRows = useMemo(() => {
        const rows = INITIAL_ACCOUNTS.map((account) => {
            const balance = getAccountBalance(account, expenses);
            const baseBalance = convertToBase(balance, account.currency);
            const chartData = Array.from({ length: 7 }, (_, index) => {
                const day = new Date(now);
                day.setDate(now.getDate() - (6 - index));
                return expenses.reduce((sum, transaction) => {
                    const txDate = parseDateString(transaction.date);
                    const sameDay =
                        txDate.getFullYear() === day.getFullYear() &&
                        txDate.getMonth() === day.getMonth() &&
                        txDate.getDate() === day.getDate();
                    if (!sameDay || transaction.accountId !== account.id || transaction.type !== "expense") return sum;
                    return sum + absoluteTransactionAmount(transaction);
                }, 0);
            });

            return { account, balance, baseBalance, chartData };
        });
        const total = rows.reduce((sum, row) => sum + row.baseBalance, 0) || 1;

        return rows.map((row) => ({ ...row, share: (row.baseBalance / total) * 100 }));
    }, [expenses, now]);

    const previousMonthLabel = comparison.previousEnd.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
    const monthLabel = now.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
    const budgetTotal = INITIAL_BUDGETS.reduce((sum, budget) => sum + budget.amount, 0);
    const budgetProgress = budgetTotal > 0 ? Math.min(monthExpenses / budgetTotal, 1) : 0;

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.eyebrow}>Money Keeper</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            {monthLabel}
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setIsHidden((value) => !value)} activeOpacity={0.76}>
                        <MaterialIcons name={isHidden ? "visibility-off" : "visibility"} size={22} color={APP_TEXT} />
                    </TouchableOpacity>
                </View>

                <SectionHeader title="Рахунки" action={`${accountRows.length} активні`} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountCarousel}>
                    {accountRows.map((row) => (
                        <DashboardAccountCard
                            key={row.account.id}
                            account={row.account}
                            balance={row.balance}
                            baseBalance={row.baseBalance}
                            share={row.share}
                            chartData={row.chartData}
                            hidden={isHidden}
                        />
                    ))}
                </ScrollView>

                <View style={styles.statsGrid}>
                    <StatTile icon="trending-up" label="Доходи" value={formatCurrency(monthIncome)} color={APP_INCOME} />
                    <StatTile icon="trending-down" label="Витрати" value={formatCurrency(monthExpenses)} color={APP_EXPENSE} />
                    <StatTile icon="savings" label="Заощаджено" value={formatCurrency(savings)} color={APP_PRIMARY} />
                </View>

                <LinearGradient
                    colors={comparison.isBetter ? APP_GRADIENTS.softMint : APP_GRADIENTS.softRose}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.comparisonCard}
                >
                    <View style={[styles.comparisonIcon, { backgroundColor: comparison.isBetter ? "#EAF7EF" : "#FDEDEC" }]}>
                        <MaterialIcons name={comparison.isBetter ? "south-west" : "north-east"} size={22} color={comparison.isBetter ? APP_INCOME : APP_EXPENSE} />
                    </View>
                    <View style={styles.comparisonBody}>
                        <ThemedText type="defaultSemiBold" style={styles.comparisonTitle}>
                            На цю ж дату минулого місяця
                        </ThemedText>
                        <ThemedText style={styles.comparisonText}>
                            До {previousMonthLabel}: {formatCurrency(comparison.previous)} · зараз {formatCurrency(comparison.current)}
                        </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={[styles.comparisonDelta, { color: comparison.isBetter ? APP_INCOME : APP_EXPENSE }]}>
                        {comparison.delta > 0 ? "+" : ""}
                        {comparison.percent.toFixed(0)}%
                    </ThemedText>
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <View>
                            <ThemedText type="defaultSemiBold" style={styles.budgetTitle}>
                                Місячний бюджет
                            </ThemedText>
                            <ThemedText style={styles.budgetSubtitle}>
                                {formatCurrency(monthExpenses)} з {formatCurrency(budgetTotal)}
                            </ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.budgetPercent}>
                            {Math.round(budgetProgress * 100)}%
                        </ThemedText>
                    </View>
                    <View style={styles.budgetTrack}>
                        <View style={[styles.budgetFill, { width: `${budgetProgress * 100}%` }]} />
                    </View>
                </LinearGradient>

                <View style={styles.section}>
                    <SectionHeader title="Топ категорії" action="місяць" />
                    <LinearGradient colors={APP_GRADIENTS.softViolet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardList}>
                        {topCategories.map((item) => {
                            const category = categoryMap.get(item.category);
                            return (
                                <ProgressLine
                                    key={item.category}
                                    label={item.category}
                                    amount={item.amount}
                                    total={topCategoryMax}
                                    color={category?.color ?? APP_PRIMARY}
                                />
                            );
                        })}
                    </LinearGradient>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Останні транзакції" action={`${recentTransactions.length} записів`} />
                    <View style={styles.transactionList}>
                        {recentTransactions.map((transaction) => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                onPress={() => router.push({ pathname: "/modal", params: { id: transaction.id } })}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: APP_BG,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 104,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
        paddingBottom: 18,
    },
    eyebrow: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    title: {
        color: APP_TEXT,
        fontSize: 25,
        textTransform: "capitalize",
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 4,
    },
    accountCarousel: {
        gap: 14,
        paddingRight: 20,
        paddingBottom: 4,
    },
    accountHeroCard: {
        width: Math.min(SCREEN_WIDTH - 58, 370),
        minHeight: 214,
        borderRadius: 24,
        padding: 20,
        justifyContent: "space-between",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
    accountHeroTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    accountHeroIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    accountHeroMeta: {
        flex: 1,
        minWidth: 0,
    },
    accountHeroName: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    accountHeroType: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 12,
        marginTop: 2,
    },
    accountSharePill: {
        minHeight: 32,
        borderRadius: 999,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.16)",
    },
    accountShareText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "900",
    },
    accountHeroBalance: {
        color: "#FFFFFF",
        fontSize: 34,
        lineHeight: 40,
        marginTop: 28,
    },
    accountHeroFooter: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 18,
        marginTop: 22,
    },
    accountHeroCaption: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 12,
        marginBottom: 2,
    },
    accountHeroBaseValue: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    balanceLabel: {
        color: "rgba(255,255,255,0.74)",
        fontSize: 14,
        fontWeight: "700",
    },
    livePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#7DFFB2",
    },
    liveText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    balanceValue: {
        color: "#FFFFFF",
        fontSize: 38,
        lineHeight: 44,
        marginTop: 28,
    },
    balanceFooter: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 18,
        marginTop: 22,
    },
    balanceCaption: {
        color: "rgba(255,255,255,0.62)",
        fontSize: 12,
        marginBottom: 2,
    },
    balanceSubValue: {
        color: "#FFFFFF",
        fontSize: 17,
    },
    miniChart: {
        height: 54,
        minWidth: 106,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 6,
    },
    miniBarTrack: {
        width: 9,
        height: "100%",
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.16)",
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    miniBar: {
        width: "100%",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
    },
    statsGrid: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
    },
    statTile: {
        flex: 1,
        minHeight: 124,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        justifyContent: "space-between",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    statIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    statLabel: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "700",
    },
    statValue: {
        color: APP_TEXT,
        fontSize: 15,
    },
    comparisonCard: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    comparisonIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    comparisonBody: {
        flex: 1,
    },
    comparisonTitle: {
        color: APP_TEXT,
        fontSize: 15,
    },
    comparisonText: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    comparisonDelta: {
        minWidth: 52,
        textAlign: "right",
        fontSize: 16,
    },
    budgetCard: {
        marginTop: 14,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    budgetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    budgetTitle: {
        color: APP_TEXT,
        fontSize: 16,
    },
    budgetSubtitle: {
        color: "#6B7280",
        fontSize: 13,
    },
    budgetPercent: {
        color: APP_PRIMARY,
        fontSize: 20,
    },
    budgetTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: "#E7ECF3",
        overflow: "hidden",
    },
    budgetFill: {
        height: "100%",
        borderRadius: 999,
        backgroundColor: APP_PRIMARY,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitle: {
        color: APP_TEXT,
        fontSize: 18,
    },
    sectionAction: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "700",
    },
    cardList: {
        gap: 10,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
    },
    progressLine: {
        gap: 8,
    },
    progressMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    progressLabel: {
        color: APP_TEXT,
        fontSize: 14,
    },
    progressValue: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "700",
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E7ECF3",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },
    transactionList: {
        gap: 10,
    },
    transactionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    transactionBody: {
        flex: 1,
        minWidth: 0,
    },
    transactionName: {
        color: APP_TEXT,
        fontSize: 15,
    },
    transactionDate: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 14,
        maxWidth: 112,
        textAlign: "right",
    },
});
