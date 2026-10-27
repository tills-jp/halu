/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.UserDetailMainte;

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
    // ------------------------------------------------------
    // 初期処理
    // ------------------------------------------------------
    on初期処理: function () {
      $H.log("Controller on初期処理 : start");

      // 処理モードを取得する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      let mode = sessionStorage.loadItem("処理モード");
      if (mode == undefined) {
        mode = "insert";
        sessionStorage.saveItem("処理モード", "insert");
      }

      // C-023: 新規登録モード（insert・複製のconvert）のときだけ、パスワードの画面バリデーションを必須へ動的に切り替える
      // （訂正・照会・削除モードは任意のまま＝validation.jsonの既定["free"]/min"0"を維持する）
      // ここ（on初期処理の先頭）はvalidation JSON同期完了後・ユーザー操作前であることが
      // 同期チェーン（dataset→validation→transaction→initExecute→on初期処理）により保証されているため、
      // getTargetRuleが返す共有validationデータ（Validation.fn.data配下の参照）をその場で書き換える
      let パスワードルール = this.model.getValidation().getTargetRule("パスワード");
      if (パスワードルール) {
        if (mode == "insert" || mode == "convert") {
          パスワードルール["validation"] = ["required", "free"];
          パスワードルール["min"] = "1";
        }
        else {
          パスワードルール["validation"] = ["free"];
          パスワードルール["min"] = "0";
        }
      }

      // 初期処理
      let arg = this.model.on初期処理();
      this.view.on初期処理(arg);

      if (mode != "insert") {
        // 初期処理：前画面の引き継ぎデータをデータセットに設定する
        let status1 = this.model.setFromBeforeStorageDataToDataset();
        if (status1 == "OK") {
          let dataSet = this.model.dataset.getData();
          this.view.fromJsonDataToView(dataSet);
        }
      }
      // セレクトボックスの値を取得する
      this.ajaxExecute("init");
      // 項目の活性・非活性をセットする
      this.view.set項目制御(mode);

      $H.log("Controller on初期処理 : end");
    }

    // ------------------------------------------------------
    //  レスポンスデータ編集処理
    // ------------------------------------------------------
    , on初期処理OfEditResponseData: function (responseData, mode) {
      $H.log("Controller on初期処理OfEditResponseData : start");

      let dataSet = this.model.on初期処理OfEditResponseData(responseData, mode);
      // セレクトボックスの一括初期表示
      this.onShowSelectBoxAll(responseData, this.appspec.selectbox);

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      let selectMode = sessionStorage.loadItem("処理モード");
      // 新規の時：キーなし、新規以外の時：キーが設定される
      if (selectMode != "insert") {
        this.ajaxExecute("select");
      }

      $H.log("Controller on初期処理OfEditResponseData : end");
    }

  });
  App.Controller = Controller;
}(jQuery, Halu));