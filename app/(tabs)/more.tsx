import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useExpenses } from "@/context/expenses-context";
import {
    APP_BG,
    APP_EXPENSE,
    APP_GRADIENTS,
    APP_INCOME,
    APP_PRIMARY,
    APP_TEXT,
    INITIAL_BUDGETS,
    INITIAL_GOALS,
    INITIAL_RECURRING_PAYMENTS,
} from "@/shared/config";
import { absoluteTransactionAmount, filterByMonth, formatCurrency } from "@/shared/finance";

function SectionTitle({ title, action }: { title: string; action?: string }) {
    return (
        <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {title}
            </ThemedText>
            {action ? <ThemedText style={styles.sectionAction}>{action}</ThemedText> : null}
        </View>
    );
}

function ProgressCard({
    title,
    subtitle,
    value,
    total,
    color,
    icon,
}: {
    title: string;
    subtitle: string;
    value: number;
    total: number;
    color: string;
    icon: keyof typeof MaterialIcons.glyphMap;
}) {
    const progress = total > 0 ? Math.min(value / total, 1) : 0;

    return (
        <LinearGradient colors={["#FFFFFF", `${color}12`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.progressCard}>
            <View style={styles.progressTop}>
                <View style={[styles.progressIcon, { backgroundColor: `${color}16` }]}>
                    <MaterialIcons name={icon} size={22} color={color} />
                </View>
                <View style={styles.progressTitleWrap}>
                    <ThemedText type="defaultSemiBold" style={styles.progressTitle} numberOfLines={1}>
                        {title}
                    </ThemedText>
                    <ThemedText style={styles.progressSubtitle}>{subtitle}</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={[styles.progressPercent, { color }]}>
                    {Math.round(progress * 100)}%
                </ThemedText>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
            </View>
        </LinearGradient>
    );
}

function SettingsRow({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
}: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}) {
    return (
        <View style={styles.settingsRow}>
            <View style={styles.settingsIcon}>
                <MaterialIcons name={icon} size={21} color={APP_PRIMARY} />
            </View>
            <View style={styles.settingsBody}>
                <ThemedText type="defaultSemiBold" style={styles.settingsTitle}>
                    {title}
                </ThemedText>
                <ThemedText style={styles.settingsSubtitle}>{subtitle}</ThemedText>
            </View>
            <Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#D0D5DD", true: "#BBD7EF" }} thumbColor={value ? APP_PRIMARY : "#FFFFFF"} />
        </View>
    );
}

