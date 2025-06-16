<template>
    <div>
        <main class="main">
            <!-- <audio ref="audio" :src="menuWav" preload></audio> -->
            <router-view v-show="routerName === 'default'" />
            <!-- 要用 v-if 則 chartjs才有動畫算是重載入。用 v-show 是避免重載入，只是隱藏然後顯示 -->
            <router-view name="asset" v-if="routerName === 'asset'" />
            <!-- 有2個 v-if 在切換的時候手機會有出現 null is not an object evaluating t.insertBefore，所以改成 v-show -->
            <router-view name="dividend" v-show="routerName === 'dividend'" />
        </main>
        <footer class="footer">
            <el-menu default-active="default" :router="false" mode="horizontal" active-text-color="#409EFF">
                <el-menu-item index="default" @click="onMenuItemClick('default')" style="padding: 0 6px">
                    <i class="el-icon-star-off" style="position: relative; top: -2px"></i>自選股
                </el-menu-item>
                <el-menu-item index="dividend" @click="onMenuItemClick('dividend')" style="padding: 0 6px">
                    <i class="el-icon-sugar" style="position: relative; top: -2px"></i>價差股利
                </el-menu-item>
                <el-menu-item index="asset" @click="onMenuItemClick('asset')" style="padding: 0 6px">
                    <i class="el-icon-pie-chart" style="position: relative; top: -2px"></i>資產表
                </el-menu-item>
                <el-menu-item index="add" @click="doShowSearch()" style="padding: 0 6px">
                    <i class="el-icon-circle-plus-outline" style="position: relative; top: -2px"></i>
                </el-menu-item>
                <el-menu-item index="index" style="padding: 0 6px">
                    <el-tooltip
                        effect="dark"
                        placement="top"
                        :content="fearLevel.reasons && fearLevel.reasons.length ? fearLevel.reasons.join('\n') : ''"
                        :disabled="!fearLevel.reasons || !fearLevel.reasons.length"
                        popper-class="tooltip-pre-line"
                    >
                        <span style="display: block; line-height: 1.2; position: relative; top: 10px">
                            <span :style="fearColorStyle">{{ fearLevel.fear }}</span
                            ><br />
                            <span :style="sentimentColorStyle">{{ fearLevel.sentiment }}</span>
                        </span>
                    </el-tooltip>
                </el-menu-item>

                <!-- <el-menu-item index="link" @click="doShowLink()" style="padding: 0 6px">
                    <i class="el-icon-link" style="position: relative; top: -2px"></i>
                </el-menu-item> -->
            </el-menu>
        </footer>
        <el-backtop :right="10" :bottom="68" :visibility-height="30" />
        <FormSearch ref="childFormSearch" />
        <FormLink ref="childFormLink" />
    </div>
</template>

<script>
// import menuWav from '@/assets/menu.wav';
import FormSearch from '@/components/FormSearch.vue';
import FormLink from '@/components/FormLink.vue';

export default {
    components: { FormSearch, FormLink },
    data() {
        return {
            routerName: 'default',
            // menuWav,
        };
    },
    computed: {
        fearLevel() {
            return this.$store.getters.getFearLevel();
        },
        fearColorStyle() {
            switch (this.fearLevel.fear) {
                case '無恐慌':
                    return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
                case '輕微恐慌':
                    return { color: '#b39ddb', 'font-weight': 'bold', 'font-size': '16px' }; // 淺紫
                case '很恐慌':
                    return { color: '#7e57c2', 'font-weight': 'bold', 'font-size': '16px' }; // 紫
                case '極度恐慌':
                    return { color: '#512da8', 'font-weight': 'bold', 'font-size': '16px' }; // 深紫
                default:
                    return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
            }
        },
        sentimentColorStyle() {
            if (!this.fearLevel.sentiment) return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
            if (this.fearLevel.sentiment.includes('資金進攻')) {
                return { color: '#ee3333', 'font-weight': 'bold', 'font-size': '16px' }; // 深紅
            }
            if (this.fearLevel.sentiment.includes('偏多')) {
                return { color: '#b13935', 'font-weight': 'bold', 'font-size': '16px' }; // 紅
            }
            if (this.fearLevel.sentiment.includes('中性')) {
                return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' }; // 灰
            }
            if (this.fearLevel.sentiment.includes('資金避險')) {
                return { color: '#01aa00', 'font-weight': 'bold', 'font-size': '16px' }; // 綠
            }
            return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
        },
    },
    methods: {
        onMenuItemClick(page) {
            // const { audio } = this.$refs;
            // audio.play();
            this.routerName = page;
            this.$store.commit('SAVE_ROUTER_NAME', page);
            window.scrollTo(0, 0);
        },
        doShowSearch() {
            // console.log(this.$refs);
            // 父改子去顯示 drawer 變數 不好，子要被改值
            // 父傳一堆變數給子也不太好
            // 所以父傳id給子，最簡單，子拿此參數再去 vuex 取值，改值，再填回 localstorage
            this.$store.dispatch('GET_TAIWAN_STOCK');
            this.$refs.childFormSearch.onInit();
        },
        doShowLink() {
            this.$refs.childFormLink.onInit();
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
    /* margin-top: 60px;      */

.footer
    position: fixed
    bottom: 0
    z-index: 100
    width: 100%

.el-menu--horizontal > .el-menu-item.is-active
    border-bottom: none
    border-top: 2px solid var(--el-color-primary)
</style>
