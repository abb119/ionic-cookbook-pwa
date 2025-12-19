<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Editar Receta</ion-title>
        <ion-buttons slot="end">
          <ion-button color="danger" @click="onDelete">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="onSave" v-if="loaded">
        <ion-list>
          <ion-item>
            <ion-input
              label="Título"
              label-placement="floating"
              v-model="form.titulo"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-select label="Categoría" v-model="form.categoria">
              <ion-select-option value="entrante">Entrante</ion-select-option>
              <ion-select-option value="principal">Principal</ion-select-option>
              <ion-select-option value="postre">Postre</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-select label="Dificultad" v-model="form.dificultad">
              <ion-select-option value="facil">Fácil</ion-select-option>
              <ion-select-option value="media">Media</ion-select-option>
              <ion-select-option value="dificil">Difícil</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-input
              label="Tiempo (min)"
              type="number"
              label-placement="floating"
              v-model="form.tiempo"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              label="URL Imagen"
              label-placement="floating"
              v-model="form.imagen"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-textarea
              label="Ingredientes (uno por línea)"
              label-placement="floating"
              v-model="form.ingredientes"
              :rows="5"
            ></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-textarea
              label="Pasos (uno por línea)"
              label-placement="floating"
              v-model="form.pasos"
              :rows="5"
            ></ion-textarea>
          </ion-item>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" :disabled="submitting">
            {{ submitting ? 'Guardando...' : 'Guardar Cambios' }}
          </ion-button>
        </div>
      </form>
      <div v-else class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
      </div>
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
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  onIonViewWillEnter,
} from '@ionic/vue';
import { trashOutline } from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pb from '../pocketbase';

const route = useRoute();
const router = useRouter();
const submitting = ref(false);
const loaded = ref(false);
const recipeId = route.params.id as string;

const form = reactive({
  titulo: '',
  categoria: 'principal',
  dificultad: 'media',
  tiempo: 30 as any,
  imagen: '',
  ingredientes: '',
  pasos: '',
});

onIonViewWillEnter(async () => {
  try {
    const r = await pb.collection('recipes').getOne(recipeId);
    form.titulo = r.title;
    form.categoria = r.category;
    form.dificultad = r.difficulty;
    form.tiempo = r.time;
    form.imagen = r.image || '';
    form.ingredientes = Array.isArray(r.ingredients) ? r.ingredients.join('\n') : r.ingredients;
    form.pasos = Array.isArray(r.steps) ? r.steps.join('\n') : r.steps;
    loaded.value = true;
  } catch (e) {
    console.error(e);
  }
});

function linesToArray(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function onSave() {
  submitting.value = true;
  try {
    const payload = {
      title: form.titulo.trim(),
      category: form.categoria,
      difficulty: form.dificultad,
      time: Number(form.tiempo),
      image: form.imagen.trim() || null,
      ingredients: linesToArray(form.ingredientes),
      steps: linesToArray(form.pasos),
    };

    await pb.collection('recipes').update(recipeId, payload);
    router.replace(`/tabs/home`);
  } catch (error) {
    console.error(error);
    alert('Error al guardar cambios');
  } finally {
    submitting.value = false;
  }
}

async function onDelete() {
  if (!confirm('¿Seguro que quieres eliminar esta receta?')) return;
  try {
    await pb.collection('recipes').delete(recipeId);
    router.replace('/tabs/home');
  } catch (error) {
    console.error(error);
    alert('Error al eliminar');
  }
}
</script>

