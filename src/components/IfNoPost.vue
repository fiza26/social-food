<script setup>
import { usePostsStore } from "../stores/posts";
const postsStore = usePostsStore();
</script>

<template>
    <h3 v-if="postsStore.posts < 1">There is no post yet</h3>
</template>