/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * データ選択ダイアログパターン  
 * コントローラミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin DataSelectionDialogControllerMixin
   */
  App.DataSelectionDialogControllerMixin = {

    /**
     * ログイン情報を表示し、初期処理を実行する
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param - なし
     */
    initExecute: function () {
      $H.log("Controller initExecute : start");

      let arg = this.model.getログイン情報();
      this.view.setログイン情報(arg);

      this.on初期処理();

      $H.log("Controller initExecute : end");
    },

    /**
     * 前画面よりリクエストデータと引継ぎデータを取得し、データセットに設定後、<br>
     * 検索処理を実施する<br>
     * ※検索処理はon最初のページDialogを実施<br>
     *
     * @memberof DataSelectionDialogControllerMixin
     * @param - なし
     */
    on初期処理: function () {
      $H.log("Controller on初期処理 : start");

      let arg = this.model.on初期処理();
      this.view.on初期処理(arg);

      // 選択画面リクエストデータとレスポンスデータを設定する
      this.model.setリクエストデータOf選択画面();

      // 初期処理：前画面の引き継ぎデータをデータセットに設定する
      let status = this.model.setFromBeforeStorageDataToDataset();
      if (status == "OK") {
        let dataSet = this.model.dataset.getData();
        this.view.fromJsonDataToView(dataSet);
      }

      this.on最初のページDialog();

      $H.log("Controller on初期処理 : end");
    },
    /**
    * 前画面に空データを引き渡し、自画面のセッションストレージをクリア後に<br>
    * ダイアログを閉じて前画面に戻る<br>
    * 
    * @memberof DataSelectionDialogControllerMixin
    * @param {event} event - イベント情報
    */
    on閉じるDialog: function (event) {
      $H.log("Controller on閉じるDialog : start");

      // 前画面のレスポンスデータを設定
      this.model.set戻るレスポンスデータOf選択画面();

      // セッションストレージをクリアし、前画面へ戻る
      this.model.clearセッション情報();
      this.model.previousTransition();

      $H.log("Controller on閉じるDialog : end");
    },
    /**
     * フォーカス設定イベント<br>
     * 該当位置のデータをdatasetから取得、表示する<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    onFocus: function (event) {
      $H.log("Controller onFocus : start");

      this.onControllerFocus(event);

      $H.log("Controller onFocus : end");
    },

    /**
     * ロストフォーカスイベント<br>
     * 該当位置の入力値チェックおよびdatasetへの値設定を行う<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    onBlur: function (event) {
      $H.log("Controller onBlur : start");

      this.onControllerBlur(event);

      $H.log("Controller onBlur : end");
    },

    /**
     * F12キー押下時、フォーカスをあてる項目を指定する
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    onFocus12: function (event) {
      $H.log("Controller onFocus12 : start");

      this.view.setF12FocusItem();

      $H.log("Controller onFocus12 : end");
    },
   
    /**
     * 検索処理を実行する<br>
     * ※検索処理はon最初のページDialogを実施<br>
     *
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on検索Dialog: function (event) {
      $H.log("Controller on検索Dialog : start");

      this.on最初のページDialog();

      $H.log("Controller on検索Dialog : end");
    },

    /**
     * ヘッダのセッションストレージおよび画面表示内容をクリアする
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    onクリアDialog: function (event) {
      $H.log("Controller onクリアDialog : start");

      let dataSet = this.model.onクリア();
      this.view.onクリア(dataSet);

      $H.log("Controller onクリアDialog : end");
    },
    /**
     * 選択したデータを前画面のセッションストレージに保存し、<br>
     * ダイアログのセッションストレージをクリア後、ダイアログを閉じる<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on選択Dialog: function (event) {
      $H.log("Controller on選択Dialog : start");

      if (!this.model.check行選択()) return;

      // 前画面のレスポンスデータを設定
      this.model.set選択レスポンスデータOf選択画面();

      // セッションストレージをクリアし、前画面へ戻る
      this.model.clearセッション情報();
      this.model.previousTransition();

      $H.log("Controller on選択Dialog : end");
    },
    /**
     * セレクトボックスの値を変更した場合、<br>
     * データセットに格納した値を元に再設定する<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     * @returns セレクトボックスの選択値
     */
    onChangeSelectBox: function (event) {
      $H.log("Controller onChangeSelectBox : start");

      let targetValue = this.model.onChangeSelectBox(event, this.appspec.selectbox);

      $H.log("Controller onChangeSelectBox : end");
      return targetValue;
    },

    /**
     * ヘッダー部のチェックボックスをクリック後、<br>
     * チェックボックスのON/OFFの情報をデータセットに設定する<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     * @returns チェックボックスのON/OFFの結果
     */
    onChangeCheckBox: function (event) {
      $H.log("Controller onChangeCheckBox : start");

      let checkValue = this.model.onChangeCheckBox(event, this.appspec.checkboxDetail);

      $H.log("Controller onChangeCheckBox : end");
      return checkValue;
    },
    /**
     * 現在ページとデータセットより表示件数（最初のページ部分）を取得し、<br>
     * 検索処理を行う<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on最初のページDialog: function (event) {
      $H.log("Controller on最初のページDialog : start");

      this.model.on最初のページ();
      this.ajaxExecute("select");

      $H.log("Controller on最初のページDialog : end");
    },

    /**
     * 現在ページとデータセットより表示件数（１つ前のページ部分）を取得し、<br>
     * 検索処理を行う<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on前のページDialog: function (event) {
      $H.log("Controller on前のページDialog : start");

      this.model.on前のページ();
      this.ajaxExecute("select");

      $H.log("Controller on前のページDialog : end");
    },

    /**
     * 現在ページとデータセットより表示件数（１つ後のページ部分）を取得し、<br>
     * 検索処理を行う<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on次のページDialog: function (event) {
      $H.log("Controller on次のページDialog : start");

      this.model.on次のページ();
      this.ajaxExecute("select");

      $H.log("Controller on次のページDialog : end");
    },
    /**
     * 現在ページとデータセットより表示件数（最後のページ部分）を取得し、<br>
     * 検索処理を行う<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     */
    on最後のページDialog: function (event) {
      $H.log("Controller on最後のページDialog : start");

      this.model.on最後のページ();
      this.ajaxExecute("select");

      $H.log("Controller on最後のページDialog : end");
    },
    /**
     * テーブルの選択行の情報をセッションストレージに保存し、<br>
     * 選択行の背景色を変更する<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {event} event - イベント情報
     * @param {Object}  arg - 画面情報(クリック情報)
     */
    onテーブル行クリックDialog: function (event, arg) {
      $H.log("Controller onテーブル行クリックDialog : start");

      let row = event.currentTarget.parentNode.rowIndex;
      let idName = event.currentTarget.offsetParent.id;
      let selectArg = { クリック行: row, セレクタ名: idName };
      this.model.onテーブル行クリック(selectArg);
      this.view.onテーブル行クリック(selectArg);

      $H.log("Controller onテーブル行クリックDialog : end");
    },
    /**
     * 初期処理実行前にバリデーションチェック処理をする
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {Object} requestData - リクエストデータ
     * @param {String} mode        - 処理モード
     */
    on初期処理OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on初期処理OfCheckRequestData : start");

      let status = this.checkRequestData(requestData);

      $H.log("Controller on初期処理OfCheckRequestData : end");
      return status;
    },

    /**
     * 照会処理実行前にリクエストデータに対しバリデーションチェック処理をする
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {Object} requestData - リクエストデータ
     * @param {String} mode        - 処理モード
     */
    on照会OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on照会OfCheckRequestData : start");

      let status = this.checkRequestData(requestData);

      $H.log("Controller on照会OfCheckRequestData : end");
      return status;
    },

    /**
     * 初期処理実行後にレスポンスデータからデータセットに値を設定し、<br>
     * セレクトボックスの一括初期表示を設定した後、検索処理を行う<br>
     * ※検索処理はon最初のページDialogを実施<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {Object} responseData - レスポンスデータ
     * @param {String} mode         - 処理モード
     */
    on初期処理OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on初期処理OfEditResponseData : start");

      let dataSet = this.model.on初期処理OfEditResponseData(responseData, mode);

      // セレクトボックスの一括初期表示
      this.onShowSelectBoxAll(responseData, this.appspec.selectbox);

      this.on最初のページDialog();

      $H.log("Controller on初期処理OfEditResponseData : end");
    },
    
    /**
     * 照会処理実行後にレスポンスデータからデータセットに値を設定し、画面表示を行う
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {Object} responseData - レスポンスデータ
     * @param {String} mode         - 処理モード
     */
    on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on照会OfEditResponseData : start");

      let dataSet = this.model.on照会OfEditResponseData(responseData, mode);
      this.view.on照会OfEditResponseData(dataSet, responseData, mode);

      this.view.setFirstFocusItem();

      $H.log("Controller on照会OfEditResponseData : end");
    },

    /**
     * 処理のエラー情報をダイアログで表示する
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param {Object} responseData - レスポンスデータ
     * @param {String} mode         - 処理モード
     */
    onErrorResponseData: function (responseData, mode) {
      $H.log("Controller onErrorResponseData : start");

      this.errorResponseData(responseData);

      $H.log("Controller onErrorResponseData : end");
    },
    /**
     * 確認ダイアログ表示後に行う処理を追加する<br>
     * ※フレームワーク自体に実装はしていないため、個別で実装する必要あり<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param - なし
     * @returns なし
     */
    onConfirmDialogAfter: function () {
      $H.log("Controller onConfirmDialogAfter : start");

      $H.log("Controller onConfirmDialogAfter : end");
    },
    
    /**
     * 実行ダイアログ表示後に行う処理を追加する<br>
     * ※フレームワーク自体に実装はしていないため、個別で実装する必要あり<br>
     * 
     * @memberof DataSelectionDialogControllerMixin
     * @param - なし
     * @returns なし
     */
    onExecuteDialogAfter: function () {
      $H.log("Controller onExecuteDialogAfter : start");

      $H.log("Controller onExecuteDialogAfter : end");
    },
    
    /**
     * サーバーダイアログ表示後、先頭項目にフォーカスを設定する<br>
     * ※デフォルトでsetFirstFocusItemを実行する。変更する場合は個別でオーバーライドする<br>
     *
     * @memberof DataSelectionDialogControllerMixin
     * @param - なし
     * @returns なし
     */
    onServerDialogAfter: function () {
      $H.log("Controller onServerDialogAfter : start");

      this.view.setFirstFocusItem();

      $H.log("Controller onServerDialogAfter : end");
    }

  };
}(jQuery, Halu));
