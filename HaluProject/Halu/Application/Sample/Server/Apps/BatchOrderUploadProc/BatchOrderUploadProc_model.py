# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

from commons.jsonchunk import getjsonchunkbyid
from DataCheckModel import DataCheck_model

class BatchOrderUploadProc_model():
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
            self.mvclog.debug(self.mvclogname, 'BatchOrderUploadProc_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'BatchOrderUploadProc_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'BatchOrderUploadProc_model init end')

    def notEmptyPassForSqlsDataOfBatchProc(self, sqlsId, dataName):
        """
        SQLの出力項目が空でないとき、SQLをパスする

        Parameters
        ----------
        sqlsId : str
            sql.jsonのid名
        dataName : str
            出力レコードの項目名

        Returns
        -------
        status : str
            OK または PASS
        """
        self.mvclog.debug(self.mvclogname, 'BatchOrderUploadProc_model notEmptyPassForSqlsDataOfBatchProc start')

        tempObj = DataCheck_model(self.requestdict, self.sqldict, self.mvclog, self.mvclogname)
        status = tempObj.notEmptyPassForSqlsData(sqlsId, dataName)

        self.mvclog.debug(self.mvclogname,
                          f'BatchOrderUploadProc_model notEmptyPassForSqlsDataOfBatchProc end status : {status}')
        return status

    def checkProductResolvedOfBatchProc(self, sqlsId):
        """
        商品コードから商品ＩＤが解決できたかチェックする（2026-08-04 C-045）

        受注明細.商品ＩＤはNOT NULL＋FK制約のため、解決できないまま登録すると
        DB制約違反という原因の分かりにくいエラーになる。ここで明示的にエラーとし、
        どの受注番号・明細番号・商品コードが解決できなかったかをログへ残す。
        通常はOrderUpload画面の取込時チェック（checkProductCode）で弾かれるため、
        本チェックに掛かるのは再処理時や取込後に商品が論理削除された場合となる。

        Parameters
        ----------
        sqlsId : str
            商品検索ＳＱＬのid名（商品ＩＤ・商品名称を出力するSQL）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, 'BatchOrderUploadProc_model checkProductResolvedOfBatchProc start')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', sqlsId, 'output', 'record')
        if sqlRecord['商品ＩＤ']['value'][0] != '':
            self.mvclog.debug(self.mvclogname,
                              'BatchOrderUploadProc_model checkProductResolvedOfBatchProc end status : OK')
            return 'OK'

        tranRecord = getjsonchunkbyid(self.sqldict, 'sqls', 'TranSelect', 'output', 'record')
        w_受注番号 = tranRecord['受注番号']['value'][0]
        w_明細番号 = tranRecord['明細番号']['value'][0]
        w_商品コード = tranRecord['商品コード']['value'][0]

        # message へ設定することでフレームワークがロールバックし、当該分割をエラー終了させる
        self.sqldict['message']['status'] = 'ERROR'
        self.sqldict['message']['msg'] = \
            f'商品コードから商品を特定できませんでした。（受注番号 {w_受注番号}・明細番号 {w_明細番号}' \
            f'・商品コード {w_商品コード}）'

        self.mvclog.error(self.mvclogname,
                          f'BatchOrderUploadProc_model checkProductResolvedOfBatchProc 商品未解決 : '
                          f'受注番号 = {w_受注番号}, 明細番号 = {w_明細番号}, 商品コード = {w_商品コード}')
        self.mvclog.debug(self.mvclogname,
                          'BatchOrderUploadProc_model checkProductResolvedOfBatchProc end status : ERROR')
        return 'ERROR'
