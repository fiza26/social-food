<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    isFiltered: Boolean,
    filteredItems: Array
})

</script>

<template>
    <div v-if="isFiltered && filteredItems.length === 0">
        <p>No post with this label yet</p>
    </div>
</template>