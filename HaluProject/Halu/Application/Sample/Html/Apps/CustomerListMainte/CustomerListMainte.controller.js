/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.CustomerListMainte;

  // インスタンスプロパティを追加する
  class Controller extends $H.Controller {
    constructor(appspec, model, view) {
      $H.log("Controller init : start");
      super();
      this.appspec = appspec;
      this.model = model;
      this.view = view;
      this.createPubSubEvent();

      $H.log("Controller init : end");
    };
  }
  // 共通モジュールを追加する
  Controller.include($H.Library.EnterTabPFKeyMixin);
  Controller.include($H.Library.ControllerMixin);

  // 基本名称メンテパターンミックスインを追加する
  Controller.include($H.Library.SingleTableListFormControllerMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Controller.include({

    /**
     * 全選択ボタン（C-011）
     * 顧客ＩＤが入っている行の削除チェックを一括ON。全てON済みならば一括OFF（トグル）
     */
    on全選択: function (event) {
      $H.log("Controller on全選択 : start");

      let arg = this.model.on全選択();
      this.view.on全選択(arg);

      $H.log("Controller on全選択 : end");
    },

    /**
     * 削除ボタン（C-012）
     * 削除チェックのある行のみを送信する（チェック0件なら警告して送信しない）。
     * 実際の絞り込みはモデルのon実行OfCheckRequestDataで行う
     */
    on削除実行: function (event) {
      $H.log("Controller on削除実行 : start");

      if (!this.model.hasDeleteCheckedRow()) {
        let arg = { title: "削除確認", status: "WARNING", message: ["削除する行にチェックを付けて下さい。"] };
        this.pubsub.publish("alertDialog", arg);
        $H.log("Controller on削除実行 : end");
        return;
      }
      this.model.execKind = "delete";
      this.ajaxExecute("execute");

      $H.log("Controller on削除実行 : end");
    },

    /**
     * 登録ボタン（C-012）: パターンのon実行をオーバーライドし、
     * 登録（削除チェックの無い行のみ送信）であることをモデルへ伝える
     */
    on実行: function (event) {
      $H.log("Controller on実行 : start");

      this.model.execKind = "register";
      this.ajaxExecute("execute");

      $H.log("Controller on実行 : end");
    },

    /**
     * 行追加（C-012 UAT指摘対応）: パターンのon行追加クリックをオーバーライド。
     * チェック列を左端へ移動したため、パターンの td:nth-child(2) 固定の
     * フォーカス指定では入力欄に当たらない。追加行の最初のテキスト入力欄
     * （顧客氏名）へフォーカスする方式に変更（列順に依存しない）
     */
    on行追加クリック: function (event, arg) {
      $H.log("Controller on行追加クリック : start");

      // 明細テーブルの最大値を取得する
      let rowMax = document.querySelector('#mainTable').rows.length;

      // 最後尾に空行を挿入する
      let dataSet = this.model.on行追加クリック(rowMax + 1);
      this.view.on行追加クリック(dataSet);
      $('#mainTable tr').eq(rowMax).find("input[type='text']").first().focus();

      $H.log("Controller on行追加クリック : end");
    },

  });
  App.Controller = Controller;
}(jQuery, Halu));