/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function($, $H){
  // 名前空間を設定する
  var App = $H.Application.BatchDivisionList;

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

  // マスター一覧パターン  ミックスインを追加する
  Model.include($H.Library.MultiTableListFormModelMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Model.include({
    // -----------------------------------
    //  リクエストデータ  チェック処理
    // -----------------------------------
    on再処理OfCheckRequestData: function(requestData, mode) {
      $H.log("Model on再処理OfCheckRequestData : start");

      var dataSet       = this.dataset.getData();
      var detailRecord  = this.appspec.getJSONChunkByIdAtRecords(dataSet, "detail")["record"];
      var requestRecord = this.appspec.getJSONChunkByIdAtRecords(requestData, "header")["record"];

      // セッションデータに識別名を設定する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      var row = sessionStorage.loadItem("クリック行");
      requestRecord["再処理バッチ管理ＩＤ"]["value"][0]     = detailRecord["明細バッチ管理ＩＤ"]["value"][row];
      requestRecord["再処理バッチ分割管理ＩＤ"]["value"][0] = detailRecord["明細バッチ分割管理ＩＤ"]["value"][row];

      $H.log("Model on再処理OfCheckRequestData : end");
      return true;
    }
    
  });
  App.Model = Model;

}(jQuery, Halu));