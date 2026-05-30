import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useExpenses } from "@/context/expenses-context";
import { APP_BG, APP_GRADIENTS, APP_PRIMARY, APP_TEXT, INITIAL_ACCOUNTS, type AccountItem } from "@/shared/config";
import { convertToBase, formatCurrency, getAccountBalance } from "@/shared/finance";

function typeLabel(type: AccountItem["type"]) {
    const labels: Record<AccountItem["type"], string> = {
        cash: "Готівка",
        card: "Картка",
        deposit: "Депозит",
        credit: "Кредит",
        investment: "Інвестиції",
    };
    return labels[type];
}

function AccountCard({ account, balance, share }: { account: AccountItem; balance: number; share: number }) {
    return (
        <LinearGradient colors={["#FFFFFF", `${account.color}12`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.accountCard}>
            <View style={styles.accountHeader}>
                <View style={[styles.accountIcon, { backgroundColor: `${account.color}18` }]}>
                    <MaterialIcons name={account.icon} size={24} color={account.color} />
                </View>
                <View style={styles.accountTitleWrap}>
                    <ThemedText type="defaultSemiBold" style={styles.accountName} numberOfLines={1}>
                        {account.name}
                    </ThemedText>
                    <ThemedText style={styles.accountType}>{typeLabel(account.type)} · {account.currency}</ThemedText>
                </View>
                <MaterialIcons name="more-horiz" size={22} color="#98A2B3" />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.accountBalance}>
                {formatCurrency(balance, account.currency)}
            </ThemedText>
            <View style={styles.accountFooter}>
                <View style={styles.shareTrack}>
                    <View style={[styles.shareFill, { width: `${Math.min(share, 100)}%`, backgroundColor: account.color }]} />
                </View>
                <ThemedText style={styles.shareText}>{share.toFixed(0)}%</ThemedText>
            </View>
        </LinearGradient>
    );
}

export default function AccountsScreen() {
    const insets = useSafeAreaInsets();
    const { expenses } = useExpenses();

    const rows = useMemo(() => {
        const accountRows = INITIAL_ACCOUNTS.map((account) => {
            const balance = getAccountBalance(account, expenses);
            return {
                account,
                balance,
                baseBalance: convertToBase(balance, account.currency),
            };
        });
        const total = accountRows.reduce((sum, row) => sum + row.baseBalance, 0) || 1;
        return accountRows.map((row) => ({ ...row, share: (row.baseBalance / total) * 100 }));
    }, [expenses]);

    const totalBalance = rows.reduce((sum, row) => sum + row.baseBalance, 0);
    const liquidBalance = rows.filter((row) => row.account.group === "personal").reduce((sum, row) => sum + row.baseBalance, 0);
    const savingsBalance = rows.filter((row) => row.account.group === "savings").reduce((sum, row) => sum + row.baseBalance, 0);

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.eyebrow}>Гаманці</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            Рахунки
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.addButton} activeOpacity={0.78}>
                        <MaterialIcons name="add-card" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <LinearGradient colors={APP_GRADIENTS.ocean} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.totalCard}>
                    <View>
                        <ThemedText style={styles.totalLabel}>Загальний стан</ThemedText>
                        <ThemedText type="title" style={styles.totalValue}>
                            {formatCurrency(totalBalance)}
                        </ThemedText>
                    </View>
                    <View style={styles.totalStats}>
                        <View style={styles.totalStat}>
                            <ThemedText style={styles.totalStatLabel}>Доступно</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.totalStatValue}>
                                {formatCurrency(liquidBalance)}
                            </ThemedText>
                        </View>
                        <View style={styles.totalStat}>
                            <ThemedText style={styles.totalStatLabel}>Накопичення</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.totalStatValue}>
                                {formatCurrency(savingsBalance)}
                            </ThemedText>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.quickGrid}>
                    <TouchableOpacity style={styles.quickCard} activeOpacity={0.78}>
                        <MaterialIcons name="swap-horiz" size={23} color={APP_PRIMARY} />
                        <ThemedText type="defaultSemiBold" style={styles.quickTitle}>Переказ</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickCard} activeOpacity={0.78}>
                        <MaterialIcons name="edit" size={23} color="#16A085" />
                        <ThemedText type="defaultSemiBold" style={styles.quickTitle}>Корекція</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickCard} activeOpacity={0.78}>
                        <MaterialIcons name="archive" size={23} color="#F39C12" />
                        <ThemedText type="defaultSemiBold" style={styles.quickTitle}>Архів</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        Активні рахунки
                    </ThemedText>
                    <ThemedText style={styles.sectionAction}>{rows.length} шт.</ThemedText>
                </View>
                <View style={styles.accountsList}>
                    {rows.map((row) => (
                        <AccountCard key={row.account.id} account={row.account} balance={row.balance} share={row.share} />
                    ))}
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
    addButton: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: APP_PRIMARY,
        alignItems: "center",
        justifyContent: "center",
    },
    totalCard: {
        borderRadius: 24,
        padding: 22,
        minHeight: 210,
        justifyContent: "space-between",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 22,
        elevation: 10,
    },
    totalLabel: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 14,
        fontWeight: "800",
    },
    totalValue: {
        color: "#FFFFFF",
        fontSize: 36,
        lineHeight: 42,
        marginTop: 8,
    },
    totalStats: {
        flexDirection: "row",
        gap: 10,
    },
    totalStat: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        backgroundColor: "rgba(255,255,255,0.14)",
    },
    totalStatLabel: {
        color: "rgba(255,255,255,0.68)",
        fontSize: 12,
        fontWeight: "700",
    },
    totalStatValue: {
        color: "#FFFFFF",
        fontSize: 15,
        marginTop: 3,
    },
    quickGrid: {
        flexDirection: "row",
        gap: 10,
        marginTop: 16,
        marginBottom: 22,
    },
    quickCard: {
        flex: 1,
        minHeight: 78,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    quickTitle: {
        color: APP_TEXT,
        fontSize: 13,
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
        fontWeight: "800",
    },
    accountsList: {
        gap: 12,
    },
    accountCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    accountHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    accountIcon: {
        width: 46,
        height: 46,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    accountTitleWrap: {
        flex: 1,
        minWidth: 0,
    },
    accountName: {
        color: APP_TEXT,
        fontSize: 16,
    },
    accountType: {
        color: "#6B7280",
        fontSize: 12,
        marginTop: 2,
    },
    accountBalance: {
        color: APP_TEXT,
        fontSize: 24,
        marginTop: 16,
    },
    accountFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 12,
    },
    shareTrack: {
        flex: 1,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#E7ECF3",
        overflow: "hidden",
    },
    shareFill: {
        height: "100%",
        borderRadius: 999,
    },
    shareText: {
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "800",
        minWidth: 38,
        textAlign: "right",
    },
});
