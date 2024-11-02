<script setup>
import { ref } from "vue";
import router from "@/router";

import { supabaseUrl, supabaseKey } from '@/supabaseConfig';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseKey);

const loginState = ref(true);
const regisState = ref(false);

const showRegis = () => {
    regisState.value = true;
    loginState.value = false;
};

const showLogin = () => {
    loginState.value = true;
    regisState.value = false;
}

let name = ref("");
let fullName = ref("");
let email = ref("");
let password = ref("");

const notif = ref(false);
const messageNotif = ref('')

const closeNotif = () => {
    notif.value = false;
}

async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })
    if (error) {
        console.log(error);
        notif.value = true;
        messageNotif.value = 'Login error, incorrect email and password';
    } else {
        console.log(data);
        notif.value = true;
        messageNotif.value = 'Login success';
        setTimeout(() => {
            router.push({ name: 'home' });
        }, 3000)
    }
};

async function regis() {
    if (!name.value || !fullName.value || !email.value || !password.value === '') {
        notif.value = true;
        messageNotif.value = "Field can not be empty";
        return;
    }

    const { data: existingUsernames, error: fetchError } = await supabase.from('profiles').select('name').eq('name', name.value);

    if (fetchError) {
        console.error(fetchError);
        notif.value = true;
        messageNotif.value = 'Error checking username availability';
        return;
    }

    if (existingUsernames.length > 0) {
        notif.value = true;
        messageNotif.value = 'Username already exists, please choose another one';
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                username: name.value,
                full_name: fullName.value
            }
        }
    })
    if (error) {
        console.log(error);
        setTimeout(() => {
            notif.value = true;
            messageNotif.value = 'Registration error';
        }, 3000)
    } else {
        console.log(data);
        notif.value = true;
        messageNotif.value = 'Registration success, check your email to confirm';
        router.push({ name: 'login' });
    }
}; 
</script>

<template>
    <main>
        <div class="container">
            <form v-if="loginState">
                <label for="">Email</label><br>
                <input type="text" placeholder="Enter email" v-model="email" required><br>
                <label for="">Password</label><br>
                <input type="password" placeholder="Enter password" v-model="password" required><br>
                <button type="button" @click="login" @submit.prevent>Login</button>
                <div class="no-account">
                    <p>Don't have an account?</p>
                    <span @click="showRegis()">Create one</span>
                </div>
            </form>
            <form v-if="regisState">
                <label for="">Name</label><br>
                <input type="text" placeholder="Enter name" v-model="fullName" required><br>
                <label for="">Username</label>
                <input type="text" placeholder="Enter username" v-model="name" required><br>
                <label for="">Email</label><br>
                <input type="text" placeholder="Enter email" v-model="email" required><br>
                <label for="">Password</label><br>
                <input type="password" placeholder="Enter password" v-model="password" required><br>
                <button type="button" @click="regis" @submit.prevent>Register</button>
                <div class="no-account">
                    <p>Already have an account?</p>
                    <span @click="showLogin()">Login</span>
                </div>
            </form>
            <div class="notif" v-if="notif">
                <p class="notif-texts">{{ messageNotif }}</p>
                <p class="close-notif" @click="closeNotif()">X</p>
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

.container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 100px;
    margin-right: 50px;
    margin-left: 50px;
    margin-bottom: 50px;
}

.container form {
    padding: 15px;
    border-radius: 15px;
    width: 400px;
    border: 2px solid #e84393;
    box-shadow: 10px 10px #000000bf;
}

.container form input {
    font-family: "Poppins", sans-serif;
    border: none;
    border-radius: 15px;
    padding: 7px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: #dddd;
    border: 2px solid #e84393;
}

.container form button {
    font-family: "Poppins", sans-serif;
    border: none;
    width: 100%;
    border-radius: 15px;
    padding: 7px;
    margin-top: 20px;
    cursor: pointer;
    background-color: #e84393;
    color: white;
}

.container form .no-account {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 20px;
}

.container form .no-account span {
    text-decoration: underline;
    background-color: #e84393;
    color: white;
    cursor: pointer;
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

.notif .notif-texts {
    max-width: 200px;
}

.close-notif {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    color: black;
    text-align: center;
    cursor: pointer;
}

@media (max-width: 768px) {
    .notif {
        right: 1%;
        width: 90%;
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
</style>