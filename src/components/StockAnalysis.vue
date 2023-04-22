<template>
    <el-page-header @back="$emit('back')">
        <template #content>
            <span class="text-large font-600 mr-3"> {{ greeting }} {{ id }} </span>
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
        };
    },
};
</script>
