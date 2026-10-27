/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.CustomerListMainte;

  // インスタンスプロパティを追加する
  class View extends $H.View {
  constructor (appspec) {
      $H.log("View init : start");
      super();
      this.appspec = appspec;

      $H.log("View init : end");
    }
  }

  // 共通モジュールを追加する
  View.include($H.Library.FormatMixin);
  View.include($H.Library.OutlineMixin);
  View.include($H.Library.LoadTemplateMixin);
  View.include($H.Library.ViewMixin);

  // 基本名称メンテパターンミックスインを追加する
  View.include($H.Library.SingleTableListFormViewMixin);
  // del start 2024114
  // View.include($H.Library.SampleBaseDataMainteViewMixin);
  // del end   2024114

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  View.include({

    /**
     * 全選択トグルの画面反映（C-011）
     * @param {object} arg - { rows: 対象行indexの配列, value: '9'（チェック）/'0'（解除） }
     */
    on全選択: function (arg) {
      $H.log("View on全選択 : start");

      let checked = (arg["value"] == "9");
      let trs = $("#mainTable tbody tr");
      for (let i = 0; i < arg["rows"].length; i++) {
        trs.eq(arg["rows"][i]).find("input[halu-ds-field='削除']").prop("checked", checked);
      }

      $H.log("View on全選択 : end");
    },

  });

  App.View = View;
}(jQuery, Halu));