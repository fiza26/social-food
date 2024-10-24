<script setup>
import { defineProps, defineEmits } from 'vue';
import { useUserStore } from '../stores/userSession';
import { RouterLink } from 'vue-router';

const userStore = useUserStore();

const props = defineProps({
  post: Object,
  setting: Function,
  editPost: Function,
  deletePost: Function,
  savePost: Function,
  removeSavedPost: Function,
})

const emit = defineEmits(['setting', 'editPost', 'deletePost', 'savePost', 'removeSavedPost'])
</script>

<template>
  <div class="profile">
    <img v-if="!post.profile_picture"
      src="https://static.vecteezy.com/system/resources/previews/019/879/186/original/user-icon-on-transparent-background-free-png.png"
      alt="">
    <img v-else :src="post.profile_picture" alt="" class="user-profile-picture">
    <div class="post-detail">
      <div class="nameAndDate">
        <RouterLink :to="`/profile/${post.name}`">
          <h3>{{ post.name }}</h3>
        </RouterLink>
        <p>{{ post.date_created }}</p>
      </div>
      <div class="post-label">
        <p>{{ post.label }}</p>
        <span @click="setting(post)" v-if="userStore.name === post.name">. . .</span>
      </div>
      <div class="edit-delete" v-if="post.settingState">
        <span @click="editPost(post)">Edit</span>
        <span @click="deletePost(post)">Delete</span>
      </div>
      <div class="save-post">
        <span v-if="!post.isSaved" @click="savePost(post)"><img
            src="https://static.thenounproject.com/png/3810268-200.png" alt=""></span>
        <span v-else="post.isSaved" @click="removeSavedPost(post)" class="post-saved"><img
            src="https://static.thenounproject.com/png/3810268-200.png" alt=""></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container .profile {
  display: flex;
  align-items: center;
  margin-bottom: 7px;
}

.container .profile img {
  height: 40px;
}

.container .profile .user-profile-picture {
  height: 40px;
  border-radius: 50px;
  margin-right: 10px;
}

.container .profile .post-detail {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}

.container .profile .post-detail .nameAndDate a {
  text-decoration: none;
  color: black;
}

.container .profile .post-detail .post-label {
  display: flex;
}

.container .profile .post-detail .post-label p {
  display: flex;
  align-items: center;
  background-color: #e84393;
  color: white;
  border-radius: 15px;
  padding: 10px;
  height: 30px;
  margin-right: 5px;
}

.container .profile .post-detail .post-label span {
  background-color: #dddd;
  border-radius: 15px;
  height: 30px;
  width: 50px;
  text-align: center;
  cursor: pointer;
  margin-right: 5px;
}

.container .profile .post-detail .edit-delete span {
  margin-left: 5px;
  padding: 5px;
  border-bottom: 2px solid #e84393;
  cursor: pointer;
}

.container .profile .post-detail .save-post span img {
  height: 25px;
  cursor: pointer;
}

.container .profile .post-detail .save-post span img:active {
  background-color: #e84393;
  border-radius: 15px;
  padding: 7px;
}

.container .profile .post-detail .save-post .post-saved {
  background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
  border-radius: 15px;
  padding: 2px;
}
</style>