import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lazts/lazts.ts'),
            name: 'lazts',
            // the proper extensions will be added
            fileName: 'lazts',
        },
    },
    resolve: {
        alias: {
            '@lazts': resolve(__dirname, './lazts'),
        },
    },
    plugins: [dts()],
});
