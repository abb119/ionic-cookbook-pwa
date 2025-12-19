<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="currentTab">
          <ion-segment-button value="info">
            <ion-label>Perfil</ion-label>
          </ion-segment-button>
          <ion-segment-button value="mis-recetas">
            <ion-label>Mis Recetas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="guardadas">
            <ion-label>Guardadas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <div v-if="currentTab === 'info'">
        <div class="ion-text-center ion-padding">
          <ion-avatar style="width: 120px; height: 120px; margin: 0 auto;">
            <img :src="getUserAvatar()" alt="Avatar" />
          </ion-avatar>
        </div>
        
        <form @submit.prevent="onSaveProfile">
          <ion-list>
            <ion-item>
              <ion-input label="Nombre" label-placement="floating" v-model="name"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Email" label-placement="floating" v-model="email" readonly></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Avatar URL" label-placement="floating" v-model="avatar"></ion-input>
            </ion-item>
          </ion-list>
          
          <div class="ion-padding">
            <ion-button expand="block" type="submit" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </ion-button>
            <ion-button expand="block" fill="outline" color="danger" @click="onDeleteProfile">
              Borrar Mi Cuenta
            </ion-button>
          </div>
        </form>
      </div>

      <div v-if="currentTab === 'mis-recetas'">
        <div class="ion-padding">
          <ion-button expand="block" router-link="/recipes/new" color="primary">
            <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
            Crear Nueva Receta
          </ion-button>
        </div>
        
        <p v-if="myRecipesDisplay.length === 0" class="ion-text-center">No tienes recetas.</p>
        <ion-grid v-else>
          <ion-row>
            <ion-col size="6" size-md="4" size-lg="3" v-for="r in myRecipesDisplay" :key="r.id">
              <ion-card button @click="router.push(`/recipes/${r.id}`)" class="recipe-card">
                <div class="image-container">
                  <img :src="getImageUrl(r)" @error="handleImageError" />
                </div>
                <ion-card-header>
                  <ion-card-title>{{ r.title }}</ion-card-title>
                  <div class="recipe-meta">
                    <ion-badge :color="getCategoryColor(r.category)">{{ r.category }}</ion-badge>
                    <div class="meta-info">
                      <ion-icon :icon="timeOutline" :style="{color: getDifficultyColor(r.difficulty)}"></ion-icon>
                      <span>{{ r.time }}min</span>
                    </div>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <ion-button size="small" fill="outline" @click.stop="editRecipe(r)">
                    <ion-icon :icon="createOutline" slot="start"></ion-icon>
                    Editar
                  </ion-button>
                  <ion-button size="small" fill="clear" color="danger" @click.stop="deleteMyRecipe(r)">
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Borrar
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div class="pagination" v-if="myTotalPages > 1">
          <ion-button :disabled="myPage === 1" @click="changeMyPage(myPage - 1)">Anterior</ion-button>
          <span>Página {{ myPage }} de {{ myTotalPages }}</span>
          <ion-button :disabled="myPage === myTotalPages" @click="changeMyPage(myPage + 1)">Siguiente</ion-button>
        </div>
      </div>

      <div v-if="currentTab === 'guardadas'">
        <p v-if="savedRecipesDisplay.length === 0" class="ion-text-center">No tienes recetas guardadas.</p>
        <ion-grid v-else>
          <ion-row>
            <ion-col size="6" size-md="4" size-lg="3" v-for="r in savedRecipesDisplay" :key="r.id">
              <ion-card button @click="router.push(`/recipes/${r.id}`)" class="recipe-card">
                <div class="image-container">
                  <img :src="getImageUrl(r)" @error="handleImageError" />
                </div>
                <ion-card-header>
                  <ion-card-title>{{ r.title }}</ion-card-title>
                  <div class="recipe-meta">
                    <ion-badge :color="getCategoryColor(r.category)">{{ r.category }}</ion-badge>
                    <div class="meta-info">
                      <ion-icon :icon="timeOutline" :style="{color: getDifficultyColor(r.difficulty)}"></ion-icon>
                      <span>{{ r.time }}min</span>
                    </div>
                  </div>
                </ion-card-header>
                <ion-card-content>
                  <ion-button size="small" fill="outline" @click.stop="router.push(`/recipes/${r.id}`)">
                    <ion-icon :icon="createOutline" slot="start"></ion-icon>
                    Ver
                  </ion-button>
                  <ion-button size="small" fill="clear" color="danger" @click.stop="unsaveRecipe(r)">
                    <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                    Quitar de guardadas
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <div class="pagination" v-if="savedTotalPages > 1">
          <ion-button :disabled="savedPage === 1" @click="changeSavedPage(savedPage - 1)">Anterior</ion-button>
          <span>Página {{ savedPage }} de {{ savedTotalPages }}</span>
          <ion-button :disabled="savedPage === savedTotalPages" @click="changeSavedPage(savedPage + 1)">Siguiente</ion-button>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonBadge, IonList, IonItem, IonInput, IonAvatar, onIonViewWillEnter
} from '@ionic/vue';
import { logOutOutline, timeOutline, createOutline, trashOutline, addCircleOutline } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import pb from '../pocketbase';

