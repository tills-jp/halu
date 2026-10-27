/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.OrderDetailListMainte;

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

  // マスターメンテパターンミックスインを追加する
  Controller.include($H.Library.SingleRecordFormControllerMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Controller.include({
    // ------------------------------------------------------------------------
    // 初期処理
    // ------------------------------------------------------------------------
    on初期処理: function () {
      $H.log("Controller on初期処理 : start");

      // 処理モードを取得する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      var mode = sessionStorage.loadItem("処理モード");
      if (mode == undefined) {
        var mode = "insert";
        sessionStorage.saveItem("処理モード", "insert");
      }

      // 初期処理
      var arg = this.model.on初期処理();
      this.view.on初期処理(arg);

      if (mode != "insert") {
        // 初期処理：前画面の引き継ぎデータをデータセットに設定する
        var status1 = this.model.setFromBeforeStorageDataToDataset();
        if (status1 == "OK") {
          var dataSet = this.model.dataset.getData();
          this.view.fromJsonDataToView(dataSet);
        }
      }

      // 新規の時：キーなし、新規以外の時：キーが設定される
      this.ajaxExecute("select");
      // 項目の活性・非活性をセットする
      this.view.set項目制御(mode);

      $H.log("Controller on初期処理 : end");
    }
    // ------------------------------------------------------
    // チェンジ イベント処理（追加処理）
    // ------------------------------------------------------
    , onChange削除: function (event) {
      $H.log("Controller onChange削除 : start");

      var row = event.currentTarget.parentNode.parentNode.rowIndex;
      this.model.onChangeTableCheckBox(event, row, this.appspec.checkboxDetail);

      // 削除行の金額は後継に加算しない
      var arg1 = this.model.calc合計金額();
      if (arg1["status"] == "OK") {
        this.view.set合計金額(arg1);
      }

      $H.log("Controller onChange削除 : end");
    }
    // ------------------------------------------------------
    // 実行（C-044: 商品未選択チェックを追加）
    // ------------------------------------------------------
    /**
     * 商品が選択されていない入力行があれば警告して送信しない。
     * 問題なければパターンの実行処理へ委譲する
     */
    , on実行: function (event) {
      $H.log("Controller on実行(OrderDetailListMainte) : start");

      var row = this.model.get商品未選択行();
      if (row > 0) {
        var arg = {
          title: "入力エラー", status: "WARNING"
          , message: [row + "行目の商品が選択されていません。"]
        };
        this.pubsub.publish("alertDialog", arg);
        $H.log("Controller on実行(OrderDetailListMainte) : end (商品未選択)");
        return;
      }

      $H.Library.SingleRecordFormControllerMixin.on実行.call(this, event);

      $H.log("Controller on実行(OrderDetailListMainte) : end");
    }
    // ------------------------------------------------------
    // 商品選択（C-044）
    // ------------------------------------------------------
    /**
     * 明細行の「選択」ボタン押下で商品選択ダイアログを開く
     * 押した行のindexを渡すことで、選択結果がその行へ転記される
     */
    , on商品選択: function (event, arg) {
      $H.log("Controller on商品選択 : start");

      // button → td → tr
      var row = event.currentTarget.parentNode.parentNode.rowIndex;
      this.on選択ダイアログ表示(
        this.appspec.selectStorageRequestData[0],
        this.appspec.selectStorageResponseData[0],
        row
      );

      $H.log("Controller on商品選択 : end");
    }
    /**
     * 商品選択ダイアログから戻った後の後処理
     * 標準単価が受注単価へ転記されるため、受注金額・合計金額を再計算する
     * （数量が未入力の行は金額を確定できないため計算しない。数量入力時にonDerive数量単価で計算される）
     */
    , on商品選択後: function (arg) {
      $H.log("Controller on商品選択後 : start");

      var row = arg["clickRow"];
      var dataSet = this.model.dataset.getData();
      var detailRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      if (detailRecord["受注数量"]["value"][row] != "") {
        var arg1 = this.model.calc受注金額({ row: row });
        if (arg1["status"] == "OK") {
          this.view.set受注金額(arg1);
        }
        var arg2 = this.model.calc合計金額();
        this.view.set合計金額(arg2);
      }

      $H.log("Controller on商品選択後 : end");
    }
    // ------------------------------------------------------
    // 導出項目編集用カスタムイベント処理
    // ------------------------------------------------------
    , onDerive数量単価: function (arg) {
      $H.log("Controller onDerive数量単価 : start");

      var arg1 = this.model.calc受注金額(arg);
      if (arg1["status"] == "OK") {
        this.view.set受注金額(arg1);
      }
      var arg2 = this.model.calc合計金額();
      this.view.set合計金額(arg2);

      $H.log("Controller onDerive数量単価 : end");
    }

  });
  App.Controller = Controller;
}(jQuery, Halu));