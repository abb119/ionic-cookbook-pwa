<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="header-info">
        <h1>Bienvenido</h1>
        <p>Entra en CookBook</p>
      </div>

      <form @submit.prevent="onSubmit">
        <ion-list>
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
            {{ authLoading ? 'Entrando...' : 'Entrar' }}
          </ion-button>
          
          <ion-button expand="block" fill="clear" router-link="/register">
            ¿No tienes cuenta? Regístrate
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

  if (!email.value) {
    fieldErrors.email = 'El email es obligatorio';
  } else if (!email.value.includes('@')) {
    fieldErrors.email = 'Email inválido';
  }

  if (!password.value) {
    fieldErrors.password = 'La contraseña es obligatoria';
  } else if (password.value.length < 4) {
    fieldErrors.password = 'La contraseña debe tener al menos 4 caracteres';
  }

  return !fieldErrors.email && !fieldErrors.password;
}

async function onSubmit() {
  if (!validateForm()) return;

  try {
    await auth.login(email.value, password.value);
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
