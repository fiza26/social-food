<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    activeLabel: String,
    showAll: Function,
    sortLabel: Function,
})

const emit = defineEmits(['showAll', 'sortLabel']);

const showAll = () => emit('showAll');
const sortLabel = (label) => emit('sortLabel', label);

</script>

<template>
    <div class="sort-label">
        <p @click="showAll" :class="{ sortLabelActive: activeLabel === 'All' }">All</p>
        <p @click="sortLabel('Discussion')" :class="{ sortLabelActive: activeLabel === 'Discussion' }">Discussion</p>
        <p @click="sortLabel('Question')" :class="{ sortLabelActive: activeLabel === 'Question' }">Question</p>
        <p @click="sortLabel('Recipe')" :class="{ sortLabelActive: activeLabel === 'Recipe' }">Recipe</p>
    </div>
</template>

<style scoped>
.container .sort-label {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 40rem;
    margin-bottom: 20px;
    border-radius: 15px;
    padding: 15px;
}

.container .sort-label p {
    margin: 5px;
    border-radius: 15px;
    width: 130px;
    text-align: center;
    padding: 3px;
    border: 1px solid #e84393;
    cursor: pointer;
}

.container .sort-label p:hover {
    background-color: #e84393;
    color: white;
}

.container .sortLabelActive {
    background-color: #e84393;
    color: white;
}
</style>