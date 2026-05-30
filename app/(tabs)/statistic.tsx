import { useCallback, useMemo, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { FontFamily } from "@/constants/theme";
import { useCategories } from "@/context/categories-context";
import { useExpenses, type Expense } from "@/context/expenses-context";
import { APP_BG, APP_EXPENSE, APP_GRADIENTS, APP_INCOME, APP_PRIMARY, APP_TEXT } from "@/shared/config";
import {
    categoryTotals,
    formatCompactCurrency,
    formatCurrency,
    parseDateString,
    sumTransactions,
    toISODate,
} from "@/shared/finance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = Math.max(320, SCREEN_WIDTH - 40);
const SAME_DATE_COLORS = ["#2E75B6", "#27AE60", "#E74C3C", "#F39C12", "#8E44AD", "#16A085"];

type PeriodKey = "week" | "month" | "year" | "custom";

const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: "week", label: "Тиждень" },
    { key: "month", label: "Місяць" },
    { key: "year", label: "Рік" },
    { key: "custom", label: "Період" },
];

function periodStart(period: PeriodKey, now = new Date()) {
    if (period === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    if (period === "year") {
        return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    }

    return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

function parseInputDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
    const date = new Date(`${value.trim()}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatRangeLabel(start: Date, end: Date) {
    return `${start.toLocaleDateString("uk-UA", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "short",
    })}`;
}

function getPeriodRange(period: PeriodKey, now: Date, customFrom: string, customTo: string) {
    let start = periodStart(period, now);
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (period === "custom") {
        const parsedFrom = parseInputDate(customFrom);
        const parsedTo = parseInputDate(customTo);
        if (parsedFrom && parsedTo) {
            start = parsedFrom;
            end = parsedTo;
            if (start > end) {
                const originalStart = start;
                start = end;
                end = originalStart;
            }
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end, isValid: true };
        }
    }

    return { start, end, isValid: period !== "custom" };
}

function filterByRange(transactions: Expense[], start: Date, end: Date) {
    return transactions.filter((transaction) => {
        const date = parseDateString(transaction.date);
        return date >= start && date <= end;
    });
}

function daysBetween(start: Date, end: Date) {
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
}

function buildRangeRows(transactions: Expense[], start: Date, end: Date) {
    const dayCount = daysBetween(start, end);
    const rows: { label: string; income: number; expense: number }[] = [];

    if (dayCount <= 31) {
        const cursor = new Date(start);
        while (cursor <= end) {
            const dayStart = new Date(cursor);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(cursor);
            dayEnd.setHours(23, 59, 59, 999);
            const dayTransactions = filterByRange(transactions, dayStart, dayEnd);
            rows.push({
                label: cursor.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }),
                income: sumTransactions(dayTransactions, "income"),
                expense: sumTransactions(dayTransactions, "expense"),
            });
            cursor.setDate(cursor.getDate() + 1);
        }
        return rows;
    }

    if (dayCount <= 120) {
        const cursor = new Date(start);
        while (cursor <= end) {
            const weekStart = new Date(cursor);
            const weekEnd = new Date(cursor);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekEnd > end) weekEnd.setTime(end.getTime());
            const weekTransactions = filterByRange(transactions, weekStart, weekEnd);
            rows.push({
                label: weekStart.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }),
                income: sumTransactions(weekTransactions, "income"),
                expense: sumTransactions(weekTransactions, "expense"),
            });
            cursor.setDate(cursor.getDate() + 7);
        }
        return rows;
    }

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
        const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
        const boundedStart = monthStart < start ? start : monthStart;
        const boundedEnd = monthEnd > end ? end : monthEnd;
        const monthTransactions = filterByRange(transactions, boundedStart, boundedEnd);
        rows.push({
            label: cursor.toLocaleDateString("uk-UA", { month: "short" }),
            income: sumTransactions(monthTransactions, "income"),
            expense: sumTransactions(monthTransactions, "expense"),
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return rows;
}

function rgbaFromHex(hex: string, opacity: number) {
    const normalized = hex.replace("#", "");
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildSixMonthSameDateData(transactions: Expense[], anchorDate: Date) {
    const targetDay = anchorDate.getDate();
    const labels = Array.from({ length: targetDay }, (_, index) => {
        const day = index + 1;
        return day === 1 || day === targetDay || day % 5 === 0 ? String(day) : "";
    });

    const months = Array.from({ length: 6 }, (_, index) => {
        const offset = 5 - index;
        const month = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - offset, 1);
        const monthLastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const dayLimit = Math.min(targetDay, monthLastDay);
        const monthLabel = month.toLocaleDateString("uk-UA", { month: "short" });
        let running = 0;
        const data = Array.from({ length: targetDay }, (_, dayIndex) => {
            const day = dayIndex + 1;
            if (day <= dayLimit) {
                running += transactions.reduce((sum, transaction) => {
                    if (transaction.type !== "expense") return sum;
                    const date = parseDateString(transaction.date);
                    const sameMonth = date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
                    return sameMonth && date.getDate() === day ? sum + Number(transaction.amount || 0) : sum;
                }, 0);
            }
            return running;
        });

        return {
            label: monthLabel,
            total: running,
            color: SAME_DATE_COLORS[index % SAME_DATE_COLORS.length],
            data: data.length ? data : [0],
        };
    });

    return {
        labels,
        months,
        datasets: months.map((month) => ({
            data: month.data,
            color: (opacity = 1) => rgbaFromHex(month.color, opacity),
            strokeWidth: 2,
        })),
    };
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <LinearGradient colors={["#FFFFFF", `${color}12`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.metricPill}>
            <View style={[styles.metricDot, { backgroundColor: color }]} />
            <View style={styles.metricTextWrap}>
                <ThemedText style={styles.metricLabel}>{label}</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.metricValue} numberOfLines={1}>
                    {value}
                </ThemedText>
            </View>
        </LinearGradient>
    );
}

function MonthBars({ rows }: { rows: { label: string; income: number; expense: number }[] }) {
    const max = Math.max(...rows.flatMap((row) => [row.income, row.expense]), 1);

    return (
        <View style={[styles.monthBars, { minWidth: Math.max(CHART_WIDTH - 32, rows.length * 34) }]}>
            {rows.map((row) => (
                <View key={row.label} style={styles.monthBarColumn}>
                    <View style={styles.monthBarPair}>
                        <View style={[styles.monthBar, styles.incomeBar, { height: `${Math.max(8, (row.income / max) * 100)}%` }]} />
                        <View style={[styles.monthBar, styles.expenseBar, { height: `${Math.max(8, (row.expense / max) * 100)}%` }]} />
                    </View>
                    <ThemedText style={styles.monthBarLabel}>{row.label}</ThemedText>
                </View>
            ))}
        </View>
    );
}

function CategoryRow({ category, amount, share, delta, color }: { category: string; amount: number; share: number; delta: number; color: string }) {
    const isUp = delta > 0;
    const deltaColor = isUp ? APP_EXPENSE : APP_INCOME;

    return (
        <View style={styles.categoryRow}>
            <View style={[styles.categoryColor, { backgroundColor: color }]} />
            <View style={styles.categoryBody}>
                <View style={styles.categoryMeta}>
                    <ThemedText type="defaultSemiBold" style={styles.categoryName}>
                        {category}
                    </ThemedText>
                    <ThemedText style={styles.categoryShare}>{share.toFixed(0)}%</ThemedText>
                </View>
                <View style={styles.categoryTrack}>
                    <View style={[styles.categoryFill, { width: `${Math.min(share, 100)}%`, backgroundColor: color }]} />
                </View>
            </View>
            <View style={styles.categoryAmountWrap}>
                <ThemedText type="defaultSemiBold" style={styles.categoryAmount}>
                    {formatCompactCurrency(amount)}
                </ThemedText>
                <ThemedText style={[styles.categoryDelta, { color: delta === 0 ? "#6B7280" : deltaColor }]}>
                    {delta > 0 ? "+" : ""}
                    {formatCompactCurrency(delta)}
                </ThemedText>
            </View>
        </View>
    );
}

export default function StatisticScreen() {
    const insets = useSafeAreaInsets();
    const { categories } = useCategories();
    const { expenses } = useExpenses();
    const [period, setPeriod] = useState<PeriodKey>("month");
    const now = useMemo(() => new Date(), []);
    const [customFrom, setCustomFrom] = useState(() => toISODate(new Date(now.getFullYear(), now.getMonth(), 1)));
    const [customTo, setCustomTo] = useState(() => toISODate(now));
    const categoryMap = useMemo(() => new Map(categories.map((category) => [category.label, category])), [categories]);

    const selectedRange = useMemo(() => getPeriodRange(period, now, customFrom, customTo), [customFrom, customTo, now, period]);
    const selectedRangeLabel = useMemo(() => formatRangeLabel(selectedRange.start, selectedRange.end), [selectedRange.end, selectedRange.start]);
    const periodTransactions = useMemo(() => filterByRange(expenses, selectedRange.start, selectedRange.end), [expenses, selectedRange.end, selectedRange.start]);
    const periodExpense = useMemo(() => sumTransactions(periodTransactions, "expense"), [periodTransactions]);
    const periodIncome = useMemo(() => sumTransactions(periodTransactions, "income"), [periodTransactions]);
    const averageTransaction = useMemo(() => {
        const expenseTransactions = periodTransactions.filter((transaction) => transaction.type === "expense");
        if (!expenseTransactions.length) return 0;
        return periodExpense / expenseTransactions.length;
    }, [periodExpense, periodTransactions]);

    const pieData = useMemo(() => {
        const data = categoryTotals(periodTransactions, "expense").slice(0, 6);
        if (!data.length) {
            return [
                {
                    name: "Немає",
                    amount: 1,
                    color: "#DDE3EA",
                    legendFontColor: "#6B7280",
                    legendFontSize: 12,
                },
            ];
        }

        return data.map((item, index) => ({
            name: item.category,
            amount: item.amount,
            color: categoryMap.get(item.category)?.color ?? ["#2E75B6", "#27AE60", "#E74C3C", "#F39C12", "#8E44AD", "#16A085"][index % 6],
            legendFontColor: "#344054",
            legendFontSize: 12,
        }));
    }, [categoryMap, periodTransactions]);

    const rangeRows = useMemo(() => buildRangeRows(expenses, selectedRange.start, selectedRange.end), [expenses, selectedRange.end, selectedRange.start]);

    const cumulativeData = useMemo(() => {
        let running = 0;
        const totals = rangeRows.map((row) => {
            running += row.expense;
            return running;
        });

        return {
            labels: rangeRows.map((row, index) => (rangeRows.length <= 12 || index === 0 || index === rangeRows.length - 1 || index % 4 === 0 ? row.label : "")),
            data: totals.length ? totals : [0],
        };
    }, [rangeRows]);

    const sameDateSixMonthData = useMemo(() => buildSixMonthSameDateData(expenses, selectedRange.end), [expenses, selectedRange.end]);

    const categoryRows = useMemo(() => {
        const rangeMs = selectedRange.end.getTime() - selectedRange.start.getTime();
        const previousEnd = new Date(selectedRange.start.getTime() - 1);
        const previousStart = new Date(previousEnd.getTime() - rangeMs);
        const previousPeriod = filterByRange(expenses, previousStart, previousEnd);
        const current = categoryTotals(periodTransactions, "expense");
        const previous = new Map(categoryTotals(previousPeriod, "expense").map((item) => [item.category, item.amount]));
        const total = current.reduce((sum, item) => sum + item.amount, 0) || 1;

        return current.slice(0, 7).map((item) => ({
            ...item,
            share: (item.amount / total) * 100,
            delta: item.amount - (previous.get(item.category) ?? 0),
        }));
    }, [expenses, periodTransactions, selectedRange.end, selectedRange.start]);

    const applyQuickRange = useCallback((days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setPeriod("custom");
        setCustomFrom(toISODate(start));
        setCustomTo(toISODate(end));
    }, []);

    const applyCurrentMonth = useCallback(() => {
        const end = new Date();
        setPeriod("custom");
        setCustomFrom(toISODate(new Date(end.getFullYear(), end.getMonth(), 1)));
        setCustomTo(toISODate(end));
    }, []);

    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(46, 117, 182, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(52, 64, 84, ${opacity})`,
        decimalPlaces: 0,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: APP_PRIMARY,
        },
        propsForBackgroundLines: {
            stroke: "#E7ECF3",
        },
    };

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <ThemedText style={styles.eyebrow}>Звіти</ThemedText>
                    <ThemedText type="defaultSemiBold" style={styles.title}>
                        Аналітика
                    </ThemedText>
                </View>

                <View style={styles.segmented}>
                    {PERIODS.map((item) => {
                        const active = item.key === period;
                        return (
                            <TouchableOpacity key={item.key} style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={() => setPeriod(item.key)}>
                                <ThemedText style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <LinearGradient colors={period === "custom" ? APP_GRADIENTS.softBlue : APP_GRADIENTS.softMint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rangeCard}>
                    <View style={styles.rangeHeader}>
                        <View>
                            <ThemedText type="defaultSemiBold" style={styles.rangeTitle}>
                                Обраний період
                            </ThemedText>
                            <ThemedText style={styles.rangeSubtitle}>
                                {selectedRange.isValid ? selectedRangeLabel : "Введіть дати у форматі YYYY-MM-DD"}
                            </ThemedText>
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.rangeCount}>
                            {periodTransactions.length} записів
                        </ThemedText>
                    </View>

                    {period === "custom" ? (
                        <>
                            <View style={styles.dateInputsRow}>
                                <View style={styles.dateField}>
                                    <ThemedText style={styles.dateLabel}>Від</ThemedText>
                                    <TextInput
                                        value={customFrom}
                                        onChangeText={setCustomFrom}
                                        placeholder="2026-05-01"
                                        placeholderTextColor="#98A2B3"
                                        style={styles.dateInput}
                                    />
                                </View>
                                <View style={styles.dateField}>
                                    <ThemedText style={styles.dateLabel}>До</ThemedText>
                                    <TextInput
                                        value={customTo}
                                        onChangeText={setCustomTo}
                                        placeholder="2026-05-29"
                                        placeholderTextColor="#98A2B3"
                                        style={styles.dateInput}
                                    />
                                </View>
                            </View>
                            <View style={styles.quickRanges}>
                                <TouchableOpacity style={styles.quickRangeButton} onPress={() => applyQuickRange(7)}>
                                    <ThemedText style={styles.quickRangeText}>7 днів</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickRangeButton} onPress={() => applyQuickRange(30)}>
                                    <ThemedText style={styles.quickRangeText}>30 днів</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickRangeButton} onPress={applyCurrentMonth}>
                                    <ThemedText style={styles.quickRangeText}>Цей місяць</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : null}
                </LinearGradient>

                <View style={styles.metricsRow}>
                    <MetricPill label="Доходи" value={formatCurrency(periodIncome)} color={APP_INCOME} />
                    <MetricPill label="Витрати" value={formatCurrency(periodExpense)} color={APP_EXPENSE} />
                    <MetricPill label="Середній чек" value={formatCurrency(averageTransaction)} color={APP_PRIMARY} />
                </View>

                <LinearGradient colors={APP_GRADIENTS.softViolet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            Категорії витрат
                        </ThemedText>
                        <ThemedText style={styles.cardHint}>{period === "custom" ? selectedRangeLabel : PERIODS.find((item) => item.key === period)?.label}</ThemedText>
                    </View>
                    <PieChart
                        data={pieData}
                        width={CHART_WIDTH}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="14"
                        absolute
                    />
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            Доходи vs витрати
                        </ThemedText>
                        <View style={styles.legend}>
                            <View style={[styles.legendDot, { backgroundColor: APP_INCOME }]} />
                            <ThemedText style={styles.legendText}>дохід</ThemedText>
                            <View style={[styles.legendDot, { backgroundColor: APP_EXPENSE }]} />
                            <ThemedText style={styles.legendText}>витрата</ThemedText>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <MonthBars rows={rangeRows} />
                    </ScrollView>
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softMint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            Накопичувальна крива
                        </ThemedText>
                        <ThemedText style={styles.cardHint}>{selectedRangeLabel}</ThemedText>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={{
                                labels: cumulativeData.labels,
                                datasets: [{ data: cumulativeData.data }],
                            }}
                            width={Math.max(CHART_WIDTH, cumulativeData.data.length * 28)}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            withInnerLines={false}
                            style={styles.chart}
                        />
                    </ScrollView>
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            Пів року на цю дату
                        </ThemedText>
                        <ThemedText style={styles.cardHint}>до {selectedRange.end.getDate()} числа</ThemedText>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={{
                                labels: sameDateSixMonthData.labels,
                                datasets: sameDateSixMonthData.datasets,
                            }}
                            width={Math.max(CHART_WIDTH, sameDateSixMonthData.labels.length * 34)}
                            height={240}
                            chartConfig={chartConfig}
                            bezier
                            withInnerLines={false}
                            style={styles.chart}
                        />
                    </ScrollView>
                    <View style={styles.sameDateLegend}>
                        {sameDateSixMonthData.months.map((month) => (
                            <View key={month.label} style={styles.sameDateLegendItem}>
                                <View style={[styles.sameDateDot, { backgroundColor: month.color }]} />
                                <ThemedText style={styles.sameDateLabel}>{month.label}</ThemedText>
                                <ThemedText type="defaultSemiBold" style={styles.sameDateValue}>
                                    {formatCompactCurrency(month.total)}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softRose} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            Порівняння категорій
                        </ThemedText>
                        <ThemedText style={styles.cardHint}>vs попередній період</ThemedText>
                    </View>
                    <View style={styles.categoryList}>
                        {categoryRows.map((row) => (
                            <CategoryRow
                                key={row.category}
                                category={row.category}
                                amount={row.amount}
                                share={row.share}
                                delta={row.delta}
                                color={categoryMap.get(row.category)?.color ?? APP_PRIMARY}
                            />
                        ))}
                    </View>
                </LinearGradient>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: APP_BG,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 104,
    },
    header: {
        marginBottom: 16,
    },
    eyebrow: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    title: {
        color: APP_TEXT,
        fontSize: 28,
    },
    segmented: {
        flexDirection: "row",
        padding: 5,
        borderRadius: 16,
        backgroundColor: "#E7ECF3",
        marginBottom: 14,
    },
    segmentButton: {
        flex: 1,
        minHeight: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    segmentButtonActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    segmentText: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "800",
    },
    segmentTextActive: {
        color: APP_TEXT,
    },
    rangeCard: {
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    rangeHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    rangeTitle: {
        color: APP_TEXT,
        fontSize: 15,
    },
    rangeSubtitle: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    rangeCount: {
        color: APP_PRIMARY,
        fontSize: 13,
        textAlign: "right",
    },
    dateInputsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    dateField: {
        flex: 1,
        gap: 6,
    },
    dateLabel: {
        color: "#667085",
        fontSize: 11,
        fontWeight: "800",
        textTransform: "uppercase",
    },
    dateInput: {
        minHeight: 46,
        borderWidth: 1,
        borderColor: "#C9DAEA",
        borderRadius: 14,
        paddingHorizontal: 12,
        color: APP_TEXT,
        backgroundColor: "rgba(255,255,255,0.74)",
        fontFamily: FontFamily.semiBold,
        fontSize: 14,
    },
    quickRanges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    quickRangeButton: {
        minHeight: 36,
        borderRadius: 999,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(46,117,182,0.1)",
    },
    quickRangeText: {
        color: APP_PRIMARY,
        fontSize: 12,
        fontWeight: "800",
    },
    metricsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 14,
    },
    metricPill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: 72,
        padding: 12,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
    },
    metricDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    metricTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    metricLabel: {
        color: "#6B7280",
        fontSize: 11,
        fontWeight: "700",
    },
    metricValue: {
        color: APP_TEXT,
        fontSize: 13,
        marginTop: 2,
    },
    card: {
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 14,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    cardTitle: {
        color: APP_TEXT,
        fontSize: 17,
    },
    cardHint: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    chart: {
        borderRadius: 14,
    },
    legend: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 4,
    },
    legendText: {
        color: "#6B7280",
        fontSize: 11,
        fontWeight: "700",
    },
    monthBars: {
        height: 196,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 8,
        paddingTop: 18,
    },
    monthBarColumn: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    monthBarPair: {
        height: 150,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 5,
    },
    monthBar: {
        width: 10,
        borderRadius: 999,
    },
    incomeBar: {
        backgroundColor: APP_INCOME,
    },
    expenseBar: {
        backgroundColor: APP_EXPENSE,
    },
    monthBarLabel: {
        color: "#6B7280",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "capitalize",
    },
    sameDateLegend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    sameDateLegendItem: {
        minHeight: 34,
        borderRadius: 999,
        paddingHorizontal: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.72)",
        borderWidth: 1,
        borderColor: "rgba(46,117,182,0.1)",
    },
    sameDateDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    sameDateLabel: {
        color: "#667085",
        fontSize: 12,
        fontWeight: "800",
        textTransform: "capitalize",
    },
    sameDateValue: {
        color: APP_TEXT,
        fontSize: 12,
    },
    categoryList: {
        gap: 14,
    },
    categoryRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    categoryColor: {
        width: 12,
        height: 44,
        borderRadius: 999,
    },
    categoryBody: {
        flex: 1,
        minWidth: 0,
        gap: 8,
    },
    categoryMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    categoryName: {
        color: APP_TEXT,
        fontSize: 14,
    },
    categoryShare: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "700",
    },
    categoryTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E7ECF3",
        overflow: "hidden",
    },
    categoryFill: {
        height: "100%",
        borderRadius: 999,
    },
    categoryAmountWrap: {
        minWidth: 88,
        alignItems: "flex-end",
    },
    categoryAmount: {
        color: APP_TEXT,
        fontSize: 13,
    },
    categoryDelta: {
        fontSize: 11,
        fontWeight: "800",
        marginTop: 1,
    },
});
