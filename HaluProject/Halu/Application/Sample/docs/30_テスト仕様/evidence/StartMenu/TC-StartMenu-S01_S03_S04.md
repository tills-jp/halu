# TC-StartMenu-S01／S03／S04 実施エビデンス（代表: S分類）

- 実施日時: 2026-09-21 13:53〜13:55
- DB観測（ログ情報・本日分・ユーザＩＤ=2）:
  ```
            2 | 13:53:40.729 | ログイン（メニュー開始）        ← S01 init
            2 | 13:54:40.307 | Sample/Html/Apps/OrderList    ← S03 userinfo
            2 | 13:54:46.594 | Sample/Html/Apps/ZZNotExist   ← S03（未実装画面名でも記録される。Error404 T01の到達経路）
            2 | 13:55:23.137 | Sample/Html/Apps/ZZNotExist
            2 | 13:55:29.433 | ログオフ（メニュー終了）        ← S04 term
  ```
- S02: OrderList／Error404 から「戻る」で復帰した際、Halumain(init) 送信なし・ログ情報追加なし・保存済みタブ（tab_1／tab_2）を復元
- 期待結果との一致: OK
