<script setup>
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import axios from "axios";
import { useUserStore } from '../stores/userSession';
import { usePostsStore } from "../stores/posts";

import { supabaseUrl, supabaseKey } from '@/supabaseConfig';
import { createClient } from '@supabase/supabase-js';
import PostForm from "@/components/PostForm.vue";
import SortLabel from "@/components/SortLabel.vue";
import IfNoPost from "@/components/IfNoPost.vue";
import IfNoPostSelectedLabel from "@/components/IfNoPostSelectedLabel.vue";
import PostItem from "@/components/PostItem.vue";

const supabase = createClient(supabaseUrl, supabaseKey);

const userStore = useUserStore();
const postsStore = usePostsStore();

const editPost = (post) => postsStore.editPost(post);
const cancelEdit = (post) => postsStore.cancelEdit(post);
const submitEdit = (post) => postsStore.submitEdit(post);
const deletePost = (post) => postsStore.deletePost(post);
const upvote = (post) => postsStore.upvote(post);
const removeUpvote = (post) => postsStore.removeUpvote(post);
const savePost = (post) => postsStore.savePost(post);
const removeSavedPost = (post) => postsStore.removeSavedPost(post);

async function loadProfile() {
  await userStore.isLoggedIn();
  await postsStore.getPosts();
  await userStore.getProfile();
}
loadProfile();

// API
const foods = ref([]);
const foodName = ref("");
const imageUrl = ref("");

