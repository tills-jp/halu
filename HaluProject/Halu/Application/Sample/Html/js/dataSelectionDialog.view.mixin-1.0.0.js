/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * データ選択ダイアログパターン 
 * ビューミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin DataSelectionDialogViewMixin
   */
  App.DataSelectionDialogViewMixin = {

    /**
     * CSSの適用と各種ダイアログの初期処理を実施する
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {object} dataset - データセット
     */
    initExecute: function (dataset) {
      $H.log("View initExecute : start");

      this.initテンプレートロード();
      this.initAlertDialog();        // 警告メッセージ用ダイアログ 初期処理
      this.initConfirmDialog(this);  // 確認メッセージ用ダイアログ 初期処理
      this.initExecuteDialog(this);  // 実行確認メッセージ用ダイアログ 初期処理
      this.initServerDialog(this);   // サーバ確認メッセージ用ダイアログ 初期処理

      $H.log("View initExecute : end");
    },

    /**
     * CSSファイル名をセッションストレージから取得し、現在の画面に適用する
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param - なし
     */
    initテンプレートロード: function () {
      $H.log("View initテンプレートロード : start");

      // ＣＳＳファイル名をセッションストレージから取得しロードする
      sessionStorage.setIdName(this.appspec.sysname + ".Login");
      let cssName = sessionStorage.loadItem("ＣＳＳファイル名");

      if (cssName) {
        let arg = { cssName: cssName };
        this.appendCSS(arg);
      }

      $H.log("View initテンプレートロード : end");
    },

    /**
     * ページヘッダー部にあるログイン情報を表示する
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} arg - 画面情報(ログイン情報)
     */
    setログイン情報: function (arg) {
      $H.log("View setログイン情報 : start");

      // 後方互換: halu-ds-id="login"+halu-ds-field で要素を特定（なければ #id で検索）
      let $氏名 = $("[halu-ds-id='login'][halu-ds-field='ユーザ氏名']");
      if (!$氏名.length) $氏名 = $("#ユーザ氏名");
      $氏名.html(arg["ユーザ名称"]);

      let $日時 = $("[halu-ds-id='login'][halu-ds-field='ログイン日時']");
      if (!$日時.length) $日時 = $("#ログイン日時");
      $日時.html(arg["ログイン時刻"]);

      if (arg["ログイン和暦"] != "") {
        let $和暦 = $("[halu-ds-id='login'][halu-ds-field='ログイン和暦']");
        if (!$和暦.length) $和暦 = $("#ログイン和暦");
        $和暦.html(arg["ログイン和暦"]);
      }

      $H.log("View setログイン情報 : end");
    },

    /**
     * 初期処理実行時、データセットがない場合はテーブルの空行を作成する
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} arg - 画面情報(データセット)
     */
    on初期処理: function (arg) {
      $H.log("View on初期処理 : start");

      let dataSet = arg["データセット"];

      // テーブルの空行を作成する
      let detailInfo = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail");
      if (detailInfo === undefined) {
      }
      else {
        if (detailInfo["multiline"] == "yes") {
          this.resetJsonDataToTable("#dialogTable", dataSet, "detail");
        }
      }

      $H.log("View on初期処理 : end");
    },

    /**
     * ページ情報を取得し、画面表示とボタンの活性/非活性制御をする
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} arg - 画面情報(ページ情報)
     */
    showページ情報Dialog: function (arg) {
      $H.log("View showページ情報Dialog : start");

      let pageline = arg["ページライン数Dialog"];
      let curpage = arg["カレントページDialog"];
      let maxpage = arg["最大ページDialog"];
      let totalcount = arg["トータル件数Dialog"];
      let pagedata = curpage + "/" + maxpage + "ページ(" + totalcount + "件)";
      $("#dialogForm input[name='ページ情報Dialog']").val(pagedata);
      $("#dialogForm input[name='ページ情報Dialog']").attr("disabled", "disabled");

      $("#最初のページDialog").removeAttr("disabled");
      $("#前のページDialog").removeAttr("disabled");
      $("#次のページDialog").removeAttr("disabled");
      $("#最後のページDialog").removeAttr("disabled");
      if (curpage == 1) {
        $("#最初のページDialog").attr("disabled", "disabled");
        $("#前のページDialog").attr("disabled", "disabled");
      }
      if (curpage == maxpage) {
        $("#最後のページDialog").attr("disabled", "disabled");
        $("#次のページDialog").attr("disabled", "disabled");
      }

      $H.log("View showページ情報Dialog : end");
    },

    /**
     * 検索項目をクリアする
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} arg - 画面情報
     */
    onクリア: function (dataSet) {
      $H.log("View onクリア : start");

      // 検索項目をクリアする
      this.setFromDatasetToViewWithSessionStorageOfHeader(dataSet);

      $H.log("View onクリア : end");
    },

    /**
     * 選択された行に背景色を設定し、他の行に対しては背景色を元に戻す
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} arg = 画面項目
     */
    onテーブル行クリック: function (arg) {
      $H.log("View onTableRowClick : start");

      let clickRow = arg["クリック行"];

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // 選択行にCSSクラスを設定する
      let j, k;
      let beforeRow = sessionStorage.loadItem("クリック行");
      let rows = $("#dialogTable")[0].rows;
      jQuery.each(rows, function (j) {
        k = j;
        let cells = rows[j].cells;
        jQuery.each(cells, function () {
          if (k == beforeRow) {
            $(this).removeClass("table-success");
          }
          if (k == clickRow) {
            $(this).addClass("table-success");
          }
        });
      });

      sessionStorage.saveItem("クリック行", clickRow);

      $H.log("View onTableRowClick : end");
    },

    /**
     * 照会処理実行後、データセットの内容を画面に表示する
     * 
     * @memberof DataSelectionDialogViewMixin
     * @param {Object} dataSet      - データセット
     * @param {Object} responseData - レスポンスデータ
     * @param {String} mode         - 処理モード
     */
    on照会OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on照会OfEditResponseData : start");

      // テーブル以外の項目（ヘッダー・フッター）にデータを表示する
      this.fromJsonDataToView(dataSet);

      // 行選択状態をクリアする
      // resetJsonDataToTable はテンプレート行をコピーするため、
      // table-success が残っていると全行に引き継がれてしまう
      $("#dialogTable td").removeClass("table-success");

      // テーブルにデータを表示する
      this.resetJsonDataToTable("#dialogTable", dataSet, "detail");

      $H.log("View on照会OfEditResponseData : end");
    }

  };
}(jQuery, Halu));
