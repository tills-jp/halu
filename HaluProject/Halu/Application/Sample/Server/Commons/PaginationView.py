# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid

class Pagination_view():
    """
    ページ送りの共通メソッドを保持する(View)

    Attributes
    ----------
    responsedict : dict
        レスポンスデータ
    mvclog : obj
        ログ出力用オブジェクト
    mvclogname : str
        ログの出力ファイル名
    """
    def __init__(self, responsedict, mvclog, mvclogname):

        self.responsedict = responsedict
        self.mvclog     = mvclog
        self.mvclogname = mvclogname

    def getMaxPageCount(self, idName):
        """
        総件数とページ当りの行数を使って、総ページ数を計算する
        計算結果をレスポンスデータの'最大ページ'にセットする

        Parameters
        ----------
        idName : str
            対象とするデータセットID

        Returns
        -------
        result : str
            'OK' 固定
        """
        self.mvclog.debug(self.mvclogname, 'Pagination_view getMaxPageCount start')

        responseRecord   = getjsonchunkbyid(self.responsedict, 'records', idName)
        page_line        = int(responseRecord['record']['ページライン数']['value'][0])
        total_count      = int(responseRecord['record']['トータル件数']['value'][0])

        if total_count == 0:
            max_page    = 1
        else:
            max_page    = ((total_count + (page_line - 1)) // page_line)

        responseRecord['record']['最大ページ']['value'][0] = max_page

        self.mvclog.debug(self.mvclogname, f'Pagination_view getMaxPageCount end max_page = {max_page}')
        return 'OK'
