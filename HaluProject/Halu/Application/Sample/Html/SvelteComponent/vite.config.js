// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

//アプリ独自コンポーネントのビルド設定
export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        accessors: true
      }
    })
  ],
  // npm run buildで参照される情報
  build: {
    rollupOptions: {
      input: {
        //アプリ独自コンポーネント一括エントリーポイント
        AppComponents: path.resolve(__dirname, 'src/components/AppComponents/AppComponents.main.js'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        inlineDynamicImports: false
      }
    },
    outDir: path.resolve(__dirname, 'build'),
    // outDir: '../SvelteComponent/build',
    emptyOutDir: true //出力先フォルダを空にするかどうか(falseにするとbuild/assets内にファイルが増え続ける)
  }
});
