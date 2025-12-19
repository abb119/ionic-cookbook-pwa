<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Menú Semanal</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="goToToday">
            <ion-icon :icon="todayOutline" slot="icon-only"></ion-icon>
          </ion-button>
          <ion-button @click="loadMeals">
            <ion-icon :icon="refreshOutline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <div class="week-navigation">
          <ion-button fill="clear" @click="previousWeek">
            <ion-icon :icon="chevronBackOutline"></ion-icon>
          </ion-button>
          <span class="week-label">{{ weekLabel }}</span>
          <ion-button fill="clear" @click="nextWeek">
            <ion-icon :icon="chevronForwardOutline"></ion-icon>
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      
      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :duration="3000"
        position="top"
        color="success"
        @didDismiss="showToast = false"
      ></ion-toast>

      <div v-for="day in weekDays" :key="day.date" class="day-section" :class="{'today': day.isToday, 'past': day.isPast}">
        <div class="day-header">
           <div>
             <h2>{{ day.dayName }}</h2>
             <small class="date-label">
               {{ day.dateLabel }}
               <ion-badge v-if="day.isToday" color="success" class="today-badge">Hoy</ion-badge>
               <ion-badge v-if="day.isPast" color="medium" class="past-badge">Pasado</ion-badge>
             </small>
           </div>
           <ion-button 
             fill="clear" 
             size="small" 
             @click="openAddModal(day.date)"
             :disabled="day.isPast"
             :title="day.isPast ? 'No puedes añadir planes a días pasados' : 'Añadir plan'"
           >
             <ion-icon :icon="addCircleOutline" slot="icon-only"></ion-icon>
           </ion-button>
        </div>

        <ion-list lines="none" v-if="getMealsForDay(day.date).length">
           <ion-item v-for="meal in getMealsForDay(day.date)" :key="meal.id" class="meal-item" :class="{'past-meal': day.isPast}">
             <ion-label class="ion-text-wrap">
               <h3>{{ typeTransl(meal.type) }}</h3>
               <p v-if="meal.expand?.recipe">🍽️ {{ meal.expand.recipe.title }}</p>
               <p v-else>📝 {{ meal.description }}</p>
             </ion-label>
             <ion-button 
               fill="clear" 
               color="primary" 
               slot="end" 
               @click="openEditModal(meal, day.isPast)"
               :disabled="day.isPast"
               :title="day.isPast ? 'No puedes editar planes pasados' : 'Editar'"
             >
               <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
             </ion-button>
             <ion-button 
               fill="clear" 
               color="danger" 
               slot="end" 
               @click="deleteMeal(meal.id, day.isPast)"
               :disabled="day.isPast"
               :title="day.isPast ? 'No puedes borrar planes pasados' : 'Borrar'"
             >
               <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
             </ion-button>
           </ion-item>
        </ion-list>
        <div v-else class="empty-day">
           <small v-if="day.isPast">Día pasado - Sin registro</small>
           <small v-else>Sin planes</small>
        </div>
      </div>

      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
        <ion-header>
           <ion-toolbar>
             <ion-title>{{ editingMeal ? 'Editar' : 'Añadir' }} - {{ selectedDateLabel }}</ion-title>
             <ion-buttons slot="end">
                <ion-button @click="closeModal">Cancelar</ion-button>
             </ion-buttons>
           </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
           <ion-item>
              <ion-select label="Tipo" v-model="newMeal.type" interface="popover">
                 <ion-select-option value="lunch">Comida</ion-select-option>
                 <ion-select-option value="dinner">Cena</ion-select-option>
              </ion-select>
           </ion-item>

           <div class="info-box ion-margin-vertical">
             <p><strong>🍽️ Receta Guardada:</strong> Vincula una receta que ya tienes</p>
             <p><strong>📝 Manual:</strong> Escribe texto libre (ej: "Pizza fuera")</p>
           </div>

           <ion-segment v-model="mode" class="ion-margin-vertical">
              <ion-segment-button value="recipe">Receta Guardada</ion-segment-button>
              <ion-segment-button value="manual">Manual</ion-segment-button>
           </ion-segment>

           <div v-if="mode === 'recipe'">
              <ion-item v-if="myRecipes.length">
                 <ion-select 
                   label="Elige Receta" 
                   v-model="newMeal.recipe_id" 
                   placeholder="Selecciona una receta"
                   interface="alert"
                 >
                    <ion-select-option v-for="r in myRecipes" :key="r.id" :value="r.id">
                       {{ r.title }}
                    </ion-select-option>
                 </ion-select>
              </ion-item>
              <div v-else class="ion-padding ion-text-center">
                <p>No tienes recetas.</p>
                <ion-button size="small" router-link="/recipes/new">Crear Receta</ion-button>
              </div>
           </div>

           <div v-else>
              <ion-item>
                 <ion-input 
                   label="Descripción" 
                   label-placement="floating"
                   v-model="newMeal.description" 
                   placeholder="Ej: Pizza fuera, Sobras, Restaurante..."
                   required
                 ></ion-input>
              </ion-item>
           </div>

           <div class="ion-padding">
              <ion-button expand="block" @click="saveMeal" :disabled="!canSave">
                {{ editingMeal ? 'Actualizar' : 'Guardar' }}
              </ion-button>
           </div>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonList, IonItem, IonLabel, IonModal, IonSelect, IonSelectOption, IonInput, IonSegment, 
  IonSegmentButton, IonToast, IonBadge, onIonViewWillEnter, onIonViewWillLeave
} from '@ionic/vue';
import { 
  refreshOutline, addCircleOutline, trashOutline, createOutline, 
  chevronBackOutline, chevronForwardOutline, todayOutline 
} from 'ionicons/icons';
import { ref, computed, onUnmounted } from 'vue';
import pb from '../pocketbase';
import { useAuthStore } from '../stores/auth';

