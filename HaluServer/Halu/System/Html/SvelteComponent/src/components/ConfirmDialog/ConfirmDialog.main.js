// @ts-nocheck
import ConfirmDialog from './ConfirmDialog.svelte';
import { mount } from 'svelte';

// @ts-ignore
window.ConfirmDialog = ConfirmDialog
let dialogComponent;
// @ts-ignore
window.createConfirmDialog = function (handlerEvent) {
    let afterFunc = null;
    if (handlerEvent && typeof handlerEvent === "function") {
        afterFunc = handlerEvent;
    }
    //初回のみマウントする
    if (!dialogComponent) {
        dialogComponent = mount(ConfirmDialog, {
            target: document.body,
        });
    }
    //マウント後に後処理関数を設定する
    dialogComponent.setAfterFunction(afterFunc);
    return dialogComponent;
};

// @ts-ignore
window.showConfirmDialog = function ({ title, message, buttonLabel }) {
    //マウント済ダイアログを表示する
    if (!dialogComponent) return;
    dialogComponent.showConfirmDialog(title, message, buttonLabel);
};