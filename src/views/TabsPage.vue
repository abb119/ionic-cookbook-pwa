<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="restaurantOutline" />
          <ion-label>Recetas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="menu" href="/tabs/menu">
          <ion-icon :icon="calendarOutline" />
          <ion-label>Menú</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personCircleOutline" />
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonLabel, IonIcon } from '@ionic/vue';
import { restaurantOutline, calendarOutline, personCircleOutline } from 'ionicons/icons';
</script>
