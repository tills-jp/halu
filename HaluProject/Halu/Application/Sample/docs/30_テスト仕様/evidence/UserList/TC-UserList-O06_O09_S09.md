# TC-UserList-O06〜O09／S09／S10 実施エビデンス（代表: O分類・ページング）

- 実施日時: 2026-09-21 18:18〜18:20（Docker・ブラウザ（Chromium）、ADMIN001）。ユーザ22件（デモ2＋ZZTEST01〜20）
- 初期表示: `#ページ情報`="1/2ページ(22件)"、20行、先頭行 ADMIN001／末尾行 ZZTEST18（ユーザＩＤ昇順＝S10）
- 観測（JS実行結果）:
  ```json
  {"step":"after next","page":"2/2ページ(22件)","cur":"2","codes":"ZZTEST19,ZZTEST20"}
  {"step":"after next on last","page":"2/2ページ(22件)","cur":"2"}            ← 最大ページで停止
  {"step":"after prev","page":"1/2ページ(22件)","cur":"1","rows":20}
  {"step":"after prev on first","page":"1/2ページ(22件)","cur":"1"}           ← 1ページ未満にならない
  {"step":"after last","page":"2/2ページ(22件)","cur":"2","codes":"ZZTEST19,ZZTEST20"}
  {"step":"after first","page":"1/2ページ(22件)","cur":"1","first":"ADMIN001","rows":20}
  ```
  （cur = sessionStorage["Sample.UserList.カレントページ"]）
- 期待結果との一致: OK
