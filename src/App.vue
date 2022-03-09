<template>
    <div>
        <main class="main">
            <router-view v-show="routerName === 'default'" />
            <!-- 要用 v-if 則 chartjs才有動畫算是重載入。用 v-show 是避免重載入，只是隱藏然後顯示 -->
            <router-view name="asset" v-if="routerName === 'asset'" />
            <!-- 有2個 v-if 在切換的時候手機會有出現 null is not an object evaluating t.insertBefore，所以改成 v-show -->
            <router-view name="dividend" v-show="routerName === 'dividend'" />
        </main>
        <footer class="footer">
            <el-menu default-active="default" :router="false" mode="horizontal" active-text-color="#409EFF">
                <el-menu-item index="default" @click="onMenuItemClick('default')">
                    <i class="el-icon-star-on" style="position: relative; top: -2px"></i>自選股　
                </el-menu-item>
                <el-menu-item index="asset" @click="onMenuItemClick('asset')">
                    <i class="el-icon-s-data" style="position: relative; top: -2px"></i>資產配置
                </el-menu-item>
                <el-menu-item index="dividend" @click="onMenuItemClick('dividend')">
                    <i class="el-icon-s-promotion" style="position: relative; top: -2px"></i>股利預估
                </el-menu-item>
            </el-menu>
        </footer>
    </div>
</template>

<script>
export default {
    data() {
        return {
            routerName: 'default',
        };
    },

    methods: {
        onMenuItemClick(page) {
            this.routerName = page;
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

.footer
    position: fixed
    bottom: 0
    z-index: 100
    width: 100%

.el-menu--horizontal > .el-menu-item.is-active
    border-bottom: none
    border-top: 2px solid var(--el-color-primary)
</style>
