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
        buttonLabel: "",
    });
    //後処理関数（setAfterFunction で更新する）
    let afterFunc = $state(null);

    //後処理関数情報の更新
    export function setAfterFunction(newFunc) {
        afterFunc = newFunc;
    }
    //表示処理
    export function showServerDialog(title, message, buttonLabel) {
        state.title = title;
        state.message = message;
        state.buttonLabel = buttonLabel;
        state.visible = true;
        onIntroEnd();
    }
    //初期表示後処理
    function onIntroEnd() {
        setTimeout(() => {
            const yesButton = document.getElementById("serverDialogYES");
            if (yesButton) yesButton.focus();
        }, 0);
    }

    //クリックボタン押下処理
    function clickButton(result) {
        //選択(はい/いいえ)の値をセッションストレージに保存
        if (result == true) {
            sessionStorage.setItem("serverDialog", 1);
        } else {
            sessionStorage.setItem("serverDialog", 0);
        }
        //画面非表示
        state.visible = false;
    }

    //非表示後処理呼び出し
    function onAfterHidden() {
        if (typeof afterFunc === 'function') { afterFunc(); }
    }
</script>

{#if state.visible}
    <div
        id="serverDialog"
        class="modal fade show"
        tabindex="-1"
        role="dialog"
        aria-labelledby="serverHeader"
        aria-hidden="false"
        in:fly={{ y: -50, duration: 300 }}
        out:fly={{ y: -50, duration: 200 }}
        onoutroend={onAfterHidden}
    >
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <!-- アクセシビリティ警告を避けるためbuttonを使用 -->
                    <button
                        type="button"
                        class="close"
                        aria-label="Close"
                        onclick={() => clickButton(false)}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 class="modal-title" id="serverHeader">
                        {@html state.title}
                    </h4>
                </div>
                <div class="modal-body" id="serverBody">
                    <p>{@html state.message}</p>
                </div>
                <div class="modal-footer" id="serverFooter">
                    <button
                        id="serverDialogYES"
                        type="button"
                        class="btn"
                        onclick={() => clickButton(true)}
                    >
                        {state.buttonLabel[0]}
                    </button>
                    <button
                        id="serverDialogNO"
                        type="button"
                        class="btn"
                        onclick={() => clickButton(false)}
                    >
                        {state.buttonLabel[1]}
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" in:fade={{ duration: 200 }} out:fade={{ duration: 150 }}></div>
{/if}