const searchFoods = async () => {
  foods.value = [];

  if (foodName.value) {
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${foodName.value}`);
      if (response.data.meals) {
        foods.value = response.data.meals;
      }
    } catch (error) {
      console.error('Error loading food:', error);
    }
  }
};
searchFoods();

const file = ref(null);
const imageUploadedUrl = ref('');

// Handle file change
const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
    imageUploadedUrl.value = URL.createObjectURL(selectedFile);
  }
};

const notif = ref(false);
const messageNotif = ref('')

// Add post
const content = ref("");
const label = ref("");
const imageOption = ref('');

async function removeFile() {
  imageUploadedUrl.value = '';
  location.reload()
}

async function addPost() {
  await searchFoods();

  // Extract image URL if food found
  if (foods.value && foods.value.length > 0) {
    imageUrl.value = foods.value[0].strMealThumb;
  } else {
    imageUrl.value = ''; // Reset imageUrl if no food found
  }

  // If user chose to generate image from API
  if (imageUrl.value) {
    imageOption.value = imageUrl.value;
  }

  try {
    const fileName = `${userStore.name}/${file.value.name}`;
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file.value);

    console.log('upload data:', data);

    if (error) {
      throw new Error('Image upload failed: ' + error.message);
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    const publicURL = publicUrlData.publicUrl;

    // Optionally update any user state or store with the new image URL
    imageUploadedUrl.value = publicURL;
    console.log('profile url', imageUploadedUrl);

    // If user chose upload image option
    if (imageUploadedUrl) {
      imageOption.value = imageUploadedUrl.value;
    }

  } catch (error) {
    console.error(error);
    if (!imageUrl) {
      alert('An error occurred while uploading the image.');
    }
  }

  const { error } = await supabase.from('posts').insert({ name: userStore.name, profile_picture: userStore.myProfilePicture, post_content: content.value, image_url: imageOption.value, date_created: new Date().toLocaleString(), label: label.value })
  if (error) {
    window.alert("Data has not added");
  } else {
    notif.value = true;
    messageNotif.value = 'Post has been added successfully';
    await postsStore.getPosts();
  }
};

// Search food 
const filteredFoods = ref([]);

const searchFood = () => {
  filteredFoods.value = foods.value.filter((item) => item.strMeal.toLowerCase().includes(foodName.value.toLowerCase()));
}

watch(foodName, async () => {
  afterChooseFood.value = false; // Reset afterChooseFood whenever foodName changes
  await searchFoods(); // Fetch updated foods
  searchFood(); // Filter based on updated foods
});

// Upload image functionality
const uploadState = ref(false);

const uploadStateActive = () => {
  uploadState.value = !uploadState.value;
}

// Choose food
const afterChooseFood = ref(false);

const chooseFood = (food) => {
  foodName.value = food.strMeal;
  filteredFoods.value = [];
  afterChooseFood.value = true;
}

// Sort label
const showState = ref(false);
const showDiv = ref(false);
const filteredItems = ref([]);
const isFiltered = ref(false);
const activeLabel = ref('All');

const showAll = () => {
  isFiltered.value = false;
  showDiv.value = false;
  activeLabel.value = 'All';
}

const sortLabel = (label) => {
  isFiltered.value = true;
  showState.value = false;
  showDiv.value = true;
  activeLabel.value = label;
  filteredItems.value = postsStore.posts.filter((item) => item.label === label);
};

//Slice functionality 
const visibleCount = ref(3);

const showMore = () => {
  showState.value = true;
  visibleCount.value = 100;
}

const showLess = () => {
  showState.value = false;
  visibleCount.value = 3;
}

// Show full image
const modalForImage = ref(false);
let clickedImage;
const showFullImage = (post) => {
  clickedImage = post;
  modalForImage.value = true;
};

// Close image
const closeImage = () => {
  modalForImage.value = false;
};

// Setting
const setting = (post) => {
  post.settingState = !post.settingState;
}

// Close notif 
const closeNotif = () => {
  notif.value = false;
  location.reload();
}
</script>

<template>
  <main>
    <div class="master-container">
      <div class="container">
        <PostForm v-model="content" v-model:label="label" v-model:foodName="foodName" :foodName="foodName"
          :afterChooseFood="afterChooseFood" :filteredFoods="filteredFoods" :imageUploadedUrl="imageUploadedUrl"
          :uploadState="uploadState" :chooseFood="chooseFood" :handleFileChange="handleFileChange"
          :removeFile="removeFile" :addPost="addPost" :uploadStateActive="uploadStateActive" :file="file" />
        <SortLabel :activeLabel="activeLabel" @showAll="showAll" @sortLabel="sortLabel" />
        <IfNoPost />
        <div v-if="isFiltered && filteredItems.length === 0">
          <p>No post with this label yet</p>
        </div>
        <div v-else>
          <div class="card" v-for="post in (isFiltered ? filteredItems : postsStore.posts).slice(0, visibleCount)"
            :key="post.id">
            <PostItem :post="post" :setting="setting" :editPost="editPost" :deletePost="deletePost" :savePost="savePost"
              @removeSavedPost="removeSavedPost" />
            <hr>
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
            <div class="button-action" v-if="!post.editPostActive">
              <button v-if="!post.isUpvoted" @click="upvote(post)">{{ post.upvotes }} Upvote</button>
              <button v-else @click="removeUpvote(post)" class="upvoted">{{ post.upvotes }} Remove Upvote</button>
              <RouterLink :to="`/comment/${post.id}`"><button>{{ post.total_comments }} Comment</button></RouterLink>
            </div>
            <div class="button-action" v-if="post.editPostActive">
              <button @click="submitEdit(post)" :class="{ editStateActive: post.editPostActive }">Update</button>
              <button @click="cancelEdit(post)">Cancel</button>
            </div>
          </div>
        </div>
        <div class="showMoreOrLess" v-if="postsStore.posts.length >= 4 && !showDiv">
          <button @click="showMore()" v-if="!showState">Show More</button>
          <button @click="showLess()" v-else>Show Less</button>
        </div>
        <div class="showMoreOrLess" v-if="filteredItems.length > 4 && showDiv">
          <button @click="showMore()" v-if="!showState">Show More</button>
          <button @click="showLess()" v-else>Show Less</button>
        </div>
        <div class="notif" v-if="postsStore.notif || notif">
          <p v-if="notif">{{ messageNotif }}</p>
          <p v-else>{{ postsStore.messageNotif }}</p>
          <p class="close-notif" @click="closeNotif()">X</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.master-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 100px;
  margin-right: 30px;
  margin-left: 30px;
  margin-bottom: 30px;
}

.container {
  display: flex;
  flex-direction: column;
}

hr {
  border: 1px solid #e84393;
  margin-bottom: 10px;
}

.container .card {
  background-color: #ffff;
  border: 2px solid #e84393;
  padding: 15px;
  max-width: 40rem;
  box-shadow: 10px 10px #000000bf;
  margin-bottom: 25px;
  border-radius: 15px;
  animation-name: card-animation;
  animation-duration: 0.5s;
}

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

.second-container {
  margin-left: 30px;
}

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
