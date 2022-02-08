<template>
    <h1>{{ msg }}</h1>
    <div class="flex flex-wrap">
        <div class="w-full pt-10">Form</div>
    </div>
    <el-button>默认按钮</el-button>
    <el-button type="danger">危险按钮</el-button>
    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <p>
        <a href="https://vitejs.dev/guide/features.html" target="_blank"> Vite Documentation1 </a>
        |
        <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Documentation22</a>
    </p>

    <button type="button" @click="state.count++">count32323 is: {{ state.count }}</button>
    <p>
        Edit
        <code>components/HelloWorld.vue</code> to test hot module replacement.
    </p>
</template>

<script setup>
import { defineProps, reactive } from 'vue';

defineProps({
    msg: String,
});

const state = reactive({ count: 0 });
</script>

<style scoped>
a {
    color: #42b983;
}
</style>
