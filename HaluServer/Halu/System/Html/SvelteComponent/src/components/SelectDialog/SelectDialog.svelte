<script>
  import css from '../../styles/select-dialog.css?inline';
  if (!document.getElementById('halu-select-dialog-css')) {
    const s = document.createElement('style');
    s.id = 'halu-select-dialog-css';
    s.textContent = css;
    document.head.appendChild(s);
  }

  let {
    dialogId = "",
    dialogStyle = "",
    dialogType = "",
  } = $props();
</script>

<div class="modal-backdrop fade show"></div>
<!-- ★mod start 20260724 選択ダイアログiframe分離方式：iframeモード時は枠内にiframeを描画する -->
<div
  id={dialogId}
  class={dialogType === "iframe" ? "modal modal-iframe" : "modal"}
  role="dialog"
  tabindex="-1"
  style={dialogStyle}
>
  {#if dialogType === "iframe"}
    <!-- 別documentのiframe内にHalu画面として選択ダイアログを表示する。
         name属性はhalumodel側のform targetと一致させること。
         data-halu-select-dialog属性はiframe内のpreviousTransitionが分離方式を判定するマーカー。 -->
    <iframe
      name="haluSelectDialogFrame"
      data-halu-select-dialog="true"
      title="選択ダイアログ"
      class="halu-select-dialog-iframe"
    ></iframe>
  {/if}
</div>
<!-- ★mod end 20260724 -->
