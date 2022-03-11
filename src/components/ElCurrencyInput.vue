<template>
    <el-input ref="inputRef" :modelValue="formattedValue">
        <template #prepend>$</template>
        <template #suffix><span style="position: relative; top: 6px">元</span> </template>
    </el-input>
</template>

<script>
import { useCurrencyInput } from 'vue-currency-input';

export default {
    name: 'ElCurrencyInput',
    props: {
        modelValue: Number,
        options: Object,
    },
    setup(props) {
        const { inputRef, formattedValue } = useCurrencyInput(props.options);

        return { inputRef, formattedValue };
    },
};
</script>
