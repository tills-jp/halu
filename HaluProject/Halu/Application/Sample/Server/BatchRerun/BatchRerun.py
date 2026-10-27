# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import sys
from batchclientserver.batchclientmainserver import BatchClientMainServer


# batchStartup から渡されるパラメータ名（sql.json の id="batchParam" のキーと一致させる）
PARAM_DBNAME = 'ＤＢ名'
PARAM_CONTROLL_ID = 'バッチ管理ＩＤ'
PARAM_CUR_DIVISION = '分割番号'
PARAM_DIVISION_NUMBER = '分割数'


def parseArgs(args):
    """
    起動アーギュメントを辞書へ変換する（2形式に対応）

    (1) 「キー名:値」形式 -- BatchDivisionList画面の「再処理」からの起動。
        batchstartup/batchexecute.py は sql.json の id='batchParam' の項目を
        「キー名:値」の並びに編集して起動するため、その形式を解釈する。
        例: BatchRerun.py ＤＢ名:sample バッチ管理ＩＤ:5 分割番号:1 分割数:3

    (2) 位置引数形式 -- 運用担当者によるCLIからの直接実行。
        docs/01_Halu構造/py_batch.md「6. バッチリラン」に記載の手順。
        例: BatchRerun.py sample 5 1 3

    Parameters
    ----------
    args : list
        sys.argv

    Returns
    -------
    param_dict : dict
        パラメータ名 -> 値（文字列）
    """
    values = args[1:]

    # (2) 位置引数形式
    if not values or not all(':' in value for value in values):
        return {
            PARAM_DBNAME: values[0],
            PARAM_CONTROLL_ID: values[1],
            PARAM_CUR_DIVISION: values[2],
            PARAM_DIVISION_NUMBER: values[3],
        }

    # (1) 「キー名:値」形式
    param_dict = {}
    for value in values:
        w_list = value.split(':')
        if w_list[0] == '':
            continue

        param_dict[w_list[0]] = ':'.join(w_list[1:])

    return param_dict


def main(args):
    """
    バッチリランの呼び出し（指定した分割単位のバッチクライアントを再実行する）：

    - 画面から: python BatchRerun.py ＤＢ名:{DB名} バッチ管理ＩＤ:{ID} 分割番号:{番号} 分割数:{分割数}
    - CLIから : python BatchRerun.py {DBName} {バッチ管理ＩＤ} {分割番号} {分割数}
    """

    param_dict = parseArgs(args)

    dbname = param_dict[PARAM_DBNAME]
    controll_id = int(param_dict[PARAM_CONTROLL_ID])
    cur_division = int(param_dict[PARAM_CUR_DIVISION])
    division_number = int(param_dict[PARAM_DIVISION_NUMBER])

    # BatchClientMainServerをインスタンスする
    main_server = BatchClientMainServer()

    # BatchClientMainServerをコールする
    main_server.call(dbname, controll_id, cur_division, division_number)


if __name__ == '__main__':
    args = sys.argv
    main(args)
