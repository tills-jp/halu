/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.CustomerListMainte;

  // インスタンスプロパティを追加する
  class Model extends $H.Model {
    constructor(appspec) {
      $H.log("Model init : start");
      super();
      this.appspec = appspec;

      $H.log("Model init : end");
    }
  }
  // 共通モジュールを追加する
  Model.include($H.Library.ValidationMixin);
  Model.include($H.Library.ModelMixin);
  Model.include($H.Library.HtmlTransitionMixin);

  // 基本名称メンテパターンミックスインを追加する
  Model.include($H.Library.SingleTableListFormModelMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Model.include({

    /**
     * 全選択トグル（C-011）
     * 顧客ＩＤが入っている行の削除チェック値を一括で'9'に設定する。
     * 対象行が全て'9'の場合は'0'へ戻す（トグル）
     * @returns {object} { rows: 対象行indexの配列, value: 設定した値（'9'/'0'） }
     */
    on全選択: function () {
      $H.log("Model on全選択 : start");

      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      let idValues = detailRecord["顧客ＩＤ"]["value"];
      let delValues = detailRecord["削除"]["value"];

      let rows = [];
      let allChecked = true;
      for (let i = 0; i < idValues.length; i++) {
        if (idValues[i] == "") continue;
        rows.push(i);
        if (delValues[i] != "9") allChecked = false;
      }

      let value = allChecked ? "0" : "9";
      for (let i = 0; i < rows.length; i++) {
        delValues[rows[i]] = value;
      }

      $H.log("Model on全選択 : end");
      return { rows: rows, value: value };
    },

    /**
     * 削除チェックの付いた行（顧客ＩＤあり）が存在するか（C-012）
     * @returns {boolean}
     */
    hasDeleteCheckedRow: function () {
      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      let idValues = detailRecord["顧客ＩＤ"]["value"];
      let delValues = detailRecord["削除"]["value"];
      for (let i = 0; i < idValues.length; i++) {
        if (idValues[i] != "" && delValues[i] == "9") return true;
      }
      return false;
    },

    /**
     * 実行前のリクエスト設定（C-012）: パターン処理（空行除外コピー）の後、
     * execKindに応じてリクエストのdetail行を絞り込む。
     * register（登録）=削除チェック'9'の行を除外／delete（削除）='9'の行のみ
     * @param {Object} requestData - リクエストデータ
     * @param {String} mode        - 処理モード
     * @returns {boolean} 設定結果
     */
    on実行OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on実行OfCheckRequestData(CustomerListMainte) : start");

      // パターンと同じ空行除外コピー
      let dataSet = this.dataset.getData();
      this.setDatasetToJsonRecordsInDeleteLine(dataSet, requestData);

      // 照会（select）等、detailレコードを持たないリクエストは絞り込み対象外
      // （パターンのon照会OfCheckRequestDataが本関数を呼ぶため必須のガード）
      let detailChunk = this.appspec.getJSONChunkByIdAtRecords(requestData, "detail");
      if (!detailChunk || mode != "execute") {
        $H.log("Model on実行OfCheckRequestData(CustomerListMainte) : end (no filter)");
        return true;
      }

      // execKindによる行絞り込み
      let kind = this.execKind || "register";
      let requestRecord = detailChunk["record"];
      let delValues = requestRecord["削除"]["value"];
      let keep = [];
      for (let i = 0; i < delValues.length; i++) {
        let checked = (delValues[i] == "9");
        if ((kind == "delete") == checked) keep.push(i);
      }
      for (let name in requestRecord) {
        let values = requestRecord[name]["value"];
        let filtered = [];
        for (let k = 0; k < keep.length; k++) {
          filtered.push(values[keep[k]]);
        }
        if (filtered.length == 0) filtered = [""];
        requestRecord[name]["value"] = filtered;
      }

      $H.log("Model on実行OfCheckRequestData(CustomerListMainte) : end");
      return true;
    },

  });
  App.Model = Model;
}(jQuery, Halu));