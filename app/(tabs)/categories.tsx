import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { FontFamily } from "@/constants/theme";
import { useCategories } from "@/context/categories-context";
import { APP_BG, APP_GRADIENTS, APP_PRIMARY, APP_TEXT, CategoryItem, CategoryType } from "@/shared/config";

const TYPE_OPTIONS: { key: CategoryType; label: string }[] = [
    { key: "expense", label: "Витрати" },
    { key: "income", label: "Доходи" },
];

const COLOR_OPTIONS = [
    "#2E75B6",
    "#27AE60",
    "#E74C3C",
    "#F39C12",
    "#8E44AD",
    "#16A085",
    "#D81B60",
    "#34495E",
    "#00A8A8",
    "#A04000",
    "#7D3C98",
    "#CB4335",
];

const ICON_OPTIONS: { icon: keyof typeof MaterialIcons.glyphMap; label: string }[] = [
    { icon: "restaurant", label: "Їжа" },
    { icon: "shopping-cart", label: "Кошик" },
    { icon: "directions-car", label: "Авто" },
    { icon: "home", label: "Дім" },
    { icon: "bolt", label: "Світло" },
    { icon: "smartphone", label: "Зв'язок" },
    { icon: "local-hospital", label: "Лікар" },
    { icon: "fitness-center", label: "Спорт" },
    { icon: "local-cafe", label: "Кава" },
    { icon: "movie", label: "Кіно" },
    { icon: "flight", label: "Подорож" },
    { icon: "checkroom", label: "Одяг" },
    { icon: "school", label: "Освіта" },
    { icon: "work", label: "Робота" },
    { icon: "star", label: "Бонус" },
    { icon: "savings", label: "Сейф" },
    { icon: "account-balance", label: "Банк" },
    { icon: "label", label: "Мітка" },
];

function defaultIconForType(type: CategoryType) {
    return type === "income" ? "star" : "label";
}

