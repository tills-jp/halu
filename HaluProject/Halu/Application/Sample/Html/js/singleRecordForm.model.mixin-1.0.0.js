/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 単票登録(単一テーブル)パターン
 * モデルミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin SingleRecordFormModelMixin
   */
  App.SingleRecordFormModelMixin = {

    /**
     * データセットの値をクリアする
     * 
     * @memberof SingleRecordFormModelMixin
     * @param - なし
     * @returns なし
     */
    initExecute: function () {
      $H.log("Model initExecute : start");

      let dataSet = this.dataset.getData();
      this.clearDatasetJson(dataSet);

      $H.log("Model initExecute : end");
    },

    /**
     * セッションストレージからログイン情報を取得し、データセットへ保存する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param - なし
     * @returns {object} ユーザ名称、ログイン時刻、ログイン和暦
     */
    getログイン情報: function () {
      $H.log("Model getログイン情報 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + ".Login");

      let username = sessionStorage.loadItem("ユーザ名称");
      let datetime = sessionStorage.loadItem("ログイン時刻");
      let jdate = sessionStorage.loadItem("ログイン和暦");
      let arg = { ユーザ名称: username, ログイン時刻: datetime, ログイン和暦: jdate };

      // ログイン情報をログインレコードに設定する
      let dataSet = this.dataset.getData();
      let loginRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "login");
      if (loginRecord) {
        loginRecord["record"]["ユーザＩＤ"]["value"][0] = sessionStorage.loadItem("ユーザＩＤ");
        loginRecord["record"]["ユーザ名称"]["value"][0] = sessionStorage.loadItem("ユーザ名称");
      }

      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      $H.log("Model getログイン情報 : end");
      return arg;
    },

    /**
     * 前画面からの情報を取得する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param - なし
     * @returns {object} 前画面情報(処理モード、前画面名、データセット)
     */
    on初期処理: function () {
      $H.log("Model on初期処理 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      let mode = sessionStorage.loadItem("処理モード");
      let beforeHtmlName = this.getBeforeHtmlName();

      let arg = { 処理モード: mode, 前画面名: beforeHtmlName };
      this.pubsub.publish("showヘッダータイトル", arg);

      let dataSet = this.dataset.getData();
      arg["データセット"] = dataSet;

      $H.log("Model on初期処理 : end");
      return arg;
    },

    /**
     * 自画面のセッションストレージをクリアする
     * 
     * @memberof SingleRecordFormModelMixin
     * @param - なし
     */
    clearセッション情報: function () {
      $H.log("Model clearセッション情報 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.deleteAll("");

      $H.log("Model clearセッション情報 : end");
    },

    /**
     * 処理モードを切替え、初期処理を実行する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {event} event - イベント情報
     * @return なし
     */
    onChangeモード切替: function (event) {
      $H.log("Model onChangeモード切替 : start");

      let w_モード = $("#モード切替").val();
      if (w_モード == "init") {
        $H.log("Model onChangeモード切替 : end");
        return;
      }

      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("処理モード", w_モード);
      this.on初期処理();
      $("#モード切替").val("init");

      $H.log("Model onChangeモード切替 : end");
    },

    /**
     * データセット(detail)の指定位置に空行を挿入する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {int} row  - 行追加位置
     * @returns {object} 行追加後のデータセット
     */
    on行追加クリック: function (row) {
      $H.log("Model on行追加クリック : start");

      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail");
      this.insertRowOfDetailRecord(detailRecord, row);

      $H.log("Model on行追加クリック : end");
      return dataSet;
    },

    /**
     * クリックした行の情報をセッションストレージに保存する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} arg   - クリック行情報(datasetのindex、セレクタ名)
     */
    onテーブル行クリック: function (arg) {
      $H.log("Model onテーブル行クリック : start");

      let clickRow = arg["クリック行"];

      // データセットを取得する
      let dataSet = this.dataset.getData();

      // C-071: 2026-09-24 修正者：AI
      // 空行（画面明細キー定義の項目がすべて空）のクリックでは選択状態にしない
      // （multiTableListForm.model.mixinの空行ガードを踏襲。従来は無条件で保存していた）
      let datasetID = this.appspec.sessionStorageDetailKey[0]["datasetid"];
      let datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
      let maxSize = this.appspec.sessionStorageDetailKey[0]["dataname"].length;
      let status = "ERROR";
      for (let i = 0; i < maxSize; i++) {
        let itemName = this.appspec.sessionStorageDetailKey[0]["dataname"][i]
        if (datasetRecord[itemName]["value"][clickRow] != "") {
          status = "OK";
          break;
        }
      }

      if (status != "OK") {
        $H.log("Model onテーブル行クリック : end");
        return status;
      }

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // 画面明細キー定義情報をセッションストレージに保存する
      for (let i = 0; i < maxSize; i++) {
        let itemName = this.appspec.sessionStorageDetailKey[0]["dataname"][i]
        sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][clickRow]);
      }

      sessionStorage.saveItem("クリック行", clickRow);

      $H.log("Model onテーブル行クリック : end");
      return status;
    },

    /**
     * 次画面への引き渡しデータをチェックし、<br>
     * 自画面のキー定義情報および次画面への引き渡しデータをセッションストレージに保存して<br>
     * 画面遷移を行う<br>
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {string} nextGui - 次画面名
     * @param {string} mode - 処理モード
     */
    on次画面表示: function (nextGui, mode) {
      $H.log("Model on次画面表示 : start");

      // 次画面への引き渡しデータをチェックする
      let arg = this.checkNextStorageData();
      if (arg["status"] != "OK") {
        this.pubsub.publish("alertDialog", arg);
        return;
      }

      // 自画面のセッションストレージを保存する
      this.saveSessionStorage();

      // 次画面への引き渡しデータを設定する
      this.setNextStorageData(nextGui);

      let currName = this.appspec.urlInfo[0]["app"];
      let nextArray = currName.split("/");
      nextArray[3] = nextGui;
      let nextName = nextArray.join("/");

      this.setTransitionData(currName.slice(0, -1));
      this.postHtmlTransition(nextName.slice(0, -1));

      $H.log("Model on次画面表示 : end");
    },

    /**
     *  データセットから照会リクエストデータを作成する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     * 
     */
    on照会OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on照会OfCheckRequestData : start");

      let status = this.on訂正OfCheckRequestData(requestData, mode);

      $H.log("Model on照会OfCheckRequestData : end");
      return status;
    },
    
    /**
     *  データセットから登録リクエストデータを作成する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     */
    on登録OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on登録OfCheckRequestData : start");

      let status = this.on訂正OfCheckRequestData(requestData, mode);

      $H.log("Model on登録OfCheckRequestData : end");
      return status;
    },
    
    /**
     *  データセットから訂正リクエストデータを作成する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     * 
     */
    on訂正OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on訂正OfCheckRequestData : start");

      // データセットからリクエストにデータを設定する
      let dataSet = this.dataset.getData();
      //this.setDatasetToJsonRecordsInDeleteLine(dataSet, requestData);    // 削除行をリクエストデータに出力する
      this.setDatasetToJsonRecordsNoDeleteLine(dataSet, requestData);    // 削除行をリクエストデータに出力しない

      $H.log("Model on訂正OfCheckRequestData : end");
      return true;
    },

    /**
     *  データセットから削除リクエストデータを作成する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} requestData - リクエストデータ
     * @param {object} mode - 処理モード
     * @returns {object} チェック結果
     * 
     */
    on削除OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on削除OfCheckRequestData : start");

      let status = this.on訂正OfCheckRequestData(requestData, mode);

      $H.log("Model on削除OfCheckRequestData : end");
      return true;
    },

    /**
     * 初期処理実行後、レスポンスデータをデータセットへ設定する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     * @returns {object} レスポンスデータ反映後のデータセット
     */
    on初期処理OfEditResponseData: function (responseData) {
      $H.log("Model on初期処理OfEditResponseData : start");

      let dataSet = this.dataset.getData();
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on初期処理OfEditResponseData : end");
      return dataSet;
    },
    
    /**
     * 照会処理実行後、レスポンスデータをデータセットへ設定する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     * @param {string} mode - 処理モード
     * @returns {object} レスポンスデータ反映後のデータセット
     */
    on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Model on照会OfEditResponseData : start");

      // データセットの明細デフォルト行数を取得
      let dataSet = this.dataset.getData();
      let detailInfo = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail");

      if (detailInfo === undefined) {
      }
      else {
        let defaultline = detailInfo["defaultline"];

        // レスポンスの明細行数を取得
        let detailRecord = this.appspec.getJSONChunkByIdAtRecords(responseData, "detail")["record"];
        let maxSize = 0;
        for (let name in detailRecord) {
          maxSize = detailRecord[name]["value"].length
          break;
        }

        // レスポンスの明細行数が大きいとき、データセットの明細デフォルト行数とする
        if (maxSize > defaultline) {
          detailInfo["defaultline"] = maxSize;
        }
      }

      // レスポンスデータをデータセットにセットする
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on照会OfEditResponseData : end");
      return dataSet;
    },
    /**
     * 登録処理実行後、レスポンスデータをデータセットへ設定する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns {object} レスポンスデータ反映後のデータセット
     * 
     */
    on登録OfEditResponseData: function (responseData, mode) {
      $H.log("Model on登録OfEditResponseData : start");

      let dataSet = this.on照会OfEditResponseData(responseData, mode);

      $H.log("Model on登録OfEditResponseData : end");
      return dataSet;
    },
    
    /**
     * 訂正処理実行後、レスポンスデータをデータセットへ設定する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns {object} レスポンスデータ反映後のデータセット
     */
    on訂正OfEditResponseData: function (responseData, mode) {
      $H.log("Model on訂正OfEditResponseData : start");

      let dataSet = this.on照会OfEditResponseData(responseData, mode);

      $H.log("Model on訂正OfEditResponseData : end");
      return dataSet;
    },

    /**
     * 削除処理実行後、レスポンスデータをデータセットへ設定する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     * @returns {object} レスポンスデータ反映後のデータセット
     */
    on削除OfEditResponseData: function (responseData, mode) {
      $H.log("Model on削除OfEditResponseData : start");

      let dataSet = this.on照会OfEditResponseData(responseData, mode);

      $H.log("Model on削除OfEditResponseData : end");
      return dataSet;
    },

    /**
     * サーバー処理確認ダイアログを表示する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} responseData - レスポンスデータ
     */
    onサーバ処理確認ダイアログ: function (responseData) {
      $H.log("Model onサーバ処理確認ダイアログ : start");

      let status = responseData["message"]["status"];
      let msg = responseData["message"]["msg"];
      let arg = { title: "サーバ処理確認", status: status, message: msg };
      this.pubsub.publish("serverDialog", arg);

      $H.log("Model onサーバ処理確認ダイアログ : end");
    },

    /**
     * 入力エラー確認ダイアログを表示する
     * 
     * @memberof SingleRecordFormModelMixin
     * @param {object} message - レスポンスデータ
     */
    on入力エラー確認ダイアログ: function (message) {
      $H.log("Model on入力エラー確認ダイアログ : start");

      let status = message["status"];
      let msg = message["message"];
      let arg = { title: "入力エラー確認", status: status, message: msg };
      this.pubsub.publish("alertDialog", arg);

      $H.log("Model on入力エラー確認ダイアログ : end");
    }

  };
}(jQuery, Halu));
