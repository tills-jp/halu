// @ts-nocheck
import AlertDialog from './AlertDialog.svelte';
import { mount } from 'svelte';

// @ts-ignore
window.AlertDialog = AlertDialog
let dialogComponent;
// @ts-ignore
window.createAlertDialog = function () {
    //二重作成防止
    if (dialogComponent) return dialogComponent;

    dialogComponent = mount(AlertDialog, {
        target: document.body,
    });
    return dialogComponent;
};

// @ts-ignore
window.showAlertDialog = function ({ title, message, buttonLabel }) {
    if (!dialogComponent) return;
    dialogComponent.showAlertDialog(title, message, buttonLabel);
};