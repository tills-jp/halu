# サードパーティ ライセンス表記（Third-Party Notices）

Halu本体のライセンスは MIT License（リポジトリ直下 `LICENSE`）です。本リポジトリには、以下のサードパーティ成果物をそのまま同梱・再配布しています。各成果物はそれぞれの著作権者に帰属し、記載のライセンスに従います。

同梱ライブラリを追加・差し替え・削除したときは本書を同時に更新してください（正の一覧は `docs/04_運用/dependency_ledger.md`「フロントエンド」。更新の手順・タイミングは `docs/04_運用/release_procedure.md` §2）。

## 同梱しているもの

| 成果物 | バージョン | 配置 | ライセンス | 著作権者 |
|---|---|---|---|---|
| jQuery | 3.7.1 | `HaluServer/Halu/System/Html/js/jquery-3.7.1.min.js` | MIT | OpenJS Foundation and other contributors |
| jQuery UI | 1.12.1 | `HaluServer/Halu/System/Html/js/jquery-ui-1.12.1/` | MIT | jQuery Foundation and other contributors |
| jQuery UI Touch Punch | 0.2.3 | `HaluServer/Halu/System/Html/js/jquery.ui.touch-punch/` | MIT（MIT／GPL v2 デュアルのうちMITを選択） | Dave Furfero |
| jQuery UI Layout | 1.4.3 | `HaluServer/Halu/System/Html/js/uilayout/` | MIT（MIT／GPL デュアルのうちMITを選択） | Kevin Dalman |
| jquery-template（loadTemplate） | 1.4.5 | `HaluServer/Halu/System/Html/js/template/` | MIT | jquery-template contributors（https://github.com/codepb/jquery-template） |
| jQuery.dm-uploader | 1.0.2 | `HaluServer/Halu/System/Html/js/uploader-master/`（`LICENSE.txt` 同梱） | MIT | Daniel Morales |
| Print.js | 同梱版（ファイル内にバージョン表記なし） | `HaluServer/Halu/System/Html/js/print/` | MIT | Crabbly（https://github.com/crabbly/Print.js） |
| bignumber.js | 1.4.1 | `HaluServer/Halu/System/Html/js/bignumberjs/` | MIT | Michael Mclaughlin |
| Bootstrap | 5.3.0 | `HaluServer/Halu/System/Html/js/bootstrap-5.3.0/`、各アプリ `Html/css/bootstrap-5.3.0/` | MIT | The Bootstrap Authors |
| Glyphicons Halflings（Bootstrap 3 付属フォント） | Bootstrap 3 同梱版 | 各アプリ `Html/fonts/glyphicons-halflings-regular.*` | MIT（Bootstrap 3 の一部として） | Jan Kovařík（GLYPHICONS）／The Bootstrap Authors |
| Svelte ランタイム（ビルド成果物に含まれる） | 5系（`package.json` 参照） | `HaluServer/Halu/System/Html/SvelteComponent/build/`、各アプリ `Html/SvelteComponent/build/` | MIT | Rich Harris and contributors |
| IPAフォント（IPAゴシック・IPA Pゴシック・IPA明朝・IPA P明朝） | Ver.003.03 | `HaluServer/Halu/System/Server/Libraries/ipafont/`（`IPA_Font_License_Agreement_v1.0.txt` 同梱） | IPAフォントライセンス v1.0（無改変で再配布。ライセンス文書を同梱すること） | 独立行政法人情報処理推進機構（IPA） |

## 対象外（同梱していないもの）

- Python パッケージ（`requirements.txt`）・Node パッケージ（各 `SvelteComponent/package.json` の devDependencies）は、利用者の環境でインストールするもので本リポジトリには同梱していません。各パッケージのライセンスに従ってください。
- Docker イメージ・Linux インストーラが取得する OS パッケージ（PostgreSQL・LibreOffice・Noto CJK フォント等）も同様に本書の対象外です。
