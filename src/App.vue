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

                <el-menu-item index="index" style="padding: 0 6px">
                    <el-tooltip
                        effect="dark"
                        placement="top"
                        :content="fearLevel.reasons && fearLevel.reasons.length ? fearLevel.reasons.join('\n') : ''"
                        :disabled="!fearLevel.reasons || !fearLevel.reasons.length"
                        popper-class="tooltip-pre-line"
                    >
                        <div style="display: flex; flex-direction: column; align-items: flex-start">
                            <el-progress
                                id="cnn-fear-greed-index"
                                v-if="cnnFearGreedIndex !== null"
                                :percentage="cnnFearGreedIndex"
                                :stroke-width="14"
                                :show-text="true"
                                text-inside
                                style="width: 85px; margin-top: 6px"
                                :color="cnnFearGreedColor"
                                :format="fearLevelTextFormat"
                            />
                            <!-- <span :style="fearColorStyle">{{ fearLevel.fear }}</span
                            ><br /> -->
                            <!-- <span
                                :style="
                                    Object.assign({}, sentimentColorStyle, { 'margin-top': '-15px', display: 'inline-block' })
                                "
                                >{{ fearLevel.sentiment }}</span
                            > -->
                            <!-- 顯示 score 並用 el-progress 呈現，僅在 sentiment 包含偏多時 -->
                            <el-progress
                                id="fear-level-score"
                                :percentage="scoreToProgress(fearLevel.score)"
                                :stroke-width="10"
                                :show-text="true"
                                text-inside
                                style="width: 85px; margin-top: 2px"
                                :color="scoreProgressColor(fearLevel.score)"
                                :format="scoreProgressFormat"
                            />
                        </div>
                        <template #content>
                            <div v-for="(r, i) in fearLevelReasonsColored" :key="i" v-html="r"></div>
                        </template>
                    </el-tooltip>
                </el-menu-item>
                <el-menu-item index="add" @click="doShowSearch()" style="padding: 0 6px">
                    <i class="el-icon-circle-plus-outline" style="position: relative; top: -2px; font-size: 36px"></i>
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
        cnnFearGreedColor() {
            const v = this.cnnFearGreedIndex;
            if (v === null || v === undefined) return '#888';
            if (v <= 24) return '#ff5858'; // 深紅 Extreme Fear
            if (v <= 44) return '#ff7442'; // 淺紅 Fear
            if (v <= 54) return '#424242'; // 深灰 Neutral
            if (v <= 74) return '#43d94a'; // 淺綠 Greed
            return '#2ed37e'; // 深綠 Extreme Greed
        },
        cnnFearGreedIndex() {
            // 取自 vuex state
            const val = this.$store.state.price.cnn_fear_greed_index ?? this.$store.state.price?.cnn_fear_greed_index;
            if (typeof val === 'number') return Math.round(val);
            if (typeof val === 'string' && !isNaN(Number(val))) return Math.round(Number(val));
            return null;
        },
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
                case '極恐慌':
                    return { color: '#512da8', 'font-weight': 'bold', 'font-size': '16px' }; // 深紫
                default:
                    return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
            }
        },
        fearLevelReasonsColored() {
            if (!this.fearLevel.reasons) return [];
            return this.fearLevel.reasons.map((str) => {
                // CNN 指數行特殊處理
                if (str.includes('【CNN】')) {
                    // 取出括號內數值
                    const match = str.match(/（([\d.]+)）/);
                    if (match) {
                        const val = Number(match[1]);
                        let color = '#888';
                        if (val <= 24) color = '#ff5858';
                        else if (val <= 44) color = '#ff7442';
                        else if (val <= 54) color = '#424242';
                        else if (val <= 74) color = '#43d94a';
                        else color = '#2ed37e';
                        // 用 span 包住數值
                        return str.replace(/（([\d.]+)）/, `（<span style="color:${color};font-weight:bold;">$1</span>）`);
                    }
                }
                // 分數行特殊處理
                if (str.startsWith('總結：分數')) {
                    // 只替換冒號後第一個數字
                    return str.replace(
                        /分數([^\d]*)(\d+)/,
                        (m, p1, p2) => `分數${p1}<span style="color:rgb(255,159,64);font-weight:bold;">${p2}</span>`
                    );
                }
                // 其餘行維持原本百分比著色
                return str.replace(/([+-]\d+\.\d{2}%)/g, (match) => {
                    const color = match.startsWith('+') ? '#e57373' : match.startsWith('-') ? '#4caf50' : '#888';
                    return `<span style="color:${color};font-weight:bold;">${match}</span>`;
                });
            });
        },
        sentimentColorStyle() {
            if (!this.fearLevel.sentiment) return { color: '#888', 'font-weight': 'bold', 'font-size': '16px' };
            if (this.fearLevel.sentiment.includes('資金進攻')) {
                return { color: '#ee3333', 'font-weight': 'bold', 'font-size': '16px' }; // 深紅
            }
            if (this.fearLevel.sentiment.includes('偏多')) {
                return { color: '#ee3333', 'font-weight': 'bold', 'font-size': '16px' }; // 紅
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
            this.routerName = page;
            this.$store.commit('SAVE_ROUTER_NAME', page);
            window.scrollTo(0, 0);
        },
        doShowSearch() {
            this.$store.dispatch('GET_TAIWAN_STOCK');
            this.$refs.childFormSearch.onInit();
        },
        doShowLink() {
            this.$refs.childFormLink.onInit();
        },
        fearLevelTextFormat(percentage) {
            // 讓 el-progress 顯示『75% 極貪婪』格式
            if (this.fearLevel && this.fearLevel.fear) {
                return `${percentage}% ${this.fearLevel.fear}`;
            }
            return percentage + '%';
        },
        // score 轉換成 progress 百分比，範圍 -3~7
        scoreToProgress(score) {
            const min = -3,
                max = 7;
            // 預設分數為2
            if (typeof score !== 'number' || isNaN(score)) score = 2;
            return Math.round(((score - min) / (max - min)) * 100);
        },
        // score progress 顏色
        scoreProgressColor(score) {
            if (score >= 4) return '#ff5858'; // 深綠
            if (score >= 2) return '#ff7442'; // 淺綠
            if (score >= 0) return '#ffad90'; // 淺紅
            if (score < 0) return '#01aa00'; // 淺紅
            return '#ff7442'; // 深紅
        },
        // score progress 顯示格式
        scoreProgressFormat(percentage) {
            const min = -3,
                max = 7;
            const score = Math.round((percentage / 100) * (max - min) + min);
            // 取 sentiment
            const sentiment = this.fearLevel?.sentiment || '';
            return `${score}分 ${sentiment}`;
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

.tooltip-pre-line
    white-space: pre-line
    font-size: 15px
    line-height: 1.6

#cnn-fear-greed-index .el-progress-bar__outer
    height: 23px!important

#fear-level-score .el-progress-bar__outer
    height: 23px!important
</style>
