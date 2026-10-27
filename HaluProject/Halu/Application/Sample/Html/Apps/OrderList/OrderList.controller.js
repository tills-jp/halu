/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.OrderList;

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

  // マスター一覧パターンミックスインを追加する
  Controller.include($H.Library.MultiTableListFormControllerMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Controller.include({
    // ---------------------------------------
    //     顧客検索  イベント処理
    // ---------------------------------------
    on顧客検索: function (event, arg) {
      $H.log("Controller on顧客検索 : start");

      // 顧客選択ダイアログを表示する
      this.on選択ダイアログ表示(
        this.appspec.selectStorageRequestData[0],
        this.appspec.selectStorageResponseData[0],
        0
      );

      $H.log("Controller on顧客検索 : end");
    },
    // ---------------------------------------
    //     受注一覧H  イベント処理
    // ---------------------------------------
    on受注一覧H: function (event) {
      $H.log("Controller on受注一覧H : start");

      this.ajaxExecute("printH");

      $H.log("Controller on受注一覧H : end");
    },

    // ---------------------------------------
    //     受注一覧HM  イベント処理
    // ---------------------------------------
    on受注一覧HM: function (event) {
      $H.log("Controller on受注一覧HM : start");

      this.ajaxExecute("printHM");

      $H.log("Controller on受注一覧HM : end");
    },

    // -------------------------------------------
    //     受注一覧H  バリデーションチェック処理
    // -------------------------------------------
    on受注一覧HOfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on受注一覧HOfCheckRequestData : start");

      let status = this.checkRequestData(requestData);

      $H.log("Controller on受注一覧HOfCheckRequestData : end");
      return status;
    },
    
    // --------------------------------------------
    //     受注一覧HM  バリデーションチェック処理
    // --------------------------------------------
    on受注一覧HMOfCheckRequestData: function (requestData, mode) {
      $H.log("Controller on受注一覧HMOfCheckRequestData : start");

      let status = this.checkRequestData(requestData);

      $H.log("Controller on受注一覧HMOfCheckRequestData : end");
      return status;
    },

    // -------------------------------------------
    //     受注一覧H  レスポンスデータ編集処理
    // -------------------------------------------
    on受注一覧HOfEditResponseData: function (responseData, mode) {
      $H.log("Controller on受注一覧HOfEditResponseData : start");

      this.model.on受注一覧HOfEditResponseData(responseData, mode);

      $H.log("Controller on受注一覧HOfEditResponseData : end");
    },
    
    // -------------------------------------------
    //     受注一覧HM  レスポンスデータ編集処理
    // -------------------------------------------
    on受注一覧HMOfEditResponseData: function (responseData, mode) {
      $H.log("Controller on受注一覧HMOfEditResponseData : start");

      this.model.on受注一覧HMOfEditResponseData(responseData, mode);

      $H.log("Controller on受注一覧HMOfEditResponseData : end");
    }
    
  });
  App.Controller = Controller;
}(jQuery, Halu));