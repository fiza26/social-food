<script setup>
import { ref, onMounted, watchEffect } from "vue"
import { RouterLink, RouterView, useRoute } from 'vue-router'
import router from "@/router";
import { useUserStore } from '@/stores/userSession';
import supabase from "@/supabase";

const userStore = useUserStore();

userStore.isLoggedIn();

// Reactive variable to track user session
const localUser = ref(null);
const route = useRoute();

// Check if user is logged in
async function isLoggedIn() {
  const { data: { session } } = await supabase.auth.getSession();
  localUser.value = session;
}

// Call isLoggedIn on component mount
onMounted(isLoggedIn);

// Watch for route changes to recheck login status
watchEffect(() => {
  if (route.name === 'login') {
    localUser.value = null;
  } else {
    isLoggedIn();
  }
});

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error)
  } else {
    router.push({ name: 'landing' });
  }
};

// Notification Functionality 
const notifState = ref(false);

const clickNotif = () => {
  notifState.value = !notifState.value;
};

const notifFromUpvotes = ref([]);

async function getNotifFromUpvotes() {
  if (!userStore.name) return;
  const { data } = await supabase.from('upvotes').select().neq('name', userStore.name);
  notifFromUpvotes.value = data;
}
getNotifFromUpvotes();

const notifFromComments = ref([]);

async function getNotifFromComments() {
  if (!userStore.name) return;
  const { data } = await supabase.from('comments').select().neq('name', userStore.name);
  notifFromComments.value = data;
}
getNotifFromComments();

watchEffect(() => {
  if (userStore.name) {
    getNotifFromUpvotes();
    getNotifFromComments();
  }
});

const hamburgerMenuState = ref(false);
const showMenu = () => {
  hamburgerMenuState.value = !hamburgerMenuState.value;
}

</script>

<template>
  <header>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;1,100;1,200;1,300;1,400;1,500&display=swap"
      rel="stylesheet">
    <div class="wrapper" v-if="route.name != 'Landing'">
      <nav>
        <RouterLink to="/" v-if="localUser">Home</RouterLink>
        <div class="user-access" v-if="!hamburgerMenuState">
          <span v-if="localUser" @click="clickNotif()"><i class="fa-solid fa-bell"></i> ({{ notifFromUpvotes.length +
            notifFromComments.length }})</span>
          <RouterLink v-if="localUser" :to="`/profile/${userStore.name}`">Profile</RouterLink>
          <span v-if="localUser" @click="logout">Logout</span>
        </div>
        <div class="hamburger-menu" @click="showMenu()" v-if="localUser">
          <span v-if="!hamburgerMenuState">---</span>
          <span v-if="!hamburgerMenuState">---</span>
          <span v-if="!hamburgerMenuState">---</span>
          <span v-else>X</span>
        </div>
        <div class="mobile-user-access" v-if="hamburgerMenuState">
          <span v-if="localUser" @click="clickNotif()"><i class="fa-solid fa-bell"></i> ({{ notifFromUpvotes.length +
            notifFromComments.length }})</span>
          <RouterLink v-if="localUser" :to="`/profile/${userStore.name}`">Profile</RouterLink>
          <span v-if="localUser" @click="logout">Logout</span>
        </div>
      </nav>
      <div class="notification" v-if="notifState">
        <h3 v-if="notifFromUpvotes.length < 1 && notifFromComments.length < 1">No Notification</h3>
        <div v-for="notif in notifFromUpvotes" :key="notif.id">
          <RouterLink :to="`/comment/${notif.id_post}`">
            <p>
              Your post upvoted by {{ notif.name }}
            </p>
          </RouterLink>
        </div>
        <div v-for="notif in notifFromComments" :key="notif.id">
          <RouterLink :to="`/comment/${notif.id_post}`">
            <p>Your post commented by {{ notif.name }}</p>
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
  <RouterView />
</template>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Poppins", sans-serif;
  background-color: #dddd;
}

nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: white;
  background-color: #e84393;
  background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
  height: 60px;
  box-shadow: 10px 10px #000000bf;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;
}

nav a {
  color: white;
  text-decoration: none;
}

nav span {
  cursor: pointer;
}

nav .user-access {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 250px;
}

nav .hamburger-menu {
  display: none;
}

nav .mobile-user-access {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 250px;
  animation: moveUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.notification {
  background-color: #ffff;
  border: 2px solid #e84393;
  height: 350px;
  width: 300px;
  position: fixed;
  right: 28%;
  top: 60px;
  padding: 13px;
  border-bottom-right-radius: 15px;
  border-bottom-left-radius: 15px;
  animation-name: notif-animation;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
  z-index: 1;
  overflow: scroll;
  cursor: pointer
}

.notification a {
  text-decoration: none;
  color: black;
}

.notification p {
  background-color: #dddd;
  padding: 7px;
  border-radius: 15px;
  margin-bottom: 7px;
  transition: 0.5s ease-in-out;
}

.notification p:hover {
  transform: scale(1.03);
}

@media (max-width: 768px) {
  .notification {
    right: 5%;
    width: 90%;
  }

  nav .user-access {
    background-color: red;
    display: none;
  }

  nav .hamburger-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    animation: moveUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  }

  nav .hamburger-menu span {
    margin: -6px;
  }
}

@keyframes notif-animation {
  0% {
    height: 0;
    color: white;
  }

  100% {
    height: 350px;
    color: black;
  }
}

@keyframes moveUp {
  0% {
    transform: scale(0);
    opacity: 0;
    border-radius: 15px;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
