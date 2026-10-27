/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 一覧照会(親子テーブル)パターン
 * ビューミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin MultiTableListFormViewMixin
   */
  App.MultiTableListFormViewMixin = {

    /**
     * テンプレートのロードおよび各ダイアログの初期処理を実行する
     * 
     * @memberof MultiTableListFormViewMixin
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
     * CSSファイルの追加処理を実行する
     * 
     * @memberof MultiTableListFormViewMixin
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
     * 引数からログイン情報を取得し、画面へ表示する
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} arg  - ユーザ名称、ログイン時刻、ログイン和暦
     */
    setログイン情報: function (arg) {
      $H.log("View setログイン情報 : start");

      // 後方互換: halu-ds-id="login"+halu-ds-field で要素を特定（なければ #id で検索）
      let $和暦 = $("[halu-ds-id='login'][halu-ds-field='ログイン和暦']");
      if (!$和暦.length) $和暦 = $("#ログイン和暦");
      $和暦.html(arg["ログイン和暦"]);

      let $氏名 = $("[halu-ds-id='login'][halu-ds-field='ユーザ氏名']");
      if (!$氏名.length) $氏名 = $("#ユーザ氏名");
      $氏名.html(arg["ユーザ名称"]);

      let $日時 = $("[halu-ds-id='login'][halu-ds-field='ログイン日時']");
      if (!$日時.length) $日時 = $("#ログイン日時");
      if ($日時.length) $日時.html(arg["ログイン時刻"]);

      $H.log("View setログイン情報 : end");
    },

    /**
     * データセットの内容を画面へ表示する
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} arg - 処理モード、前画面名、データセット
     */
    on初期処理: function (arg) {
      $H.log("View on初期処理 : start");

      let dataSet = arg["データセット"];

      // テーブルの空行を作成する
      let detailInfo = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail");
      if (detailInfo) {
        if (detailInfo["multiline"] == "yes") {
          this.resetJsonDataToTable("#mainTable", dataSet, "detail");
        }
      }

      $H.log("View on初期処理 : end");
    },

    /**
     * appspecに定義された画面ヘッダキーをもとに、<br>
     * データセットの内容をセッションストレージに保存する<br>
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} dataSet - データセット
     */
    on初期リロード前処理: function (dataSet) {
      $H.log("View on初期リロード前処理 : start");

      this.setFromDatasetToViewWithSessionStorageOfHeader(dataSet);

      $H.log("View on初期リロード前処理 : end");
    },

    /**
     * データセットからデータ件数およびページ情報を画面に表示する
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} arg - ページ情報（ページライン数、カレントページ、最大ページ、トータル件数）
     */
    showページ情報: function (arg) {
      $H.log("View showページ情報 : start");

      let pageline = arg["ページライン数"];
      let curpage = arg["カレントページ"];
      let maxpage = arg["最大ページ"];
      let totalcount = arg["トータル件数"];
      let pagedata = curpage + "/" + maxpage + "ページ(" + totalcount + "件)";
      $("#mainForm input[name='ページ情報']").val(pagedata);
      $("#mainForm input[name='ページ情報']").attr("disabled", "disabled");

      $("#最初のページ").removeAttr("disabled");
      $("#前のページ").removeAttr("disabled");
      $("#次のページ").removeAttr("disabled");
      $("#最後のページ").removeAttr("disabled");
      if (curpage == 1) {
        $("#最初のページ").attr("disabled", "disabled");
        $("#前のページ").attr("disabled", "disabled");
      }
      if (curpage == maxpage) {
        $("#最後のページ").attr("disabled", "disabled");
        $("#次のページ").attr("disabled", "disabled");
      }

      $H.log("View showページ情報 : end");
    },

    /**
     * ヘッダの検索項目をクリアする
     * 
     * @memberof MultiTableListFormViewMixin
     * @param dataSet - データセット
     */
    onクリア: function (dataSet) {
      $H.log("View onクリア : start");

      // 検索項目をクリアする
      this.setFromDatasetToViewWithSessionStorageOfHeader(dataSet);

      $H.log("View onクリア : end");
    },

    /**
     * 選択行の背景色を変更する
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} arg   - クリック行情報(datasetのindex、セレクタ名)
     */
    onテーブル行クリック: function (arg) {
      $H.log("View onテーブル行クリック : start");

      let clickRow = arg["クリック行"];

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // 選択行にCSSクラスを設定する
      let j, k;
      let beforeRow = sessionStorage.loadItem("クリック行");
      let rows = $("#mainTable")[0].rows;
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

      $H.log("View onテーブル行クリック : end");
    },

    /**
     * 照会処理のレスポンスデータの内容を画面へ表示する
     * 
     * @memberof MultiTableListFormViewMixin
     * @param {object} dataSet - データセット
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on照会OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on照会OfEditResponseData : start");

      // テーブル以外の項目（ヘッダー・フッター）にデータを表示する
      this.fromJsonDataToView(dataSet);

      // 行選択状態をクリアする
      // resetJsonDataToTable はテンプレート行をコピーするため、
      // table-success が残っていると全行に引き継がれてしまう
      $("#mainTable td").removeClass("table-success");

      // テーブルにデータを表示する
      this.resetJsonDataToTable("#mainTable", dataSet, "detail");

      $H.log("View on照会OfEditResponseData : end");
    }

  };
}(jQuery, Halu));
