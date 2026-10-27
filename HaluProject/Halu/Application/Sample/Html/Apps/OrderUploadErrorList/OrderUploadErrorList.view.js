/***********************************************
 * Framework Name  :  Halu
 * (c) 2025 TILLS & Co.
***********************************************/
(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Application.OrderUploadErrorList;

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

  // マスター一覧パターンミックスインを追加する
  View.include($H.Library.MultiTableListFormViewMixin);

  // --------------------------------------------------------
  // パターンに含まれない処理を追加する
  // また、パターン内の処理を変更するときは、オーバライドする
  // --------------------------------------------------------
  View.include({
    // ---------------------------------------------------------------------------
    // 【C-041】表示専用要素への値設定をテキストとして行う（フレームワーク実装の
    // オーバライド）。
    //
    // フレームワーク標準（haluview.mixin の setValueToObjectOfOther）は
    // TD・DIV へ jQuery の html() で値を設定するため、値がＨＴＭＬとして
    // 解釈される。本画面が表示する「受注番号・明細番号・項目値」は
    // **業務ユーザーがアップロードしたＣＳＶファイルの生値**であり、
    // タグを含む値がそのまま描画されると保存型ＸＳＳになる。
    // 本画面は全列が単なる文字列表示のため、text() で設定して無害化する。
    //
    // ※他の一覧画面はＤＢに登録済みの検証済みデータを表示しているため
    // 　従来どおりで運用している（フレームワーク側の既定を変える是非は
    // 　Halu改修バックログの課題として申し送り）。
    // ---------------------------------------------------------------------------
    setValueToObjectOfOther: function (tagName, typeName, object, value) {

      switch (tagName) {
        case "BUTTON":
          break;
        default:
          $(object).text(value);
          break;
      }

    }

  });
  App.View = View;

}(jQuery, Halu));
