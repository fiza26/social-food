<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useUserStore } from '../stores/userSession'; // Import your store

const userStore = useUserStore();

const props = defineProps({
    modelValue: String, // v-model for content 
    label: String,
    foodName: String,
    afterChooseFood: Boolean,
    filteredFoods: Array,
    imageUploadedUrl: String,
    uploadState: Boolean,
    chooseFood: Function,
    handleFileChange: Function,
    removeFile: Function,
    addPost: Function,
    uploadStateActive: Function,
});

// Emit for v-model content
const emit = defineEmits(['update:modelValue', 'update:label', 'update:foodName']);

const localContent = ref(props.modelValue);
const selectedLabel = ref(props.label);

// Watch for changes in localContent and selectedLabel
// watch(localContent, (newValue) => {
//     emit('update:modelValue', newValue); // Emit when content changes
// });

// watch(selectedLabel, (newValue) => {
//     emit('update:label', newValue); // Emit when label changes
// });

// Update localContent on input
const updateContent = () => {
    emit('update:modelValue', localContent.value);
};

// Update selectedLabel on selection
const updateLabel = () => {
    emit('update:label', selectedLabel.value);
};

// Handle food name change
const updateFoodName = (event) => {
    emit('update:foodName', event.target.value);
};

</script>

<template>
    <div class="card-posting">
        <h3>Post Something...</h3>
        <input type="text" placeholder="Enter your name" v-model="userStore.name" disabled>

        <select v-model="selectedLabel" @change="updateLabel">
            <option value="">Choose Label</option>
            <option value="Discussion">Discussion</option>
            <option value="Question">Question</option>
            <option value="Recipe">Recipe</option>
        </select>

        <input type="text" placeholder="Write food name to generate image from API, Example: Pizza" :value="foodName"
            @input="updateFoodName" v-if="!imageUploadedUrl" />

        <div class="searchSuggestion" v-if="foodName && !afterChooseFood">
            <p v-for="food in filteredFoods" :key="food.idMeal" @click="chooseFood(food)">{{ food.strMeal }}</p>
        </div>

        <div class="upload-image" v-if="!foodName">
            <div @click="uploadStateActive" class="upload-your-image">Or upload your image...</div>
            <div v-if="uploadState" class="custom-file-upload">
                <label for="file-upload" class="custom-upload-button">Choose File</label>
                <input id="file-upload" type="file" @change="handleFileChange" accept="image/*" />
                <p v-if="imageUploadedUrl">{{ imageUploadedUrl }}</p>
                <button v-if="imageUploadedUrl" @click="removeFile">X Remove File</button>
            </div>
        </div>

        <textarea placeholder="Write something here..." v-model="localContent" @input="updateContent"
            :disabled="!selectedLabel"></textarea>

        <button type="submit" @click="addPost" :disabled="localContent === ''">Post</button>
    </div>
</template>

<style>
.container .card-posting {
    background-color: #ffff;
    border: 2px solid #e84393;
    padding: 15px;
    max-width: 600px;
    box-shadow: 10px 10px #000000bf;
    margin-bottom: 25px;
    border-radius: 15px;
}

.container .card-posting input {
    font-family: "Poppins", sans-serif;
    width: 100%;
    border: none;
    padding: 7px;
    border: 1px solid #e84393;
    border-radius: 15px;
    margin-top: 10px;
}

.container .card-posting select {
    font-family: "Poppins", sans-serif;
    margin-top: 10px;
    width: 100%;
    padding: 7px;
    border-radius: 15px;
    border: none;
    border: 1px solid #e84393;
}

.container .card-posting .searchSuggestion {
    background-color: #ddd;
    padding: 7px;
    border-bottom-right-radius: 15px;
    border-bottom-left-radius: 15px;
}

.container .card-posting .searchSuggestion p {
    white-space: normal;
    overflow: hidden;
    max-width: 500px;
}

.container .card-posting .upload-image .upload-your-image {
    margin-top: 5px;
    cursor: pointer;
    font-size: 13px;
}

.container .card-posting .upload-image .upload-your-image:hover {
    text-decoration: underline #e84393;
}

#file-upload {
    display: none;
}

.custom-upload-button {
    display: inline-block;
    border: 1px solid #e84393;
    width: 150px;
    text-align: center;
    padding: 5px;
    margin-top: 5px;
    cursor: pointer;
    border-radius: 15px;
    transition: background-color 0.3s ease-in-out;
    animation: moveUp 0.3s both ease-in-out;
}

.custom-upload-button:hover {
    color: white;
    background-color: #e84393;
}

.custom-file-upload p {
    margin-top: 7px;
    white-space: pre-wrap;
    max-width: 30rem;
}

.container .card-posting p {
    padding: 5px;
    border-radius: 15px;
    cursor: pointer;
}

.container .card-posting p:hover {
    background-color: #e84393;
    color: white;
}

.card-posting textarea {
    font-family: "Poppins", sans-serif;
    width: 100%;
    height: 50px;
    border-radius: 15px;
    padding: 10px;
    border: 1px solid #e84393;
    margin-top: 10px;
}

.card-posting button {
    font-family: "Poppins", sans-serif;
    border: none;
    background-color: #e84393;
    color: white;
    border-radius: 15px;
    width: 100%;
    padding: 7px;
    margin-top: 10px;
    cursor: pointer;
}

.card-posting button:active {
    transform: scale(0.9);
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
}
</style>