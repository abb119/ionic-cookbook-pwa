<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ recipe?.title || 'Detalle' }}</ion-title>
        <ion-buttons slot="end" v-if="isOwner">
          <ion-button @click="editRecipe">
            <ion-icon :icon="createOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content v-if="recipe" class="ion-padding">
      <div class="ion-text-center">
        <img
          :src="getPhotoUrl(recipe.image)"
          @error="handleImageError"
          style="max-width: 100%; max-height: 300px; border-radius: 8px;"
        />
      </div>
      
      <h1>{{ recipe.title }}</h1>
      <p>
        <ion-badge :color="getCategoryColor(recipe.category)">{{ recipe.category }}</ion-badge>
        <ion-badge color="secondary" style="margin-left: 8px;">{{ recipe.difficulty }}</ion-badge>
        <ion-badge color="tertiary" style="margin-left: 8px;">{{ recipe.time }} min</ion-badge>
      </p>

      <ion-list>
        <ion-list-header>
          <ion-label>Ingredientes</ion-label>
        </ion-list-header>
        <ion-item v-for="(ing, idx) in getList(recipe.ingredients)" :key="idx">
          <ion-label>{{ ing }}</ion-label>
        </ion-item>
      </ion-list>

      <ion-list>
        <ion-list-header>
          <ion-label>Pasos</ion-label>
        </ion-list-header>
        <ion-item v-for="(step, idx) in getList(recipe.steps)" :key="idx">
          <ion-label class="ion-text-wrap">{{ idx + 1 }}. {{ step }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    
    <ion-content v-else class="ion-padding ion-text-center">
      <ion-spinner></ion-spinner>
      <p>Cargando receta...</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import { createOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pb from '../pocketbase';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const recipe = ref<any>(null);

const isOwner = computed(() => {
  if (!recipe.value || !auth.user) return false;
  return recipe.value.author === auth.user.id; 
});

onIonViewWillEnter(async () => {
  recipe.value = null;
  const id = route.params.id;
  try {
    const data = await pb.collection('recipes').getOne(id as string);
    recipe.value = data;
  } catch (e) {
    console.error(e);
  }
});

function editRecipe() {
  router.push(`/recipes/${route.params.id}/edit`);
}

function getList(data: any): string[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function getCategoryColor(cat: string) {
  switch (cat) {
    case 'entrante': return 'success';
    case 'principal': return 'warning';
    case 'postre': return 'tertiary';
    default: return 'medium';
  }
}

function getPhotoUrl(path: string) {
  if (!path) return "https://via.placeholder.com/300x200?text=Receta";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return "https://via.placeholder.com/300x200?text=Receta";
}

function handleImageError(e: any) {
  e.target.src = "https://via.placeholder.com/300x200?text=Receta";
}
</script>
