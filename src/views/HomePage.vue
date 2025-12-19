<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="reload" fill="clear" color="dark">
            <strong>Recetas</strong>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button router-link="/tabs/profile" style="display: flex; align-items: center; gap: 8px;">
            <ion-avatar style="width: 32px; height: 32px;">
              <img :src="getUserAvatar()" alt="Avatar" />
            </ion-avatar>
            <span style="font-size: 0.8rem;">{{ auth.user?.name || 'Mi Perfil' }}</span>
          </ion-button>
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          v-model="search"
          placeholder="Buscar recetas..."
          @ionInput="onSearchInput"
        ></ion-searchbar>
      </ion-toolbar>
      <ion-toolbar>
        <div style="display: flex; gap: 10px; padding: 0 16px; align-items: center;">
             <ion-select 
                v-model="recipesStore.filters.categoria" 
                label="Categoría" 
                label-placement="floating" 
                fill="outline" 
                interface="popover"
                style="flex: 1;"
                @ionChange="handleChangeFilter"
             >
                <ion-select-option value="">Todas</ion-select-option>
                <ion-select-option value="entrante">Entrante</ion-select-option>
                <ion-select-option value="principal">Principal</ion-select-option>
                <ion-select-option value="postre">Postre</ion-select-option>
             </ion-select>

             <ion-select 
                v-model="recipesStore.filters.dificultad" 
                label="Dificultad" 
                label-placement="floating" 
                fill="outline" 
                interface="popover"
                style="flex: 1;"
                @ionChange="handleChangeFilter"
             >
                <ion-select-option value="">Todas</ion-select-option>
                <ion-select-option value="facil">Fácil</ion-select-option>
                <ion-select-option value="media">Media</ion-select-option>
                <ion-select-option value="dificil">Difícil</ion-select-option>
             </ion-select>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="loading && !recipes.length" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>

      <div v-if="error" class="ion-text-center ion-padding color-danger">
        {{ error }}
      </div>

      <ion-grid v-if="recipes.length">
        <ion-row>
          <ion-col
            size="12"
            size-sm="6"
            size-md="4"
            size-lg="3"
            v-for="r in recipes"
            :key="r.id"
          >
            <ion-card button class="recipe-card">
              <div class="image-container" @click="openModal(r)">
                <img :src="getPhotoUrl(r.image)" @error="handleImageError" alt="Recipe image" />
                <ion-fab-button 
                  size="small" 
                  class="bookmark-fab" 
                  @click.stop="toggleSave(r)"
                  :color="auth.savedRecipeIds.has(r.id) ? 'warning' : 'light'"
                >
                  <ion-icon :icon="auth.savedRecipeIds.has(r.id) ? bookmark : bookmarkOutline"></ion-icon>
                </ion-fab-button>
              </div>
              <ion-card-header @click="openModal(r)">
                <div class="badges">
                  <ion-badge :color="getCategoryColor(r.category)">{{ r.category }}</ion-badge>
                </div>
                <ion-card-title style="font-size: 1.1rem;">{{ r.title }}</ion-card-title>
                <ion-card-subtitle>
                  <span style="display: flex; align-items: center; gap: 5px;">
                     <ion-icon :icon="hourglassOutline" color="warning" style="vertical-align: text-bottom;"></ion-icon> 
                     {{ r.time }} min | 
                     <ion-icon :icon="barChartOutline" color="success" style="vertical-align: text-bottom;"></ion-icon> 
                     {{ r.difficulty }}
                  </span>
                </ion-card-subtitle>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      
      <div class="ion-text-center ion-padding pagination-controls" v-if="recipes.length || page > 1">
         <ion-button 
            fill="clear" 
            :disabled="page <= 1" 
            @click="changePage(page - 1)"
         >
           &lt; Anterior
         </ion-button>
         <span class="page-info">Página {{ page }} de {{ totalPages }}</span>
         <ion-button 
            fill="clear" 
            :disabled="page >= totalPages" 
            @click="changePage(page + 1)"
         >
           Siguiente &gt;
         </ion-button>
      </div>

      <div v-else-if="!recipesStore.loading" class="ion-text-center ion-padding muted">
        No hay recetas que coincidan con tu búsqueda.
      </div>
    </ion-content>

    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ selectedRecipe?.titulo }}</ion-title>
          <ion-buttons slot="end">
             <ion-button v-if="auth.user && isSaved(selectedRecipe?.id)" color="warning" @click="toggleSave(selectedRecipe)">
               <ion-icon :icon="bookmark" slot="icon-only"></ion-icon>
             </ion-button>
             <ion-button v-else-if="auth.user" @click="toggleSave(selectedRecipe)">
               <ion-icon :icon="bookmarkOutline" slot="icon-only"></ion-icon>
             </ion-button>

             <ion-button @click="closeModal">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" v-if="selectedRecipe">
         <div class="ion-text-center">
             <img :src="getPhotoUrl(selectedRecipe.image)" style="max-height: 250px; border-radius: 12px;" @error="handleImageError" alt="Recipe image" />
         </div>
         <h2 class="ion-text-center">{{ selectedRecipe.title }}</h2>
         
         <div class="meta-row">
            <ion-chip>
               <ion-icon :icon="calendarOutline"></ion-icon>
               <ion-label>{{ formatDate(selectedRecipe.created_at) }}</ion-label>
            </ion-chip>
            <ion-chip>
               <ion-icon :icon="personCircleOutline"></ion-icon>
               <ion-label>Autor #{{ selectedRecipe.autor_id }}</ion-label>
            </ion-chip>
             <ion-chip :color="getCategoryColor(selectedRecipe.category)">
               <ion-label>{{ selectedRecipe.category }}</ion-label>
            </ion-chip>
         </div>

         <div class="details-section">
            <h3>Ingredientes</h3>
            <ul>
               <li v-for="(ing, i) in getList(selectedRecipe.ingredients)" :key="i">{{ ing }}</li>
            </ul>
         </div>

         <div class="details-section">
            <h3>Pasos</h3>
            <ol>
               <li v-for="(step, i) in getList(selectedRecipe.steps)" :key="i">{{ step }}</li>
            </ol>
         </div>

      </ion-content>
    </ion-modal>

    <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button router-link="/recipes/new">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>

  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonButton,
  IonModal,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton,
  IonAvatar,
  onIonViewWillEnter,
} from '@ionic/vue';
import { 
  logOutOutline, 
  personCircleOutline,
  hourglassOutline, 
  barChartOutline, 
  calendarOutline,
  bookmarkOutline,
  bookmark,
  addOutline,
} from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipesStore } from '../stores/recipes';
import { useAuthStore } from '../stores/auth';
import API from '../api/api';

