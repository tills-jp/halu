# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid

class SingleTableListForm_model():
    """
    一覧登録(単一テーブル)パターン用の共通メソッドを保持する
    SingleTableListForm

    Attributes
    ----------
    requestdict : dict
        リクエストデータ
    sqldict : dict
        SQLデータ
    mvclog : obj
        ログ出力用オブジェクト
    mvclogname : str
        ログの出力ファイル名
    """
    def __init__(self, requestdict, sqldict, mvclog, mvclogname):

        self.requestdict = requestdict
        self.sqldict = sqldict
        self.mvclog     = mvclog
        self.mvclogname = mvclogname

    def setData(self, requestId, sqlsId, idName):
        """
        SQLのキー項目にデータをセットする（DELETE/ UPDATE/ INSERT）

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
        result : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'SingleTableListForm_model setData start')

        result = 'OK'
        # SQLタイプによって処理を分岐
        if sqlsId == 'delete':
            result = self.setDeleteData(requestId, sqlsId, idName)
        if sqlsId == 'update':
            result = self.setUpdateData(requestId, sqlsId, idName)
        if sqlsId == 'insert':
            result = self.setInsertData(requestId, sqlsId, idName)
        if sqlsId == 'insert_natural':
            result = self.setInsertNaturalData(requestId, sqlsId, idName)

        self.mvclog.debug(self.mvclogname, f'SingleTableListForm_model setData end result = {result}')
        return result


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
        self.mvclog.debug(self.mvclogname, 'SingleTableListForm_model setDeleteData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        deleteCheck = requestRecord['削除']['value']
        idData = requestRecord[idName]['value']
        maxLength = len(deleteCheck) - 1
        j = 0
        emptySW = 'PASS'
        for i in range(maxLength):
            if deleteCheck[i] != '9':
                continue
            if idData[i] == '':
                continue

            for key, value in requestRecord.items():
                if key in sqlRecord:
                    sqlRecord[key]['value'][j] = value['value'][i]
                    emptySW = 'OK'
            j = j + 1

        self.mvclog.debug(self.mvclogname, f'SingleTableListForm_model setDeleteData end status = {emptySW}')
        return emptySW


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
        self.mvclog.debug(self.mvclogname, 'SingleTableListForm_model setUpdateData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        idData = requestRecord[idName]['value']
        j = 0
        emptySW = 'PASS'
        for i in range(len(idData)):
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

        self.mvclog.debug(self.mvclogname, f'SingleTableListForm_model setUpdateData end status = {emptySW}')
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
        self.mvclog.debug(self.mvclogname, 'SingleTableListForm_model setInsertData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        idData = requestRecord[idName]['value']
        # 2026-08-04 C-051: 既存キーが0件（マスタ全件削除後の新規登録等）のとき
        #   max([]) が ValueError になるため空判定を max の前に置く
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

        self.mvclog.debug(self.mvclogname, f'SingleTableListForm_model setInsertData end status = {emptySW}')
        return emptySW


    def setInsertNaturalData(self, requestId, sqlsId, idName):
        """
        登録データを設定する（自然キー用）

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
        self.mvclog.debug(self.mvclogname, 'SingleTableListForm_model setInsertNaturalData start')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', requestId, 'record')
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'input', 'record')

        deleteCheck = requestRecord['削除']['value']
        maxLength = len(deleteCheck) - 1
        j = 0
        emptySW = 'PASS'
        for i in range(maxLength):
            if deleteCheck[i] != '9':
                continue

            for key, value in requestRecord.items():
                if key in sqlRecord:
                    sqlRecord[key]['value'][j] = value['value'][i]
                    emptySW = 'OK'
            j = j + 1

        self.mvclog.debug(self.mvclogname, f'SingleTableListForm_model setInsertNaturalData end status = {emptySW}')
        return emptySW
