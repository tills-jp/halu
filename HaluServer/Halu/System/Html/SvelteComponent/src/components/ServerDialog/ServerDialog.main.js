// @ts-nocheck
import ServerDialog from './ServerDialog.svelte';
import { mount } from 'svelte';

// @ts-ignore
window.ServerDialog = ServerDialog
let dialogComponent;
// @ts-ignore
window.createServerDialog = function (handlerEvent) {
    let afterFunc = null;
    if (handlerEvent && typeof handlerEvent === "function") {
        afterFunc = handlerEvent;
    }
    //初回のみマウントする
    if (!dialogComponent) {
        dialogComponent = mount(ServerDialog, {
            target: document.body,
        });
    }
    //マウント後に後処理関数を設定する
    dialogComponent.setAfterFunction(afterFunc);
    return dialogComponent;
};

// @ts-ignore
window.showServerDialog = function ({ title, message, buttonLabel }) {
    //マウント済ダイアログを表示する
    if (!dialogComponent) return;
    dialogComponent.showServerDialog(title, message, buttonLabel);
};