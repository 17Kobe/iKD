<template>
    <el-input
        ref="inputRef"
        :class="{ 'i-currency': true, disabled: isStock }"
        :modelValue="formattedValue"
        :style="isStock ? { 'pointer-events': 'none' } : {}"
    >
        <template #prepend>$</template>
        <template #suffix><span style="position: relative; top: 8px; font-size: 10px">元</span> </template>
    </el-input>
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input';
import { watch } from 'vue';

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
        const { inputRef, formattedValue, setValue } = useCurrencyInput(props.options);

        watch(
            () => props.modelValue,
            (newValue) => {
                // formattedValue.value = newValue; 這個方法沒有貨幣符號
                setValue(newValue);
            }
        );

        return { inputRef, formattedValue };
    },
};
</script>

<style lang="sass">
.i-currency .el-input__inner
    text-align: right
</style>
