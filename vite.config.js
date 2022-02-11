import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// https://www.npmjs.com/package/vite-plugin-singlefile
// 解決 dist 內編譯的 index.html 直接從本機去開啟會有 CORS 問題，但目前剩 favion.ico 開啟有問題
// 還有編完後，index.html 內的js及css就變蠻醜的
import { viteSingleFile } from 'vite-plugin-singlefile';
// import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), viteSingleFile()],

    build: {
        cssCodeSplit: false,
        assetsInlineLimit: 100000000,
        rollupOptions: {
            output: {
                manualChunks: () => 'everything.js',
            },
        },
    },
    resolve: {
        alias: [
            { find: '@', replacement: '/src' },
            { find: 'views', replacement: '/src/views' },
            { find: 'components', replacement: '/src/components' },
        ],
    },
    // resolve: {
    //     alias: {
    //         '@pages': path.resolve(__dirname, './src/pages'),
    //     },
    // },
    server: {
        open: true,
    },
    define: {
        'process.env': process.env,
    },
});
