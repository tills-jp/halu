// @ts-ignore
import SelectDialog from './SelectDialog.svelte';
import { mount, unmount } from 'svelte';
// @ts-ignore
window.SelectDialog = SelectDialog;

let _selectDialogInstance = null;

// @ts-ignore
// ★mod start 20260724 選択ダイアログiframe分離方式：第3引数dialogTypeを追加（後方互換）
window.mountSelectDialog = function (dialogId, dialogStyle, dialogType) {
  if (_selectDialogInstance) {
    unmount(_selectDialogInstance);
    _selectDialogInstance = null;
  }
  // ダイアログをマウント
  //   従来方式(dialogType未指定): 空枠のみ。中身はhaluview.mixinが同一documentへ挿入する
  //   iframe分離方式(dialogType==="iframe"): 枠内にiframeを描画し、別documentへHalu画面を表示する
  _selectDialogInstance = mount(SelectDialog, {
    target: document.body,
    props: { dialogId, dialogStyle, dialogType }
  });
};
// ★mod end 20260724

// @ts-ignore
window.unmountSelectDialog = function () {
  if (_selectDialogInstance) {
    unmount(_selectDialogInstance);
    _selectDialogInstance = null;
  }
};
