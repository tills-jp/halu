/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 一覧照会(親子テーブル)パターン
 * モデルミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin MultiTableListFormModelMixin
   */
  App.MultiTableListFormModelMixin = {

    /**
     * データセットの値をクリアする
     * 
     * @memberof MultiTableListFormModelMixin
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
     * @memberof MultiTableListFormModelMixin
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
     * データセットを取得し、戻り値として返す
     * 
     * @memberof MultiTableListFormModelMixin
     * @param - なし
     * @returns {object} データセット
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
     * データセットをセッションストレージに保存し、戻り値として返す
     * 
     * @memberof MultiTableListFormModelMixin
     * @param - なし
     * @returns {object} データセット
     */
    on初期リロード前処理: function () {
      $H.log("Model on初期リロード前処理 : start");

      // データセットを設定する
      let dataSet = this.dataset.getData();

      // セッションストレージのデータをデータセットに保存する
      dataSet = this.setFromSessionStorageToDatasetOfKeyInfo(dataSet, this.appspec.sessionStorageHeaderKey);

      $H.log("Model on初期リロード前処理 : end");
      return dataSet;
    },

    /**
     * データセットとセッションストレージのヘッダ情報をクリアする<br>
     * 
     * @memberof MultiTableListFormModelMixin
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
     * クリックしたテーブルと行の情報を取得し、セッションストレージに保存する<br>
     *
     * @memberof MultiTableListFormModelMixin
     * @param {object} arg    - クリック行情報(datasetのindex、セレクタ名)
     * @param {string} status - 処理結果
     */
    onテーブル行クリック: function (arg) {
      $H.log("Model onテーブル行クリック : start");

      let clickRow = arg["クリック行"];

      // 2026-09-25 修正者：AI（C-075）
      // sessionStorageDetailKey が未定義／空配列の画面（遷移先を持たない照会専用一覧）は
      // 明細キーの保存対象が無いため、キー保存処理をスキップしてハイライトのみ行う
      if (!this.appspec.sessionStorageDetailKey || this.appspec.sessionStorageDetailKey.length === 0) {
        $H.log("Model onテーブル行クリック : end");
        return "OK";
      }

      // データセットを取得する
      let dataSet = this.dataset.getData();

      // データ有無の判定
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

      $H.log("Model onテーブル行クリック : end");
      return status;
    },

    /**
     * データセットからデータ件数およびページ情報を取得し、画面に表示する
     *
     * @memberof MultiTableListFormModelMixin
     * @param {object} arg - ページ情報（ページライン数、カレントページ、最大ページ、トータル件数）
     */
    onDeriveトータル件数: function (arg) {
      $H.log("Model onDeriveトータル件数 : start");

      let pageline = this.dataset.getElementData("ページライン数");
      let curpage = this.dataset.getElementData("カレントページ");
      let maxpage = this.dataset.getElementData("最大ページ");
      let totalcount = this.dataset.getElementData("トータル件数");
      if (totalcount == "") {
        totalcount = "0";
      }
      let targetArg = { ページライン数: pageline, カレントページ: curpage, 最大ページ: maxpage, トータル件数: totalcount };
      this.pubsub.publish("showページ情報", targetArg);

      $H.log("Model onDeriveトータル件数 : end");
    },

    /**
     * カレントページ情報を1ページ目に設定してセッションストレージに保存する<br>
     * クリック行情報を削除する<br>
     * 
     * @memberof MultiTableListFormModelMixin
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
     * カレントページ情報を1ページ前に設定し、クリック行情報をクリアする
     * 
     * @memberof MultiTableListFormModelMixin
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
     * カレントページ情報を1ページ次に設定し、クリック行情報を削除する
     * 
     * @memberof MultiTableListFormModelMixin
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
     * カレントページ情報を最後のページに設定し、クリック行情報を削除する
     * 
     * @memberof MultiTableListFormModelMixin
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
     * セッションストレージからカレントページ情報をデータセットへ保存する
     * 
     * @memberof MultiTableListFormModelMixin
     * @param - なし
     */
    onリロード: function () {
      $H.log("Model onリロード : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      let pageline = sessionStorage.loadItem("ページライン数");
      let pageno = sessionStorage.loadItem("カレントページ");

      this.dataset.setElementData(pageline, "ページライン数");
      this.dataset.setElementData(pageno, "カレントページ");

      $H.log("Model onリロード : end");
    },

    /**
     * 自画面と次画面のセッションストレージを保存する
     * 
     * @memberof MultiTableListFormModelMixin
     * @param - なし
     */
    clearセッション情報: function () {
      $H.log("Model clearセッション情報 : start");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.deleteAll("");

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.nextname);
      sessionStorage.deleteAll("");

      $H.log("Model clearセッション情報 : end");
    },

    /**
     * 次画面への引き渡しデータをチェックし、<br>
     * 自画面のキー定義情報および次画面への引き渡しデータをセッションストレージに保存して<br>
     * 画面遷移を行う<br>
     * 
     * @memberof MultiTableListFormModelMixin
     * @param {string} nextGui - 次画面名
     * @param {string} mode - 処理モード
     * @returns なし
     */
    on次画面表示: function (nextGui, mode) {
      $H.log("Model on次画面表示 : start");

      // 次画面への引き渡しデータをチェックする
      let arg = this.checkNextStorageData();
      if (arg["status"] != "OK") {
        this.pubsub.publish("alertDialog", arg);
        return;
      }

      // 自画面のキー定義情報をセッションストレージに保存する
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
     * セッションストレージにクリック行情報が保存されているかチェックする
     * 
     * @memberof MultiTableListFormModelMixin
     * @param - なし
     * @returns {boolean} チェック結果(true:行選択あり/false:行選択なし)
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
      * 初期処理のレスポンスデータをデータセットへ設定する
      * 
      * @memberof MultiTableListFormModelMixin
      * @param {object} responseData - レスポンスデータ
      * @param {string} mode - 処理モード
      * @returns {object} レスポンスデータ反映後のデータセット
      */
    on初期処理OfEditResponseData: function (responseData, mode) {
      $H.log("Model on初期処理OfEditResponseData : start");

      let dataSet = this.dataset.getData();
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on初期処理OfEditResponseData : end");
      return dataSet;
    },

    /**
      * 照会処理のレスポンスデータをデータセットへ設定する
      * 
      * @memberof MultiTableListFormModelMixin
      * @param {object} responseData - レスポンスデータ
      * @param {string} mode - 処理モード
      * @returns {object} レスポンスデータ反映後のデータセット
      */
    on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Model on照会OfEditResponseData : start");

      let dataSet = this.dataset.getData();
      this.setJsonRecordsToDataset(responseData, dataSet, this.pubsub);

      $H.log("Model on照会OfEditResponseData : end");
      return dataSet;
    }

  };
}(jQuery, Halu));
