<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from '../stores/userSession';
import { usePostsStore } from "../stores/posts";

import { supabaseUrl, supabaseKey } from '@/supabaseConfig';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

const userStore = useUserStore();
const postsStore = usePostsStore();

const notif = ref(false);
const messageNotif = ref('')

const removeSavedPostAlternative = (post) => postsStore.removeSavedPostAlternative(post);

async function loadProfile() {
    await userStore.isLoggedIn();
    await userStore.getProfile();
}
loadProfile();

const route = useRoute();
const name = computed(() => route.params.name);
const fullName = userStore.fullName;

// Upload image state
const uploadState = ref(false);

const uploadStateActive = () => {
    uploadState.value = !uploadState.value;
};

const file = ref(null);
const imageUrl = ref('');

// Handle file change
const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        file.value = selectedFile;
        imageUrl.value = URL.createObjectURL(selectedFile);
    }
};

// Upload image function (integrates with Supabase)
const uploadImage = async () => {
    if (!file.value) {
        notif.value = true;
        messageNotif.value = 'Please select a file first'
        return;
    }

    try {
        const fileName = `${name.value}/${file.value.name}`;
        const { data, error } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, file.value);

        console.log('upload data:', data);

        if (error) {
            throw new Error('Image upload failed: ' + error.message);
        }

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

        const publicURL = publicUrlData.publicUrl;

        // Update the user's profile image URL in your store or state management
        notif.value = true;
        messageNotif.value = 'Image uploaded successfully!';

        // Optionally update any user state or store with the new image URL
        imageUrl.value = publicURL;
        console.log('profile url', imageUrl);

        await supabase.from('profiles').insert({ profile_picture_url: imageUrl.value, name: name.value });
        await supabase.from('posts').update({ profile_picture: imageUrl.value }).eq('name', name.value);
        await supabase.from('comments').update({ profile_picture: imageUrl.value }).eq('name', name.value);

    } catch (error) {
        console.error(error);
        notif.value = true;
        messageNotif.value = 'An error occurred while uploading the image';
    }
    location.reload();
};

// Get user profile
const userProfile = ref([]);

async function getProfile() {
    const { data } = await supabase.from('profiles').select().eq('name', name.value);
    userProfile.value = data;
};
getProfile();

// Show full image
const modalForImage = ref(false);
let clickedImage;
const showFullImage = (profile) => {
    clickedImage = profile;
    modalForImage.value = true;
};

// Close image
const closeImage = () => {
    modalForImage.value = false;
};

const posts = ref([]);
const savedPost = ref([]);

//Get profile picture file name 
async function getProfilePictureFileName() {
    const { data, error } = await supabase.storage.from('profile-pictures').list(name.value, { limit: 1 });
    if (error) {
        console.log('Error fetching file list', error);
        return null;
    }

    if (data && data.length > 0) {
        return data[0].name;
    }

    return null;
}

// Remove profile picture
async function removeProfilePicture() {
    const fileName = await getProfilePictureFileName()

    if (!fileName) {
        console.log('No profile picture found');
        return;
    }

    const { error: profileError } = await supabase.from('profiles').delete().eq('name', name.value);
    await supabase.from('posts').update({ profile_picture: null }).eq('name', name.value);
    await supabase.from('comments').update({ profile_picture: null }).eq('name', name.value);

    const filePath = `${name.value}/${fileName}`;
    const { error: storageError } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

    if (!profileError && storageError) {
        location.reload();
    } else {
        console.log("Can not delete profile picture:", profileError || storageError);
    }
};

// Get my post
// This will be shown even if the user is not logged in or is accessing with another account because it uses route.params instead of fetching data directly from the store
async function getMyPost() {
    const { data } = await supabase.from('posts').select().eq('name', name.value);
    posts.value = data;
};
getMyPost();

async function getSavedPost() {
    const { data } = await supabase.from('saved_post').select().eq('saved_by', name.value);
    savedPost.value = data;
};
getSavedPost();

</script>

