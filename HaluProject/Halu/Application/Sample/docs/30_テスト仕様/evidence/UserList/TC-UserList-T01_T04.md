# TC-UserList-T01／T02／T04 実施エビデンス（代表: T分類）

- 実施日時: 2026-09-21 18:19／18:23
- T01: 行未選択で #訂正／#削除／#照会 → いずれも `#alertDialog` に「選択エラー 行が選択されていません。選択して下さい。」、title は「ユーザ一覧」のまま
- T02／T04 観測:
  ```json
  {"clicked":"ZZTEST21","page":"2/2ページ(22件)","uid":"27"}                         ← 条件 'ZZTEST'・2ページ目で行選択
  {"title":"ユーザ詳細","mode":"update","before":["Sample.UserDetailMainte.処理モード=update","Sample.UserDetailMainte.ユーザＩＤ=27"],
   "fields":["ユーザＩＤ=27(ro)","ユーザ名=ゼットテスト21","ユーザコード=ZZTEST21","メニュー名=StartMenu",…]}     ← T02 引き継ぎ
  {"step":"T04 restored","title":"ユーザ一覧","cond":"ZZTEST","page":"2/2ページ(22件)","cur":"2","lines":"20","codes":"ZZTEST21,ZZTEST22"}
  ```
- 期待結果との一致: OK
