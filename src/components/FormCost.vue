<template>
    <el-drawer title="設定股票買進成本" v-model="isShow" :show-close="true" direction="rtl" size="70%">
        <el-form ref="form" :model="form" label-width="60px">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="成交價">
                        <el-input v-model="form.name" placeholder="ex: 33.43"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="股數">
                        <el-input v-model="form.region" placeholder="ex: 2000"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item>
                <el-button type="primary" @click="onAdd"><i class="el-icon-plus"></i> 增加一列</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
export default {
    data() {
        return {
            isShow: false,
            costList: [],
            form: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: '',
            },
        };
    },
    computed: {},
    created() {
        // console.log(this.id);
    },
    methods: {
        onAdd() {},
        onInit(stockId) {
            this.isShow = true;
            // this.data = this.$store.getters.getStar(id); // 因為 computed 是在網頁開啟時就跑了，那時還沒有id就會變成沒過濾全都取了。為了在點擊設定才去取，所以要這樣
            console.log(this.data);
            console.log(stockId);
        },
    },
};
// 父傳子參考 https://its201.com/article/weixin_49035434/119852222 方法1，的emit似乎 vue 3有改語法而不行了。但方法2沒用 emit仍正常
</script>
