// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

//フレームワーク共通コンポーネントのビルド設定
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
        //ダイアログ系コンポーネント一括エントリーポイント
        HaluComponents: path.resolve(__dirname, 'src/components/HaluComponents/HaluComponents.main.js'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        inlineDynamicImports: false
      }
    },
    // outDir: '../SvelteComponent/build',
    outDir: path.resolve(__dirname, 'build'),
    emptyOutDir: true //出力先フォルダを空にするかどうか(falseにするとbuild/assets内にファイルが増え続ける)
  }
});
