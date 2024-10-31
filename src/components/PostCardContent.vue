<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    modalForImage: Boolean,
    clickedImage: Object,
    closeImage: Function,
    post: Object,
    showFullImage: Function,
})
</script>

<template>
    <div class="content">
        <div class="content-image">
            <div class="modal" v-if="modalForImage">
                <div class="modal-content">
                    <img :src="clickedImage.image_url" alt="" class="full-image">
                    <button class="close-image" @click="closeImage">
                        <h1>X</h1>
                    </button>
                </div>
            </div>
            <img :src="post.image_url" alt="" @click="showFullImage(post)">
        </div>
        <p v-if="!post.editPostActive">{{ post.post_content }}</p>
        <textarea name="" id="" v-if="post.editPostActive" v-model="post.post_content"></textarea>
    </div>
</template>

<style>
.content {
    white-space: normal;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
}

.content .content-image {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
}

.content img {
    width: 400px;
    object-fit: cover;
    border-radius: 15px;
    cursor: pointer;
}

.content p {
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 33rem;
}

.content textarea {
    font-family: "Poppins", sans-serif;
    width: 100%;
    padding: 15px;
    border-radius: 15px;
    font-size: 17px;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.modal .modal-content {
    transition: 1s ease-in-out;
    transform: scale(0);
    animation: moveUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.modal .full-image {
    width: 600px;
}

.modal .close-image {
    position: absolute;
    top: 10px;
    right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-family: "Poppins", sans-serif;
    border: none;
    width: 50px;
    height: 50px;
    padding: 20px;
    border-radius: 50px;
    transition: ease-in-out 0.3s;
}

.modal .close-image:hover {
    transform: scale(1.3);
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