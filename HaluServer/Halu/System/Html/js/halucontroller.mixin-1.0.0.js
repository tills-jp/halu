(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  // 関数を追加する
  /**
   * @mixin ControllerMixin
   */
  App.ControllerMixin = {
    /**
     * ブラウザ戻るボタンを無効にする
     * @memberof ControllerMixin
     * @function onBrowserBackBotton
     * @param {event} event - イベント情報
     */
    onBrowserBackBotton: function (event) {
      $H.log("ControllerMixin onBrowserBackBotton : start");

      if (!event.originalEvent.state) {
        history.pushState(null, null, null);
      }

      $H.log("ControllerMixin onBrowserBackBotton : end");
    },

    /**
     * フレームワーク内部イベント設定配列
     * @memberof ControllerMixin
     * @constant {object} pubsubHaluEvent - [イベント名,実行コンテキスト,コールバック関数]
     */
    pubsubHaluEvent: [
      ["dataformat", "view", "onDataFormat"]
      , ["dataunformat", "view", "onDataUnformat"]
      , ["guidemessage", "view", "onGuideMessage"]
      , ["errorToolTip", "view", "onErrorToolTip"]
      , ["removeToolTip", "view", "onRemoveToolTip"]
      , ["alertDialog", "view", "onAlertDialog"]
      , ["confirmDialog", "view", "onConfirmDialog"]
      , ["confirmDialogAfter", "controller", "onConfirmDialogAfter"]
      , ["executeDialog", "view", "onExecuteDialog"]
      , ["executeDialogAfter", "controller", "onExecuteDialogAfter"]
      , ["serverDialog", "view", "onServerDialog"]
      , ["serverDialogAfter", "controller", "onServerDialogAfter"]
      //★add start 20260526
      , ["keydownUnbind", "controller", "unbindEnterTabPFKey"]
      //★add end 20260526
      //★add start 20260724 選択ダイアログiframe分離方式：親画面のキー再設定・選択結果反映
      // keydownBind : keydownUnbindの対。model側からenterTabPFKeyを引数に渡して再設定する
      , ["keydownBind", "controller", "setEnterTabPFKey"]
      // selectDialogReturn : iframe分離方式の選択結果を親画面へ反映する
      , ["selectDialogReturn", "controller", "on選択ダイアログ戻り"]
      //★add end 20260724
    ],

    /**
     * Focus処理
     * @memberof ControllerMixin
     * @param {event} event - イベント情報
     */
    onControllerFocus: function (event) {
      $H.log("ControllerMixin onControllerFocus start name : " + (event.target.getAttribute("halu-ds-field") || event.target.name));
      // 変数宣言
      let isMultiline = null;
      let targetRowObj = null;
      let targetCellObj = null;
      let sameNameRowObjs = null;
      let value = null;
      let message = null;
      let arg = null;

      // Focus された要素の name 属性
      this.focusName;
      // Focus されたセルの行位置
      this.focusCurRow = 0;
      // Focus されたセルの列位置
      this.focusCurCell = 0;
      // ※セルの位置は dataset 上の並び順と無関係であることに注意
      // dataset 上の、該当データの位置
      this.focusIndex = 0;
      // 2026-06-12 後方互換: halu-ds-id/halu-ds-field で要素を特定（なければname属性で検索）
      // 対象要素から フィールド名を取得（halu-ds-field 優先、なければ name 属性）
      this.focusName = event.target.getAttribute("halu-ds-field") || event.target.name;
      // dataset を走査して multiline かどうかを求める
      isMultiline = this.model.dataset.isMultilineByName(this.focusName);

      // multiline の場合
      if (isMultiline) {
        // データが次の条件で表示されているものと想定して処理します
        // ・表形式であること
        // ・各セル内が、更に個別の表になっていないこと

        //- テーブル上のセル位置を求める ----------
        // 該当要素を含む tr 要素を求める
        targetRowObj = $(event.target).closest('tr');
        // 該当要素を含む td / th 要素を求める
        targetCellObj = $(event.target).closest('td,th');
        // セル位置を求める
        if (targetRowObj && targetCellObj) {
          this.focusCurRow = targetRowObj[0].rowIndex;
          this.focusCurCell = targetCellObj[0].cellIndex;
        }
        //- dataset 上の該当位置を求める ----------
        // 2026-06-12 後方互換: halu-ds-id/halu-ds-field で要素を特定（なければname属性で検索）
        // 同じフィールドの要素を含む、tr 要素の集合を求める
        if (event.target.getAttribute("halu-ds-field")) {
          let dsId = event.target.getAttribute("halu-ds-id");
          let sel = dsId ? "[halu-ds-id='" + dsId + "'][halu-ds-field='" + this.focusName + "']" : "[halu-ds-field='" + this.focusName + "']";
          sameNameRowObjs = $(document).find(sel).closest('tr');
        } else {
          sameNameRowObjs = $(document).find('[name="' + this.focusName + '"]').closest('tr');
        }
        // sameNameRowObjs 上の targetRowObj の位置がdataset 上の位置に相当します
        this.focusIndex = sameNameRowObjs.index(targetRowObj);
      }

      // 入力項目の値をdatasetから取得する
      value = this.model.onFocus(event, this.focusIndex);
      // 値を画面に表示する
      this.view.onFocus(event, value, this.focusCurRow);
      // 入力ガイドメッセージを作成する
      message = this.model.onFocusMessage(event);
      arg = { status: "OK", message: message };
      // ガイドメッセージを表示する
      this.view.onGuideMessage(arg);

      $H.log("ControllerMixin onControllerFocus : end");
    },
    /**
     * Blur処理
     * @memberof ControllerMixin
     * @param {event} event - イベント情報
     */
    onControllerBlur: function (event) {
      $H.log("ControllerMixin onControllerBlur start name : " + (event.target.getAttribute("halu-ds-field") || event.target.name));
      //変数宣言
      let isMultiline = null;
      let targetRowObj = null;
      let targetCellObj = null;
      let sameNameRowObjs = null;
      let message = null;
      let target = null;

      // Blur された要素の name 属性
      this.blurName;

      // ※セルの位置は dataset と無関係であることに注意
      // Blur されたセルの行位置
      this.blurCurRow = 0;
      // Blur されたセルの列位置
      this.blurCurCell = 0;

      // dataset 上の、該当データの位置
      this.blurIndex = 0;
      // 2026-06-12 後方互換: halu-ds-id/halu-ds-field で要素を特定（なければname属性で検索）
      // 対象要素から フィールド名を取得（halu-ds-field 優先、なければ name 属性）
      this.blurName = event.target.getAttribute("halu-ds-field") || event.target.name;
      // dataset を走査して multiline かどうかを求める
      isMultiline = this.model.dataset.isMultilineByName(this.blurName);

      // multiline の場合
      if (isMultiline) {
        // データが次の条件で表示されているものと想定して処理します
        // ・表形式であること
        // ・各セル内が、更に個別の表になっていないこと

        //- テーブル上のセル位置を求める ----------
        // 該当要素を含む tr 要素を求める
        targetRowObj = $(event.target).closest('tr');
        // 該当要素を含む td / th 要素を求める
        targetCellObj = $(event.target).closest('td,th');
        // セル位置を求める
        if (targetRowObj && targetCellObj) {
          this.blurCurRow = targetRowObj[0].rowIndex;
          this.blurCurCell = targetCellObj[0].cellIndex;
        }
        //- dataset 上の該当位置を求める ----------
        // 2026-06-12 後方互換: halu-ds-id/halu-ds-field で要素を特定（なければname属性で検索）
        // 同じフィールドの要素を含む、tr 要素の集合を求める
        if (event.target.getAttribute("halu-ds-field")) {
          let dsId = event.target.getAttribute("halu-ds-id");
          let sel = dsId ? "[halu-ds-id='" + dsId + "'][halu-ds-field='" + this.blurName + "']" : "[halu-ds-field='" + this.blurName + "']";
          sameNameRowObjs = $(document).find(sel).closest('tr');
        } else {
          sameNameRowObjs = $(document).find('[name="' + this.blurName + '"]').closest('tr');
        }
        // sameNameRowObjs 上の targetRowObj の位置が dataset 上の位置に相当します
        this.blurIndex = sameNameRowObjs.index(targetRowObj);
      }
      // 入力データをdatasetに設定する
      this.model.onBlur(event, this.blurIndex);

      // 入力データをチェックする
      message = this.model.onBlurDataCheck(event, this.blurIndex);
      if (message["status"] == "OK" || message["noDisplayMessage"] == "yes") {
        this.view.onRemoveToolTip(message);
      }
      else {
        // 重複エラー表示の防止
        this.view.onRemoveToolTip(message);
        this.view.onErrorToolTip(message);
      }

      // 入力データをフォーマットし再表示する
      this.view.onBlur(event);

      if (message["status"] == "OK") {
        target = event.target;
        this.model.onBlurDerive(target, target.value, this.blurCurRow);
      }

      $H.log("ControllerMixin onControllerBlur : end");
    },

    /**
     * トランザクション実行前処理
     * @memberof ControllerMixin
     * @param {string} mode - 処理モード
     */
    ajaxExecute: function (mode) {
      $H.log("ControllerMixin ajaxExecute : start");
      //変数宣言
      let transaction = null;

      //データ取得
      transaction = this.model.getTransaction(mode);
      if (!transaction.synchro) {
        transaction.synchroData(this, "ajaxExecuteDo");
      }
      else {
        this.ajaxExecuteDo(transaction);
      }

      $H.log("ControllerMixin ajaxExecute : end");
    },

    /**
     * トランザクションを実行する
     * @memberof ControllerMixin
     * @param {object} transaction -transactionクラス
     */
    ajaxExecuteDo: function (transaction) {
      $H.log("ControllerMixin ajaxExecuteDo : start");
      //変数宣言
      let dataSet = null;
      let requestJson = null;
      //データ取得
      dataSet = this.model.dataset.getData();
      requestJson = transaction.data["request"];
      if (requestJson === undefined) {
      }
      else {
        this.model.setDatasetToJsonRecordsNoEmptyLine(dataSet, requestJson);
      }
      transaction.ajax(this);

      $H.log("ControllerMixin ajaxExecuteDo : end");
    },

    /**
     * 外部トランザクション実行前処理
     * @memberof ControllerMixin
     * @param {object} program - 外部トランザクションの情報
     * @param {string} mode - 処理モード
     */
    ajaxExternalExecute: function (program, mode) {
      $H.log("ControllerMixin ajaxExternalExecute : start");
      //変数宣言
      let transaction = null;
      //データ取得
      transaction = this.model.getExternalTransaction(program, mode);
      if (!transaction.synchro) {
        transaction.synchroData(this, "ajaxExecuteDo");
      }
      else {
        this.ajaxExternalExecuteDo(transaction);
      }

      $H.log("ControllerMixin ajaxExternalExecute : end");
    },

    /**
     * トランザクションを実行する
     * @memberof ControllerMixin
     * @param {object} transaction - transactionクラス
     */
    ajaxExternalExecuteDo: function (transaction) {
      $H.log("ControllerMixin ajaxExecuteDo : start");
      //変数宣言
      let dataSet = null;
      let requestJson = null;

      //データ取得
      dataSet = this.model.dataset.getData();
      requestJson = transaction.data["request"];
      if (requestJson === undefined) {
      }
      else {
        this.model.setDatasetToJsonRecordsNoEmptyLine(dataSet, requestJson);
      }
      transaction.ajaxExternal(this);

      $H.log("ControllerMixin ajaxExecuteDo : end");
    },

    /**
     * リクエストデータをチェックする
     * @memberof ControllerMixin
     * @param {object} data - リクエストデータ
     * @returns チェック結果
     */
    checkRequestData: function (data) {
      $H.log("ControllerMixin checkRequestData : start");
      //変数宣言
      let status = null;

      //データ取得
      status = this.model.transactionCheck(data);

      $H.log("ControllerMixin checkRequestData : end");
      return status;
    },

    /**
     * レスポンスエラーをダイアログに表示する
     * @memberof ControllerMixin
     * @param {object} data - レスポンスデータ
     */
    errorResponseData: function (data) {
      $H.log("ControllerMixin errorResponseData : start");
      //変数宣言
      let msg = null;
      let arg = null;

      //データ取得
      msg = data["message"]["msg"];
      arg = { title: "サーバエラー", status: "ERROR", message: msg };
      this.pubsub.publish("alertDialog", arg);

      $H.log("ControllerMixin errorResponseData : end");
    },

    /**
     * サーバとの接続エラー
     * @memberof ControllerMixin
     * @param {object} XMLHttpRequest - リクエスト
     * @param {string} textStatus - エラー情報
     * @param {string} errorThrown - 例外情報
     */
    connectError: function (XMLHttpRequest, textStatus, errorThrown) {
      $H.log("ControllerMixin responseError : start");
      //変数宣言
      let arg = {};
      //データ取得
      arg["title"] = "通信エラー";
      arg["status"] = "ERROR";
      arg["message"] = ["サーバとの接続に失敗しました。入力データが更新されていません。", "閉じるボタンを押し、そのままの画面でしばらくお待ちください。", "そして実行ボタンを押して下さい。"];
      this.pubsub.publish("alertDialog", arg);

      $H.log("ControllerMixin responseError : end");
    },

    /**
     * Dataset同期チェック
     * @memberof ControllerMixin
     */
    synchroCheckDataset: function () {
      $H.log("ControllerMixin synchroCheckDataset : start");

      this.pubsub.model = this.model;
      this.pubsub.view = this.view;
      this.pubsub.controller = this;

      this.model.pubsub = this.pubsub;
      this.view.pubsub = this.pubsub;

      if (this.model.dataset) {
        this.model.dataset.synchroData(this, "synchroCheckValidation");
      }
      else {
        this.synchroCheckValidation();
      }

      $H.log("ControllerMixin synchroCheckDataset : end");
    }

    /**
     * Validation同期チェック
     * @memberof ControllerMixin
     */
    , synchroCheckValidation: function () {
      $H.log("ControllerMixin synchroCheckValidation : start");
      //変数宣言
      let validation = null;

      //データ取得
      if (this.model.dataset) {
        this.view.initExecute(this.model.dataset.data);
      }
      else {
        this.view.initExecute();
      }
      this.model.initExecute();
      validation = this.model.getValidation();
      if (validation) {
        validation.synchroData(this, "synchroCheckTransaction");
      }
      else {
        this.synchroCheckTransaction();
      }

      $H.log("ControllerMixin synchroCheckValidation : end");
    },

    /**
     * Transaction同期チェック
     * @memberof ControllerMixin
     * 
     */
    synchroCheckTransaction: function () {
      $H.log("ControllerMixin synchroCheckTransaction : start");
      //変数宣言
      let validation = null;
      let requestInfo = null;
      let tranName = null;
      let transaction = null;

      //データ取得
      validation = this.model.getValidation();
      if (validation) {
        this.view.copyFormat(validation.getData());
      }

      requestInfo = this.appspec.requestInfo;
      if (requestInfo.length > 0) {
        tranName = requestInfo[0][0];
        transaction = this.model.getTransaction(tranName);
        transaction.synchroData(this, "initExecute");
      }
      else {
        this.initExecute();
      }
      $H.log("ControllerMixin synchroCheckTransaction : end");
    },

    /**
     * セレクトボックス表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defSelectBox - セレクトボックス
     * 
     */
    onShowSelectBox: function (responseData, defSelectBox) {
      $H.log("ControllerMixin onShowSelectBox : start");
      //変数宣言
      let datasetID = null;
      let responseRecord = null;

      //データ取得
      datasetID = defSelectBox["init"]["datasetid"];
      responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);

      if (responseRecord) {
        if (defSelectBox["selectorid"]) {
          this.view.onShowSelectBox(defSelectBox, responseRecord["record"]);
        }
      }
      $H.log("ControllerMixin onShowSelectBox : end");
    },

    /**
     * セレクトボックス表示処理 セレクタＩＤ指定によるセット
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {string} defSelectBoxID - セレクタID
     */
    onShowSelectBoxById: function (responseData, defSelectBoxID) {
      $H.log("ControllerMixin onShowSelectBoxById : start");
      //変数宣言
      let max = 0;
      let defSelectBox = null;
      let datasetID = null;
      let responseRecord = null;

      //データ取得
      max = this.appspec.selectbox.length;
      for (let i = 0; i < max; i++) {
        //初期化
        defSelectBox = null;
        datasetID = null;
        responseRecord = null;

        if (this.appspec.selectbox[i]["selectorid"] == defSelectBoxID) {
          //初期化
          defSelectBox = null;
          datasetID = null;
          responseRecord = null;

          //データ取得
          defSelectBox = this.appspec.selectbox[i]
          datasetID = this.appspec.selectbox[i]["init"]["datasetid"];
          responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);

          if (responseRecord) {
            if (defSelectBox["selectorid"]) {
              this.view.onShowSelectBox(defSelectBox, responseRecord["record"]);
            }
          }
          break;
        }
      }

      $H.log("ControllerMixin onShowSelectBoxById : end");
    },

    /**
     * セレクトボックス一括表示処理（ＩＤでの設定）
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defSelectBox - セレクトボックス
     */
    onShowSelectBoxAll: function (responseData, defSelectBox) {
      $H.log("ControllerMixin onShowSelectBoxAll : start");
      //変数宣言
      let max = 0;
      let datasetID = null;
      let responseRecord = null;

      if (this.appspec.isExists(defSelectBox[0])) {
        max = defSelectBox.length;
        for (let i = 0; i < max; i++) {
          datasetID = defSelectBox[i]["init"]["datasetid"];
          responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);
          if (!responseRecord) {
            continue;
          }

          if (defSelectBox[i]["selectorid"]) {
            this.view.onShowSelectBox(defSelectBox[i], responseRecord["record"]);
          }
        }
      }

      $H.log("ControllerMixin onShowSelectBoxAll : end");
    },

    /**
     * チェックボックス表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defCheckBox - チェックボックス(単一)
     */
    onShowCheckBox: function (responseData, defCheckBox) {
      $H.log("ControllerMixin onShowCheckBox : start");
      //変数宣言
      let datasetID = null;
      let responseRecord = null;

      datasetID = defCheckBox["datasetid"];
      responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);

      if (responseRecord) {
        if (defCheckBox["selectorid"]) {
          this.view.onShowCheckBox(defCheckBox, responseRecord["record"]);
        }
      }

      $H.log("ControllerMixin onShowCheckBox : end");
    },

    /**
     * チェックボックス一括表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defCheckBox - チェックボックス(配列)
     */
    onShowCheckBoxAll: function (responseData, defCheckBox) {
      $H.log("ControllerMixin onShowCheckBoxAll : start");
      //変数宣言
      let max = 0;
      let datasetID = null;
      let responseRecord = null;

      max = defCheckBox.length;
      for (let i = 0; i < max; i++) {
        //初期化
        datasetID = null;
        responseRecord = null;
        //データ取得  
        datasetID = defCheckBox[i]["datasetid"];
        responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);
        if (!responseRecord) {
          continue;
        }

        if (defCheckBox[i]["selectorid"]) {
          this.view.onShowCheckBox(defCheckBox[i], responseRecord["record"]);
        }
      }

      $H.log("ControllerMixin onShowCheckBoxAll : end");
    },

    /**
     * テーブル  チェックボックス一括表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defCheckBox - チェックボックス(配列)
     */
    onShowCheckBoxAllTable: function (responseData, defCheckBox) {
      $H.log("ControllerMixin onShowCheckBoxAllTable : start");
      //変数宣言
      let max = 0;
      let datasetID = null;
      let responseRecord = null;

      max = defCheckBox.length;
      for (let i = 0; i < max; i++) {
        //初期化
        datasetID = null;
        responseRecord = null;
        //データ取得
        datasetID = defCheckBox[i]["datasetid"];
        responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);
        if (!responseRecord) {
          continue;
        }

        if (defCheckBox[i]["selectorname"]) {
          this.view.onShowCheckBoxTable(defCheckBox[i], responseRecord["record"]);
        }
      }

      $H.log("ControllerMixin onShowCheckBoxAllTable : end");
    },

    /**
     * ラジオボタン表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defRadioButton - ラジオボタン
     */
    onShowRadioButton: function (responseData, defRadioButton) {
      $H.log("ControllerMixin onShowRadioButton : start");
      //変数宣言
      let datasetID = null;
      let responseRecord = null;
      //データ取得
      datasetID = defRadioButton["datasetid"];
      responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);

      if (responseRecord) {
        if (defRadioButton["selectorname"]) {
          this.view.onShowRadioButton(defRadioButton, responseRecord["record"]);
        }
      }

      $H.log("ControllerMixin onShowRadioButton : end");
    },

    /**
     * ラジオボタン一括表示処理
     * @memberof ControllerMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} defRadioButton - ラジオボタン(配列)
     */
    onShowRadioButtonAll: function (responseData, defRadioButton) {
      $H.log("ControllerMixin onShowRadioButtonAll : start");
      //変数宣言
      let max = 0;
      let datasetID = null;
      let responseRecord = null;
      //データ取得
      max = defRadioButton.length;
      for (let i = 0; i < max; i++) {
        //初期化
        datasetID = null;
        responseRecord = null;
        //データ取得
        let datasetID = defRadioButton[i]["datasetid"];
        let responseRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, datasetID);
        if (!responseRecord) {
          continue;
        }

        if (defRadioButton[i]["selectorname"]) {
          this.view.onShowRadioButton(defRadioButton[i], responseRecord["record"]);
        }
      }

      $H.log("ControllerMixin onShowRadioButtonAll : end");
    },

    //★mod start 20260701 dialogclose廃止・ダイアログclose時はpreviousTransitionで前画面へ戻る方式に変更
    /**
     * 選択ダイアログを表示する<br>
     *
     * @memberof ControllerMixin
     * @param {object} requestData  - 選択リクエストデータ
     * @param {object} responseData - 選択レスポンスデータ
     * @param {number} row          - クリック行のindex
     */
    on選択ダイアログ表示: function (requestData, responseData, row) {
      $H.log("ControllerMixin on選択ダイアログ表示 : start");

      this.model.on選択画面ダイアログ表示(requestData, responseData, row, null);

      $H.log("ControllerMixin on選択ダイアログ表示 : end");
    }
    //★mod end 20260701
    //★add start 20260724 選択ダイアログiframe分離方式：選択結果を親画面へ反映する
    ,
    /**
     * 選択ダイアログ（iframe分離方式）からの戻り処理。<br>
     * iframe方式では親画面がフルページ再ロードされないため、従来 on初期処理 の選択画面戻り分岐が
     * 担っていた「on選択画面戻り→データセット反映→view反映→後処理関数呼出」を本メソッドで実行する。<br>
     * on選択画面戻り本体・sessionStorage契約は不変。呼び出しシグネチャも on初期処理 と同一。
     * @memberof ControllerMixin
     */
    on選択ダイアログ戻り: function () {
      $H.log("ControllerMixin on選択ダイアログ戻り : start");

      let arg = this.model.on選択画面戻り();

      // 選択画面戻り処理
      if (arg["status"] == "OK") {
        let dataSet = this.model.dataset.getData();
        this.view.on照会OfEditResponseData(dataSet, dataSet, "");

        if (arg["selected"] == "CANCEL") {
          // 選択画面で選択データなし
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
      }

      $H.log("ControllerMixin on選択ダイアログ戻り : end");
    }
    //★add end 20260724

  };
}(jQuery, Halu));
