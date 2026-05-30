import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { FontFamily } from "@/constants/theme";
import { useCategories } from "@/context/categories-context";
import { useExpenses } from "@/context/expenses-context";
import {
    APP_BG,
    APP_EXPENSE,
    APP_GRADIENTS,
    APP_INCOME,
    APP_PRIMARY,
    APP_TEXT,
    INITIAL_ACCOUNTS,
    TransactionType,
} from "@/shared/config";
import { formatCurrency, formatDisplayDate, toISODate } from "@/shared/finance";

const TYPE_OPTIONS: { key: TransactionType; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
    { key: "expense", label: "Витрата", icon: "trending-down", color: APP_EXPENSE },
    { key: "income", label: "Дохід", icon: "trending-up", color: APP_INCOME },
    { key: "transfer", label: "Переказ", icon: "swap-horiz", color: APP_PRIMARY },
];

const TAGS = ["робота", "дім", "підписка", "готівка", "сім'я"];

export default function ModalScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { categories } = useCategories();
    const { addExpense, deleteExpense, expenses, updateExpense } = useExpenses();
    const [type, setType] = useState<TransactionType>("expense");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(categories.find((item) => item.type === "expense")?.label ?? "Інше");
    const [accountId, setAccountId] = useState(INITIAL_ACCOUNTS[0]?.id ?? "mono");
    const [sum, setSum] = useState("");
    const [date, setDate] = useState(() => toISODate(new Date()));
    const [note, setNote] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const isEditMode = Boolean(params.id);
    const categoryOptions = useMemo(() => {
        if (type === "transfer") return [];
        return categories.filter((item) => item.type === type);
    }, [categories, type]);

    useEffect(() => {
        if (!isEditMode) {
            navigation.setOptions({ title: "Нова транзакція" });
            return;
        }

        const transaction = expenses.find((item) => item.id === params.id);
        if (!transaction) return;

        setType(transaction.type);
        setTitle(transaction.name);
        setCategory(transaction.category);
        setAccountId(transaction.accountId);
        setSum(transaction.amount);
        setDate(transaction.date);
        setNote(transaction.note ?? "");
        setSelectedTags(transaction.tags ?? []);
        navigation.setOptions({ title: transaction.name });
    }, [expenses, isEditMode, navigation, params.id]);

    useEffect(() => {
        if (type === "transfer") {
            setCategory("Переказ");
            return;
        }

        const firstCategory = categories.find((item) => item.type === type)?.label;
        if (firstCategory && !categories.some((item) => item.type === type && item.label === category)) {
            setCategory(firstCategory);
        }
    }, [categories, category, type]);

    const handleSave = useCallback(() => {
        const name = title.trim() || (type === "income" ? "Новий дохід" : type === "transfer" ? "Переказ між рахунками" : "Нова витрата");
        const amount = sum.trim().replace(",", ".");
        const amountNum = Number(amount);
        if (Number.isNaN(amountNum) || amountNum <= 0) {
            Alert.alert("Перевірте суму", "Введіть додатне число для транзакції.");
            return;
        }

        const categoryConfig = categories.find((item) => item.label === category);
        const payload = {
            name,
            category,
            amount,
            date: date.trim() || toISODate(new Date()),
            icon: type === "transfer" ? "swap-horiz" : categoryConfig?.icon ?? "receipt",
            type,
            accountId,
            currency: INITIAL_ACCOUNTS.find((account) => account.id === accountId)?.currency ?? "UAH",
            note: note.trim(),
            tags: selectedTags,
        } as const;

        if (isEditMode && params.id) {
            updateExpense(params.id, payload);
        } else {
            addExpense(payload);
        }
        router.back();
    }, [accountId, addExpense, categories, category, date, isEditMode, note, params.id, router, selectedTags, sum, title, type, updateExpense]);

    const handleDelete = useCallback(() => {
        if (!params.id) return;
        Alert.alert("Видалити транзакцію", "Цю дію не можна скасувати.", [
            { text: "Скасувати", style: "cancel" },
            {
                text: "Видалити",
                style: "destructive",
                onPress: () => {
                    deleteExpense(params.id!);
                    router.back();
                },
            },
        ]);
    }, [deleteExpense, params.id, router]);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
    }, []);

    const activeType = TYPE_OPTIONS.find((item) => item.key === type) ?? TYPE_OPTIONS[0];

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.eyebrow}>{isEditMode ? "Редагування" : "Швидке введення"}</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            {isEditMode ? "Транзакція" : "Додати запис"}
                        </ThemedText>
                    </View>
                    <Link href="/" dismissTo asChild>
                        <TouchableOpacity style={styles.closeButton}>
                            <MaterialIcons name="close" size={22} color={APP_TEXT} />
                        </TouchableOpacity>
                    </Link>
                </View>

                <View style={styles.typeRow}>
                    {TYPE_OPTIONS.map((item) => {
                        const active = item.key === type;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.typeButton, active && { backgroundColor: `${item.color}16`, borderColor: item.color }]}
                                onPress={() => setType(item.key)}
                                activeOpacity={0.78}
                            >
                                <MaterialIcons name={item.icon} size={20} color={active ? item.color : "#667085"} />
                                <ThemedText style={[styles.typeText, active && { color: item.color }]}>{item.label}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.amountCard}>
                    <ThemedText style={styles.inputLabel}>Сума</ThemedText>
                    <View style={styles.amountRow}>
                        <TextInput
                            style={styles.amountInput}
                            value={sum}
                            onChangeText={setSum}
                            placeholder="0"
                            placeholderTextColor="#98A2B3"
                            keyboardType="decimal-pad"
                        />
                        <ThemedText type="defaultSemiBold" style={styles.currencyLabel}>
                            {INITIAL_ACCOUNTS.find((account) => account.id === accountId)?.currency ?? "UAH"}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.amountHint, { color: activeType.color }]}>
                        {sum ? formatCurrency(Number(sum.replace(",", ".")) || 0, INITIAL_ACCOUNTS.find((account) => account.id === accountId)?.currency ?? "UAH") : " "}
                    </ThemedText>
                </LinearGradient>

                <LinearGradient colors={APP_GRADIENTS.softViolet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.formCard}>
                    <ThemedText style={styles.inputLabel}>Назва</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={type === "income" ? "Наприклад, Фриланс" : "Наприклад, Сільпо"}
                        placeholderTextColor="#98A2B3"
                    />

                    <ThemedText style={styles.inputLabel}>Рахунок</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                        {INITIAL_ACCOUNTS.map((account) => {
                            const active = account.id === accountId;
                            return (
                                <TouchableOpacity
                                    key={account.id}
                                    style={[styles.accountChip, active && { borderColor: account.color, backgroundColor: `${account.color}12` }]}
                                    onPress={() => setAccountId(account.id)}
                                >
                                    <MaterialIcons name={account.icon} size={18} color={active ? account.color : "#667085"} />
                                    <ThemedText style={[styles.accountChipText, active && { color: account.color }]}>{account.name}</ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {type !== "transfer" ? (
                        <>
                            <ThemedText style={styles.inputLabel}>Категорія</ThemedText>
                            <View style={styles.categoryGrid}>
                                {categoryOptions.slice(0, 12).map((item) => {
                                    const active = item.label === category;
                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.categoryButton, active && { borderColor: item.color, backgroundColor: `${item.color}12` }]}
                                            onPress={() => setCategory(item.label)}
                                            activeOpacity={0.78}
                                        >
                                            <MaterialIcons name={item.icon} size={20} color={active ? item.color : "#667085"} />
                                            <ThemedText style={[styles.categoryText, active && { color: item.color }]} numberOfLines={1}>
                                                {item.label}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </>
                    ) : null}

                    <ThemedText style={styles.inputLabel}>Дата</ThemedText>
                    <View style={styles.dateRow}>
                        <TextInput style={[styles.input, styles.dateInput]} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor="#98A2B3" />
                        <View style={styles.dateBadge}>
                            <MaterialIcons name="event" size={18} color={APP_PRIMARY} />
                            <ThemedText style={styles.dateBadgeText}>{formatDisplayDate(date)}</ThemedText>
                        </View>
                    </View>

                    <ThemedText style={styles.inputLabel}>Нотатка</ThemedText>
                    <TextInput
                        style={[styles.input, styles.noteInput]}
                        value={note}
                        onChangeText={setNote}
                        placeholder="Коментар, місце або деталі"
                        placeholderTextColor="#98A2B3"
                        multiline
                    />

                    <ThemedText style={styles.inputLabel}>Теги</ThemedText>
                    <View style={styles.tagsRow}>
                        {TAGS.map((tag) => {
                            const active = selectedTags.includes(tag);
                            return (
                                <TouchableOpacity key={tag} style={[styles.tagChip, active && styles.tagChipActive]} onPress={() => toggleTag(tag)}>
                                    <ThemedText style={[styles.tagText, active && styles.tagTextActive]}>#{tag}</ThemedText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.photoButton} activeOpacity={0.75}>
                        <MaterialIcons name="photo-camera" size={20} color={APP_PRIMARY} />
                        <ThemedText type="defaultSemiBold" style={styles.photoButtonText}>
                            Прикріпити фото чека
                        </ThemedText>
                    </TouchableOpacity>
                </LinearGradient>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.82}>
                    <LinearGradient colors={type === "income" ? APP_GRADIENTS.mint : type === "expense" ? APP_GRADIENTS.sunset : APP_GRADIENTS.ocean} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveGradient}>
                        <ThemedText style={styles.saveButtonText}>{isEditMode ? "Зберегти зміни" : "Додати транзакцію"}</ThemedText>
                    </LinearGradient>
                </TouchableOpacity>

                {isEditMode ? (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <ThemedText style={styles.deleteText}>Видалити транзакцію</ThemedText>
                    </TouchableOpacity>
                ) : null}
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
        paddingBottom: 36,
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
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    typeRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    typeButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E4E7EC",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    typeText: {
        color: "#667085",
        fontSize: 13,
        fontWeight: "800",
    },
    amountCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 18,
        marginBottom: 12,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    amountInput: {
        flex: 1,
        minHeight: 74,
        paddingVertical: 4,
        color: APP_TEXT,
        fontFamily: FontFamily.extraBold,
        fontSize: 44,
    },
    currencyLabel: {
        color: "#667085",
        fontSize: 18,
    },
    amountHint: {
        fontSize: 13,
        fontWeight: "800",
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 16,
        gap: 10,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    inputLabel: {
        color: "#667085",
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase",
        marginTop: 4,
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontFamily: FontFamily.regular,
        fontSize: 15,
        color: APP_TEXT,
        backgroundColor: "#FFFFFF",
    },
    chipsRow: {
        gap: 8,
        paddingRight: 6,
    },
    accountChip: {
        minHeight: 42,
        borderWidth: 1,
        borderColor: "#E4E7EC",
        borderRadius: 14,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
    },
    accountChipText: {
        color: "#667085",
        fontSize: 13,
        fontWeight: "800",
    },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryButton: {
        width: "31.5%",
        minHeight: 70,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E4E7EC",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingHorizontal: 6,
    },
    categoryText: {
        color: "#667085",
        fontSize: 11,
        lineHeight: 14,
        fontWeight: "800",
        textAlign: "center",
    },
    dateRow: {
        gap: 8,
    },
    dateInput: {
        flex: 1,
    },
    dateBadge: {
        minHeight: 42,
        borderRadius: 14,
        backgroundColor: "#EEF6FC",
        paddingHorizontal: 12,
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    dateBadgeText: {
        color: APP_PRIMARY,
        fontSize: 13,
        fontWeight: "800",
    },
    noteInput: {
        minHeight: 86,
        textAlignVertical: "top",
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tagChip: {
        minHeight: 36,
        borderRadius: 999,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEF2F6",
    },
    tagChipActive: {
        backgroundColor: "#E4F2FF",
    },
    tagText: {
        color: "#667085",
        fontSize: 13,
        fontWeight: "800",
    },
    tagTextActive: {
        color: APP_PRIMARY,
    },
    photoButton: {
        minHeight: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#A9D1F2",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        marginTop: 4,
    },
    photoButtonText: {
        color: APP_PRIMARY,
        fontSize: 14,
    },
    saveButton: {
        minHeight: 56,
        borderRadius: 18,
        marginTop: 16,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
        overflow: "hidden",
    },
    saveGradient: {
        minHeight: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "900",
    },
    deleteButton: {
        minHeight: 48,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
    },
    deleteText: {
        color: APP_EXPENSE,
        fontSize: 14,
        fontWeight: "800",
    },
});
