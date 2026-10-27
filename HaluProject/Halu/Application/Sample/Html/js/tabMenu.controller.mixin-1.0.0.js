/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * タブメニューパターン
 * コントローラミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin TabMenuControllerMixin
   */
  App.TabMenuControllerMixin = {

    /**
     * ログイン情報を表示し、<br>
     * セッションストレージにターゲットタブが保存されている場合はメニュータブを開く<br>
     * ターゲットタブが保存されていない場合は初期処理を実行する<br>
     * 
     * @memberof TabMenuControllerMixin
     * @param - なし
     */
    initExecute: function () {
      $H.log("Controller initExecute : start");

      let arg = this.model.getログイン情報();
      this.view.setログイン情報(arg);

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let tabname = sessionStorage.loadItem("ターゲットタブ");
      if (this.appspec.isExists(tabname)) {
        this.view.openメニュータブ(tabname);
      }
      else {
        this.ajaxExecute("init");
      }

      $H.log("Controller initExecute : end");
    },

    /**
     * 選択したタブに表示を切り替え、切替後のタブ名をセッションストレージに保存する
     * 
     * @memberof TabMenuControllerMixin
     * @param {event} event - イベント情報
     */
    onメニュータブ: function (event) {
      $H.log("Controller onメニュータブ : start");

      let tabName = event.currentTarget.id;
      let tabEl = document.getElementById(tabName);
      if (tabEl) {
        window.bootstrap.Tab.getOrCreateInstance(tabEl).show();
      }
      $("#" + tabName).focus();

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("ターゲットタブ", tabName);

      this.onFocus12(event);

      $H.log("Controller onメニュータブ : end");
    },

    /**
     * 次画面の情報をセッションストレージに保存し、ユーザ情報登録処理を実行する
     * 
     * @memberof TabMenuControllerMixin
     * @param {event} event - イベント情報
     */
    onメニュー項目: function (event) {
      $H.log("Controller onメニュー項目 : start");

      let htmlName = event.currentTarget.name;
      if (htmlName != "") {
        let arg = { 次画面名: htmlName };
        this.model.onメニュー項目(arg);
        this.ajaxExecute("userinfo");
      }

      $H.log("Controller onメニュー項目 : end");
    },

    /**
     * 実行処理で行う処理を追加する
     * 
     * @memberof TabMenuControllerMixin
     * @param {event} event - イベント情報
     */
    on実行: function (event) {
      $H.log("Controller on実行 : start");


      $H.log("Controller on実行 : end");
    },

    /**
     * 戻る処理で行う処理を追加する
     * 
     * @memberof TabMenuControllerMixin
     * @param {event} event - イベント情報
     */
    on戻る: function (event) {
      $H.log("Controller on戻る : start");

      this.ajaxExecute("term");

      $H.log("Controller on戻る : end");
    },

    /**
     * F12キー押下時、フォーカスをあてる項目を指定する
     * 
     * @memberof TabMenuControllerMixin
     * @param {event} event - イベント情報
     */
    onFocus12: function (event) {
      $H.log("Controller onFocus12 : start");

      this.view.setF12FocusItem();

      $H.log("Controller onFocus12 : end");
    },

    /**
     * 初期処理のリクエストデータへメニュー起動情報とローカル端末情報を設定する
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {string} mode - 処理モード
     * @returns {boolean} true:チェックOK/false:チェックNG
     */
    on初期処理OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on初期処理OfCheckRequestData : start");

      let status = this.model.on初期処理OfCheckRequestData(requestData, mode);

      $H.log("Controller on初期処理OfCheckRequestData : end");
      return status;
    },

    /**
     * ユーザ情報のリクエストデータへ次画面名とローカル端末情報を設定する
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {string} mode - 処理モード
     * @returns {boolean} true:チェックOK/false:チェックNG
     */
    onユーザ情報OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller onユーザ情報OfCheckRequestData : start");

      let status = this.model.onユーザ情報OfCheckRequestData(requestData, mode);

      $H.log("Controller onユーザ情報OfCheckRequestData : end");
      return status;
    },

    /**
     * 終了処理のリクエストデータへメニュー終了情報とローカル端末情報を設定する
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {string} mode - 処理モード
     * @returns {boolean} true:チェックOK/false:チェックNG
     */
    on終了処理OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on終了処理OfCheckRequestData : start");

      let status = this.model.on終了処理OfCheckRequestData(requestData, mode);

      $H.log("Controller on終了処理OfCheckRequestData : end");
      return status;
    },

    /**
     * 先頭タブを表示する
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {string} mode - 処理モード
     */
    on初期処理OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on初期処理OfEditResponseData : start");

      let tabName = "tab_1";

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("ターゲットタブ", tabName);
      this.view.openメニュータブ(tabName);

      $H.log("Controller on初期処理OfEditResponseData : end");
    },

    /**
     * 遷移前画面情報をセッションストレージに保存し、次画面へ遷移する
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {string} mode - 処理モード
     */
    onユーザ情報OfEditResponseData: function (responseData, mode) {
      $H.log("Controller onユーザ情報OfEditResponseData : start");

      let htmlName = this.model.onユーザ情報OfEditResponseData(responseData, mode);
      let currName = this.appspec.urlInfo[0]["app"];
      this.model.setTransitionData(currName.slice(0, -1));
      this.model.postHtmlTransition(htmlName);

      $H.log("Controller onユーザ情報OfEditResponseData : end");
    },

    /**
     * セッションストレージのログイン情報をクリアし、前画面へ戻る
     * 
     * @memberof TabMenuControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {string} mode - 処理モード
     */
    on終了処理OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on終了処理OfEditResponseData : start");

      this.model.on終了処理OfEditResponseData();
      this.model.previousTransition();

      $H.log("Controller on終了処理OfEditResponseData : end");
    },

    /**
     * 処理のエラー情報をダイアログで表示する
     *
     * @memberof TabMenuControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    onErrorResponseData: function (responseData, mode) {
      $H.log("Controller onErrorResponseData : start");

      this.errorResponseData(responseData);

      $H.log("Controller onErrorResponseData : end");
    },

    /**
     * 引数で指定されたタブ数分、タブ表示を移動する
     * 
     * @memberof TabMenuControllerMixin
     * @param {Number} val - 移動タブ数
     */
    onTabPainMove: function (val) {
      $H.log("Controller onTabPainMove : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      let currentTabName = sessionStorage.loadItem("ターゲットタブ");
      let noArray = currentTabName.split('_');
      let tabNo = Number(noArray[1]) + val;

      if (tabNo == 0) {
        tabNo = this.appspec.maxTabNo;
      }
      if (tabNo > this.appspec.maxTabNo) {
        tabNo = 1;
      }
      let targetTabName = "タブ_" + String(tabNo);

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("ターゲットタブ", targetTabName);
      this.view.openメニュータブ(targetTabName);

      $H.log("Controller onTabPainMove : end");
    },

    /**
     * 確認ダイアログ表示後に行う処理を追加する
     *
     * @memberof TabMenuControllerMixin
     * @param - なし
     */
    onConfirmDialogAfter: function () {
      $H.log("Controller onConfirmDialogAfter : start");

      $H.log("Controller onConfirmDialogAfter : end");
    },

    /**
     * 実行ダイアログ表示後に行う処理を追加する
     * 
     * @memberof TabMenuControllerMixin
     * @param - なし
     */
    onExecuteDialogAfter: function () {
      $H.log("Controller onExecuteDialogAfter : start");

      $H.log("Controller onExecuteDialogAfter : end");
    },

    /**
     * サーバーダイアログ表示後に行う処理を追加する
     * 
     * @memberof TabMenuControllerMixin
     * @param - なし
     */
    onServerDialogAfter: function () {
      $H.log("Controller onServerDialogAfter : start");

      $H.log("Controller onServerDialogAfter : end");
    }

  };
}(jQuery, Halu));