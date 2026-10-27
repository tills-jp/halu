# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid

class OrderListPrint_form():
    """
    tran.json から呼び出し("prog": "yes"の場合)

    Attributes
    ----------
    excellog : obj
        ログ出力用オブジェクト
    excellogname : str
        ログの出力ファイル名
    excelcreate :  obj
        Excel作成用オブジェクト
    responsedict : dict
        レスポンスデータ(tran.json)
    sqldict : dict
        画面からのリクエストデータ(sql.json)
    requestdict : dict
        画面からのリクエストデータ(tran.json)

    """
    def __init__(self, excellog, excellogname, excelcreate, responsedict, sqldict, requestdict):
        try:
            self.excellog     = excellog
            self.excellogname = excellogname
            self.excellog.debug(self.excellogname, 'OrderListPrint_form init start')

            self.excelcreate  = excelcreate
            self.responsedict = responsedict
            self.sqldict      = sqldict
            self.requestdict  = requestdict

        except Exception as e:
            self.excellog.debug(self.excellogname, f'OrderListPrint_form init exception message : {e}')

        finally:
            self.excellog.debug(self.excellogname, 'OrderListPrint_form init end')


    def page_headerH(self):
        """
        トータルページ番号を設定する

        Returns
        -------
        status : str
            'OK' 固定
        """
        self.excellog.debug(self.excellogname, 'OrderListPrint_form page_headerH start')

        status = "OK"
        w_PageNo = self.excelcreate.get_totalPageNo()
        responseRecord = getjsonchunkbyid(self.responsedict, 'records', 'page_header', 'record')
        responseRecord["ページ番号"]["value"][0] = w_PageNo

        self.excellog.debug(self.excellogname, f'OrderListPrint_form page_headerH end ページ番号 : {w_PageNo}')
        return status

    def page_headerHM(self):
        """
        カレントページ番号を設定する

        Returns
        -------
        status : str
            'OK' 固定
        """
        self.excellog.debug(self.excellogname, 'OrderListPrint_form page_headerHM start')

        status = "OK"
        w_PageNo = self.excelcreate.get_currPageNo()
        responseRecord = getjsonchunkbyid(self.responsedict, 'records', 'page_header', 'record')
        responseRecord["ページ番号"]["value"][0] = w_PageNo

        self.excellog.debug(self.excellogname, f'OrderListPrint_form page_headerHM end ページ番号 : {w_PageNo}')
        return status
