# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from SingleTableListFormModel import SingleTableListForm_model


class ProductListMainte_model():
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
            self.mvclog = mvclog
            self.mvclogname = mvclogname
            self.mvclog.debug(self.mvclogname, 'ProductListMainte_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'ProductListMainte_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'ProductListMainte_model init end')

    def setData(self, requestId, sqlsId, idName):
        """
        SQLにデータをセットする（一覧登録パターンの共通処理へ委譲する）

        送信された明細行のうち、キー項目（商品ＩＤ）が入っている行を update 用SQLの入力に、
        空欄の行を insert 用SQLの入力に振り分ける。

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
        status : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'ProductListMainte_model setData start')

        tempObj = SingleTableListForm_model(self.requestdict, self.sqldict, self.mvclog, self.mvclogname)
        status = tempObj.setData(requestId, sqlsId, idName)

        self.mvclog.debug(self.mvclogname, f'ProductListMainte_model setData end status = {status}')
        return status
