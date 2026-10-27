/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
 * --------------------------------------------
 * 一覧登録(単一テーブル)パターン
 * ビューミックスイン 
***********************************************/

(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * 関数を追加する
   * @mixin SingleTableListFormViewMixin
   */
  App.SingleTableListFormViewMixin = {
    
    /**
     * CSSの適用と各種ダイアログの初期処理を実施する
     * 
     * @memberof SingleTableListFormViewMixin
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
     * @memberof SingleTableListFormViewMixin
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
     * @memberof SingleTableListFormViewMixin
     * @param {Object} arg - 画面情報(ログイン情報)
     */
    setログイン情報: function (arg) {
      $H.log("View setログイン情報 : start");

      // 後方互換: halu-ds-id="login"+halu-ds-field で要素を特定（なければ #id で検索）
      let $和暦 = $("[halu-ds-id='login'][halu-ds-field='ログイン和暦']");
      if (!$和暦.length) $和暦 = $("#ログイン和暦");
      $和暦.html(arg["ログイン和暦"]);

      let $日時 = $("[halu-ds-id='login'][halu-ds-field='ログイン日時']");
      if (!$日時.length) $日時 = $("#ログイン日時");
      $日時.html(arg["ログイン時刻"]);

      let $氏名 = $("[halu-ds-id='login'][halu-ds-field='ユーザ氏名']");
      if (!$氏名.length) $氏名 = $("#ユーザ氏名");
      $氏名.html(arg["ユーザ名称"]);

      $H.log("View setログイン情報 : end");
    },

    /**
     * 初期処理を実施（処理なし）  ※必要な場合は処理を追加
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {Object} arg - 画面情報
     */
    on初期処理: function (arg) {
      $H.log("View on初期処理 : start");

      $H.log("View on初期処理 : end");
    },

    /**
     * 検索項目をクリアする<br>
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {Object} dataSet - データセット
     */
    onクリア: function (dataSet) {
      $H.log("View onクリア : start");

      // 検索項目をクリアする
      this.setFromDatasetToViewWithSessionStorageOfHeader(dataSet);

      $H.log("View onクリア : end");
    },

    /**
     * データセットの明細データを画面の明細テーブルに表示する
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {Object} dataSet - データセット
     */
    on行追加クリック: function (dataSet) {
      $H.log("View on行追加クリック : start");

      this.resetJsonDataToTable("#mainTable", dataSet, "detail");

      $H.log("View on行追加クリック : end");
    },

    /**
     * 指定された行番号のチェックボックスをチェックONにする<br>
     * 他の行に対してはチェックOFFにする<br>
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {String} name  - 項目名
     * @param {number} index - 行のindex
     */
    on行チェック: function (name, index) {
      $H.log("View on行チェック : start");

      // 2026-06-12 後方互換: halu-ds-field で要素を特定（なければ class 名で検索）
      let object = $("[halu-ds-field='" + name + "']");
      if (!object.length) object = $("." + name);
      let maxSize = object.length;
      for (let i = 0; i < maxSize; i++) {
        if (i == index) {
          $(object[i]).prop("checked", true);
        }
        else {
          $(object[i]).prop("checked", false);
        }
      }

      $H.log("View on行チェック : end");
    },

    /**
     * 選択された行に背景色を設定し、他の行に対しては背景色を元に戻す
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {Object} arg - 画面項目
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
            $(this).removeClass("rowBackground");
          }
          if (k == clickRow) {
            $(this).addClass("rowBackground");
          }
        });
      });

      sessionStorage.saveItem("クリック行", clickRow);

      $H.log("View onテーブル行クリック : end");
    },

    /**
     * レスポンスデータの内容を画面に表示する<br>
     * 削除チェックボックスが明細テーブルに存在する場合は、チェックOFFにする<br>
     * 
     * @memberof SingleTableListFormViewMixin
     * @param {Object} dataSet      - データセット
     * @param {Object} responseData - レスポンスデータ
     * @param {String} mode         - 処理モード
     */
    on照会OfEditResponseData: function (dataSet, responseData, mode) {
      $H.log("View on照会OfEditResponseData : start");

      this.fromJsonDataToView(responseData);

      // 行選択状態をクリアする
      // resetJsonDataToTable はテンプレート行をコピーするため、
      // rowBackground が残っていると全行に引き継がれてしまう
      $("#mainTable td").removeClass("rowBackground");

      this.resetJsonDataToTable("#mainTable", dataSet, "detail");

      // 削除チェックボックスに値を設定する
      // 2026-06-12 後方互換: halu-ds-field で要素を特定（なければ class 名で検索）
      let deleteCheckBox = $("[halu-ds-field='削除']");
      if (!deleteCheckBox.length) deleteCheckBox = $(".削除");
      let maxSize = deleteCheckBox.length;
      for (let i = 0; i < maxSize; i++) {
        $(deleteCheckBox[i]).prop("checked", false);
      }

      $H.log("View on照会OfEditResponseData : end");
    }

  };
}(jQuery, Halu));
