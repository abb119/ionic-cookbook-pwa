import { defineStore } from "pinia";
import pb from "../pocketbase";

export const useRecipesStore = defineStore("recipes", {
    state: () => ({
        items: [] as any[],
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 8,
        loading: false,
        error: null as string | null,
        filters: {
            q: "",
            categoria: "",
            dificultad: "",
        },
        selectedRecipe: null as any,
        detailsLoading: false,
        detailsError: null as string | null,
    }),

    actions: {
        async fetchRecipes(params: any = {}) {
            const append = params.append || false;

            if (!append) {
                this.loading = true;
                this.items = [];
            }

            this.error = null;

            if (params.page) this.page = params.page;

            try {
                const filterParts = [];

                if (this.filters.q) {
                    filterParts.push(`title ~ "${this.filters.q}"`);
                }

                if (this.filters.categoria) {
                    filterParts.push(`category = "${this.filters.categoria}"`);
                }

                if (this.filters.dificultad) {
                    filterParts.push(`difficulty = "${this.filters.dificultad}"`);
                }

                const filterString = filterParts.length > 0 ? filterParts.join(' && ') : '';

                const resultList = await pb.collection('recipes').getList(this.page, this.limit, {
                    filter: filterString,
                    sort: '-created',
                    expand: 'author',
                });

                const newItems = resultList.items;

                if (append) {
                    this.items = [...this.items, ...newItems];
                } else {
                    this.items = newItems;
                }

                this.page = resultList.page;
                this.totalPages = resultList.totalPages;
                this.total = resultList.totalItems;

            } catch (err: any) {
                this.error = err.message || "Error al cargar recetas";
                if (!append) this.items = [];
            } finally {
                this.loading = false;
            }
        },

        setSearch(query: string) {
            this.filters.q = query;
            this.page = 1;
        },

        async goToPage(p: number) {
            if (p < 1 || p > this.totalPages) return;
            this.page = p;
            await this.fetchRecipes();
        },

        async fetchRecipeDetails(id: string | number) {
            this.detailsLoading = true;
            this.detailsError = null;
            this.selectedRecipe = null;

            try {
                const record = await pb.collection('recipes').getOne(id as string, {
                    expand: 'author',
                });
                this.selectedRecipe = record;
            } catch (err: any) {
                this.detailsError = err.message || "Error al cargar detalles de la receta";
            } finally {
                this.detailsLoading = false;
            }
        },

        clearSelected() {
            this.selectedRecipe = null;
            this.detailsError = null;
        },
    },
});
