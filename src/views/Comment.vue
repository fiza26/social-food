<script setup>
import { ref, computed, nextTick } from "vue";
import { RouterLink } from "vue-router";
import { useRoute } from "vue-router";
import { useUserStore } from '../stores/userSession';
import { usePostsStore } from "../stores/posts";

import { supabaseUrl, supabaseKey } from '@/supabaseConfig';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

const userStore = useUserStore();
const postsStore = usePostsStore();

const route = useRoute();
const id = computed(() => route.params.id);

async function loadProfile() {
    await userStore.isLoggedIn();
    await userStore.getProfile();
    await postsStore.getPosts();
}
loadProfile();

const editPost = (post) => postsStore.editPost(post);
const cancelEdit = (post) => postsStore.cancelEdit(post);
const submitEdit = (post) => postsStore.submitEdit(post);
const deletePost = (post) => postsStore.deletePost(post, route);
const upvote = (post) => postsStore.upvote(post);
const removeUpvote = (post) => postsStore.removeUpvote(post);
const savePost = (post) => postsStore.savePost(post);
const removeSavedPost = (post) => postsStore.removeSavedPost(post);

const item = computed(() => {
    return postsStore.posts.find((content) => content.id === parseInt(id.value));
});

const setting = (item) => {
    item.settingState = !item.settingState;
}

const notif = ref(false);
const messageNotif = ref('');

const closeNotif = () => {
    notif.value = false;
}

// Show Full Image
const modalForImage = ref(false);
let clickedImage;
const showFullImage = (post) => {
    clickedImage = post;
    modalForImage.value = true;
};

// Close Image
const closeImage = () => {
    modalForImage.value = false;
};

// Insert Comment to Database
const comment = ref("");

async function insertComment() {
    const totalComment = ref([]);

    const { data } = await supabase.from('comments').select().eq('id_post', id.value);
    totalComment.value = data;

    let incrementTotalComment = totalComment.value.length;

    const { error } = await supabase.from('comments').insert({ id_post: id.value, name: userStore.name, profile_picture: userStore.myProfilePicture, comment: comment.value, date_created: new Date().toLocaleString() });
    await supabase.from('posts').update({ total_comments: incrementTotalComment + 1 }).eq('id', id.value);
    if (error) {
        window.alert("Error");
    } else {
        comment.value = "";
        notif.value = true;
        messageNotif.value = 'Comment has been posted'
        await getComments();
    }
};

// Get Comments
const comments = ref([]);

async function getComments() {
    const { data } = await supabase.from('comments').select().eq('id_post', id.value);

    comments.value = data.map(comment => {
        comment.editCommentState = false;
        return comment;
    });
    console.log("Comments", comments);
};
getComments();

// Edit Comment 
const editComment = (comment) => {
    comment.editCommentState = !comment.editCommentState;
}

async function submitEditComment(comment) {
    const { error } = await supabase.from('comments').update({ comment: comment.comment }).eq('id', comment.id);
    if (error) {
        window.alert("Error");
    } else {
        notif.value = true;
        messageNotif.value = 'Comment has been updated';
        await getComments();
    }
}

// Delete Comment 
async function deleteComment(comment) {
    const totalComment = ref([]);

    const { data } = await supabase.from('comments').select().eq('id_post', id.value);
    totalComment.value = data;

    let incrementTotalComment = totalComment.value.length;

    const { error } = await supabase.from('comments').delete().eq('id', comment.id);
    await supabase.from('posts').update({ total_comments: incrementTotalComment - 1 }).eq('id', id.value);
    if (error) {
        window.alert("Error");
    } else {
        notif.value = true;
        messageNotif.value = 'Comment has been deleted';
        await getComments();
    }
}
</script>

