# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid

class Pagination_model():
    """
    ページ送りの共通メソッドを保持する(Model)

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

    def getOffsetLine(self, idName1, idName2):
        """
        カレントページ数とページ当りの行数を使って、オフセット行数を計算する
        計算結果をSQLデータの'オフセットライン数'にセットする

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
        self.mvclog.debug(self.mvclogname, 'Pagination_model getOffsetLine start')

        requestRecord   = getjsonchunkbyid(self.requestdict, 'records', idName1)
        page_line       = int(requestRecord['record']['ページライン数']['value'][0])
        cur_page        = int(requestRecord['record']['カレントページ']['value'][0])
        offset_line     = (cur_page - 1) * page_line

        sqlRecord   = getjsonchunkbyid(self.sqldict, 'sqls', idName2, 'input')
        sqlRecord['record']['オフセットライン数']['value'][0] = str(offset_line)

        self.mvclog.debug(self.mvclogname, f'Pagination_model getOffsetLine end offset_line = {offset_line}')
        return 'OK'
