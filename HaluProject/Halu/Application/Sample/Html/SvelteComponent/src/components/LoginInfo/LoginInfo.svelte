<script>
  let { onLogout = () => {} } = $props();
</script>

<!-- labelは警告が出るのでspanに変更 -->
<!-- 「ログインユーザ」表記＋氏名（右揃え2段）＋ログアウトボタン（D-011）。
     ログイン日時の表示はUAT指摘（2026-07-27）により廃止（データ取得・sessionStorageは不変） -->
<div class="d-flex align-items-center">
  <div class="mx-2 header-login-info">
    <span class="my-0 header-login-info-label">ログインユーザ</span>
    <span class="my-0 header-login-info-name" halu-ds-id="login" halu-ds-field="ユーザ氏名"> </span>
  </div>
  <div class="mx-1">
    <!-- ログアウトボタン（C-001由来。D-011でモックアップ準拠の白地・赤枠ボタン型へ変更） -->
    <span class="logout-link" role="button" tabindex="0" onclick={onLogout} onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onLogout()}>
      <svg class="logout-link-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
        <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
      </svg>
      ログアウト
    </span>
  </div>
</div>
