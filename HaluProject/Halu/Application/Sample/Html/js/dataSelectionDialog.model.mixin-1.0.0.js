/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * データ選択ダイアログパターン 
 * モデルミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin DataSelectionDialogModelMixin
   */
  App.DataSelectionDialogModelMixin = {

    /**
     * データセットを取得し、値をクリアする
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     */
    initExecute: function () {
      $H.log("Model initExecute : start");

      let dataSet = this.dataset.getData();
      this.clearDatasetJson(dataSet);

      $H.log("Model initExecute : end");
    },

    /**
     * セッションストレージからログイン情報を取得し、データセットへ設定する
     * 
     * @memberof DataSelectionDialogModelMixin
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

      // ログイン情報をログインレコードに保存する
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
     * データセットを取得する
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     * @returns {object} 画面情報(データセット)
     */
    on初期処理: function () {
      $H.log("Model on初期処理 : start");

      let arg = {};
      let dataSet = this.dataset.getData();
      arg["データセット"] = dataSet;

      $H.log("Model on初期処理 : end");
      return arg;
    },

    /**
     * セッションストレージとデータセットに入っている画面ヘッダー情報をクリアする
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     * @returns {object} データセット
     */
    onクリア: function () {
      $H.log("Model onクリア : start");

      // データセットを設定する
      let dataSet = this.dataset.getData();

      this.clearSessionStorageOfKeyInfo(this.appspec.sessionStorageHeaderKey);
      this.setFromSessionStorageToDatasetOfKeyInfo(dataSet, this.appspec.sessionStorageHeaderKey);

      $H.log("Model onクリア : end");
      return dataSet;
    },

    /**
     * データセットを取得し、セッションストレージ(画面明細キー定義)へ保存する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} arg - 画面情報（クリック行のindex）
     */
    onテーブル行クリック: function (arg) {
      $H.log("Model onテーブル行クリック : start");

      let clickRow = arg["クリック行"];

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // データセットを取得する
      let dataSet = this.dataset.getData();

      // 画面明細キー定義情報をセッションストレージに保存する
      let datasetID = this.appspec.sessionStorageDetailKey[0]["datasetid"];
      let datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
      let maxSize = this.appspec.sessionStorageDetailKey[0]["dataname"].length;
      for (let i = 0; i < maxSize; i++) {
        let itemName = this.appspec.sessionStorageDetailKey[0]["dataname"][i]
        sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][clickRow]);
      }

      $H.log("Model onテーブル行クリック : end");
    },
    /**
     * ★ ダイアログ用
     * データセットからデータ件数およびページ情報を取得し、画面に表示する
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} arg - ページ情報（ページライン数、カレントページ、最大ページ、トータル件数）
     */
    onDeriveトータル件数Dialog: function (arg) {
      $H.log("Model onDeriveトータル件数Dialog : start");

      let pageline = this.dataset.getElementData("ページライン数");
      let curpage = this.dataset.getElementData("カレントページ");
      let maxpage = this.dataset.getElementData("最大ページ");
      let totalcount = this.dataset.getElementData("トータル件数");
      if (totalcount == "") {
        totalcount = "0";
      }
      let targetArg = { ページライン数Dialog: pageline, カレントページDialog: curpage, 最大ページDialog: maxpage, トータル件数Dialog: totalcount };
      this.pubsub.publish("showページ情報Dialog", targetArg);

      $H.log("Model onDeriveトータル件数Dialog : end");
    },
    /**
     * データセットから現在ページ情報を取得し、<br>
     * 最初のページが表示できるようにページ情報をセッションストレージ・データセットへ保存する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     */
    on最初のページ: function () {
      $H.log("Model on最初のページ : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let dataset = this.dataset.getData();
      let detailInfo = this.appspec.getJSONChunkByIdAtRecords(dataset, "detail");
      let pageline = detailInfo["defaultline"];
      sessionStorage.saveItem("ページライン数", pageline);
      sessionStorage.saveItem("カレントページ", 1);
      sessionStorage.deleteItem("クリック行");

      this.dataset.setElementData(pageline, "ページライン数");
      this.dataset.setElementData(1, "カレントページ");

      $H.log("Model on最初のページ : end");
    },

    /**
     * データセットから現在ページ情報を取得し、<br>
     * 前のページが表示できるようにページ情報をセッションストレージ・データセットへ保存する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     */
    on前のページ: function () {
      $H.log("Model on前のページ : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let pageline = sessionStorage.loadItem("ページライン数");
      this.dataset.setElementData(pageline, "ページライン数");

      let pageno = parseInt(sessionStorage.loadItem("カレントページ"));
      pageno = pageno - 1;
      if (pageno < 1) {
        pageno = 1;
      }
      sessionStorage.saveItem("カレントページ", pageno);
      sessionStorage.deleteItem("クリック行");

      this.dataset.setElementData(pageno, "カレントページ");

      $H.log("Model on前のページ : end");
    },

    /**
     * データセットから現在ページ情報を取得し、<br>
     * 次のページが表示できるようにページ情報をセッションストレージ・データセットへ保存する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     */
    on次のページ: function () {
      $H.log("Model on次のページ : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let pageline = sessionStorage.loadItem("ページライン数");
      this.dataset.setElementData(pageline, "ページライン数");

      let maxpage = parseInt(this.dataset.getElementData("最大ページ"));
      let pageno = parseInt(sessionStorage.loadItem("カレントページ"));
      pageno = pageno + 1;
      if (pageno > maxpage) {
        pageno = maxpage;
      }
      sessionStorage.saveItem("カレントページ", pageno);
      sessionStorage.deleteItem("クリック行");

      this.dataset.setElementData(pageno, "カレントページ");

      $H.log("Model on次のページ : end");
    },

    /**
     * データセットから現在ページ情報を取得し、<br>
     * 最後のページが表示できるようにページ情報をセッションストレージ・データセットへ保存する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     */
    on最後のページ: function () {
      $H.log("Model on最後のページ : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let pageline = sessionStorage.loadItem("ページライン数");
      this.dataset.setElementData(pageline, "ページライン数");

      let pageno = this.dataset.getElementData("最大ページ");
      sessionStorage.saveItem("カレントページ", pageno);
      sessionStorage.deleteItem("クリック行");

      this.dataset.setElementData(pageno, "カレントページ");

      $H.log("Model on最後のページ : end");
    },

    /**
     * 自画面のセッションストレージをクリアする
     * 
     * @memberof DataSelectionDialogModelMixin
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
     * セッションストレージからクリック行を取得できるかどうかをチェックし、<br>
     * 取得できない場合はエラーダイアログを表示する<br>
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param - なし
     * @returns チェック結果(true:行選択あり/false:行選択なし)
     */
    check行選択: function () {
      $H.log("Model check行選択 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let value = sessionStorage.loadItem("クリック行");
      if (value) return true;

      let arg = {};
      arg["title"] = "選択エラー";
      arg["status"] = "ERROR";
      arg["message"] = "行が選択されていません。選択して下さい。";
      this.pubsub.publish("alertDialog", arg);

      $H.log("Model check行選択 : end");
      return false;
    },

    /**
     * 初期処理実行後、レスポンスデータからデータセットへ設定を行う
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} responseData - レスポンスデータ
     * @returns {Object} データセット
     */
    on初期処理OfEditResponseData: function (responseData) {
      $H.log("Model on初期処理OfEditResponseData : start");

      let dataSet = this.dataset.getData();
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on初期処理OfEditResponseData : end");
      return dataSet;
    },

    /**
     * 照会処理実行後、レスポンスデータからデータセットへ設定を行う
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} responseData - レスポンスデータ
     * @param {string} mode - 照会モード
     * @returns {Object} データセット
     */
    on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Model on照会OfEditResponseData : start");

      let dataSet = this.dataset.getData();
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on照会OfEditResponseData : end");
      return dataSet;
    },

    /**
     * サーバー処理確認ダイアログを表示する
     * 
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} responseData - レスポンスデータ
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
     * イベント名を "derive{name}Dialog" に変更し、親画面の "deriveトータル件数" との衝突を防ぐ
     * @memberof DataSelectionDialogModelMixin
     * @param {Object} pubsub - PubSubオブジェクト
     * @param {string} name - データ名
     * @param {string} value - データ値
     * @param {number} index - 行番号
     */
    deriveJsonValueToDatasetValue: function (pubsub, name, value, index) {
      if (pubsub === undefined) return;

      let objArray = $("." + name);
      let eventname = "derive" + name + "Dialog";

      if (pubsub.isEvent(eventname)) {
        let target = objArray[index];
        let arg = { target: target, value: value, row: index, name: name };
        pubsub.publish(eventname, arg);
      }
    }
  };
}(jQuery, Halu));
