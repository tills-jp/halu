<script>
    import { fade, fly } from "svelte/transition";
    import css from '../../styles/dialog-common.css?inline';
    if (!document.getElementById('halu-dialog-common-css')) {
      const s = document.createElement('style');
      s.id = 'halu-dialog-common-css';
      s.textContent = css;
      document.head.appendChild(s);
    }

    //内部状態の宣言
    let state = $state({
        visible: false,
        title: "",
        message: "",
        buttonLabel: [],
    });

    //表示処理表示のタイミングで内容を更新する
    export function showAlertDialog(title, message, buttonLabel) {
        state.title = title;
        state.message = message;
        state.buttonLabel = buttonLabel;
        state.visible = true;
    }

    //非表示処理
    function close() {
        state.visible = false;
    }
</script>

{#if state.visible}
    <div
        class="modal fade show"
        id="alertDialog"
        tabindex="-1"
        role="dialog"
        aria-labelledby="alertHeader"
        aria-hidden="false"
        in:fly={{ y: -50, duration: 300 }}
        out:fly={{ y: -50, duration: 200 }}
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <!-- アクセシビリティ警告を避けるためbuttonを使用 -->
                    <button
                        type="button"
                        class="close"
                        aria-label="Close"
                        onclick={() => close()}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title" id="alertHeader">
                        {@html state.title}
                    </h4>
                </div>
                <div class="modal-body" id="alertBody">
                    <p>{@html state.message}</p>
                </div>
                <div class="modal-footer" id="alertFooter">
                    <button
                        id="alertDialogCLOSE"
                        type="button"
                        class="btn btn-default"
                        onclick={() => close()}
                    >
                        {state.buttonLabel[0]}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}></div>
{/if}
