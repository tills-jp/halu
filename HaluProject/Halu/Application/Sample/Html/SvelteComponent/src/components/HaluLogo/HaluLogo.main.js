//-------------------------------------------------------
// コンポーネント情報定義
//-------------------------------------------------------
import { mount } from 'svelte'
// @ts-ignore
import ThisComponent from './HaluLogo.svelte'
const componentID = '[componentID="HaluLogo"]';

//-------------------------------------------------------
// 複数要素対応
//-------------------------------------------------------
// 複数の要素を取得（属性などで識別）
const elements = document.querySelectorAll(componentID);
// 複数マウント
elements.forEach(el => {
  mount(ThisComponent, {
    target: el,
  });
});
