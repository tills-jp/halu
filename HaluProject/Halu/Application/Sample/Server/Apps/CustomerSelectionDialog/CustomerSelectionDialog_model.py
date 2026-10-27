# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from PaginationModel import Pagination_model

class CustomerSelectionDialog_model():
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
            self.mvclog.debug(self.mvclogname, 'CustomerSelectionDialog_model init start')

            self.database    = database
            self.sqldict     = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'CustomerSelectionDialog_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'CustomerSelectionDialog_model init end')

    def getOffsetLineOfCustomerSelection(self, idName1, idName2):
        """
        カレントページ数とページ当りの行数を使って、オフセット行数を計算する

        Parameters
        ----------
        idName1 : str
            対象とするデータセットID(リクエストデータ)
        idName2 : str
            対象とするデータセットID(SQLデータ)

        Returns
        -------
        result : str
            'OK' 固定
        """
        self.mvclog.debug(self.mvclogname, 'CustomerSelectionDialog_model getOffsetLine start')

        tempObj = Pagination_model(self.requestdict, self.sqldict, self.mvclog, self.mvclogname)
        status  = tempObj.getOffsetLine(idName1, idName2)

        self.mvclog.debug(self.mvclogname, 'CustomerSelectionDialog_model getOffsetLine end')
        return status