export default function CategoriesScreen() {
    const insets = useSafeAreaInsets();
    const { addCategory, categories, deleteCategory, updateCategory } = useCategories();
    const [activeType, setActiveType] = useState<CategoryType>("expense");
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [selectedColor, setSelectedColor] = useState(APP_PRIMARY);
    const [selectedIcon, setSelectedIcon] = useState<keyof typeof MaterialIcons.glyphMap>("label");
    const [isCreating, setIsCreating] = useState(false);

    const visibleCategories = useMemo(() => categories.filter((category) => category.type === activeType), [activeType, categories]);
    const isModalOpen = editingCategory !== null || isCreating;

    const openCreate = useCallback(() => {
        setIsCreating(true);
        setEditingCategory(null);
        setEditLabel("");
        setSelectedColor(COLOR_OPTIONS[0]);
        setSelectedIcon(defaultIconForType(activeType));
    }, [activeType]);

    const openEdit = useCallback((category: CategoryItem) => {
        setEditingCategory(category);
        setIsCreating(false);
        setEditLabel(category.label);
        setSelectedColor(category.color);
        setSelectedIcon(category.icon);
    }, []);

    const closeModal = useCallback(() => {
        setEditingCategory(null);
        setIsCreating(false);
        setEditLabel("");
        setSelectedColor(COLOR_OPTIONS[0]);
        setSelectedIcon("label");
    }, []);

    const handleRemove = useCallback(
        (id: string) => {
            Alert.alert("Видалити категорію", "Категорію буде прибрано зі списку вибору.", [
                { text: "Скасувати", style: "cancel" },
                {
                    text: "Видалити",
                    style: "destructive",
                    onPress: () => {
                        deleteCategory(id);
                        closeModal();
                    },
                },
            ]);
        },
        [closeModal, deleteCategory],
    );

    const handleSave = useCallback(() => {
        const label = editLabel.trim();
        if (!label) {
            closeModal();
            return;
        }

        if (editingCategory) {
            updateCategory(editingCategory.id, {
                label,
                color: selectedColor,
                icon: selectedIcon,
            });
        } else {
            addCategory({
                label,
                type: activeType,
                color: selectedColor,
                icon: selectedIcon,
            });
        }
        closeModal();
    }, [activeType, addCategory, closeModal, editLabel, editingCategory, selectedColor, selectedIcon, updateCategory]);

    return (
        <LinearGradient colors={APP_GRADIENTS.screen} style={[styles.screen, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.eyebrow}>Довідники</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.title}>
                            Категорії
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={openCreate} activeOpacity={0.78}>
                        <MaterialIcons name="add" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.segmented}>
                    {TYPE_OPTIONS.map((item) => {
                        const active = item.key === activeType;
                        return (
                            <TouchableOpacity key={item.key} style={[styles.segmentButton, active && styles.segmentButtonActive]} onPress={() => setActiveType(item.key)}>
                                <ThemedText style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.grid}>
                    {visibleCategories.map((category) => (
                        <TouchableOpacity key={category.id} style={styles.categoryButton} activeOpacity={0.82} onPress={() => openEdit(category)} onLongPress={() => handleRemove(category.id)}>
                            <LinearGradient colors={category.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryGradient}>
                                <MaterialIcons name={category.icon} size={28} color="#FFFFFF" />
                                <ThemedText style={styles.categoryLabel} numberOfLines={2}>
                                    {category.label}
                                </ThemedText>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <Modal visible={isModalOpen} transparent animationType="fade" onRequestClose={closeModal}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal}>
                    <TouchableOpacity style={styles.modalContentWrap} activeOpacity={1} onPress={() => {}}>
                        <LinearGradient colors={APP_GRADIENTS.softBlue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalContent}>
                            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                                <View style={styles.modalTitleRow}>
                                    <View>
                                        <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
                                            {editingCategory ? "Редагувати категорію" : "Нова категорія"}
                                        </ThemedText>
                                        <ThemedText style={styles.modalSubtitle}>
                                            {editingCategory ? "Змініть назву, колір або іконку." : `Тип: ${activeType === "expense" ? "витрати" : "доходи"}`}
                                        </ThemedText>
                                    </View>
                                    <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
                                        <MaterialIcons name={selectedIcon} size={24} color="#FFFFFF" />
                                    </View>
                                </View>

                                <ThemedText style={styles.fieldLabel}>Назва</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    value={editLabel}
                                    onChangeText={setEditLabel}
                                    placeholder="Назва категорії"
                                    placeholderTextColor="#98A2B3"
                                    autoFocus
                                    selectTextOnFocus
                                />

                                <ThemedText style={styles.fieldLabel}>Колір</ThemedText>
                                <View style={styles.colorGrid}>
                                    {COLOR_OPTIONS.map((color) => {
                                        const active = color === selectedColor;
                                        return (
                                            <TouchableOpacity key={color} style={[styles.colorOption, active && styles.colorOptionActive]} onPress={() => setSelectedColor(color)}>
                                                <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <ThemedText style={styles.fieldLabel}>Іконка</ThemedText>
                                <View style={styles.iconGrid}>
                                    {ICON_OPTIONS.map((item) => {
                                        const active = item.icon === selectedIcon;
                                        return (
                                            <TouchableOpacity
                                                key={item.icon}
                                                style={[styles.iconOption, active && { borderColor: selectedColor, backgroundColor: `${selectedColor}12` }]}
                                                onPress={() => setSelectedIcon(item.icon)}
                                            >
                                                <MaterialIcons name={item.icon} size={22} color={active ? selectedColor : "#667085"} />
                                                <ThemedText style={[styles.iconOptionLabel, active && { color: selectedColor }]} numberOfLines={1}>
                                                    {item.label}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <View style={styles.modalActions}>
                                    {editingCategory ? (
                                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonDanger]} onPress={() => handleRemove(editingCategory.id)}>
                                            <ThemedText style={styles.modalButtonDangerText}>Видалити</ThemedText>
                                        </TouchableOpacity>
                                    ) : null}
                                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonGhost]} onPress={closeModal}>
                                        <ThemedText style={styles.modalButtonGhostText}>Скасувати</ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: selectedColor }]} onPress={handleSave}>
                                        <ThemedText style={styles.modalButtonPrimaryText}>Зберегти</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </LinearGradient>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: APP_PRIMARY,
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 4,
    },
    segmented: {
        flexDirection: "row",
        padding: 5,
        borderRadius: 16,
        backgroundColor: "#E7ECF3",
        marginBottom: 16,
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
    },
    segmentText: {
        color: "#6B7280",
        fontSize: 13,
        fontWeight: "800",
    },
    segmentTextActive: {
        color: APP_TEXT,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    categoryButton: {
        width: "31.5%",
        minWidth: 96,
        aspectRatio: 1,
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    categoryGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        gap: 8,
    },
    categoryLabel: {
        color: "#FFFFFF",
        fontSize: 13,
        lineHeight: 16,
        fontWeight: "800",
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(16,24,40,0.54)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContentWrap: {
        width: "100%",
        maxWidth: 440,
        maxHeight: "88%",
        borderRadius: 22,
        overflow: "hidden",
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        padding: 20,
    },
    modalTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        marginBottom: 18,
    },
    modalTitle: {
        color: APP_TEXT,
        fontSize: 18,
    },
    modalSubtitle: {
        color: "#667085",
        fontSize: 12,
        marginTop: 2,
    },
    previewIcon: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#1A1A2E",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 3,
    },
    fieldLabel: {
        color: "#667085",
        fontSize: 12,
        fontWeight: "800",
        textTransform: "uppercase",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#D0D5DD",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontFamily: FontFamily.regular,
        fontSize: 16,
        color: APP_TEXT,
        marginBottom: 18,
        backgroundColor: "rgba(255,255,255,0.86)",
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 18,
    },
    colorOption: {
        width: 38,
        height: 38,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    colorOptionActive: {
        borderColor: APP_TEXT,
        backgroundColor: "rgba(255,255,255,0.82)",
    },
    colorSwatch: {
        width: 28,
        height: 28,
        borderRadius: 10,
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    iconOption: {
        width: "31.5%",
        minHeight: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E4E7EC",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingHorizontal: 6,
        backgroundColor: "rgba(255,255,255,0.7)",
    },
    iconOptionLabel: {
        color: "#667085",
        fontSize: 10,
        lineHeight: 13,
        fontWeight: "800",
        textAlign: "center",
    },
    modalActions: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: 10,
    },
    modalButton: {
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonGhost: {
        backgroundColor: "#EEF2F6",
    },
    modalButtonPrimary: {
        backgroundColor: APP_PRIMARY,
    },
    modalButtonDanger: {
        marginRight: "auto",
        backgroundColor: "#FDEDEC",
    },
    modalButtonGhostText: {
        color: "#475467",
        fontSize: 14,
        fontWeight: "800",
    },
    modalButtonPrimaryText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },
    modalButtonDangerText: {
        color: "#E74C3C",
        fontSize: 14,
        fontWeight: "800",
    },
});
