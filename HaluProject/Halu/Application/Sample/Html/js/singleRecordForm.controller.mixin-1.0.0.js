/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 単票登録(単一テーブル)パターン
 * コントローラミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin SingleRecordFormControllerMixin
   */
  App.SingleRecordFormControllerMixin = {

    /**
     * ログイン情報を表示し、初期処理を実行する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param - なし
     * @returns なし
     */
    initExecute: function () {
      $H.log("Controller initExecute : start");

      let arg = this.model.getログイン情報();
      this.view.setログイン情報(arg);

      this.on初期処理();

      $H.log("Controller initExecute : end");
    },

    /**
     * 各種初期処理ののち、前画面の情報によって実行する処理を判定する<br>
     * ・選択画面でデータを選択した場合：選択データを表示する<br>
     * ・上記以外の場合：照会処理を実行する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param - なし
     * @returns なし
     */
    on初期処理: function () {
      $H.log("Controller on初期処理 : start");
      
      let arg = null;
      let dataSet = null;

      arg = this.model.on初期処理();
      this.view.on初期処理(arg);

      arg = null;
      arg = this.model.on選択画面戻り();

      // 選択画面戻り処理
      if (arg["status"] == "OK") {
        dataSet = this.model.dataset.getData();

        // セレクトボックスの一括初期表示
        this.onShowSelectBoxAll(dataSet, this.appspec.selectbox);
        this.view.on照会OfEditResponseData(dataSet, dataSet, "");

        // 選択画面で選択データなし
        if (arg["selected"] == "CANCEL") {
          if (arg["responseData"]["cancelfunction"] != "") {
            // 選択画面後処理関数呼出
            this.pubsub.publish(arg["responseData"]["cancelfunction"], arg);
          }
        }
        else {
          // 選択画面で選択データあり
          if (arg["responseData"]["afterfunction"] != "") {
            // 選択画面後処理関数呼出
            this.pubsub.publish(arg["responseData"]["afterfunction"], arg);
          }
        }

        $H.log("Controller on初期処理 : end");
        return;
      }

      // 画面ヘッダキー定義の値をdataSetに設定する
      // メニュー画面から遷移した時：なにも処理されない
      // 遷移先画面から戻って来た時：遷移前の値が設定される
      this.model.setMyUIStorageData();

      // 初期処理：前画面の引き継ぎデータをデータセットに設定する
      let status = this.model.setFromBeforeStorageDataToDataset();
      if (status == "OK") {
        dataSet = null;
        dataSet = this.model.dataset.getData();
        this.view.fromJsonDataToView(dataSet);
      }

      // 新規の時：キーなし、新規以外の時：キーが設定される
      this.ajaxExecute("select");

      $H.log("Controller on初期処理 : end");
    },

    /**
     * フォーカス設定イベント<br>
     * 該当位置のデータをdatasetから取得、表示する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     */
    onFocus: function (event) {
      $H.log("Controller onFocus : start");

      this.onControllerFocus(event);

      $H.log("Controller onFocus : end");
    },

    /**
     * ロストフォーカスイベント<br>
     * 該当位置の入力値チェックおよびdatasetへの値設定を行う
     * 
     * @memberof SingleRecordFormControllerMixin
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
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     */
    onFocus12: function (event) {
      $H.log("Controller onFocus12 : start");

      this.view.setF12FocusItem();

      $H.log("Controller onFocus12 : end");
    },

    /** 
     * 自画面のセッションストレージをクリアし、前画面へ遷移する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     */
    on戻る: function (event) {
      $H.log("Controller on戻る : start");

      this.model.clearセッション情報();
      this.model.previousTransition();

      $H.log("Controller on戻る : end");
    },

    /**
     * 処理モードに応じてトランザクションを実行する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     * @returns なし
     */
    on実行: function (event) {
      $H.log("Controller on実行 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      let mode = sessionStorage.loadItem("処理モード");

      if (mode == "select") return;

      if (mode == "convert") {
        mode = "insert";
      }
      this.ajaxExecute(mode);

      $H.log("Controller on実行 : end");
    },

    /**
     * カーソルが当たってる行のindexを取得し、最後尾に空行を追加する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     */
    on行追加クリック: function (event) {
      $H.log("Controller on行追加クリック : start");

      // 明細テーブルの最大値を取得する
      let rowMax = document.querySelector('#mainTable').rows.length;
      
      // 最後尾に空行を挿入する
      let dataSet = this.model.on行追加クリック(rowMax + 1);
      this.view.on行追加クリック(dataSet);
      $('#mainTable tr').eq(rowMax).find('td:nth-child(2) input').focus();

      $H.log("Controller on行追加クリック : end");
    },

    /**
     * テーブルと選択行の情報をセッションストレージに保存し、<br>
     * 選択行の背景色を変更する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {event} event - イベント情報
     * @param {object} arg  - クリック行情報(datasetのindex、セレクタ名)
     */
    onテーブル行クリック: function (event, arg) {
      $H.log("Controller onテーブル行クリック : start");

      // C-071: 2026-09-24 修正者：AI
      // イベントはappspecで"#mainTable td"に束ねられ currentTarget=td になるため、
      // td→tr→tbodyで辿るparentNode.parentNode.rowIndexは常にundefinedになっていた。
      // closest('tr')でクリックされたtr要素を直接取得しrowIndexを取得する
      // （multiTableListForm.controller.mixinと同じ考え方。td直下でもinput内でも壊れない）
      let row = $(event.currentTarget).closest('tr')[0].rowIndex;
      let idName = event.currentTarget.offsetParent.id;
      let selectArg = { クリック行: row, セレクタ名: idName };
      let status = this.model.onテーブル行クリック(selectArg);
      if (status == "OK") {
        this.view.onテーブル行クリック(selectArg);
      }

      $H.log("Controller onテーブル行クリック : end");
    },

    /**
     * セレクトボックス選択変更イベント<br>
     * 変更後の選択値をデータセットへ反映し、戻り値として返す<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     * @return {String} セレクトボックス選択値 
     */
    onChangeSelectBox: function (event) {
      $H.log("Controller onChangeSelectBox : start");

      let targetValue = this.model.onChangeSelectBox(event, this.appspec.selectbox);

      $H.log("Controller onChangeSelectBox : end");
      return targetValue;
    },

    /**
     * セレクトボックス選択変更イベント(テーブル形式)<br>
     * 変更後の選択値をデータセットへ反映し、戻り値として返す<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     * @return {String} セレクトボックス選択値 
     */
    onChangeTableSelectBox: function (event) {
      $H.log("Controller onChangeTableSelectBox : start");

      let row = event.currentTarget.parentNode.parentNode.rowIndex;
      let targetValue = this.model.onChangeTableSelectBox(event, row, this.appspec.selectbox);

      $H.log("Controller onChangeTableSelectBox : end");
      return targetValue;
    },
    
    /**
     * チェックボックス選択変更イベント<br>
     * 変更後の選択値をデータセットへ反映し、戻り値として返す<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     * @return {boolean} チェックボックスの値 
     */
    onChangeCheckBox: function (event) {
      $H.log("Controller onChangeCheckBox : start");

      let checkValue = this.model.onChangeTableCheckBox(event, this.appspec.checkboxDetail);

      $H.log("Controller onChangeCheckBox : end");
      return checkValue;
    },
    
    /**
     * チェックボックス選択変更イベント(テーブル形式)<br>
     * 変更後の選択値をデータセットへ反映し、戻り値として返す<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     * @returns {boolean} チェックボックスの値 
     */
    onChangeTableCheckBox: function (event) {
      $H.log("Controller onChangeTableCheckBox : start");

      let row = event.currentTarget.parentNode.parentNode.rowIndex;
      let checkValue = this.model.onChangeTableCheckBox(event, row, this.appspec.checkboxDetail);

      $H.log("Controller onChangeTableCheckBox : end");
      return checkValue;
    },

    /**
     * 削除チェックボックス選択変更イベント(テーブル形式)<br>
     * 変更後の選択値をデータセットへ反映し、戻り値として返す<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     * @returns {boolean} チェックボックスの値 
     */
    onChange削除: function (event) {
      $H.log("Controller onChange削除 : start");

      let row = event.currentTarget.parentNode.parentNode.rowIndex;
      let checkValue = this.model.onChangeTableCheckBox(event, row, this.appspec.checkboxDetail);

      $H.log("Controller onChange削除 : end");
      return checkValue;
    },
    
    /**
     * 処理モード切替処理<br>
     * 変更後の処理モードをセッションストレージへ保存し、初期処理を実行する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param  {event} event - イベント情報
     */
    onChangeモード切替: function (event) {
      $H.log("Controller onChangeモード切替 : start");

      this.model.onChangeモード切替(event);

      $H.log("Controller onChangeモード切替 : end");
    },

    /**
     * 初期処理に使用するリクエストデータのバリデーションチェック処理を行う
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {string} mode - 処理モード
     * @returns {object} チェック結果
     */
    on初期処理OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on初期処理OfCheckRequestData : start");

      let status = this.checkRequestData(requestData);

      $H.log("Controller on初期処理OfCheckRequestData : end");
      return status;
    },
    
    /**
     * データセットから照会リクエストデータを作成し、バリデーションチェック処理を行う
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     */
    on照会OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on照会OfCheckRequestData : start");

      let status = this.model.on照会OfCheckRequestData(requestData, mode);
      if (status) {
        status = this.checkRequestData(requestData);
      }

      $H.log("Controller on照会OfCheckRequestData : end");
      return status;
    },

    /**
     * データセットから登録リクエストデータを作成し、バリデーションチェック処理を行う
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     */
    on登録OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on登録OfCheckRequestData : start");

      let status = this.model.on登録OfCheckRequestData(requestData, mode);
      if (status) {
        status = this.checkRequestData(requestData);
      }

      $H.log("Controller on登録OfCheckRequestData : end");
      return status;
    },
    
    /**
     * データセットから訂正リクエストデータを作成し、バリデーションチェック処理を行う
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     */
    on訂正OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on訂正OfCheckRequestData : start");

      let status = this.model.on訂正OfCheckRequestData(requestData, mode);
      if (status) {
        status = this.checkRequestData(requestData);
      }

      $H.log("Controller on訂正OfCheckRequestData : end");
      return status;
    },
    
    /**
     * データセットから削除リクエストデータを作成し、バリデーションチェック処理を行う
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     */
    on削除OfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on削除OfCheckRequestData : start");

      let status = this.model.on削除OfCheckRequestData(requestData, mode);
      if (status) {
        status = this.checkRequestData(requestData);
      }

      $H.log("Controller on削除OfCheckRequestData : end");
      return status;
    },

    /**
     * 初期処理のレスポンスデータと前画面から受け取ったヘッダ情報をもとに<br>
     * セレクトボックスの初期表示および照会処理を実行する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on初期処理OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on初期処理OfEditResponseData : start");

      let dataSet = this.model.on初期処理OfEditResponseData(responseData, mode);

      // セレクトボックスの一括初期表示
      this.onShowSelectBoxAll(responseData, this.appspec.selectbox);

      // 画面ヘッダキー定義の値をdataSetに設定する
      // メニュー画面から遷移した時：なにも処理されない
      // 遷移先画面から戻って来た時：遷移前の値が設定される
      this.model.setMyUIStorageData();

      // 新規の時：キーなし、新規以外の時：キーが設定される
      this.ajaxExecute("select");

      $H.log("Controller on初期処理OfEditResponseData : end");
    },
    
    /**
     * 照会処理のレスポンスデータの内容をデータセットへ設定し、画面へ表示する
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on照会OfEditResponseData : start");

      let dataSet = this.model.on照会OfEditResponseData(responseData, mode);
      this.view.on照会OfEditResponseData(dataSet, responseData, mode);

      this.view.setFirstFocusItem();

      $H.log("Controller on照会OfEditResponseData : end");
    },

    /**
     * 登録処理のレスポンスデータの内容をデータセットへ設定し、画面へ表示する<br>
     * 処理結果をダイアログに表示する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns - なし
     */
    on登録OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on登録OfEditResponseData : start");

      let jsonRecords = responseData["records"];
      if (jsonRecords === undefined) {
        this.model.onサーバ処理確認ダイアログ(responseData);

        $H.log("Controller on登録OfEditResponseData : end");
        return;
      }

      let dataSet = this.model.on登録OfEditResponseData(responseData, mode);
      this.view.on登録OfEditResponseData(dataSet, responseData, mode);
      this.model.onサーバ処理確認ダイアログ(responseData);

      $H.log("Controller on登録OfEditResponseData : end");
    },
    
    /**
     * 訂正処理のレスポンスデータの内容をデータセットへ設定し、画面へ表示する<br>
     * 処理結果をダイアログに表示する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns なし
     */
    on訂正OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on訂正OfEditResponseData : start");

      let jsonRecords = responseData["records"];
      if (jsonRecords === undefined) {
        this.model.onサーバ処理確認ダイアログ(responseData);

        $H.log("Controller on訂正OfEditResponseData : end");
        return;
      }

      let dataSet = this.model.on訂正OfEditResponseData(responseData, mode);
      this.view.on訂正OfEditResponseData(dataSet, responseData, mode);
      this.model.onサーバ処理確認ダイアログ(responseData);

      $H.log("Controller on訂正OfEditResponseData : end");
    },

    /**
     * 削除処理のレスポンスデータの内容をデータセットへ設定し、画面へ表示する<br>
     * 処理結果をダイアログに表示する<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns なし
     */
    on削除OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on削除OfEditResponseData : start");

      let jsonRecords = responseData["records"];
      if (jsonRecords === undefined) {
        this.model.onサーバ処理確認ダイアログ(responseData);

        $H.log("Controller on削除OfEditResponseData : end");
        return;
      }

      let dataSet = this.model.on削除OfEditResponseData(responseData, mode);
      this.view.on削除OfEditResponseData(dataSet, responseData, mode);
      this.model.onサーバ処理確認ダイアログ(responseData);

      $H.log("Controller on削除OfEditResponseData : end");
    },

    /**
     * 処理のエラー情報をダイアログで表示する
     *
     * @memberof SingleRecordFormControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
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
     * @memberof SingleRecordFormControllerMixin
     * @param - なし
     */
    onConfirmDialogAfter: function () {
      $H.log("Controller onConfirmDialogAfter : start");

      $H.log("Controller onConfirmDialogAfter : end");
    },

    /**
     * 実行ダイアログ表示後に行う処理を追加する<br>
     * ※フレームワーク自体に実装はしていないため、個別で実装する必要あり<br>
     * 
     * @memberof SingleRecordFormControllerMixin
     * @param - なし
     */
    onExecuteDialogAfter: function () {
      $H.log("Controller onExecuteDialogAfter : start");

      $H.log("Controller onExecuteDialogAfter : end");
    },
    
    /**
     * サーバーダイアログ表示後、先頭項目にフォーカスを設定する<br>
     * ※フレームワーク自体に実装はしていないため、個別で実装する必要あり<br>
     *
     * @memberof SingleRecordFormControllerMixin
     * @param - なし
     */
    onServerDialogAfter: function () {
      $H.log("Controller onServerDialogAfter : start");

      this.view.setFirstFocusItem();

      $H.log("Controller onServerDialogAfter : end");
    }

  };
}(jQuery, Halu));
