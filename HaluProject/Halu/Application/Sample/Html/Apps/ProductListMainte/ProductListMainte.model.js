/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.ProductListMainte;

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

  // 一覧登録（単一テーブル）パターンミックスインを追加する
  Model.include($H.Library.SingleTableListFormModelMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Model.include({

    /**
     * 全選択トグル（CustomerListMainte C-011の既定を踏襲）
     * 商品ＩＤが入っている行の削除チェック値を一括で'9'に設定する。
     * 対象行が全て'9'の場合は'0'へ戻す（トグル）
     * @returns {object} { rows: 対象行indexの配列, value: 設定した値（'9'/'0'） }
     */
    on全選択: function () {
      $H.log("Model on全選択 : start");

      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      let idValues = detailRecord["商品ＩＤ"]["value"];
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
     * 削除チェックの付いた行（商品ＩＤあり）が存在するか
     * @returns {boolean}
     */
    hasDeleteCheckedRow: function () {
      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      let idValues = detailRecord["商品ＩＤ"]["value"];
      let delValues = detailRecord["削除"]["value"];
      for (let i = 0; i < idValues.length; i++) {
        if (idValues[i] != "" && delValues[i] == "9") return true;
      }
      return false;
    },

    /**
     * 一覧内での商品コード重複を検出する（REQ-007）
     * 商品コードはUNIQUE制約（削除フラグ='0'の部分索引）で守られているが、
     * DB側で弾くとメッセージが汎用文言になるため、画面内で先に検出して
     * 分かりやすいメッセージを出す。削除チェック行と空行は対象外。
     * @returns {string} 重複していた商品コード（重複なしは空文字）
     */
    getDuplicateProductCode: function () {
      let dataSet = this.dataset.getData();
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      let codeValues = detailRecord["商品コード"]["value"];
      let delValues = detailRecord["削除"]["value"];

      let seen = {};
      for (let i = 0; i < codeValues.length; i++) {
        let code = codeValues[i];
        if (code == "") continue;
        if (delValues[i] == "9") continue;
        if (seen[code]) return code;
        seen[code] = true;
      }
      return "";
    },

    /**
     * 実行前のリクエスト設定（CustomerListMainte C-012の既定を踏襲）:
     * パターン処理（空行除外コピー）の後、execKindに応じてリクエストのdetail行を絞り込む。
     * register（登録）=削除チェック'9'の行を除外／delete（削除）='9'の行のみ
     *
     * ※ mode == "execute" のガードは必須（C-026）。
     *   SingleTableListFormModelMixinのon照会OfCheckRequestDataが本関数へ委譲するため、
     *   ガードが無いとselect（照会）時にも絞り込みが走り初期照会が沈黙する。
     * @param {Object} requestData - リクエストデータ
     * @param {String} mode        - 処理モード
     * @returns {boolean} 設定結果
     */
    on実行OfCheckRequestData: function (requestData, mode) {
      $H.log("Model on実行OfCheckRequestData(ProductListMainte) : start");

      // パターンと同じ空行除外コピー
      let dataSet = this.dataset.getData();
      this.setDatasetToJsonRecordsInDeleteLine(dataSet, requestData);

      // 照会（select）等、detailレコードを持たないリクエストは絞り込み対象外
      let detailChunk = this.appspec.getJSONChunkByIdAtRecords(requestData, "detail");
      if (!detailChunk || mode != "execute") {
        $H.log("Model on実行OfCheckRequestData(ProductListMainte) : end (no filter)");
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

      $H.log("Model on実行OfCheckRequestData(ProductListMainte) : end");
      return true;
    },

  });
  App.Model = Model;
}(jQuery, Halu));
