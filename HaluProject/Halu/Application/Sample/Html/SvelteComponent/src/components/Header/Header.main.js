//-------------------------------------------------------
// コンポーネント情報定義
//-------------------------------------------------------
import { mount, unmount } from "svelte";
// @ts-ignore
import ThisComponent from "./Header.svelte";

// マウント対象要素を特定するセレクター
const componentID = '[componentID="Header"]';
//-------------------------------------------------------

//-------------------------------------------------------
// マウント管理
// ESモジュールはページ内で1度しか評価されないため、
// ダイアログ等でDOMに動的追加された要素へのマウントは
// querySelectorAll では検出できない。
// そのため Map でインスタンスを管理し、MutationObserver で
// DOM変化を監視して追加・削除のたびに mount/unmount する。
//-------------------------------------------------------

// マウント済みインスタンスを管理するMap
// （key: 対象Element, value: Svelteインスタンス）
const mounted = new Map();

/**
 * 指定要素にコンポーネントをマウントする
 * 既にマウント済みの場合は先にアンマウントしてから再マウントする
 * @param {Element} el - マウント先のDOM要素
 */
function mountToElement(el) {
    if (mounted.has(el)) unmount(mounted.get(el));
    const instance = mount(ThisComponent, {
        target: el,
        props: {
            // props-Title属性の値をタイトルとして渡す
            title: el.getAttribute('props-Title'),
            // props-LoginInfo-visible属性が "false" の場合はログイン情報を非表示にする
            // デフォルト：表示する（属性がない場合も含む）
            loginInfoVisible: el.getAttribute('props-LoginInfo-visible') !== 'false'
        }
    });
    mounted.set(el, instance);
}

// ページロード時点でDOMに存在する要素に初期マウントする
document.querySelectorAll(componentID).forEach(mountToElement);

//-------------------------------------------------------
// MutationObserver によるDOM変化の監視
// ダイアログ（選択ダイアログ等）でコンテンツが動的に挿入・削除される場合に対応する
//-------------------------------------------------------
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {

        // DOMから削除されたノードのコンポーネントをアンマウントしてメモリを解放する
        mutation.removedNodes.forEach(node => {
            // 削除されたノードがElementでない場合は処理しない
            if (!(node instanceof Element)) {
                return;
            }

            // 削除ノード自体がマウント対象の場合
            if (mounted.has(node)) {
                unmount(mounted.get(node));
                mounted.delete(node);
            }

            // 削除ノードの子孫にマウント対象が含まれる場合
            node.querySelectorAll(componentID).forEach(el => {
                if (mounted.has(el)) {
                    unmount(mounted.get(el));
                    mounted.delete(el);
                }
            });
        });

        // DOMに追加されたノードにコンポーネントをマウントする
        mutation.addedNodes.forEach(node => {
            if (!(node instanceof Element)) {
                return;
            }
            // 追加ノード自体がマウント対象の場合
            if (node.matches(componentID)) {
                mountToElement(node);
            }
            // 追加ノードの子孫にマウント対象が含まれる場合
            node.querySelectorAll(componentID).forEach(mountToElement);
        });
    });
});
// body配下のchildListとsubtreeを監視する
observer.observe(document.body, { childList: true, subtree: true });
