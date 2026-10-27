# coding: utf-8

from commons.datamapping       import DataMapping
from commons.dynamicapp        import DynamicApp
from database.database         import Database

class Model():
    """
    モデルクラス。SQLを実行する。

    Attributes
    ----------
    log : mlog
    datamapping : DataMapping
    dynamicapp : DynamicApp
    database : Database
    requestdict : dict
        画面からのリクエストデータ
    parallel_flag : ?
    parallel_end : ?
    """
    def __init__(self, mlog, mlogname, dlog, dlogname, requestdict):
        try:
            self.mlog     = mlog
            self.mlogname = mlogname
            self.mlog.debug(self.mlogname, 'Model init start')

            # 利用する外部クラスをインスタンス
            self.datamapping = DataMapping()
            self.dynamicapp  = DynamicApp()

            self.dlog     = dlog
            self.dlogname = dlogname
            self.database = Database(self.dlog, self.dlogname)

            # インスタンス変数を設定
            self.requestdict = requestdict

        except Exception as e:
            self.mlog.error(self.mlogname, f'Model init exception message : {e}')

        finally:
            self.mlog.debug(self.mlogname, 'Model init end')


    def fromRequestToSql(self, sqldict, temp_object):
        """
        SQL実行処理１（SQLデータからsql配列を取り出し実行する）

        Parameters
        ----------
        sqldict : dict
            SQLデータ（sql.json）
        temp_object : Class
            サーバプログラム実行用のモデルオブジェクト -> AppCache.getModelObject() の戻り値
        """
        try:
            for sql_info in sqldict['sqls']:
                self.mlog.debug(self.mlogname, f'Model fromRequestToSql sql_info : {sql_info}')
                # sql入力レコードの編集
                self.editSqlInputData(sql_info, sqldict)

                # beforeメソッド処理
                result = self.dynamicapp.doBeforeAfterMethod('before', sql_info, temp_object)
                if result in('ERROR', 'ALLPASS'):
                    return

                # SQLの実行
                if result == 'OK':
                    self.doSql(sql_info, sqldict)
                    if sqldict['message']['status'] == 'ERROR':
                        return

                # afterメソッド処理
                result = self.dynamicapp.doBeforeAfterMethod('after', sql_info, temp_object)
                if result in('ERROR', 'ALLPASS'):
                    return

        except Exception as e:
            self.mlog.error(self.mlogname, f'Model fromRequestToSql exception message type    : {str(type(e))}')
            self.mlog.error(self.mlogname, f'Model fromRequestToSql exception message arg     : {str(e.args)}')
            self.mlog.error(self.mlogname, f'Model fromRequestToSql exception message         : {e}')
            # 2026-08-02 B-007 SQL実行例外時にERRORを設定し既存のrollback分岐・エラー応答へ合流
            sqldict['message']['status'] = 'ERROR'
            sqldict['message']['msg'] = 'SQL実行エラーが発生しました。サーバーログを確認してください。'


    def editSqlInputData(self, sql_info, sqldict):
        """
        SQL実行前処理２（sql入力レコードの編集）

        Parameters
        ----------
        sql_info : dict
            SQLデータの中の'sqls' の1要素 -> sqldict['sqls'][i]
        sqldict : dict
            SQLデータ（sql.json）
        """
        # input データ無しの場合リターン
        if 'input' not in sql_info:
            return

        sql_input_record = sql_info['input']['record']
        for name, value in sql_input_record.items():
            # fromtype が設定されていた場合の処理
            if 'fromtype' in value:
                # 違うid のrequest から編集する
                if value['fromtype'] == 'request':
                    self.datamapping.fromRequestEditValue(value, self.requestdict)
                    continue

                # sqldict のinput から編集する
                if value['fromio'] == 'input':
                    self.datamapping.fromSqlInputEditValue(value, sqldict)
                    continue

                # sqldict のoutput から編集する
                if value['fromio'] == 'output':
                    self.datamapping.fromSqlOutputEditValue(value, sqldict)
                    continue

            # fromtype が設定されていない場合、同じidのrequestから編集する
            if 'records' in self.requestdict:
                for request_info in self.requestdict['records']:
                    if sql_info['id'] != request_info['id']:
                        continue

                    if name in request_info['record']:
                        value['value'] = request_info['record'][name]['value']
                    break


    def doSql(self, sql_info, sqldict):
        """
        SQL実行

        Parameters
        ----------
        sql_info : dict
            SQLデータの中の'sqls' の1要素 -> sqldict['sqls'][i]
        sqldict : dict
            SQLデータ（sql.json）
        """
        # 接続するDBを設定（デフォルトはsqldict['dbname']）
        dbname = sqldict['dbname']
        if 'dbname' in sql_info:
            if sql_info['dbname'] != '':
                dbname = sql_info['dbname']
        # SQL実行（nosql が指定されている場合はスキップ）
        if sql_info['sql']['type'] != 'nosql':
            self.database.doSql(dbname, sql_info)
        # SQL実行後チェック処理
        if 'check' in sql_info['sql']:
            self.database.recordCheck(sql_info, sqldict)


    def call(self, json_cache, app_cache):
        """
        メイン処理（MainModel から呼び出される）

        Parameters
        ----------
        json_cache : dict
            SQL定義情報のキャッシュ -> JsonCache("sql.json")
        app_cache : dict
            モデルAPPのキャッシュ -> AppCache("model.py")

        Returns
        -------
        sqldict : dict
            SQL実行後のSQLデータ
        """
        try:
            self.mlog.debug(self.mlogname, 'Model: call start')

            # SQLデータを設定
            self.mlog.debug(self.mlogname, 'Model: SQLデータを設定 start')

            sqldict = json_cache.getJsonData(self.requestdict)

            self.mlog.debug(self.mlogname, 'Model: SQLデータを設定 end')


            # サーバプログラム実行用のモデルオブジェクトを動的生成
            self.mlog.debug(self.mlogname, 'Model: モデルオブジェクトを動的生成 start')

            #temp_object = app_cache.getModelObject(sqldict, self.requestdict) 2021/06/19
            temp_object = app_cache.getModelObject(self.database, sqldict, self.requestdict)

            self.mlog.debug(self.mlogname, 'Model: モデルオブジェクトを動的生成 end')


            # SQLデータからSQL文を作成して実行
            self.mlog.debug(self.mlogname, 'Model: SQLデータからSQL文を作成して実行 start')

            self.fromRequestToSql(sqldict, temp_object)

            self.mlog.debug(self.mlogname, 'Model: SQLデータからSQL文を作成して実行 end')


            self.mlog.debug(self.mlogname, 'Model: SQL実行エラー判定')
            if sqldict['message']['status'] == 'OK':
                self.mlog.debug(self.mlogname, 'Model: SQL実行 ＯＫ コミットを実行')
                self.database.commit()
            else:
                self.mlog.debug(self.mlogname, 'Model: SQL実行 エラー ロールバックを実行')
                self.database.rollback()

            # SQLデータをリターン
            return sqldict

        except Exception as e:
            self.mlog.error(self.mlogname, f'Model call exception message : {e}')
            sqldict['message']['status'] = 'ERROR'
            sqldict['message']['msg'] = e
            return sqldict

        finally:
            # コネクションをクローズ
            self.mlog.debug(self.mlogname, 'Model: コネクションをクローズ')
            self.database.close()

            self.mlog.debug(self.mlogname, 'Model: call end')