export default function MoreScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { expenses } = useExpenses();
    const [biometry, setBiometry] = useState(true);
    const [darkTheme, setDarkTheme] = useState(false);
    const [hiddenBalance, setHiddenBalance] = useState(false);

    const budgetRows = useMemo(() => {
        const monthTransactions = filterByMonth(expenses);
        return INITIAL_BUDGETS.map((budget) => {
            const used = monthTransactions.reduce((sum, transaction) => {
                if (transaction.type !== "expense" || transaction.category !== budget.category) return sum;
                return sum + absoluteTransactionAmount(transaction);
            }, 0);
            return { ...budget, used };
        });
    }, [expenses]);

    const upcomingTotal = INITIAL_RECURRING_PAYMENTS.reduce((sum, item) => sum + item.amount, 0);

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.eyebrow}>Керування</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            Більше
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.backupButton} activeOpacity={0.78}>
                        <MaterialIcons name="cloud-upload" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.menuGrid}>
                    <TouchableOpacity style={styles.menuCard} onPress={() => router.push("/categories")} activeOpacity={0.78}>
                        <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuGradient}>
                            <MaterialIcons name="category" size={24} color={APP_PRIMARY} />
                            <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                                Категорії
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuCard} activeOpacity={0.78}>
                        <LinearGradient colors={APP_GRADIENTS.softMint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuGradient}>
                            <MaterialIcons name="file-download" size={24} color="#16A085" />
                            <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                                Експорт
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuCard} activeOpacity={0.78}>
                        <LinearGradient colors={["#FFFFFF", "#FFF8EA"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.menuGradient}>
                            <MaterialIcons name="lock" size={24} color="#F39C12" />
                            <ThemedText type="defaultSemiBold" style={styles.menuTitle}>
                                PIN
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <SectionTitle title="Бюджети" action="80% alert" />
                <View style={styles.stack}>
                    {budgetRows.map((budget) => {
                        const isOver = budget.used >= budget.amount;
                        const isClose = budget.used / budget.amount >= budget.alertAt / 100;
                        return (
                            <ProgressCard
                                key={budget.id}
                                title={budget.category}
                                subtitle={`${formatCurrency(budget.used)} з ${formatCurrency(budget.amount)}${isOver ? " - перевищено" : isClose ? " - близько до ліміту" : ""}`}
                                value={budget.used}
                                total={budget.amount}
                                color={isOver ? APP_EXPENSE : isClose ? "#F39C12" : budget.color}
                                icon={isOver ? "warning" : "pie-chart"}
                            />
                        );
                    })}
                </View>

                <SectionTitle title="Фінансові цілі" action="активні" />
                <View style={styles.stack}>
                    {INITIAL_GOALS.map((goal) => (
                        <ProgressCard
                            key={goal.id}
                            title={goal.title}
                            subtitle={`${formatCurrency(goal.saved)} з ${formatCurrency(goal.target)} - до ${goal.deadline}`}
                            value={goal.saved}
                            total={goal.target}
                            color={goal.color}
                            icon={goal.icon}
                        />
                    ))}
                </View>

                <SectionTitle title="Регулярні платежі" action={formatCurrency(upcomingTotal)} />
                <View style={styles.recurringList}>
                    {INITIAL_RECURRING_PAYMENTS.map((payment) => (
                        <View key={payment.id} style={styles.recurringRow}>
                            <View style={styles.recurringIcon}>
                                <MaterialIcons name={payment.icon} size={22} color={APP_PRIMARY} />
                            </View>
                            <View style={styles.recurringBody}>
                                <ThemedText type="defaultSemiBold" style={styles.recurringTitle}>
                                    {payment.title}
                                </ThemedText>
                                <ThemedText style={styles.recurringMeta}>
                                    {payment.category} - {payment.frequency} - нагадати за {payment.alertDays} дн.
                                </ThemedText>
                            </View>
                            <View style={styles.recurringAmountWrap}>
                                <ThemedText type="defaultSemiBold" style={styles.recurringAmount}>
                                    {formatCurrency(payment.amount)}
                                </ThemedText>
                                <ThemedText style={styles.recurringDate}>{payment.nextDate}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>

                <SectionTitle title="Налаштування" />
                <LinearGradient colors={APP_GRADIENTS.softViolet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.settingsCard}>
                    <SettingsRow icon="fingerprint" title="Біометрія" subtitle="Face ID / Touch ID для входу" value={biometry} onValueChange={setBiometry} />
                    <SettingsRow icon="visibility-off" title="Прихований баланс" subtitle="Маскувати суми на головному екрані" value={hiddenBalance} onValueChange={setHiddenBalance} />
                    <SettingsRow icon="dark-mode" title="Темна тема" subtitle="Підготовлено для light/dark режимів" value={darkTheme} onValueChange={setDarkTheme} />
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softMint} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.backupCard}>
                    <View style={[styles.backupIcon, { backgroundColor: `${APP_INCOME}16` }]}>
                        <MaterialIcons name="verified-user" size={24} color={APP_INCOME} />
                    </View>
                    <View style={styles.backupBody}>
                        <ThemedText type="defaultSemiBold" style={styles.backupTitle}>
                            Локальний бекап
                        </ThemedText>
                        <ThemedText style={styles.backupText}>Дані готові до резервної копії у файл без підключення банків.</ThemedText>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    backupButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: APP_PRIMARY,
        alignItems: "center",
        justifyContent: "center",
    },
    menuGrid: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 22,
    },
    menuCard: {
        flex: 1,
        minHeight: 88,
        borderRadius: 18,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    menuGradient: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 10,
    },
    menuTitle: {
        color: APP_TEXT,
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
        marginBottom: 12,
    },
    sectionTitle: {
        color: APP_TEXT,
        fontSize: 18,
    },
    sectionAction: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "800",
    },
    stack: {
        gap: 10,
        marginBottom: 22,
    },
    progressCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    progressTop: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    progressIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    progressTitleWrap: {
        flex: 1,
        minWidth: 0,
    },
    progressTitle: {
        color: APP_TEXT,
        fontSize: 15,
    },
    progressSubtitle: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    progressPercent: {
        minWidth: 44,
        textAlign: "right",
        fontSize: 16,
    },
    track: {
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E7ECF3",
        overflow: "hidden",
    },
    fill: {
        height: "100%",
        borderRadius: 999,
    },
    recurringList: {
        gap: 10,
        marginBottom: 22,
    },
    recurringRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 14,
    },
    recurringIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEF6FC",
    },
    recurringBody: {
        flex: 1,
        minWidth: 0,
    },
    recurringTitle: {
        color: APP_TEXT,
        fontSize: 15,
    },
    recurringMeta: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    recurringAmountWrap: {
        alignItems: "flex-end",
        minWidth: 86,
    },
    recurringAmount: {
        color: APP_EXPENSE,
        fontSize: 13,
    },
    recurringDate: {
        color: "#6B7280",
        fontSize: 11,
        marginTop: 2,
    },
    settingsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    settingsRow: {
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEF2F6",
    },
    settingsIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEF6FC",
    },
    settingsBody: {
        flex: 1,
        minWidth: 0,
    },
    settingsTitle: {
        color: APP_TEXT,
        fontSize: 15,
    },
    settingsSubtitle: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    backupCard: {
        flexDirection: "row",
        gap: 12,
        borderRadius: 20,
        padding: 16,
        backgroundColor: "#FFFFFF",
    },
    backupIcon: {
        width: 46,
        height: 46,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    backupBody: {
        flex: 1,
        minWidth: 0,
    },
    backupTitle: {
        color: APP_TEXT,
        fontSize: 16,
    },
    backupText: {
        color: "#6B7280",
        fontSize: 13,
        marginTop: 3,
    },
});
