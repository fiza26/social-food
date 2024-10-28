<script setup>
import { defineProps } from 'vue';
import { usePostsStore } from "../stores/posts";

const postsStore = usePostsStore();

const props = defineProps({
    notif: Boolean,
    messageNotif: String,
    closeNotif: Function
})
</script>

<template>
    <div class="notif" v-if="postsStore.notif || notif">
        <p v-if="notif">{{ messageNotif }}</p>
        <p v-else>{{ postsStore.messageNotif }}</p>
        <p class="close-notif" @click="closeNotif()">X</p>
    </div>
</template>

<style scoped>
.notif {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #e84393;
    color: white;
    width: 300px;
    padding: 15px;
    border-radius: 15px;
    position: fixed;
    top: 450px;
    right: 30px;
    transition: ease-in-out;
    animation-name: item-notif;
    animation-duration: 0.3s;
    animation-fill-mode: forwards;
    box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.75);
    -webkit-box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 0.75);
}

.close-notif {
    background-color: white;
    padding: 3px;
    width: 35px;
    border-radius: 15px;
    color: black;
    text-align: center;
    cursor: pointer;
}

@keyframes card-animation {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
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

@keyframes item-notif {
    0% {
        transform: scale(0);
        transform: translate(20rem, 1rem);
    }

    100% {
        transform: scale(1);
        transform: translate(-1rem, 1rem);
    }
}

@media screen and (max-width: 768px) {
    .container .sort-label {
        max-width: 40rem;
    }

    .container .card {
        margin-bottom: 20px;
    }

    .container .card .button-action button {
        width: 9rem;
    }

    .content img {
        width: 300px;
    }

    .modal .full-image {
        width: 350px;
    }

    .notif {
        right: 1%;
        width: 90%;
    }
}
</style>