const router = useRouter();
const auth = useAuthStore();
const currentTab = ref('info');

const name = ref('');
const email = ref('');
const avatar = ref('');
const saving = ref(false);

const myRecipesFull = ref<any[]>([]);
const savedRecipesFull = ref<any[]>([]);
const myPage = ref(1);
const savedPage = ref(1);
const pageSize = 8;

const myRecipesDisplay = computed(() => {
  const start = (myPage.value - 1) * pageSize;
  return myRecipesFull.value.slice(start, start + pageSize);
});

const savedRecipesDisplay = computed(() => {
  const start = (savedPage.value - 1) * pageSize;
  return savedRecipesFull.value.slice(start, start + pageSize);
});

const myTotalPages = computed(() => Math.ceil(myRecipesFull.value.length / pageSize));
const savedTotalPages = computed(() => Math.ceil(savedRecipesFull.value.length / pageSize));

onIonViewWillEnter(async () => {
  name.value = auth.user?.name || '';
  email.value = auth.user?.email || '';
  avatar.value = auth.user?.avatar || '';
  await loadData();
});

async function loadData() {
  const userId = pb.authStore.model?.id;
  if (!userId) return;

  try {
    const myRecipes = await pb.collection('recipes').getFullList({
      filter: `author = "${userId}"`,
      sort: '-created',
    });
    myRecipesFull.value = myRecipes;

    savedRecipesFull.value = auth.savedRecipes || [];
  } catch (e) {
    console.error(e);
  }
}

function changeMyPage(p: number) {
  myPage.value = p;
}

function changeSavedPage(p: number) {
  savedPage.value = p;
}

function logout() {
  auth.logout();
  router.replace('/login');
}

function editRecipe(r: any) {
  router.push(`/recipes/${r.id}/edit`);
}

async function deleteMyRecipe(r: any) {
  if (!confirm('¿Borrar receta?')) return;
  try {
    await pb.collection('recipes').delete(r.id);
    await loadData();
  } catch (e) {
    console.error(e);
  }
}

async function unsaveRecipe(r: any) {
  if (!confirm('¿Quitar de guardadas?')) return;
  try {
    await auth.toggleSaved(r.id);
    await loadData(); // Reload to refresh the saved recipes list
  } catch (e: any) {
    console.error(e);
    alert(e.message || 'Error al quitar de guardadas');
  }
}

function getCategoryColor(cat: string) {
  if (cat === 'entrante') return 'success';
  if (cat === 'principal') return 'primary';
  if (cat === 'postre') return 'warning';
  return 'medium';
}

function getDifficultyColor(diff: string) {
  if (diff === 'facil') return 'green';
  if (diff === 'media') return 'orange';
  if (diff === 'dificil') return 'red';
  return 'gray';
}

function getImageUrl(recipe: any) {
  if (recipe.image) {
    // If it's a URL string, return it directly
    if (typeof recipe.image === 'string' && (recipe.image.startsWith('http://') || recipe.image.startsWith('https://'))) {
      return recipe.image;
    }
    if (pb.baseUrl) {
      try {
        return pb.files.getUrl(recipe, recipe.image, { thumb: '300x300' });
      } catch {
        return 'https://via.placeholder.com/300x200?text=Receta';
      }
    }
  }
  return 'https://via.placeholder.com/300x200?text=Receta';
}

function handleImageError(e: any) {
  e.target.src = 'https://via.placeholder.com/300x200?text=Receta';
}

async function onSaveProfile() {
  saving.value = true;
  try {
    const userId = pb.authStore.model?.id;
    if (!userId) return;
    
    const payload = {
      name: name.value,
      avatar: avatar.value
    };
    
    await pb.collection('users').update(userId, payload);
    auth.user = { ...auth.user, ...payload };
    alert('Perfil actualizado');
  } catch (e) {
    console.error(e);
    alert('Error al actualizar');
  } finally {
    saving.value = false;
  }
}

async function onDeleteProfile() {
  if (!confirm('¿Seguro que quieres borrar tu perfil? Esta acción no se puede deshacer.')) return;
  try {
    const userId = pb.authStore.model?.id;
    if (!userId) return;
    
    await pb.collection('users').delete(userId);
    auth.logout();
    router.replace('/login');
  } catch (e) {
    console.error(e);
    alert('Error al eliminar cuenta');
  }
}

function getUserAvatar() {
  if (avatar.value) {
    return avatar.value;
  }
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name.value || email.value || 'Usuario') + '&background=random';
}
</script>

<style scoped>
.profile-header {
  text-align: center;
  padding: 20px;
}

.recipe-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.image-container {
  width: 100%;
  height: 150px;
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

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}
</style>
