# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid

class OrderDetailListMainte_model():
    """
    sql.json から呼び出し("prog": "yes"の場合)

    Attributes
    ----------
    mvclog : obj
        ログ出力用オブジェクト
    mvclogname : str
        ログの出力ファイル名
    database : obj
        DB接続用オブジェクト
    sqldict : dict
        画面からのリクエストデータ(sql.json)
    requestdict : dict
        画面からのリクエストデータ(tran.json)
    """
    def __init__(self, mvclog, mvclogname, database, sqldict, requestdict):
        try:
            self.mvclog     = mvclog
            self.mvclogname = mvclogname
            self.mvclog.debug(self.mvclogname, 'OrderDetailListMainte_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'OrderDetailListMainte_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'OrderDetailListMainte_model init end')


    def setUpdateData(self, requestId, sqlsId, idName):
        """
        更新データを設定する

        Parameters
        ----------
        requestId : str
            セットする値を保持するリクエストデータのデータセットID
        sqlsId : str
            対象とするSQLデータのデータセットID
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        emptySW : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderDetailListMainte_model setUpdateData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        deleteCheck = requestRecord['削除']['value']
        idData = requestRecord[idName]['value']
        j = 0
        emptySW = 'PASS'
        for i in range(len(idData)):
            if deleteCheck[i] == '9':
                continue
            if idData[i] == '':
                continue

            for key, value in requestRecord.items():
                if key in sqlRecord:
                    if j == 0:
                        sqlRecord[key]['value'][0] = value['value'][i]
                    else:
                        sqlRecord[key]['value'].append(value['value'][i])
                    emptySW = 'OK'
            j += 1

        self.mvclog.debug(self.mvclogname, f'OrderDetailListMainte_model setUpdateData end status = {emptySW}')
        return emptySW

    def setInsertData(self, requestId, sqlsId, idName):
        """
        登録データを設定する

        Parameters
        ----------
        requestId : str
            セットする値を保持するリクエストデータのデータセットID
        sqlsId : str
            対象とするSQLデータのデータセットID
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        emptySW : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderDetailListMainte_model setInsertData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        idData = requestRecord[idName]['value']
        # 2026-08-04 C-051: 既存キーが0件のとき max([]) が ValueError になるため空判定を max の前に置く
        #   （従来の `if maxId == '': maxId = 0` は max が空文字を返し得ないため機能していなかった）。
        #   あわせて int() を通し、画面往復で文字列化された値でも後続の `+ 1` が成立するようにする。
        existIds = [int(a) for a in idData if a != '']
        maxId = max(existIds) if existIds else 0
        j = 0
        emptySW = 'PASS'
        for i in range(len(idData)):
            if idData[i] != '':
                continue

            idData[i] = maxId + 1
            maxId += 1
            for key, value in requestRecord.items():
                if key in sqlRecord:
                    if j == 0:
                        sqlRecord[key]['value'][0] = value['value'][i]
                    else:
                        sqlRecord[key]['value'].append(value['value'][i])
                    emptySW = 'OK'
            j += 1

        self.mvclog.debug(self.mvclogname, f'OrderDetailListMainte_model setInsertData end status = {emptySW}')
        return emptySW

    def setDeleteData(self, requestId, sqlsId, idName):
        """
        削除データを設定する

        Parameters
        ----------
        requestId : str
            セットする値を保持するリクエストデータのデータセットID
        sqlsId : str
            対象とするSQLデータのデータセットID
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        emptySW : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderDetailListMainte_model setDeleteData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        deleteCheck = requestRecord['削除']['value']
        idData = requestRecord[idName]['value']
        # maxLength = len(deleteCheck) - 1
        maxLength = len(deleteCheck)
        j = 0
        emptySW = 'PASS'
        for i in range(maxLength):
            if deleteCheck[i] != '9':
                continue
            if idData[i] == '':
                continue

            # 2026-08-04 C-050: 2行目以降は append する（setUpdateData/setInsertDataと同じ方式）。
            #   SQL入力の値配列は長さ1で初期化されるため、添字への直接代入では
            #   2行目（j=1）でIndexErrorとなり複数行の同時削除ができなかった。
            #   なお受注番号のようにdetailリクエストに無い項目は単一値のまま残るが、
            #   フレームワークのバインド置換（databasecommon.replaceSql）が
            #   「添字が上限を超えたらvalue[0]を使う」ため全行に同じ値が展開される。
            for key, value in requestRecord.items():
                if key in sqlRecord:
                    if j == 0:
                        sqlRecord[key]['value'][0] = value['value'][i]
                    else:
                        sqlRecord[key]['value'].append(value['value'][i])
                    emptySW = 'OK'
            j = j + 1

        self.mvclog.debug(self.mvclogname, f'OrderDetailListMainte_model setDeleteData end status = {emptySW}')
        return emptySW
