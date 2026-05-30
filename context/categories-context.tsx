import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { APP_PRIMARY, INITIAL_CATEGORIES, type CategoryItem, type CategoryType } from "@/shared/config";

type CategoryInput = {
    label: string;
    type: CategoryType;
    icon: CategoryItem["icon"];
    color: string;
};

type CategoriesContextValue = {
    categories: CategoryItem[];
    addCategory: (category: CategoryInput) => void;
    updateCategory: (id: string, data: Partial<CategoryInput>) => void;
    deleteCategory: (id: string) => void;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

function makeCategoryColors(color: string): [string, string] {
    const fallback = color || APP_PRIMARY;
    return [fallback, "#101828"];
}

export function CategoriesProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);

    const addCategory = useCallback((category: CategoryInput) => {
        setCategories((prev) => [
            {
                ...category,
                id: `custom-${Date.now()}`,
                colors: makeCategoryColors(category.color),
            },
            ...prev,
        ]);
    }, []);

    const updateCategory = useCallback((id: string, data: Partial<CategoryInput>) => {
        setCategories((prev) =>
            prev.map((category) => {
                if (category.id !== id) return category;
                const nextColor = data.color ?? category.color;
                return {
                    ...category,
                    ...data,
                    colors: makeCategoryColors(nextColor),
                };
            }),
        );
    }, []);

    const deleteCategory = useCallback((id: string) => {
        setCategories((prev) => prev.filter((category) => category.id !== id));
    }, []);

    return <CategoriesContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory }}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
    return ctx;
}