<template>
    <div class="master-container">
        <div class="container">
            <div class="modal" v-if="modalForImage">
                <div class="modal-content">
                    <img :src="clickedImage.profile_picture_url" alt="" class="full-image">
                    <button class="close-image" @click="closeImage">
                        <h1>X</h1>
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="cover">
                    <img src="https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                        alt="">
                </div>
                <div class="profile">
                    <img v-if="userProfile.length === 0"
                        src="https://static.vecteezy.com/system/resources/previews/019/879/186/original/user-icon-on-transparent-background-free-png.png"
                        alt="">
                    <div v-for="profile in userProfile" :key="profile.id">
                        <img :src="profile.profile_picture_url" @click="showFullImage(profile)" alt="Profile Picture" />
                    </div>
                    <h3>{{ fullName }}</h3>
                    <h4>{{ name }}</h4>
                    <button class="upload-button" @click="uploadStateActive()"
                        v-if="userProfile.length === 0 && name === userStore.name">Upload
                        Picture</button>
                    <div class="change-profile-picture" v-if="userProfile.length === 0">
                        <div v-if="uploadState" class="custom-file-upload">
                            <label for="file-upload" class="custom-upload-button">Choose File</label>
                            <p v-if="file">{{ file.name }}</p>
                            <input id="file-upload" type="file" @change="handleFileChange" accept="image/*" />
                            <button @click="uploadImage">Upload</button>
                        </div>
                    </div>
                    <div class="profile-picture-action" v-if="userProfile.length > 0 && name === userStore.name">
                        <button @click="removeProfilePicture()">Remove Profile Picture</button>
                    </div>
                </div>
                <div class="post-container">
                    <h3 v-if="posts.length > 0">All Post</h3>
                    <h3 v-else class="if-no-posts">You have not posted anything yet</h3>
                    <hr v-if="posts.length > 0">
                    <div class="my-post" v-for="post in posts" :key="post.id">
                        <p>{{ post.post_content }}</p>
                        <RouterLink :to="`/comment/${post.id}`"><button>More Details</button></RouterLink>
                    </div>
                    <h3 v-if="savedPost.length > 0">Saved Post</h3>
                    <hr v-if="savedPost.length > 0">
                    <div class="my-post" v-for="post in savedPost" :key="post.id">
                        <div class="header">
                            <p>{{ post.post_content }}</p>
                            <div class="save-post">
                                <span @click="removeSavedPostAlternative(post)" class="post-saved"><img
                                        src="https://static.thenounproject.com/png/3810268-200.png" alt=""></span>
                            </div>
                        </div>
                        <RouterLink :to="`/comment/${post.id_post}`"><button>More Details</button></RouterLink>
                    </div>
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
    animation-duration: 1s;
    overflow: hidden;
}

.container .card .cover {
    position: relative;
}

.container .card .cover img {
    width: 100%;
    height: 350px;
    border-radius: 15px;
    filter: brightness(50%);
    object-fit: cover;
}

.container .card .profile {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    position: relative;
    top: -300px;

}

.container .card .profile img {
    width: 150px;
    border-radius: 100px;
    object-fit: cover;
    cursor: pointer;
}

.container .card .profile .upload-button {
    font-family: "Poppins", sans-serif;
    border: none;
    padding: 5px;
    border-radius: 15px;
    width: 130px;
    cursor: pointer;
    background-color: #e84393;
    color: white;
    margin-top: 5px;
}

.container .card .profile .change-profile-picture {
    margin-top: 5px;
    padding: 7px;
}

.container .card .profile .change-profile-picture input {
    font-family: "Poppins", sans-serif;
    border: none;
    cursor: pointer;
    animation-name: moveUp;
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

.container .card .profile .change-profile-picture button {
    font-family: "Poppins", sans-serif;
    border: none;
    padding: 5px;
    border-radius: 15px;
    width: 130px;
    cursor: pointer;
    background-color: #e84393;
    color: white;
    animation-name: moveUp;
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

#file-upload {
    display: none;
}

.custom-file-upload {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
    max-width: 350px;
}

.custom-upload-button {
    display: inline-block;
    border: 1px solid #e84393;
    width: 130px;
    text-align: center;
    padding: 5px;
    margin-top: 5px;
    cursor: pointer;
    border-radius: 15px;
    transition: background-color 0.3s ease-in-out;
    animation-name: moveUp;
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

.custom-upload-button:hover {
    color: white;
    background-color: #e84393;
}

.container .card .profile .profile-picture-action {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.container .card .profile .profile-picture-action button {
    font-family: "Poppins", sans-serif;
    border: none;
    padding: 3px;
    width: 180px;
    border-radius: 15px;
    background-color: #e84393;
    color: white;
    margin-top: 5px;
    margin-right: 7px;
    cursor: pointer;
}

.container .card .post-container {
    margin-top: -180px;
}

.container .card .post-container h3 {
    margin-top: 15px;
}

.container .card .post-container .if-no-posts {
    text-align: center;
}

.container .card .my-post {
    background-color: #ddd;
    padding: 15px;
    border-radius: 15px;
    margin-top: 10px;
}

.container .card .my-post p {
    white-space: nowrap;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 33rem;
}

.container .card .my-post button {
    font-family: "Poppins", sans-serif;
    margin-top: 10px;
    border: 1px solid #e84393;
    background-color: #ddd;
    padding: 5px;
    border-radius: 15px;
    cursor: pointer;
    width: 150px;
}

.container .card .my-post button:hover {
    background-color: #e84393;
    color: white;
}

.container .card .my-post .header {
    display: flex;
    justify-content: space-between;
}

.container .card .my-post .header span img {
    height: 25px;
    cursor: pointer;
}

.container .card .my-post .header .post-saved {
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    border-radius: 15px;
    padding: 2px;
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
    border-radius: 15px;
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
        width: 21rem;
    }

    .container .card .button-action button {
        width: 9rem;
    }

    .container .card .profile .change-profile-picture {
        margin-top: 10px;
    }

    .container .card .profile .change-profile-picture input {
        margin-top: 10px;
    }

    .container .card .profile .change-profile-picture button {
        margin-top: 10px;
    }

    .content img {
        width: 300px;
    }

    .modal .full-image {
        width: 350px;
    }

    .container .card .my-post p {
        max-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 11rem;
    }

    .notif {
        right: 1%;
        width: 90%;
    }
}
</style>