/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function($, $H){
  // 名前空間を設定する
  let App = $H.Application.Error404;

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

  // 基本名称メンテパターンミックスインを追加する
  Model.include($H.Library.SingleTableListFormModelMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  Model.include({
    /**
     * 初期処理<br>
     * 本画面はdataset（JSON定義）を持たない（appspec.dataset="no"）ため、
     * SingleTableListFormModelMixin.initExecute（this.dataset.getData()）を
     * 空実装で上書きする。Controller側の空実装と対にする（C-069）。
     *
     * @memberof Model
     */
    initExecute: function () {
      $H.log("Model initExecute : start");
      $H.log("Model initExecute : end");
    }
  });
  App.Model = Model;
}(jQuery, Halu));