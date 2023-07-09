<template>
    <el-page-header @back="$emit('back')">
        <template #content>
            <span class="text-large font-600 mr-3"> {{ greeting }} {{ id }} </span>
            <el-input v-model="memo" :rows="5" type="textarea" placeholder="請輸入備註" />

            <FormPolicy ref="childFormPolicy" />
        </template>
    </el-page-header>
</template>

<script>
import FormPolicy from '@/components/FormPolicy.vue';

export default {
    components: { FormPolicy },
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            greeting: 'Stock Analysis',
            memo: '',
        };
    },
};
</script>