const meals = ref<any[]>([]);
const isModalOpen = ref(false);
const selectedDate = ref('');
const mode = ref('recipe');
const myRecipes = ref<any[]>([]);
const editingMeal = ref<any>(null);
const currentWeekStart = ref(new Date());
const showToast = ref(false);
const toastMessage = ref('');
let unsubscribe: (() => void) | null = null;

const newMeal = ref({
   type: 'lunch',
   recipe_id: null as string | null,
   description: ''
});

const auth = useAuthStore();

const canSave = computed(() => {
  if (mode.value === 'recipe') {
    return !!newMeal.value.recipe_id;
  } else {
    return !!newMeal.value.description?.trim();
  }
});

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayDateString(): string {
  const today = new Date();
  return toLocalDateString(today);
}

function isPastDate(dateString: string): boolean {
  const today = getTodayDateString();
  return dateString < today;
}

const weekDays = computed(() => {
  const days = [];
  const start = new Date(currentWeekStart.value);
  start.setHours(0, 0, 0, 0);
  
  const monday = new Date(start);
  monday.setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1));
  
  const todayString = getTodayDateString();
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    
    const dayString = toLocalDateString(day);
    const isToday = dayString === todayString;
    const isPast = isPastDate(dayString);
    
    days.push({
      date: dayString,
      dayName: getDayName(day),
      dateLabel: formatShortDate(day),
      isToday: isToday,
      isPast: isPast
    });
  }
  
  return days;
});

const weekLabel = computed(() => {
  const start = weekDays.value[0]?.dateLabel || '';
  const end = weekDays.value[6]?.dateLabel || '';
  return `${start} - ${end}`;
});

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const date = new Date(selectedDate.value + 'T00:00:00');
  return `${getDayName(date)} ${formatShortDate(date)}`;
});

onIonViewWillEnter(() => {
   goToToday();
   loadRecipes();
   subscribeToRealtime();
});

onIonViewWillLeave(() => {
  unsubscribeFromRealtime();
});

onUnmounted(() => {
  unsubscribeFromRealtime();
});

async function loadMeals() {
   try {
      const userId = pb.authStore.model?.id;
      if (!userId) return;
      
      const firstDay = weekDays.value[0]?.date;
      const lastDay = weekDays.value[6]?.date;
      
      console.log('Loading meals for week:', firstDay, 'to', lastDay);
      
      const resultList = await pb.collection('meal_plans').getFullList({
         filter: `user = "${userId}" && date >= "${firstDay}" && date <= "${lastDay}"`,
         expand: 'recipe',
         sort: 'date,type'
      });
      console.log('Loaded', resultList.length, 'meals:', resultList);
      meals.value = resultList;
   } catch(e) {
      console.error(e);
   }
}

async function subscribeToRealtime() {
  try {
    const userId = pb.authStore.model?.id;
    if (!userId) return;

    unsubscribe = await pb.collection('meal_plans').subscribe('*', (e) => {
      console.log('Realtime event:', e.action);
      
      if (e.record.user !== userId) return;
      
      if (e.action === 'create') {
        toastMessage.value = '✅ Nuevo plan añadido';
        showToast.value = true;
      } else if (e.action === 'update') {
        toastMessage.value = '✏️ Plan actualizado';
        showToast.value = true;
      } else if (e.action === 'delete') {
        toastMessage.value = '🗑️ Plan eliminado';
        showToast.value = true;
      }
      
      loadMeals();
    });
  } catch(e) {
    console.error('Error subscribing to realtime:', e);
  }
}

