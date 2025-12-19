import { defineStore } from "pinia";
import pb from "../pocketbase";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as any,
        loading: false,
        error: null as string | null,
        savedRecipes: [] as any[],
        myRecipes: [] as any[],
    }),

    getters: {
        isAuthenticated: () => pb.authStore.isValid,
        savedRecipeIds: (state) => new Set(state.savedRecipes.map((r: any) => r.id)),
    },

    actions: {
        restoreFromStorage() {
            if (pb.authStore.isValid) {
                this.user = pb.authStore.model;
            } else {
                this.user = null;
            }
        },

        async login(email: string, password: string): Promise<void> {
            this.loading = true;
            this.error = null;
            try {
                const authData = await pb.collection('users').authWithPassword(email, password);
                this.user = authData.record;
                await this.fetchProfile();
            } catch (err: any) {
                this.error = err.message || "Error al iniciar sesión";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async register(name: string, email: string, password: string): Promise<void> {
            this.loading = true;
            this.error = null;
            try {
                const userData = {
                    email,
                    password,
                    passwordConfirm: password,
                    name: name,
                };

                await pb.collection('users').create(userData);

                await this.login(email, password);
            } catch (err: any) {
                this.error = err.message || "Error en el registro";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            pb.authStore.clear();
            this.user = null;
            this.savedRecipes = [];
            this.myRecipes = [];
        },

        async fetchProfile() {
            if (!pb.authStore.isValid) return;

            try {
                const userId = pb.authStore.model?.id;
                if (!userId) return;

                const myRecipesResult = await pb.collection('recipes').getList(1, 100, {
                    filter: `author = "${userId}"`,
                    sort: '-created',
                });
                this.myRecipes = myRecipesResult.items;

                await this.fetchSavedRecipes();

            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        },

        async fetchSavedRecipes() {
            try {
                const userId = pb.authStore.model?.id;
                if (!userId) return;

                const savedRecordsResult = await pb.collection('saved_recipes').getList(1, 100, {
                    filter: `user = "${userId}"`,
                    expand: 'recipe',
                });

                this.savedRecipes = savedRecordsResult.items
                    .map((item: any) => item.expand?.recipe)
                    .filter(Boolean);

            } catch (err) {
                console.error("Error fetching saved recipes:", err);
                this.savedRecipes = [];
            }
        },

        async toggleSaved(recipeId: string) {
            if (!this.isAuthenticated) throw new Error("Debes iniciar sesión");

            const userId = pb.authStore.model?.id;
            if (!userId) return;

            try {
                const isSaved = this.savedRecipeIds.has(recipeId);

                if (isSaved) {
                    const savedRecord = await pb.collection('saved_recipes').getFirstListItem(
                        `user = "${userId}" && recipe = "${recipeId}"`
                    );
                    await pb.collection('saved_recipes').delete(savedRecord.id);
                } else {
                    await pb.collection('saved_recipes').create({
                        user: userId,
                        recipe: recipeId,
                    });
                }

                await this.fetchSavedRecipes();
            } catch (err: any) {
                console.error("Error toggling saved recipe:", err);
                throw new Error(err.message || "Error al guardar receta");
            }
        },
    },
});
