# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from PaginationView import Pagination_view


class OrderUploadErrorList_view():
    """
    tran.json から呼び出し("prog": "yes"の場合)

    Attributes
    ----------
    mvclog : obj
        ログ出力用オブジェクト
    mvclogname : str
        ログの出力ファイル名
    responsedict : dict
        レスポンスデータ(tran.json)
    sqldict : dict
        画面からのリクエストデータ(sql.json)
    requestdict : dict
        画面からのリクエストデータ(tran.json)
    """
    def __init__(self, mvclog, mvclogname, responsedict, sqldict, requestdict):
        try:
            self.mvclog = mvclog
            self.mvclogname = mvclogname
            self.mvclog.debug(self.mvclogname, 'OrderUploadErrorList_view init start')

            self.responsedict = responsedict
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'OrderUploadErrorList_view init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'OrderUploadErrorList_view init end')

    def getMaxPageCountOfOrderUploadErrorList(self, idName):
        """
        総件数とページ当りの行数を使って、総ページ数を計算する

        Parameters
        ----------
        idName : str
            対象とするデータセットID

        Returns
        -------
        status : str
            'OK' 固定
        """
        self.mvclog.debug(self.mvclogname, 'OrderUploadErrorList_view getMaxPageCount start')

        tempObj = Pagination_view(self.responsedict, self.mvclog, self.mvclogname)
        status = tempObj.getMaxPageCount(idName)

        self.mvclog.debug(self.mvclogname, 'OrderUploadErrorList_view getMaxPageCount end')
        return status
