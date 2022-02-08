module.exports = {
    // Configure Tailwind to remove unused styles in production
    purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                'keep-red': '#f28b82',
                'keep-blue-green': '#a7ffeb',
                'keep-blue': '#cbf0f8',
                'keep-yellow': '#fff475',
                'keep-pink': '#fdcfe8',
                'keep-brown': '#e6c9a8',
                'keep-gray': '#e8eaed',
                'keep-green': '#ccff90',
                'keep-purple': '#d7aefb',
                'keep-navy-blue': '#aecbfa',
                'keep-orange': '#fbbc04',
                'keep-main': '#feefc3',
                'element-red': '#F56C6C',
                'i-orange': '#ffb45e',
                'i-gray': '#f5f7fa',
                'i-icon-gray': '#606060',
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
