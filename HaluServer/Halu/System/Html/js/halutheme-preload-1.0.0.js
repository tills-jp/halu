/* ***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 *
 * halutheme-preload-1.0.0.js — テーマCSSの先読み（Issue #51）
 * 2026-09-08 新規作成
 *
 * 各画面の index.html の <head> で、デフォルトテーマの <link> 群の直後・最初の <script> の前に
 * 同期読込する。sessionStorage に保存済みのテーマCSS（ログイン時に login.model.mixin が保存）を
 * <body> の解析前に <link> として書き出すことで、デフォルト配色が先に描画されてから
 * 実テーマに切り替わる「ちらつき」を防ぐ（JS初期化後に appendCSS() で追加すると約1秒遅れる）。
 *
 *   - 起点      : 同一ページの halu-custom_default.css の <link>（href 例:
 *                 "../../../../../Application/Sample/Html/css/halu-custom_default.css?var=202608311200"）。
 *                 ここからアプリ名・相対パス起点・?var= を取り出す。URLは使わない
 *                 （ログイン後の画面遷移は /HaluASGI/Haluhtml で配信され、URLにアプリ名が含まれないため）
 *   - キー      : "{アプリ名}.Login.ＣＳＳファイル名"
 *   - 値        : "{アプリ名}/Html/css/halu-custom_{テーマコード}.css"
 *   - 版        : halu-custom_default.css の ?var= を流用する（テーマCSSを直したら default の var を上げる）
 *   - 二重ロード: 書き出す <link> に id="haluThemeCss" を付け、appendCSS()（haluview.mixin）側で
 *                 最後に読まれたテーマCSSと同じなら追加しない
 *   - 値が無いとき（ログイン初回・システムテーマ未設定）は何もしない。例外時も画面表示を止めない
 *********************************************** */
(function () {
  try {
    var defHref = null;
    var links = document.getElementsByTagName("link");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      if (href.indexOf("halu-custom_default.css") >= 0) {
        defHref = href;
        break;
      }
    }
    if (!defHref) { return; }

    // "…/Application/{アプリ名}/Html/css/halu-custom_default.css?var=…" を分解する
    var match = /^(.*\/Application\/)([^\/]+)\/Html\/css\/halu-custom_default\.css(\?.*)?$/.exec(defHref);
    if (!match) { return; }
    var prefix = match[1];
    var appName = match[2];
    var ver = match[3] || "";

    var cssName = sessionStorage.getItem(appName + ".Login.ＣＳＳファイル名");
    // 想定外の値（空・パス以外の文字）は書き出さない
    if (!cssName || !/^[\w\/.\-]+\.css$/.test(cssName)) { return; }

    document.write('<link id="haluThemeCss" href="' + prefix + cssName + ver + '" rel="stylesheet"/>');
  } catch (e) {
    // 先読みに失敗しても従来どおり appendCSS() がテーマを適用する
  }
})();
