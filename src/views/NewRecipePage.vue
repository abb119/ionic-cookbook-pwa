<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Nueva Receta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="onSubmit">
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
            {{ submitting ? 'Guardando...' : 'Crear Receta' }}
          </ion-button>
        </div>
      </form>
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
} from '@ionic/vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import pb from '../pocketbase';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const submitting = ref(false);

const form = reactive({
  titulo: '',
  categoria: 'principal',
  dificultad: 'media',
  tiempo: 30 as any,
  imagen: '',
  ingredientes: '',
  pasos: '',
});

function linesToArray(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function onSubmit() {
  submitting.value = true;
  try {
    const userId = pb.authStore.model?.id;
    if (!userId) {
      alert('Debes estar autenticado para crear recetas');
      return;
    }
    
    const payload: any = {
      title: form.titulo.trim(),
      category: form.categoria,
      difficulty: form.dificultad,
      time: Number(form.tiempo),
      ingredients: JSON.stringify(linesToArray(form.ingredientes)),
      steps: JSON.stringify(linesToArray(form.pasos)),
      author: userId,
    };

    if (form.imagen.trim()) {
      payload.image = form.imagen.trim();
    }

    console.log('Creating recipe with payload:', payload);
    await pb.collection('recipes').create(payload);
    router.replace('/tabs/home');
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    console.error('Error data:', error.data);
    alert(`Error al crear la receta: ${error.message || 'Error desconocido'}`);
  } finally {
    submitting.value = false;
  }
}
</script>
