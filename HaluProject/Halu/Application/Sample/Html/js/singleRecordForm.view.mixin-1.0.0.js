/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 単票登録(単一テーブル)パターン
 * ビューミックスイン
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin SingleRecordFormViewMixin
   */
  App.SingleRecordFormViewMixin = {

    /**
     * テンプレートのロードおよび各ダイアログの初期処理を実行する
     * 
     * @memberof SingleRecordFormViewMixin
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
     * @memberof SingleRecordFormViewMixin
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
     * @memberof SingleRecordFormViewMixin
     * @param {object} arg  - ユーザ名称、ログイン時刻、ログイン和暦
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
     * 処理モードに応じて実行ボタンの表示およびタイトルを切り替える<br>
     * モード切替による画面遷移の場合はモード切替を非表示にする<br>
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} arg - 処理モード、前画面名
     */
    showヘッダータイトル: function (arg) {
      $H.log("View showヘッダータイトル : start");

      let w_title = $("#ヘッダータイトル").html();
      let titleArray = w_title.split(" ");
      let title = titleArray[0];

      let mode = arg["処理モード"];

      switch (mode) {
        case "select":
          title += " （照会）";
          $("#実行").hide();
          break;
        case "insert":
          title += " （新規）";
          $("#実行").show();
          break;
        case "convert":
          title += " （複製）";
          $("#実行").show();
          break;
        case "update":
          title += " （訂正）";
          $("#実行").show();
          break;
        case "delete":
          title += " （削除）";
          $("#実行").show();
      }

      $("#ヘッダータイトル").html(title);

      // D-006 フェーズ2デザイン適用: 本文側の大見出し（.halu-page-title）を置く画面では
      // モード付きタイトルをそこへも反映する（当該画面のprogram.cssがヘッダー中央タイトルを
      // 非表示化するため、モード表示（新規/訂正等）の欠落を防ぐ）。大見出しが無い画面では何もしない
      if ($(".halu-page-title").length) {
        $(".halu-page-title").text(title);
      }

      if ($("#モード切替")) {
        let beforHtmlName = this.appspec.beforename;
        if (beforHtmlName == arg["前画面名"]) {
          $("#モード切替").hide();
        }
      }

      $H.log("View showヘッダータイトル : end");
    },

    /**
     * データセットの内容を画面へ表示する
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} arg - 処理モード、前画面名、データセット
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
          this.resetJsonDataToTable("#mainTable", dataSet, "detail");
        }
      }

      $H.log("View on初期処理 : end");
    },

    /**
     * 空行追加後のデータセットの内容を画面へ表示する
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} dataSet - 行追加済のデータセット
     */
    on行追加クリック: function (dataSet) {
      $H.log("View on行追加クリック : start");

      this.resetJsonDataToTable("#mainTable", dataSet, "detail");

      $H.log("View on行追加クリック : end");
    },

    /**
     * クリックされた行の背景色を変更し、選択状態を表示する<br>
     * ※C-071: 2026-09-24 修正者：AI 追加（multiTableListForm.view.mixinを踏襲。
     * 従来は本ミックスインに行クリックの表示処理自体が存在せず、controller側で
     * onテーブル行クリックを呼んでもハイライトが付かなかった）
     *
     * @memberof SingleRecordFormViewMixin
     * @param {object} arg - クリック行情報（クリック行、セレクタ名）
     */
    onテーブル行クリック: function (arg) {
      $H.log("View onテーブル行クリック : start");

      let clickRow = arg["クリック行"];

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // 選択行にCSSクラスを設定する
      // C-071: 前回行の解除は sessionStorage の「クリック行」に依存しない
      //（モデルが先に上書き済みで前回行を取れないため）。全行から外してからクリック行に付ける
      $("#mainTable td").removeClass("table-success");
      let rows = $("#mainTable")[0].rows;
      if (rows[clickRow]) {
        $(rows[clickRow].cells).addClass("table-success");
      }

      sessionStorage.saveItem("クリック行", clickRow);

      $H.log("View onテーブル行クリック : end");
    },

    /**
     * データセットの内容を画面に表示する
     *
     * @memberof SingleRecordFormViewMixin
     * @param {object} dataset - データセット
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on照会OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on照会OfEditResponseData : start");

      // テーブル以外の項目（ヘッダー・フッター）にデータを表示する
      this.fromJsonDataToView(dataSet);

      // テーブルにデータを表示する
      let detailInfo = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail");
      if (detailInfo === undefined) {
      }
      else {
        if (detailInfo["multiline"] == "yes") {
          this.resetJsonDataToTable("#mainTable", dataSet, "detail");
        }
      }

      $H.log("View on照会OfEditResponseData : end");
    },
    
    /**
     * データセットの内容を画面に表示する
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} dataset - データセット
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on登録OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on登録OfEditResponseData : start");

      this.on照会OfEditResponseData(dataSet, responseData, mode);

      $H.log("View on登録OfEditResponseData : end");
      return dataSet;
    },
    
    /**
     * データセットの内容を画面に表示する
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} dataset - データセット
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on訂正OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on訂正OfEditResponseData : start");

      this.on照会OfEditResponseData(dataSet, responseData, mode);

      $H.log("View on訂正OfEditResponseData : end");
    },
    
    /**
     * データセットの内容を画面に表示する
     * 
     * @memberof SingleRecordFormViewMixin
     * @param {object} dataset - データセット
     * @param {object} responseData - レスポンスデータ
     * @param {object} mode - 処理モード
     */
    on削除OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on削除OfEditResponseData : start");

      this.on照会OfEditResponseData(dataSet, responseData, mode);

      $H.log("View on削除OfEditResponseData : end");
    }

  };
}(jQuery, Halu));
