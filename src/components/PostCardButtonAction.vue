<script setup>
import { defineProps } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
    post: Object,
    upvote: Function,
    removeUpvote: Function,
    submitEdit: Function,
    cancelEdit: Function
})
</script>

<template>
    <div class="button-action" v-if="!post.editPostActive">
        <button v-if="!post.isUpvoted" @click="upvote(post)">{{ post.upvotes }} Upvote</button>
        <button v-else @click="removeUpvote(post)" class="upvoted">{{ post.upvotes }} Remove Upvote</button>
        <RouterLink :to="`/comment/${post.id}`"><button>{{ post.total_comments }} Comment</button></RouterLink>
    </div>
    <div class="button-action" v-if="post.editPostActive">
        <button @click="submitEdit(post)" :class="{ editStateActive: post.editPostActive }">Update</button>
        <button @click="cancelEdit(post)">Cancel</button>
    </div>
</template>

<style scoped>
.container .card .button-action {
    display: flex;
    justify-content: space-between;
}

.container .card .button-action button {
    font-family: "Poppins", sans-serif;
    height: 30px;
    width: 15rem;
    border: none;
    background-color: white;
    border: 2px solid #e84393;
    margin-top: 10px;
    border-radius: 15px;
    cursor: pointer;
}

.editStateActive {
    width: 50rem;
}

.container .card .button-action .upvoted {
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    border: none;
    color: white;
}

.container .card .button-action button:hover {
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    border: none;
    color: white;
}

.container .card .button-action button:active {
    transform: scale(0.9);
}
</style>