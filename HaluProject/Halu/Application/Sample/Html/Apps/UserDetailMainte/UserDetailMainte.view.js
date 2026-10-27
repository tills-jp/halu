/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.UserDetailMainte;

  // インスタンスプロパティを追加する
  class View extends $H.View {
    constructor(appspec) {
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

  // マスターメンテパターンミックスインを追加する
  View.include($H.Library.SingleRecordFormViewMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  View.include({
    // ------------------------------------------------------
    //  項目の活性・非活性を設定
    // ------------------------------------------------------
    set項目制御: function (mode) {
      $H.log("View set項目制御 : start");

      // モードに応じて項目の活性・非活性をセット
      if (mode == "select" || mode == "delete") {
        $("input").prop('disabled', true);
        $("select").prop('disabled', true);
        // C-009: 備考のtextarea化に伴い無効化対象へ追加（照会/削除モードのグレーアウト）
        $("textarea").prop('disabled', true);
      }
      // C-070: 訂正モードではユーザコードを読取専用にする（設計書3章「登録時のみ入力可。訂正・削除・照会時は読取専用」）。
      // disabled ではなく readonly を使い、表示・データセット同期を維持する（update SQL 側でも更新対象から除外済み）
      else if (mode == "update") {
        $("input[halu-ds-field='ユーザコード']").prop('readOnly', true);
      }

      $H.log("View set項目制御 : end");
    }

  });
  App.View = View;
}(jQuery, Halu));