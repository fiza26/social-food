<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
    <header>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap"
            rel="stylesheet">
    </header>
    <main>
        <nav>
            <h1>S o c i a l F o o d</h1>
        </nav>
        <section>
            <div class="social-platform">
                <p>#1 Social Platform for Food Lovers</p>
                <div class="special-text">Find Connection Through Food</div>
                <RouterLink to="/login" class="login">Login</RouterLink>
            </div>
        </section>
    </main>
</template>

<style scoped>
nav {
    position: sticky;
}

section {
    display: flex;
    justify-content: center;
    background-image: linear-gradient(to right, #e84393, #f368e0, lightblue);
    height: 100vh;
    color: white;
    overflow: hidden;
}

.social-platform {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 100px;
    padding: 7px;
    height: 500px;
}

.social-platform p {
    display: flex;
    justify-content: center;
    border: 1px solid #ffff;
    padding: 3px;
    border-radius: 15px;
    width: 330px;
}

.social-platform .special-text {
    font-family: "Dancing Script", cursive;
    font-size: 50px;
    margin-top: 20px;
    text-align: center;
}

.social-platform .login {
    border: 1px solid #ffff;
    width: 150px;
    border-radius: 15px;
    padding: 3px;
    text-align: center;
    margin-top: 20px;
    cursor: pointer;
    transition: cubic-bezier(0.075, 0.82, 0.165, 1) 1s;
    color: white;
    text-decoration: none;
}

.social-platform .login:hover {
    background-color: white;
    color: black;
}
</style>