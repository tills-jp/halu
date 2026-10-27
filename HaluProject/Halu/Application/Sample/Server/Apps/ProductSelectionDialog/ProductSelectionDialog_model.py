# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid
from commons.sqlescape import escapeSqlLiteral
from PaginationModel import Pagination_model


class ProductSelectionDialog_model():
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
            self.mvclog.debug(self.mvclogname, 'ProductSelectionDialog_model init start')

            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'ProductSelectionDialog_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'ProductSelectionDialog_model init end')

    def getOffsetLineOfProductSelection(self, idName1, idName2):
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
        status : str
            'OK' 固定
        """
        self.mvclog.debug(self.mvclogname, 'ProductSelectionDialog_model getOffsetLine start')

        tempObj = Pagination_model(self.requestdict, self.sqldict, self.mvclog, self.mvclogname)
        status = tempObj.getOffsetLine(idName1, idName2)

        self.mvclog.debug(self.mvclogname, 'ProductSelectionDialog_model getOffsetLine end')
        return status

    def setSql_ProductSelectionDialog(self, idname1, idname2, genesql_freesql):
        """
        検索条件（商品コード・商品名称）を where 句の && へ置き換える

        いずれも部分一致（LIKE）で絞り込む。値が空の条件は句を生成しない。
        一致方式はSampleの既定（UserListのユーザコード・ユーザ名、OrderListの顧客氏名）に合わせている。

        Parameters
        ----------
        idname1 : str
            処理対象のリクエストデータセットID(tran.json > request)
        idname2 : str
            処理対象のSQLデータセットID(sql.json > sqls)
        genesql_freesql : str
            'genesql' 固定（sql.json）。本画面のSQLは全て genesql のため freesql は非対応

        Returns
        -------
        status : str
            'OK' / 'ERROR'（genesql 以外を指定された場合）
        """
        self.mvclog.debug(self.mvclogname, 'setSql_ProductSelectionDialog start')

        requestdict = getjsonchunkbyid(self.requestdict, 'records', idname1, 'record')
        sqlInfo = getjsonchunkbyid(self.sqldict, 'sqls', idname2)
        rep = ''

        # 文字列リテラルへ埋め込むため、値は必ず escapeSqlLiteral を通す（commons/sqlescape.py の説明を参照）
        w_検索商品コード = escapeSqlLiteral(requestdict['検索商品コード']['value'][0])
        w_検索商品名称 = escapeSqlLiteral(requestdict['検索商品名称']['value'][0])

        # 検索商品コード（部分一致）
        if w_検索商品コード != '':
            rep = rep + f" AND prd.商品コード LIKE '%%{w_検索商品コード}%%'"

        # 検索商品名称（部分一致）
        if w_検索商品名称 != '':
            rep = rep + f" AND prd.商品名称 LIKE '%%{w_検索商品名称}%%'"

        # 検索条件の置き換え && を検索条件に置き換える
        if genesql_freesql != 'genesql':
            self.mvclog.error(self.mvclogname,
                              f'setSql_ProductSelectionDialog: 未対応の指定です genesql_freesql={genesql_freesql}')
            return 'ERROR'

        sqlInforep = sqlInfo['sql']['genesql']['where'].replace('&&', rep)
        sqlInfo['sql']['genesql']['where'] = sqlInforep

        self.mvclog.debug(self.mvclogname, 'setSql_ProductSelectionDialog end')
        return 'OK'
