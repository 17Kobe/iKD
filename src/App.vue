<template>
    <div>
        <el-tabs type="border-card" class="demo-tabs" @tab-click="handleClick">
            <!-- el-tab 使用 vue-router https://www.jb51.net/article/147774.htm -->
            <el-tab-pane>
                <template #label>
                    <span><i class="el-icon-star-on"></i> 自選股</span>
                </template>
                <router-view></router-view>
            </el-tab-pane>
            <el-tab-pane>
                <template #label>
                    <span><i class="el-icon-s-data"></i> 資產配置</span>
                </template>
                <router-view name="asset"></router-view>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },

    methods: {
        handleClick() {
            this.$router.push(`/`);
        },
    },
};
</script>
<style lang="sass">
.el-tabs .el-tabs__content
    max-height: calc(100% - 51px)
    overflow: auto
</style>
