<template>
    <el-input
        ref="inputRef"
        :class="{ 'i-currency': true, disabled: isStock }"
        :modelValue="formattedValue"
        @focus="!isStock && selectAll()"
        :style="isStock ? { 'pointer-events': 'none' } : {}"
    >
        <template #prepend>$</template>
        <template #suffix><span style="position: relative; top: 8px; font-size: 10px">元</span> </template>
    </el-input>
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input';

export default {
    name: 'ElCurrencyInput',
    props: {
        isStock: {
            type: Boolean,
            default: false,
        },
        modelValue: Number,
        options: Object,
    },
    setup(props) {
        const { inputRef, formattedValue } = useCurrencyInput(props.options);
        return { inputRef, formattedValue };
    },
    methods: {
        selectAll() {
            setTimeout(() => {
                this.$refs.inputRef.select();
            }, 200);
        },
    },
};
</script>

<style lang="sass">
.i-currency .el-input__inner
    text-align: right
</style>
