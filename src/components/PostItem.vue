<script setup>
import { defineProps, defineEmits } from 'vue';
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

</style>