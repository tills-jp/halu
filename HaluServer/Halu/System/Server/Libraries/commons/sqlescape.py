# coding: utf-8
# 20260802 Sample/Server/Commons/SqlEscape.py（Sample C-030で新設）をフレームワークへ移設
"""
検索条件フック（setSql系）が SQL 文字列リテラルへ値を埋め込む際のエスケープ処理。

■ なぜ通常の「' を '' へ置換」では効かないか

フックが受け取るリクエスト値は、Controller 層の特殊文字変換
（HaluServer commons/specialcharconvert.py editRequestDataToSpecialChar）により
シングルクォート「'」が全角2文字「’’」へ置換済みで、ASCII のクォートは残っていない。
この置換は SQL 文の組み立てが終わったあとに database.py（doGenerateSql）の
editSqlDataToNormalChar が「’’」→「'」へ復元する。

そのためフックが値をそのまま文字列リテラルへ埋め込むと、復元の時点でリテラルが閉じ、
SQL の構造が変わる（SQLインジェクションが成立する）。実測では検索値
「x' OR 'a' LIKE 'a」で WHERE 句が常に真となり全件が返った（C-030）。

■ 対策

リテラルへ埋め込む前に「’’」を2倍化しておくと、復元後に「''」
（SQL標準のエスケープ済みシングルクォート）になり、リテラル内の1文字として扱われる。
ユーザーが全角の「’」を2文字入力した場合も同じ経路で復元されるため、本処理で同時に塞がる。

■ 適用範囲

本処理は「フックが自分で文字列リテラルを組み立てる」場合に必要なもの。
sql.json の input／バインド変数（fieldtype: char / doublequote）経由で埋め込む値は
フレームワーク側が処理するため、本処理を通す必要はない。

利用方法は `from commons.sqlescape import escapeSqlLiteral`（アプリのフックからそのまま
import可能。フレームワークと同一プロセスで動作しLibrariesがsys.path上にあるため）。
"""

# Controller 層の特殊文字変換後における、シングルクォートの表現（全角2文字）
# specialcharconvert.py editRequestDataToSpecialChar の変換表と一致させること
CONVERTED_QUOTE = '’’'


def escapeSqlLiteral(value):
    """
    SQL文字列リテラルへ埋め込むリクエスト値をエスケープする

    Parameters
    ----------
    value : str
        リクエストデータから取り出した値（Controller層の特殊文字変換済み）

    Returns
    -------
    escaped : str
        リテラルへ安全に埋め込める値
    """
    if value is None:
        return ''

    return str(value).replace(CONVERTED_QUOTE, CONVERTED_QUOTE * 2)
