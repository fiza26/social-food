<script setup>
import { defineProps } from 'vue';
import { usePostsStore } from "../stores/posts";

const postsStore = usePostsStore();

const props = defineProps({
    showDiv: Boolean,
    showMore: Function,
    showState: Boolean,
    showLess: Function,
    filteredItems: Array
})
</script>

<template>
    <div class="showMoreOrLess" v-if="postsStore.posts.length >= 4 && !showDiv">
        <button @click="showMore()" v-if="!showState">Show More</button>
        <button @click="showLess()" v-else>Show Less</button>
    </div>
    <div class="showMoreOrLess" v-if="filteredItems.length > 4 && showDiv">
        <button @click="showMore()" v-if="!showState">Show More</button>
        <button @click="showLess()" v-else>Show Less</button>
    </div>
</template>

<style scoped>
.container .showMoreOrLess {
    display: flex;
    justify-content: center;
}

.container .showMoreOrLess button {
    font-family: "Poppins", sans-serif;
    background-color: #e84393;
    color: white;
    padding: 5px;
    border: none;
    border-radius: 15px;
    width: 180px;
    cursor: pointer;
}

.container .showMoreOrLess button:active {
    transform: scale(0.9);
}
</style>