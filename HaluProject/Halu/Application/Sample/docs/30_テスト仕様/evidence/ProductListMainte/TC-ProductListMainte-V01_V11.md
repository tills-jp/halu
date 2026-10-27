# TC-ProductListMainte-V01〜V11 実施エビデンス（V分類・入力チェック。V08はNG）

- 実施日時: 2026-09-23 16:25〜16:40
- V01: 商品コード空欄（商品名称・標準単価入力済み）のまま#実行 → 商品コードに`errorToolTip`「必須項目」表示、送信なし
- V02: 商品コード20桁 → blurでエラーなし
- V03: 商品コード21桁 → 「桁数の誤り」表示
- V04: 商品名称空欄のまま#実行 → 「必須項目」表示、送信なし
- V05: 商品名称100桁 → blurでエラーなし
- V06: 商品名称101桁 → 「桁数の誤り」表示
- V07: 標準単価空欄のまま#実行 → 「必須項目」表示、送信なし（単価未定は登録不可）
- **V08（NG）**: 標準単価に`1200`を入力しフォーカスアウト → エラーにはならないが表示は「1200」のまま（期待: 金額書式「1,200」）。実キー入力（クリック→`1200`を打鍵→Tab）でも同じ結果。
  - 既存行は初期描画時に「1,440」等へ正しく書式化されている。行追加等で明細表が再描画された時点で当該セルも「1,200」に変わる＝書式化はサーバー応答後の**描画経路でのみ**効いており、**フォーカスアウト（onBlur）経路では効かない**。
  - 原因: `HaluServer/Halu/System/Html/js/haluview.mixin-1.0.0.js` の`onBlur`（385行付近）が書式ルールを`this.format[target.name]`で参照している。halu-ds移行後の入力欄は`halu-ds-field`属性のみを持ち`name`属性を持たないため、ruleが`undefined`となり`onDataFormat`が素通しになる。描画経路（同ファイル1209行・1423行付近）は項目名で`this.format[name]`を参照するため正常。`halucontroller.mixin`のonFocus／onBlurは既に`getAttribute("halu-ds-field") || name`のフォールバックへ移行済みで、view側のonBlurだけが取り残されている。
  - Sample側の`ProductListMainte_validation.json`の`format: "money"`定義は正しい。値そのものはdatasetへ正しく入り登録もできるため、表示のみの不具合。
  - money書式は`OrderDetailListMainte`・`ProductSelectionDialog`のvalidation.jsonにも定義があり、同じ経路のため同様に影響を受ける可能性がある。
  - フレームワーク側バグとして **Issue #88** を起票（ラベル: バグ, halu）。テスト仕様書ではNGとして記録し、修正後にU10で再テストする。
- V09: `-1`／`1.5`／`abc` のいずれも「数字でない文字がある」表示
- V10: 標準単価11桁 → blurでエラーなし
- V11: 標準単価12桁 → 「桁数の誤り」表示
- 期待結果との一致: V01〜V07・V09〜V11はOK。V08はNG（Issue #88）