function unsubscribeFromRealtime() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

async function loadRecipes() {
   if (auth.myRecipes.length === 0) await auth.fetchProfile();
   const combined = [...(auth.myRecipes || []), ...(auth.savedRecipes || [])];
   myRecipes.value = combined;
}

function getMealsForDay(date: string) {
   return meals.value.filter(m => m.date === date);
}

function goToToday() {
  currentWeekStart.value = new Date();
  loadMeals();
}

function previousWeek() {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart.value = newDate;
  loadMeals();
}

function nextWeek() {
  const newDate = new Date(currentWeekStart.value);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart.value = newDate;
  loadMeals();
}

function openAddModal(date: string) {
   if (isPastDate(date)) {
     alert('⚠️ No puedes crear planes para días pasados');
     return;
   }
   
   editingMeal.value = null;
   selectedDate.value = date;
   newMeal.value = { type: 'lunch', recipe_id: null, description: '' };
   mode.value = 'recipe';
   isModalOpen.value = true;
}

function openEditModal(meal: any, isPast: boolean) {
   if (isPast) {
     alert('⚠️ No puedes editar planes de días pasados');
     return;
   }
   
   editingMeal.value = meal;
   selectedDate.value = meal.date;
   newMeal.value = {
      type: meal.type,
      recipe_id: meal.recipe || null,
      description: meal.description || ''
   };
   mode.value = meal.recipe ? 'recipe' : 'manual';
   isModalOpen.value = true;
}

function closeModal() {
   isModalOpen.value = false;
   editingMeal.value = null;
}

async function saveMeal() {
   try {
      const userId = pb.authStore.model?.id;
      if (!userId) {
        alert('Debes iniciar sesión');
        return;
      }

      if (isPastDate(selectedDate.value)) {
        alert('⚠️ No puedes crear o editar planes para días pasados');
        return;
      }

      if (mode.value === 'recipe' && !newMeal.value.recipe_id) {
         alert('Por favor, selecciona una receta');
         return;
      }

      if (mode.value === 'manual' && !newMeal.value.description?.trim()) {
         alert('Por favor, escribe una descripción');
         return;
      }

      const payload = {
         user: userId,
         date: selectedDate.value,
         type: newMeal.value.type,
         recipe: mode.value === 'recipe' ? newMeal.value.recipe_id : null,
         description: mode.value === 'manual' ? newMeal.value.description : null
      };

      if (editingMeal.value) {
         await pb.collection('meal_plans').update(editingMeal.value.id, payload);
      } else {
         await pb.collection('meal_plans').create(payload);
      }

      isModalOpen.value = false;
      editingMeal.value = null;
      await loadMeals();
   } catch(e: any) {
      console.error('Error completo:', e);
      const errorMsg = e.data?.message || e.message || 'Error desconocido';
      alert(`Error al guardar: ${errorMsg}`);
   }
}

async function deleteMeal(id: string, isPast: boolean) {
   if (isPast) {
     alert('⚠️ No puedes eliminar planes de días pasados');
     return;
   }
   
   if(!confirm('¿Borrar plan de comida?')) return;
   try {
     await pb.collection('meal_plans').delete(id);
     await loadMeals();
   } catch(e) {
     alert('Error al borrar');
   }
}

function getDayName(date: Date): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
}

function formatShortDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

function typeTransl(t: string) {
   return t === 'lunch' ? 'Comida' : 'Cena';
}
</script>

<style scoped>
.week-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.week-label {
  font-weight: bold;
  min-width: 150px;
  text-align: center;
}

.day-section {
  margin-bottom: 20px;
  background: var(--ion-card-background, #fff);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.day-section.today {
  border: 2px solid var(--ion-color-primary);
  box-shadow: 0 4px 16px rgba(72, 199, 142, 0.3);
}

.day-section.past {
  opacity: 0.6;
  background: rgba(128, 128, 128, 0.1);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(128,128,128,0.2);
  padding-bottom: 5px;
  margin-bottom: 5px;
}

.day-header h2 {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  color: var(--ion-color-primary);
}

.date-label {
  color: var(--ion-color-medium);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.today-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
}

.past-badge {
  font-size: 0.7rem;
  padding: 2px 6px;
}

.empty-day {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 10px;
}

.info-box {
  background: rgba(72, 199, 142, 0.1);
  border-left: 4px solid var(--ion-color-primary);
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.info-box p {
  margin: 4px 0;
}

.meal-item {
  animation: fadeIn 0.3s ease;
}

.past-meal {
  opacity: 0.7;
}

.past-meal ion-button[disabled] {
  opacity: 0.3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
