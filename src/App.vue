<template>
    <div>
        <main class="main">
            <router-view v-show="routerName === 'default'" />
            <!-- 要用 v-if 則 chartjs才有動畫算是重載入。用 v-show 是避免重載入，只是隱藏然後顯示 -->
            <router-view name="asset" v-if="routerName === 'asset'" />
        </main>
        <footer class="footer">
            <el-menu default-active="default" :router="false" mode="horizontal" active-text-color="#409EFF">
                <el-menu-item index="default" @click="onMenuItemClick('default')">
                    <i class="el-icon-star-on"></i>
                    自選股
                </el-menu-item>
                <el-menu-item index="asset" @click="onMenuItemClick('asset')">
                    <i class="el-icon-s-data"></i>
                    資產配置
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
        handleClick() {
            this.$router.push(`/`);
        },
        onMenuItemClick(page) {
            this.routerName = page;
        },
    },
};
</script>
<style lang="sass">
// .main
//     height: calc(100vh - 40px - 48px)
//     overflow-y: scroll
.footer
    position: fixed
    bottom: 0
    z-index: 100
    width: 100%
// .el-tabs .el-tabs__content
//     max-height: calc(100% - 51px)
//     overflow: auto

// body
//     height: 100%
// #app
//     height: 100%
//     position: absolute
// .el-container
//     height: 100%
//     // display:flex
// //     position: relative
// .el-main
//     height: 100%
//     padding: 0
//     // overflow: hidden
// //     padding-bottom: 50px
// .el-footer
//     display: flex
//     width: 100%
//     height: 41px
//     display: flex
//     margin-top: -50px
    // position: relative
    // top: -100px
    // position: absolute
    // top: calc(100% - 40px)
.el-menu--horizontal>.el-menu-item.is-active
    border-bottom: none
    border-top: 2px solid var(--el-color-primary)
</style>
