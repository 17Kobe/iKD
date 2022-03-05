<template>
    <container>
        <main class="main">
            <router-view v-show="routerName === 'default'" /><router-view name="asset" v-show="routerName === 'asset'" />
        </main>
        <footer class="footer">
            <el-menu default-active="default" :router="false" mode="horizontal" active-text-color="#409EFF">
                <el-menu-item index="default" @click="onMenuItemClick('default')">
                    <i class="el-icon-star-on"></i>
                    <template #title>自選股</template>
                </el-menu-item>
                <el-menu-item index="asset" @click="onMenuItemClick('asset')">
                    <i class="el-icon-s-data"></i>
                    <template #title>資產配置</template>
                </el-menu-item>
            </el-menu>
        </footer>
    </container>
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
