<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Registro</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="header-info">
        <h1>Crear Cuenta</h1>
        <p>Únete a CookBook</p>
      </div>

      <form @submit.prevent="onSubmit">
        <ion-list>
          <ion-item>
            <ion-input
              label="Nombre"
              label-placement="floating"
              fill="outline"
              type="text"
              v-model="name"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              label="Email"
              label-placement="floating"
              fill="outline"
              type="email"
              v-model="email"
              required
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              label="Contraseña"
              label-placement="floating"
              fill="outline"
              type="password"
              v-model="password"
              required
            ></ion-input>
          </ion-item>
        </ion-list>

        <div class="error-message" v-if="authError || fieldErrors.email || fieldErrors.password">
          {{ authError || fieldErrors.email || fieldErrors.password }}
        </div>

        <div class="ion-padding-top">
          <ion-button expand="block" type="submit" :disabled="authLoading">
            {{ authLoading ? 'Registrando...' : 'Registrarse' }}
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
  IonButton,
} from '@ionic/vue';
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const fieldErrors = reactive({
  email: '',
  password: '',
});

const authLoading = computed(() => auth.loading);
const authError = computed(() => auth.error);

function validateForm() {
  fieldErrors.email = '';
  fieldErrors.password = '';

  if (!email.value || !email.value.includes('@')) {
    fieldErrors.email = 'Email inválido';
  }
  if (!password.value || password.value.length < 4) {
    fieldErrors.password = 'Mínimo 4 caracteres';
  }
  return !fieldErrors.email && !fieldErrors.password;
}

async function onSubmit() {
  if (!validateForm()) return;

  try {
    await auth.register(name.value, email.value, password.value);
    router.replace('/tabs/home');
  } catch (e) {
  }
}
</script>

<style scoped>
.header-info {
  text-align: center;
  margin-bottom: 2rem;
}
.header-info h1 {
  font-size: 2rem;
  font-weight: bold;
}
.error-message {
  color: var(--ion-color-danger);
  text-align: center;
  margin-top: 1rem;
}
</style>
