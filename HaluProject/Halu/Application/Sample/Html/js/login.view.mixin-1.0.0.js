/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * ログインパターン
 * ビューミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin LoginViewMixin
   */
  App.LoginViewMixin = {

    /**
     * CSSの適用と各種ダイアログの初期処理を実施する
     * 
     * @memberof LoginViewMixin
     * @param - なし 
     */
    initExecute: function () {
      $H.log("View initExecute : start");

      this.initAlertDialog();        // 警告メッセージ用ダイアログ 初期処理
      this.initConfirmDialog(this);  // 確認メッセージ用ダイアログ 初期処理
      this.initExecuteDialog(this);  // 実行確認メッセージ用ダイアログ 初期処理
      this.initServerDialog(this);   // サーバ確認メッセージ用ダイアログ 初期処理

      $H.log("View initExecute : end");
    },

    /**
     * 
     * 項目：ログインＩＤにフォーカスをあてる
     * 
     * @memberof LoginViewMixin
     * @param {event} event - イベント情報
     */
    onクリア: function (event) {
      $H.log("View onクリア : start");

      // 画面の最初の項目にフォーカスを当てる
      // 2026-06-12 後方互換: halu-ds-field で要素を特定（なければ #id で検索）
      let $loginId = $("[halu-ds-field='ログインＩＤ']");
      if (!$loginId.length) $loginId = $("#ログインＩＤ");
      $loginId.focus();

      $H.log("View onクリア : end");
    },

    /**
     * CSSファイルを適用し、項目：ログインＩＤにフォーカスをあてる
     * 
     * @memberof LoginViewMixin
     * @param {Object} responseData - レスポンスデータ
     * @param {Object} arg          - 画面項目
     */
    on初期処理OfEditResponseData: function (responseData, arg) {
      $H.log("View on初期処理OfEditResponseData : start");

      //  ＣＳＳファイルをロードする
      let cssName = arg["ＣＳＳファイル名"];
      if (cssName != "") {
        let targetArg = { cssName: cssName };
        this.appendCSS(targetArg);
      }
      // 画面の最初の項目にフォーカスを当てる
      // 2026-06-12 後方互換: halu-ds-field で要素を特定（なければ #id で検索）
      let $loginIdInit = $("[halu-ds-field='ログインＩＤ']");
      if (!$loginIdInit.length) $loginIdInit = $("#ログインＩＤ");
      $loginIdInit.focus();

      $H.log("View on初期処理OfEditResponseData : end");
    }

  };
}(jQuery, Halu));
