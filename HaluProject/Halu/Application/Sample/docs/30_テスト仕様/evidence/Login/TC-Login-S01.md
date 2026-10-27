# TC-Login-S01 実施エビデンス（代表: S分類）

- 実施日時: 2026-08-07 16:31
- 手順: ログインＩＤ="ADMIN001"、パスワード="admin" を入力し #ログイン をクリック
- 観測結果:
  - 遷移後タイトル: "メニュー(管理者用)"（AdminMenu）
  - モーダル表示: なし（エラーなし）
  - sessionStorage:
    ```json
    {
      "Sample.AdminMenu.ターゲットタブ": "tab_1",
      "Sample.Login.メニュー名": "AdminMenu",
      "Sample.Login.ユーザ名称": "admin",
      "Sample.Login.ユーザＩＤ": "1",
      "Sample.Login.ログイン和暦": "令和8年8月7日（金）",
      "Sample.Login.ログイン時刻": "2026/8/7 16:31",
      "Sample.Login.ＣＳＳファイル名": "Sample/Html/css/halu-custom_default.css"
    }
    ```
- 期待結果との一致: OK（認証成功、ユーザＩＤ・ユーザ名称・メニュー名・ログイン時刻・ログイン和暦・CSSファイル名がセッションストレージへ保存）

# 付随確認: TC-Login-S02（認証失敗）

- 手順: ログインＩＤ="ADMIN001"、パスワード="wrongpass" で実行
- 観測結果: `"× サーバエラー ログインＩＤもしくはパスワードが間違っています。 閉じる"`、画面遷移なし
- 期待結果との一致: OK

# 付随確認: TC-Login-S03（初期表示時テーマCSS取得）

- 観測結果: `<link>` に `halu-custom_default.css` が動的追加（DBのテーマテーブル 使用中フラグ=1 と一致）
- 期待結果との一致: OK

# 付随確認: TC-Login-S04（論理削除済みユーザの認証除外）

- 前提: 自己完結テスト用ユーザ ZZTEST99（削除フラグ='9'、パスワードハッシュ=sha256("test9999")）をDBへ直接INSERTして用意
- 手順: ZZTEST99 / test9999 で実行
- 観測結果: `"× サーバエラー ログインＩＤもしくはパスワードが間違っています。 閉じる"`、画面遷移なし
- 期待結果との一致: OK
- 後始末: 検証直後に `DELETE FROM "ユーザ" WHERE "ユーザコード" = 'ZZTEST99';` を実行し、削除後の残存0件をSELECTで確認済み
