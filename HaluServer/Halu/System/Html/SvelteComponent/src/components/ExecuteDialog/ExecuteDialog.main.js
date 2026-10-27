// @ts-nocheck
import ExecuteDialog from './ExecuteDialog.svelte';
import { mount } from 'svelte';

// @ts-ignore
window.ExecuteDialog = ExecuteDialog
let dialogComponent;
// @ts-ignore
window.createExecuteDialog = function (handlerEvent) {
    let afterFunc = null;
    if (handlerEvent && typeof handlerEvent === "function") {
        afterFunc = handlerEvent;
    }
    //初回のみマウントする
    if (!dialogComponent) {
        dialogComponent = mount(ExecuteDialog, {
            target: document.body,
        });
    }
    //マウント後に後処理関数を設定する
    dialogComponent.setAfterFunction(afterFunc);
    return dialogComponent;
};

// @ts-ignore
window.showExecuteDialog = function ({ title, message, buttonLabel }) {
    //マウント済ダイアログを表示する
    if (!dialogComponent) return;
    dialogComponent.showExecuteDialog(title, message, buttonLabel);
};