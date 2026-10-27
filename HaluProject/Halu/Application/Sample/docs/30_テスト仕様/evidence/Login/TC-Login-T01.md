# TC-Login-T01 実施エビデンス（代表: T分類）

- 実施日時: 2026-08-07 16:3x
- 前提: ユーザ.メニュー名="StartMenu" のユーザ（TEST001）
- 手順: TEST001 / test でログイン実行
- 観測結果: 遷移後タイトル "メニュー(一般ユーザ用)"、URL `http://localhost:8001/HaluASGI/Haluhtml`
- 期待結果との一致: OK（StartMenuへPOST遷移）

# 付随確認: TC-Login-T02（AdminMenu分岐）

- 前提: ユーザ.メニュー名="AdminMenu" のユーザ（ADMIN001）
- 観測結果: 遷移後タイトル "メニュー(管理者用)"
- 期待結果との一致: OK（AdminMenuへPOST遷移）
