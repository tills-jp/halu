<script>
  import HaluLogo from "../HaluLogo/HaluLogo.svelte";
  import LoginInfo from "../LoginInfo/LoginInfo.svelte";

  let {
    title = "",
    loginInfoVisible = true
  } = $props();

  // アプリ名（sessionStorage の識別名 "{アプリ名}.Login"・Json／Html のパス接頭辞）
  const APP_NAME = "Sample";
  // ログオフ記録に使う term トランザクション定義（StartMenu と AdminMenu は同一定義のため StartMenu を共用）
  const TERM_TRAN_JSON = APP_NAME + "/Json/Apps/StartMenu/StartMenu_term_tran.json";
  // ログオフ記録の画面名（tabMenu.model.mixin の on終了処理OfCheckRequestData と同じ値。「ログイン（メニュー開始）」と対）
  const LOGOFF_GUI_NAME = "ログオフ（メニュー終了）";
  let loggingOut = false;

  /**
   * term リクエストの header レコードへローカル端末情報を設定する
   * （tabMenu.model.mixin の setDisplayInfo と同じ項目・同じ値）
   */
  function setDisplayInfo(header) {
    const values = {
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      request: location.pathname,
      code: navigator.appCodeName,
      browser: navigator.appName,
      version: navigator.appVersion,
      lang: navigator.language,
      platform: navigator.platform,
      useragent: navigator.userAgent,
      referer: document.referrer,
      domain: document.domain,
      screen_w: screen.width,
      screen_h: screen.height,
      screen_col: screen.colorDepth + "Bit"
    };
    for (const key of Object.keys(values)) {
      if (header[key]) header[key].value[0] = values[key];
    }
  }

  /**
   * ログオフのアクセスログ（ログ情報テーブル）を記録する（Issue #27）
   * StartMenu の term トランザクション定義（tran.json）を取得し、tabMenu.model.mixin の
   * on終了処理OfCheckRequestData と同じ値（ユーザＩＤ・画面名・端末情報）を設定して Halumain へ送る。
   * request の html が StartMenu を指すため、どの画面のヘッダーからでも同じ定義で記録できる。
   */
  async function recordLogoff() {
    const halu = window.Halu;
    const res = await fetch(halu.ApplicationURL + TERM_TRAN_JSON, { cache: "no-cache" });
    if (!res.ok) throw new Error("term tran.json の取得に失敗: " + res.status);
    const request = (await res.json()).request;
    const header = request.records.find((rec) => rec.id === "header").record;

    sessionStorage.setIdName(APP_NAME + ".Login");
    header["ユーザＩＤ"].value[0] = sessionStorage.loadItem("ユーザＩＤ", "");
    header["画面名"].value[0] = LOGOFF_GUI_NAME;
    setDisplayInfo(header);

    const post = await fetch(halu.MainASGIURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(JSON.stringify(request)),
      keepalive: true
    });
    const result = await post.json();
    if (!result || !result.message || result.message.status !== "OK") {
      throw new Error("term の応答が OK ではありません: " + JSON.stringify(result && result.message));
    }
  }

  /**
   * ログアウト処理
   * ログオフのアクセスログを記録（Issue #27）した後、sessionStorageを全クリアし、Login画面へ遷移する（C-001）。
   * 記録に失敗してもログアウト自体は続行する（監査ログの欠落より画面が止まる方を避ける。失敗はコンソールに残す）。
   * 画面はPOST遷移（$H.HtmlASGIURL）で表示されるためlocation.hrefの
   * 相対パスでは解決できない。halumodel.mixinのpostHtmlTransitionと
   * 同じ形式でLogin画面へPOST遷移する。
   */
  async function handleLogout() {
    if (loggingOut) return;
    loggingOut = true;
    try {
      await recordLogoff();
    } catch (e) {
      console.warn("ログオフのアクセスログ記録に失敗しました（ログアウトは続行します）", e);
    }

    sessionStorage.clear();

    const form = document.createElement("form");
    form.action = window.Halu.HtmlASGIURL;
    form.method = "post";

    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "gamen");
    input.setAttribute("value", "Sample/Html/Apps/Login");
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
</script>

<div class="halu-page-header sticky-top bg-primary" style="height:60px;">
  <div class="d-flex justify-content-between align-items-center" style="position: relative; height: 60px;">
    <div class="d-flex">
      <!-- ロゴコンポーネント -->
      <HaluLogo />
    </div>

    <!-- タイトルは常にヘッダー中央に固定 -->
    <div style="position: absolute; left: 50%; transform: translateX(-50%);">
      <h5 id="ヘッダータイトル" class="my-0">{title}</h5>
    </div>

    <div class="d-flex">
      <div class="mx-1 mt-1">
        <div>
          <span class="my-0"> </span>
        </div>
      </div>
      {#if loginInfoVisible}
        <!-- ログイン情報（氏名＋ログイン日時＋ログアウト）（D-002） -->
        <div class="mx-2 mt-1">
          <LoginInfo onLogout={handleLogout} />
        </div>
      {/if}
    </div>

  </div>
</div>