const router = useRouter();
const recipesStore = useRecipesStore();
const { items: recipes, loading, page, totalPages, filters } = storeToRefs(recipesStore);
const auth = useAuthStore();

const isModalOpen = ref(false);
const selectedRecipe = ref<any>(null);

onIonViewWillEnter(() => {
  doRefresh();
});

function handleSearch(ev: any) {
  recipesStore.setSearch(ev.detail.value);
  recipesStore.page = 1; 
  recipesStore.fetchRecipes();
}

function handleChangeFilter() {
  recipesStore.page = 1;
  recipesStore.fetchRecipes();
}

async function doRefresh() {
  await recipesStore.fetchRecipes({ page: 1 });
  if (auth.user) {
    await auth.fetchProfile();
  }
}

async function changePage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  await recipesStore.fetchRecipes({ page: p });
}

async function openModal(recipe: any) {
  try {
     const data = await API.get(`/recipes/${recipe.id}`);
     selectedRecipe.value = data.recipe || data;
     isModalOpen.value = true;
  } catch(e) {
     console.error(e);
     // Fallback
     selectedRecipe.value = recipe; 
     isModalOpen.value = true;
  }
}

function closeModal() {
  isModalOpen.value = false;
  selectedRecipe.value = null;
}

function isSaved(rid: any) {
  return auth.savedRecipeIds.has(rid);
}

async function toggleSave(r: any) {
  if (!auth.user) {
    alert('Inicia sesión para guardar recetas');
    return;
  }
  
  try {
    await auth.toggleSaved(r.id);
  } catch (err: any) {
    alert(err.message || 'Error al guardar receta');
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

function formatDate(d: string) {
  if(!d) return '';
  return new Date(d).toLocaleDateString();
}


function logout() {
  auth.logout();
  router.replace('/login');
}

function getUserAvatar() {
  if (auth.user?.avatar) {
    return auth.user.avatar;
  }
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(auth.user?.name || auth.user?.email || 'Usuario') + '&background=random';
}
</script>

<style scoped>
.recipe-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  background: var(--ion-color-secondary);
}

.image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
  position: relative;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.recipe-card:hover .image-container img {
  transform: scale(1.05);
}

.bookmark-fab {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  --box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

ion-card-header {
  padding: 12px;
}

.badges {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
}

.meta-row {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.details-section {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
}
.pagination-controls {
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 16px;
}
.page-info {
  font-weight: bold;
}
</style>