<template>
    <div class="master-container">
        <div class="container">
            <div class="card">
                <div class="profile">
                    <img v-if="!item.profile_picture"
                        src="https://static.vecteezy.com/system/resources/previews/019/879/186/original/user-icon-on-transparent-background-free-png.png"
                        alt="">
                    <img v-else :src="item.profile_picture" alt="" class="user-profile-picture">
                    <div class="post-detail">
                        <div class="nameAndDate">
                            <RouterLink :to="`/profile/${item.name}`">
                                <h3>{{ item.name }}</h3>
                            </RouterLink>
                            <p>{{ item.date_created }}</p>
                        </div>
                        <div class="post-label">
                            <p v-if="!item.settingState">{{ item.label }}</p>
                            <span @click="setting(item)" v-if="userStore.name === item.name">. . .</span>
                        </div>
                        <div class="edit-delete" v-if="item.settingState">
                            <span @click="editPost(item)">Edit</span>
                            <span @click="deletePost(item)">Delete</span>
                        </div>
                        <div class="save-post">
                            <span v-if="!item.isSaved" @click="savePost(item)"><img
                                    src="https://static.thenounproject.com/png/3810268-200.png" alt=""></span>
                            <span v-else="item.isSaved" @click="removeSavedPost(item)" class="post-saved"><img
                                    src="https://static.thenounproject.com/png/3810268-200.png" alt=""></span>
                        </div>
                    </div>
                </div>
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
                        <img :src="item.image_url" alt="" @click="showFullImage(item)">
                    </div>
                    <p v-if="!item.editPostActive">{{ item.post_content }}</p>
                    <textarea name="" id="" v-if="item.editPostActive" v-model="item.post_content"></textarea>
                    <div class="button-action" v-if="item.editPostActive">
                        <button @click="submitEdit(item)"
                            :class="{ editStateActive: item.editPostActive }">Update</button>
                        <button @click="cancelEdit(item)">Cancel</button>
                    </div>
                </div>
                <div class="button-action" v-if="!item.editPostActive">
                    <button v-if="!item.isUpvoted" @click="upvote(item)">{{ item.upvotes }} Upvote</button>
                    <button v-else class="upvoted" @click="removeUpvote(item)">{{ item.upvotes }} Remove Upvote</button>
                </div>
                <div class="comment-field">
                    <textarea name="" id="" placeholder="Write your comment here..." v-model="comment"></textarea>
                    <button @click="insertComment" :disabled="comment === ''">Submit</button>
                </div>
                <div class="total-comment" v-if="comments.length > 0">
                    <h4>{{ comments.length }} comment(s) found on this post</h4>
                </div>
                <div class="comment-section" v-for="comment in comments" :key="comment.id">
                    <div class="profile">
                        <div class="user-photo-name">
                            <div class="photo">
                                <img v-if="!comment.profile_picture"
                                    src="https://static.vecteezy.com/system/resources/previews/019/879/186/original/user-icon-on-transparent-background-free-png.png"
                                    alt="">
                                <img v-else :src="comment.profile_picture" alt="" class="user-profile-picture">
                            </div>
                            <div class="name-date">
                                <RouterLink :to="`/profile/${comment.name}`">
                                    <h3>{{ comment.name }}</h3>
                                </RouterLink>
                                <p>{{ comment.date_created }}</p>
                            </div>
                        </div>
                        <div class="edit-delete" v-if="userStore.name === comment.name">
                            <span @click="editComment(comment)">Edit</span>
                            <span @click="deleteComment(comment)">Delete</span>
                        </div>
                    </div>
                    <p v-if="!comment.editCommentState">{{ comment.comment }}</p>
                    <textarea name="" id="" v-model="comment.comment" v-if="comment.editCommentState"></textarea>
                    <button @click="submitEditComment(comment)" v-if="comment.editCommentState"
                        :disabled="comment.comment === ''">Update</button>
                </div>
            </div>
            <div class="notif" v-if="postsStore.notif || notif">
                <p v-if="notif">{{ messageNotif }}</p>
                <p v-else>{{ postsStore.messageNotif }}</p>
                <p class="close-notif" @click="closeNotif()">X</p>
            </div>
        </div>
    </div>
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

.container .profile {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

.container .profile .user-photo-name {
    display: flex;
    flex-direction: row;
}

.container .profile .user-photo-name .name-date a {
    color: black;
    text-decoration: none;
}

.container .profile .user-photo-name .name-date p {
    font-size: 13px;
}

.container .profile .edit-delete span {
    margin-left: 5px;
    border-bottom: 2px solid #e84393;
    cursor: pointer;
}

.container .profile .save-post span img {
    height: 25px;
    cursor: pointer;
}

.container .profile .save-post .post-saved {
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    border-radius: 15px;
    padding: 2px;
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
    width: 557px;
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
    width: 100%;
    border: none;
    background-color: white;
    border: 2px solid #e84393;
    margin-top: 10px;
    border-radius: 15px;
    cursor: pointer;
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

.container .card .comment-field {
    margin-top: 15px;
}

.container .card .comment-field textarea {
    font-family: "Poppins", sans-serif;
    width: 100%;
    border-radius: 15px;
    padding: 10px;
    border: 2px solid #e84393;
}

.container .card .comment-field button {
    font-family: "Poppins", sans-serif;
    height: 30px;
    width: 100%;
    border: none;
    background-color: #e84393;
    color: white;
    margin-top: 10px;
    border-radius: 15px;
    cursor: pointer;
}

.container .card .comment-field button:active {
    transform: scale(0.9);
}

.container .card .total-comment {
    margin-top: 13px;
}

.container .card .comment-section {
    margin-top: 15px;
    background-color: #dddd;
    border-radius: 15px;
    padding: 10px;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    overflow-wrap: break-word;
    max-width: 100%;
}

.comment-section p {
    white-space: pre-wrap;
    word-wrap: break-word;
}

.comment-section textarea {
    font-family: "Poppins", sans-serif;
    width: 100%;
    border-radius: 15px;
    height: 80px;
    padding: 15px;
    border: 1px solid #e84393;
    animation: moveUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
}

.comment-section button {
    font-family: "Poppins", sans-serif;
    height: 30px;
    width: 100%;
    border: none;
    background-color: #e84393;
    color: white;
    margin-top: 10px;
    border-radius: 15px;
    cursor: pointer;
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
    width: 303px;
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
    .container .card {
        margin-bottom: 20px;
    }

    .container .card .button-action button {
        width: 100%;
    }

    .container .profile .edit-delete span {
        font-size: 13px;
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