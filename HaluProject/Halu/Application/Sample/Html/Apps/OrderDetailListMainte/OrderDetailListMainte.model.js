/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.OrderDetailListMainte;

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

  // マスターメンテパターンミックスインを追加する
  Model.include($H.Library.SingleRecordFormModelMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Model.include({
    // ------------------------------------------------------
    // 商品選択チェック（C-044）
    // ------------------------------------------------------
    /**
     * 商品が選択されていない入力行を検出する
     *
     * 商品ＩＤはvalidation.jsonでもrequiredにしているが、サーバー側チェックだと
     * 内部項目名の「商品ＩＤ」がそのままメッセージに出て利用者に伝わらないため、
     * 画面側で先に検出して業務語のメッセージを出す（C-023と同じ方針）。
     * 削除チェック行と全項目未入力の行は対象外。
     * @returns {number} 商品未選択の行番号（1起点。該当なしは0）
     */
    get商品未選択行: function () {
      $H.log("Model get商品未選択行 : start");

      var dataSet = this.dataset.getData();
      var detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      // 「削除」は既定値を持つため入力有無の判定対象に含めない
      var 入力項目 = ["商品名称", "受注数量", "受注単価", "受注金額", "納期日", "備考"];
      var maxSize = detailRecord["商品ＩＤ"]["value"].length;

      for (var i = 0; i < maxSize; i++) {
        if (detailRecord["削除"]["value"][i] == "9") continue;
        if (detailRecord["商品ＩＤ"]["value"][i] != "") continue;
        for (var j = 0; j < 入力項目.length; j++) {
          if (detailRecord[入力項目[j]]["value"][i] != "") {
            $H.log("Model get商品未選択行 : end row = " + (i + 1));
            return i + 1;
          }
        }
      }

      $H.log("Model get商品未選択行 : end (none)");
      return 0;
    }
    // ------------------------------------------------------
    // 導出項目編集用カスタムイベント処理
    // ------------------------------------------------------
    , calc受注金額: function (arg) {
      $H.log("Model calc受注金額 : start");

      var row = arg["row"];
      var dataSet = this.dataset.getData();
      var detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      var w_数量 = detailRecord["受注数量"]["value"][row];
      var w_単価 = detailRecord["受注単価"]["value"][row];
      var w_金額 = w_数量 * w_単価;
      detailRecord["受注金額"]["value"][row] = w_金額;

      var arg1 = {};
      arg1["受注金額"] = w_金額;
      arg1["row"] = row;
      arg1["status"] = "OK";

      $H.log("Model calc受注金額 : end");
      return arg1;
    }
    , calc合計金額: function () {
      $H.log("Model calc合計金額 : start");

      var dataSet = this.dataset.getData();
      var detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      var headerRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "header")["record"];

      var maxSize = detailRecord["受注金額"]["value"].length;
      var w_合計金額 = 0;
      for (var i = 0; i < maxSize; i++) {
        if (detailRecord["削除"]["value"][i] == "9") {
          continue;
        }
        var tmp = detailRecord["受注金額"]["value"][i];
        w_合計金額 = new BigNumber(w_合計金額).plus(Number(tmp)).toPrecision();
      }
      var arg1 = {};
      arg1["合計金額"] = w_合計金額;
      arg1["status"] = "OK";
      headerRecord["合計金額"]["value"][0] = w_合計金額;

      $H.log("Model calc合計金額 : end");
      return arg1;
    }
    // ------------------------------------------------------------------------
    //  リクエストデータ編集・チェック処理
    // ------------------------------------------------------------------------
    , on訂正OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on訂正OfCheckRequestData : start");

      // データセットからリクエストにデータを設定する
      var dataSet = this.dataset.getData();
      this.setDatasetToJsonRecordsInDeleteLine(dataSet, requestData);    // 削除行をリクエストデータに出力する
      // this.setDatasetToJsonRecordsNoDeleteLine(dataSet, requestData);    // 削除行をリクエストデータに出力しない

      $H.log("Model on訂正OfCheckRequestData : end");
      return true;
    }
    // ------------------------------------------------------------------------
    //  レスポンスデータ編集処理（照会・訂正共通。パターンの訂正はここを経由する）
    // ------------------------------------------------------------------------
    /**
     * レスポンスをデータセットへ反映した後、ヘッダの合計金額をサーバー値で確定する
     *
     * 応答→データセットのコピー中（setJsonValueToDatasetValue）に受注数量・受注単価の
     * derive が発火し calc合計金額 が走るが、その時点の受注金額は旧値のまま・削除は
     * クリア済みのため、削除で行が減ると旧末尾行の金額まで合算してヘッダを上書きする。
     * @param {object} responseData - レスポンスデータ
     * @param {string} mode - 処理モード
     * @returns {object} レスポンスデータ反映後のデータセット
     */
    , on照会OfEditResponseData: function (responseData, mode) {
      $H.log("Model on照会OfEditResponseData(OrderDetailListMainte) : start");

      var dataSet = $H.Library.SingleRecordFormModelMixin.on照会OfEditResponseData.call(this, responseData, mode);

      // C-072: コピー中の derive で上書きされた合計金額を、再照会したヘッダの値（DB値）へ戻す
      var responseHeader = this.appspec.getJSONChunkByIdAtRecords(responseData, "header");
      if (responseHeader && responseHeader["record"]["合計金額"] !== undefined) {
        var headerRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "header")["record"];
        headerRecord["合計金額"]["value"][0] = responseHeader["record"]["合計金額"]["value"][0];
      }

      $H.log("Model on照会OfEditResponseData(OrderDetailListMainte) : end");
      return dataSet;
    }

  });
  App.Model = Model;
}(jQuery, Halu));