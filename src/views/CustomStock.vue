<template>
    <div>
        <el-table :data="starList" style="width: 100%">
            <el-table-column fixed label="名稱" width="130" align="center">
                <template #default="scope">
                    <span style="font-size: 16px; font-weight: bold">
                        {{ scope.row.name }}
                    </span>
                    <br />
                    <span style="color: #cccccc">{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="股價" width="85" align="right">
                <template #default="scope">
                    <span v-if="scope.row.data && scope.row.data.length >= 2">
                        <!-- vue style if 寫法 https://stackoverflow.com/questions/48455909/condition-in-v-bindstyle -->
                        <span
                            :style="[
                                scope.row.data.at(-2).close > scope.row.data.at(-1).close
                                    ? { color: '#01aa00' }
                                    : scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                    ? { color: '#ee3333' }
                                    : { color: 'black' },
                                { 'font-size': '16px' },
                            ]"
                        >
                            {{ scope.row.data.at(-1).close }}<br />
                            <!-- 依漲跌幅來顯示上下箭頭的圖示，下箭頭需要下移1px，上箭頭需要上移2px -->
                            <i
                                :class="[
                                    scope.row.data.at(-2).close > scope.row.data.at(-1).close
                                        ? 'el-icon-caret-bottom'
                                        : scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                        ? 'el-icon-caret-top'
                                        : '',
                                ]"
                                :style="[
                                    scope.row.data.at(-2).close < scope.row.data.at(-1).close
                                        ? { position: 'relative', top: '2px' }
                                        : { position: 'relative', top: '1px' },
                                ]"
                            ></i>
                            <!-- 漲跌幅 如，2.53% -->
                            <span style="font-size: 14px">
                                {{
                                    (
                                        ((scope.row.data.at(-1).close - scope.row.data.at(-2).close) * 100) /
                                        scope.row.data.at(-2).close
                                    ).toFixed(2)
                                }}%
                            </span>
                        </span>
                    </span>
                </template>
            </el-table-column>

            <el-table-column prop="city" label="週KD" width="220" align="center" />
            <el-table-column label="週K線" width="220" align="center">
                <template #default="scope">
                    <WeekKdChart :parentData="scope.row.data" />
                </template>
            </el-table-column>
            <el-table-column prop="last_price1" label="成本" width="80" align="center">
                <template #default="scope">
                    <el-button size="small" icon="el-icon-s-tools text-xl" @click="drawer = true"></el-button>
                </template>
            </el-table-column>
            <el-table-column prop="last_price1" label="訊號公式" width="80" align="center">
                <template #default="scope">
                    <el-button size="small" icon="el-icon-s-tools text-xl"></el-button>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="city" label="淨值比" width="120" />
                <el-table-column prop="city" label="本益比" width="120" />
                <el-table-column prop="city" label="EPS" width="120" /> -->
        </el-table>
        <el-drawer title="持有股票成本" v-model="drawer" direction="rtl" size="70%">
            <el-form ref="formRef" :model="form" label-width="120px">
                <el-form-item label="Activity name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="Activity zone">
                    <el-select v-model="form.region" placeholder="please select your zone">
                        <el-option label="Zone one" value="shanghai"></el-option>
                        <el-option label="Zone two" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="Activity time">
                    <el-col :span="11">
                        <el-date-picker
                            v-model="form.date1"
                            type="date"
                            placeholder="Pick a date"
                            style="width: 100%"
                        ></el-date-picker>
                    </el-col>
                    <el-col :span="2" class="text-center">
                        <span class="text-gray-500">-</span>
                    </el-col>
                    <el-col :span="11">
                        <el-time-picker v-model="form.date2" placeholder="Pick a time" style="width: 100%"></el-time-picker>
                    </el-col>
                </el-form-item>
                <el-form-item label="Instant delivery">
                    <el-switch v-model="form.delivery"></el-switch>
                </el-form-item>
                <el-form-item label="Activity type">
                    <el-checkbox-group v-model="form.type">
                        <el-checkbox label="Online activities" name="type"></el-checkbox>
                        <el-checkbox label="Promotion activities" name="type"></el-checkbox>
                        <el-checkbox label="Offline activities" name="type"></el-checkbox>
                        <el-checkbox label="Simple brand exposure" name="type"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="Resources">
                    <el-radio-group v-model="form.resource">
                        <el-radio label="Sponsor"></el-radio>
                        <el-radio label="Venue"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="Activity form">
                    <el-input v-model="form.desc" type="textarea"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">Create</el-button>
                    <el-button>Cancel</el-button>
                </el-form-item>
            </el-form>
        </el-drawer>
    </div>
</template>

<script>
import WeekKdChart from '../components/WeekKdChart.vue';
// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md

export default {
    components: { WeekKdChart },
    data() {
        return {
            drawer: false,
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
    computed: {
        starList() {
            return this.$store.state.star.starList;
        },
    },
    created() {
        console.log('created');
        // 取得 localstorage 自選股，最先開始是 null 時，會給予預設值空矩陣
        const localStarList = JSON.parse(localStorage.getItem('starList')) || [];
        // console.log(localStarList);

        // 將 starList 預設的塞進到 localstorage
        // console.log(this.starList);
        const diffDefault = this.getDifference(this.starList, localStarList); // 預設有，但本地沒有，則要新增
        // const diffLocal = this.getDifference(localStarList, this.starList); // 本地有，但預設沒有，則要砍掉

        localStarList.push(...diffDefault); // 新增 append 預設到 localStarList
        localStorage.setItem('starList', JSON.stringify(localStarList)); // 將 localStarList 從 object 轉 string 後塞到 localstorage
        // console.log(diffLocal);
        // console.log(diffDefault);
        // console.log(localStarList);
        // console.log(this.starList);

        // 將 localstorage 重塞回到 vuex 的 starList
        this.$store.commit('SAVE_STAR', localStarList);
    },
    mounted() {
        console.log('mounted');
        // 在 mounted() 事件時就可以發送，因為此時不須 data 及 computed 資料都準備好(因為沒有要data 參數，在create())

        this.$store.commit('SAVE_STOCK_PRICE');
    },
    methods: {
        getDifference(array1, array2) {
            return array1.filter((object1) => !array2.some((object2) => object1.id === object2.id));
        },
    },
};
</script>

<style lang="sass">
#app
    font-family: Avenir, Helvetica, Arial, sans-serif
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
    /* text-align: center; */
    color: #2c3e50
    /* margin-top: 60px; */

.el-menu-item,
.el-submenu__title
    height: 40px !important
    line-height: 40px !important

.el-menu-item.is-active
    /* font-size: 16px; */
    /* background-color: #f28b82 !important; */
    /* background-color: #ffcc9c !important; */
    background-color: #e5e5e5 !important
    color: black !important
    border-radius: 3px
    // box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%)

.el-menu-item.is-active [class*="el-icon-"]
    color: #F56C6C
// 為了讓highchart圖更不會佔td
.el-table .el-table__body td
    padding: 0px 0
// 為了解決table內cell要/n換行的問題
.el-table .el-table__body .cell
    white-space: pre-line
</style>
