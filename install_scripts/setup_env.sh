#!/bin/bash

# エラーになったらその場で止める
set -e

# 本番用リポジトリ(masterブランチ指定)
CUR_BRANCH="master"
REPO_URL="https://raw.githubusercontent.com/tills-jp/halu/$CUR_BRANCH/install_scripts"

ENV_TEMP_URL="$REPO_URL/.env.example"
ENV_FILE=".env"


echo ">>> .env.example をダウンロードしています..."

# 本番用リポジトリから.env.exampleファイルをダウンロードし、.envファイルを作成する。
# -f を付けてHTTPエラーを失敗として扱う。付けないと404等の応答本文がそのまま
# .envとして保存され、後続の「.env に xxx の行が見つかりません」という
# 原因の分かりにくいエラーで止まる。
if ! curl -fsSL "$ENV_TEMP_URL" -o "$ENV_FILE"; then
    # 失敗時に中途半端なファイルを残さない
    rm -f "$ENV_FILE"
    echo ".env.example のダウンロードに失敗しました。"
    echo "  取得元: $ENV_TEMP_URL"
    echo "URLとネットワーク接続を確認してください。"
    exit 1
fi

# パスワードを保存するファイルのため、他ユーザから読めないようにする
chmod 600 "$ENV_FILE"

############################################################
# 入力値チェック用の関数
############################################################
check_username() {
    # $1:項目名 $2:値
    if ! [[ "$2" =~ ^[a-z_][a-z0-9_-]*$ ]]; then
        echo "$1 に使用できない文字が含まれています。"
        echo "（先頭は英小文字または _ 、2文字目以降は英小文字・数字・_・- のみ使用できます）"
        exit 1
    fi
    if [ "$2" = "root" ]; then
        echo "$1 に root は指定できません。"
        exit 1
    fi
}

check_password() {
    # $1:項目名 $2:値
    if ! [[ "$2" =~ ^[A-Za-z0-9_.@%^+=,~-]+$ ]]; then
        echo "$1 に使用できない文字が含まれています。"
        echo "（英数字と _ . @ % ^ + = , ~ - のみ使用できます）"
        exit 1
    fi
}

############################################################
# .env書き換え用の関数
############################################################
# KEY="VALUE" 形式で該当行を書き換える。
# bashビルトイン(printf)のみで書き込むため、パスワードがコマンドライン引数に
# 載らない（実行中に ps コマンドで他ユーザから見えない）。
set_env_value() {
    local key="$1" val="$2" tmp="${ENV_FILE}.tmp" line replaced=0
    while IFS= read -r line || [ -n "$line" ]; do
        if [[ "$line" == "$key="* ]]; then
            printf '%s="%s"\n' "$key" "$val"
            replaced=1
        else
            printf '%s\n' "$line"
        fi
    done < "$ENV_FILE" > "$tmp"
    if [ "$replaced" -ne 1 ]; then
        rm -f "$tmp"
        echo "$ENV_FILE に $key の行が見つかりません。"
        exit 1
    fi
    mv "$tmp" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
}

############################################################
# 対話式で値を入力
############################################################
echo ">>> 各種情報を入力してください:"

read -p "DBユーザ名: " DB_USERNAME < /dev/tty
read -s -p "DBパスワード: " DB_PASSWORD < /dev/tty

echo ""

read -p "仮想サーバ ユーザ名: " SRV_USERNAME < /dev/tty
read -s -p "仮想サーバ パスワード: " SRV_PASSWORD < /dev/tty

echo ""

read -p ">>> 外部公開しますか？（yes/no）：" ENABLE_FIREWALL < /dev/tty

# 入力値チェック（halu_install.sh側でも検証されるが、入力直後に気づけるようにここでも行う）
check_username "DBユーザ名" "$DB_USERNAME"
check_password "DBパスワード" "$DB_PASSWORD"
check_username "仮想サーバ ユーザ名" "$SRV_USERNAME"
check_password "仮想サーバ パスワード" "$SRV_PASSWORD"
if [ "$DB_USERNAME" = "$SRV_USERNAME" ]; then
    echo "DBユーザ名と仮想サーバユーザ名には別の名前を指定してください。"
    exit 1
fi

# 入力された内容を .env に反映
set_env_value "DB_USERNAME" "$DB_USERNAME"
set_env_value "DB_PASSWORD" "$DB_PASSWORD"
set_env_value "SRV_USERNAME" "$SRV_USERNAME"
set_env_value "SRV_PASSWORD" "$SRV_PASSWORD"

# ファイアーウォールの設定
set_env_value "ENABLE_FIREWALL" "$ENABLE_FIREWALL"
if [[ "$ENABLE_FIREWALL" =~ ^[Yy]([Ee][Ss])?$ ]]; then
    # 外部接続ありの場合
    set_env_value "FIREWALL_PORTS" "8000/tcp"
    set_env_value "FIREWALL_SERVICES" "ssh"
else
    # 内部接続のみの場合
    set_env_value "FIREWALL_PORTS" ""
    set_env_value "FIREWALL_SERVICES" "ssh"
fi

echo ">>> .env ファイルが生成されました（パスワードはマスク表示）:"
sed -E 's/^(.*PASSWORD=).*/\1"****"/' "$ENV_FILE"

read -p "Enterキーで終了します..." < /dev/tty
