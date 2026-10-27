# TC-UserList-S01〜S08／O10／O11 実施エビデンス（代表: S分類・検索）

- 実施日時: 2026-09-21 18:20〜18:22。テストデータ ZZTEST01〜22（メニュー名は奇数=AdminMenu／偶数=StartMenu、テーマは3種を巡回、備考は01〜03=「ZZ備考A」・04〜05=「ZZ備考AB」）
- 観測（JS実行結果）:
  ```json
  {"step":"S01","page":"1/1ページ(10件)","codes":"ZZTEST10,…,ZZTEST19"}                 ← ユーザコード 'ZZTEST1' 部分一致
  {"step":"S02","page":"1/1ページ(9件)","names":"ゼットテスト01,…,ゼットテスト09"}        ← ユーザ名 'ゼットテスト0' 部分一致
  {"step":"S04","page":"1/1ページ(11件)","menus":{"StartMenu":11}}
  {"step":"S05","page":"1/1ページ(7件)","themes":{"halu-custom_dark":7}}
  {"step":"S06 exact ZZ備考A","page":"1/1ページ(3件)","memos":"ZZ備考A,ZZ備考A,ZZ備考A"}
  {"step":"S06 partial ZZ備考 (expect 0)","page":"1/1ページ(0件)","rows":0}               ← 完全一致（部分一致しない）
  {"step":"S07 StartMenu AND dark","page":"1/1ページ(3件)","rows":"ZZTEST04/StartMenu/halu-custom_dark,ZZTEST10/…,ZZTEST16/…"}
  {"step":"S08 zero","page":"1/1ページ(0件)","rows":0,"dialog":""}
  {"step":"O10 after search","page":"1/2ページ(22件)","cur":"1","first":"ZZTEST01"}        ← 2ページ目から#検索で1ページ目へ
  {"step":"O11 after clear","fields":["検索ユーザコード=","検索メニュー名=","検索ユーザ名=","検索テーマコード=","検索備考="]}
  ```
- ブラウザコンソール（onlyErrors）: なし
- 期待結果との一致: OK
