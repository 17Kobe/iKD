<template>
    <div>
        <el-table style="width: 100%">
            <el-table-column fixed label="名稱" width="100" align="center"> </el-table-column>
            <el-table-column label="除息日" width="75" align="right"> </el-table-column>
            <el-table-column label="現金股利" width="120" align="right"> </el-table-column>
            <el-table-column label="累積股數" width="100" align="right"> </el-table-column>
            <el-table-column label="股利所得" width="100" align="right"> </el-table-column>
            <el-table-column label="現金發放日" width="120" align="right"> </el-table-column>
        </el-table>
        <br /><br />
        <br /><br />
    </div>
</template>

<script>
import _ from 'lodash';

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    name: 'component-dividend',
    data() {
        return {
            rateOfReturn: 0,
            historyData: [],
        };
    },
    computed: {},
    created() {
        console.log('created');
    },
    mounted() {
        this.$store.dispatch('GET_DIVIDEND');
    },
    methods: {},
};
</script>

<style lang="sass"></style>
