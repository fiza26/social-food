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
            <div class="burger"><img
                    src="https://png.pngtree.com/png-vector/20240402/ourmid/pngtree-burger-fast-food-png-image_12259413.png"
                    alt=""></div>
            <div class="tomato"><img
                    src="https://png.pngtree.com/png-clipart/20230113/ourmid/pngtree-red-fresh-tomato-with-green-leaf-png-image_6561484.png"
                    alt=""></div>
            <div class="ramen"><img
                    src="https://static.vecteezy.com/system/resources/previews/027/297/737/original/asian-noodle-soup-ramen-with-chicken-vegetables-and-egg-in-black-bowl-isolated-on-white-transparent-background-ai-generate-png.png"
                    alt=""></div>
            <div class="fried-chicken">
                <img src="https://static.vecteezy.com/system/resources/previews/024/724/514/non_2x/hot-and-crispy-fried-chicken-isolated-on-transparent-background-fresh-pieces-of-crispy-fried-chicken-fast-food-generative-ai-free-png.png"
                    alt="">
            </div>
            <div class="spaghetti">
                <img src="https://static.vecteezy.com/system/resources/previews/025/065/150/original/spaghetti-with-ai-generated-free-png.png"
                    alt="">
            </div>
            <div class="pancakes">
                <img src="https://png.pngtree.com/png-vector/20240203/ourmid/pngtree-strawberry-pancakes-png-png-image_11598617.png"
                    alt="">
            </div>
            <div class="beef">
                <img src="https://static.vecteezy.com/system/resources/thumbnails/025/066/778/small_2x/steak-with-ai-generated-free-png.png"
                    alt="">
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

section .burger {
    position: absolute;
    bottom: -20px;
    right: 0;
}

section .burger img {
    height: 200px;
    width: auto;
}

section .tomato {
    position: absolute;
    bottom: -50px;
    left: -100px;
    z-index: 1;
}

section .tomato img {
    height: 300px;
    width: auto;
}

section .ramen {
    position: absolute;
    bottom: -90px;
}

section .ramen img {
    height: 300px;
    width: auto;
}

section .fried-chicken {
    position: absolute;
    bottom: -60px;
    left: 270px;
}

section .fried-chicken img {
    height: 400px;
    width: auto;
}

section .spaghetti {
    position: absolute;
    bottom: -50px;
    left: 70px;
}

section .spaghetti img {
    height: 200px;
    width: auto;
}

section .pancakes {
    position: absolute;
    bottom: -120px;
    right: 200px;
    z-index: 1;
}

section .pancakes img {
    height: 430px;
    width: auto;
}

section .beef {
    position: absolute;
    bottom: -50px;
    right: 0;
}

section .beef img {
    height: 200px;
    width: auto;
}

@media screen and (max-width: 768px) {
    section .burger img, .tomato img, .ramen img, .fried-chicken img, .spaghetti img {
       display: none;
    }
}
</style>