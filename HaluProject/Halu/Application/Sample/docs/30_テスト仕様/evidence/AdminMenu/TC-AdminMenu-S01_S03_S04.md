# TC-AdminMenu-S01／S03／S04 実施エビデンス（代表: S分類）

- 実施日時: 2026-09-21 13:50〜13:52
- DB観測（`select ユーザＩＤ, アクセス日時, 画面名 from ログ情報 where アクセス日時 >= current_date`）:
  ```
   ユーザＩＤ |      t       |          画面名
  ------------+--------------+---------------------------
            1 | 13:50:20.358 | ログイン（メニュー開始）      ← S01 init（ログ情報 566→567件）
            1 | 13:52:16.968 | Sample/Html/Apps/UserList   ← S03 userinfo
            1 | 13:52:47.081 | ログオフ（メニュー終了）      ← S04 term
  ```
  端末情報: host=localhost:8001 / browser=Netscape / platform=Win32 / useragent=Mozilla/5.0 (Windows NT 10.0; ...
- S02: UserList→「戻る」でAdminMenu復帰時、Haluhtml後にHalumainリクエストなし・ログ情報追加なし・tab_2復元
- 期待結果との一致: OK
