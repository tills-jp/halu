# coding: utf-8

from sqlalchemy      import create_engine
from sqlalchemy.pool import QueuePool

from halumain.haluconf          import HaluConf
from commons.specialcharconvert import SpecialCharConvert
from database.databasecommon    import DatabaseCommon

class Database():
    """
    Database に接続し、SQLを実行するクラス。

    Attributes
    ----------
    hconf : HaluConf
        設定情報読み込み用オブジェクト。クラス変数として保持。
    engine : dict
        エンジンの格納場所
    connect : dict
        コネクションの格納場所
    trans : dict
        トランザクションの格納場所
    """
    # クラス変数を定義
    hconf = HaluConf()

    def __init__(self, dlog, dlogname):
        self.dlog     = dlog
        self.dlogname = dlogname
        self.dlog.debug(self.dlogname, 'Database init start')

        self.specialcharconvert = SpecialCharConvert()
        # エンジン・コネクション・トランザクションの格納場所を初期化
        self.engine  = {}
        self.connect = {}
        self.trans   = {}
        
        self.dlog.debug(self.dlogname, 'Database init end\n')

    def create_engine(self, dbname):
        """
        ＤＢ接続要求
        （self.engineはインスタンス変数であるが、sqlalchemy内部でプーリングされているもよう）

        Parameters
        ----------
        dbname : str
            接続するデータベース名
        """
        try:
            if dbname not in self.engine:
                self.dlog.debug(self.dlogname, f'Database データベース接続処理 start : dbname = {dbname}')

                def_db = Database.hconf.def_database[dbname]
                # PostgreSQLの接続
                if def_db['dbdriver'] == 'postgresql':
                    str_db = def_db['dbdriver'] + '://' \
                            + def_db['username'] + ':' \
                            + def_db['password'] + '@' \
                            + def_db['hostname'] + ':' \
                            + def_db['portno'] + '/' \
                            + def_db['database']
                    self.engine[dbname] = create_engine(str_db, pool_size=5, max_overflow=0, poolclass=QueuePool)

                self.dlog.debug(self.dlogname, 'Database データベース接続処理 end')

                # SQLite   create_engine('sqlite:///file.db', poolclass=QueuePool)
                # MySQL    create_engine("mysql://user:pass@host/dbname", poolclass=QueuePool)

        except Exception as e:
            self.dlog.error(self.dlogname, f'Database create_engine exception message : {e}')


    def connection(self, dbname):
        """
        コネクション取得

        Parameters
        ----------
        dbname : str
            接続するデータベース名
        """
        if dbname not in self.connect:
            self.dlog.debug(self.dlogname, f'Database コネクション取得処理 start : dbname = {dbname}')

            self.connect[dbname] = self.engine[dbname].connect()

            self.dlog.debug(self.dlogname, 'Database コネクション取得処理 end')



    def begin(self, dbname):
        """
        トランザクション開始

        Parameters
        ----------
        dbname : str
            接続するデータベース名
        """
        if dbname not in self.trans:
            self.dlog.debug(self.dlogname, f'Database トランザクション開始処理 start : dbname = {dbname}')

            self.trans[dbname] = self.connect[dbname].begin()

            self.dlog.debug(self.dlogname, 'Database トランザクション開始処理 end')


    def doSql(self, dbname, sql_info):
        """
        SQL文の実行

        Parameters
        ----------
        sql_info : dict
            sqldict['sqls'] の1要素
        """
        # パラメータ設定の場合リターン
        sql_source = sql_info['sql']
        if sql_source['type'] == 'param':
            return

        try:
            # ＤＢ接続要求、コネクション取得、トランザクション開始
            self.create_engine(dbname)
            self.connection(dbname)
            self.begin(dbname)

            # ＳＱＬ実行
            self.dlog.debug(self.dlogname, f'Database SQL文の実行 start : dbname = {dbname}')

            self.doGenerateSql(dbname, sql_info)
        except Exception as e:
            self.dlog.error(self.dlogname, f'Database SQL文の実行 exception message : {e}')
            # 2026-08-02 B-007 SQL実行例外を握りつぶさず呼び出し元へ再送出（サイレント失敗解消）
            raise

        finally:
            self.dlog.debug(self.dlogname, f'Database SQL文の実行 end : dbname = {dbname}')


    def doGenerateSql(self, dbname, sql_info):
        """
        SQL文の実行

        Parameters
        ----------
        sql_info : dict
            sqldict['sqls'] の1要素
        """
        databasecommon = DatabaseCommon(self.dlog, self.dlogname, sql_info)

        # 入力レコードが定義されているか確認
        if 'input' in sql_info:
            input_record = sql_info['input']['record']
            max_line     = databasecommon.getMaxLine()
        else:
            max_line     = 1

        # 入力レコードの件数分、繰り返す（入力レコードが無い時は一回）
        idx = 0
        for _ in range(max_line):
            before_sql = databasecommon.createSql()

            self.dlog.debug(self.dlogname, f'Database バインド変数、置換前のSQL : {before_sql}')

            if 'input' in sql_info:
                after_sql = databasecommon.replaceSql(before_sql, input_record, idx)
            else:
                after_sql = before_sql

            # バインド変数置換後の文字列の特殊文字を元に戻す
            after_sql = self.specialcharconvert.editSqlDataToNormalChar(after_sql)

            self.dlog.debug(self.dlogname, f'Database バインド変数、置換後のSQL : {after_sql}')


            # SQL文を実行する（select 以外）
            if sql_info['sql']['type'] == 'doRun':
                #self.connect[dbname].execute(after_sql)
                self.execute(dbname, after_sql)
                idx += 1
                continue

            if sql_info['sql']['type'] != 'select':
                # DBアクセスログを出力する（割愛）

                #self.connect[dbname].execute(after_sql)
                self.execute(dbname, after_sql)
                idx += 1
                continue

            # SQL文を実行する（select）
            self.execute_select(dbname, after_sql, sql_info)
            idx += 1


    def execute(self, dbname, str_sql):
        """
        ＳＱＬ実行

        Parameters
        ----------
        dbname : str
            接続するデータベース名
        str_sql : str
            実行するSQL文
        """
        self.dlog.debug(self.dlogname, f'Database 実行するSQL文 : {str_sql}')

        result = self.connect[dbname].execute(str_sql)

        #self.dlog.debug(self.dlogname, f'Database 実行結果 : {result}')
        return result

    def execute_select(self, dbname, str_sql, sql_info):
        """
        Select SQL実行
        """
        self.dlog.debug(self.dlogname, f'Database 実行するSQL文 : {str_sql}')

        output_record = sql_info['output']['record']
        self.dlog.debug(self.dlogname, f'Database SQL実行前の出力レコード : {output_record}')

        # 取得行毎にループ
        result = self.connect[dbname].execute(str_sql)
        for i, row in enumerate(result):
            self.dlog.debug(self.dlogname, f'Database 取得行毎にループ : i = {i}, row = {row}')

            for key, value in row.items():
                if key in output_record:
                    if value is None:
                        value = ''

                    if i == 0:
                        output_record[key]['value'][0] = value
                    else:
                        output_record[key]['value'].append(value)

        # 取得データ無しの時の処理（割愛）

        self.dlog.debug(self.dlogname, f'Database SQL実行後の出力レコード : {output_record}')


    def commit(self):
        """
        コミット実行
        """
        before_key = ""
        for key in self.trans:
            if before_key == key:
                continue
            
            before_key = key

            self.dlog.debug(self.dlogname, f'Database コミット処理 start key : {key}')

            self.trans[key].commit()

            self.dlog.debug(self.dlogname, 'Database コミット処理 end')

    def rollback(self):
        """
        ロールバック
        """
        for key in self.trans:
            self.dlog.debug(self.dlogname, f'Database ロールバック処理 start key : {key}')

            self.trans[key].rollback()

            self.dlog.debug(self.dlogname, 'Database ロールバック処理 end')

    def close(self):
        """
        コネクションをプールに戻す
        """
        for key in self.connect:
            self.dlog.debug(self.dlogname, f'Database クローズ処理 start key : {key}')

            self.connect[key].close()

            self.dlog.debug(self.dlogname, 'Database クローズ処理 end\n')

        self.engine  = {}
        self.connect = {}
        self.trans   = {}



    def recordCheck(self, sql_info, sqldict):
        """
        sql.json の'check' が設定されている場合、出力レコードの存在チェックを行う
        check の設定値 : 'not found error'/ 'found error'

        Parameters
        ----------
        sql_info : dict
            sqldict['sqls'] の1要素
        sql_data : dict
            sqldict
        """
        try:
            if 'check' not in sql_info['sql']:
                return
            
            check = sql_info['sql']['check']
            if check == '':
                return

            errormsg = sql_info['sql']['errormsg']
            output_record = sql_info['output']['record']

            self.dlog.debug(self.dlogname, f'Database recordCheck チェック処理 : {check}')
            for _, value in output_record.items():
                size = len(value['value'])
                if check == 'not found error':
                    if size == 1 and value['value'][0] == '':
                        self.dlog.debug(self.dlogname, 'Database recordCheck チェック処理エラー　有り')

                        sqldict['message']['status'] = 'ERROR'
                        sqldict['message']['msg'] = errormsg
                        return

                if check == 'found error':
                    if size >= 1 and value['value'][0] != '':
                        self.dlog.debug(self.dlogname, 'Database recordCheck チェック処理エラー　有り')

                        sqldict['message']['status'] = 'ERROR'
                        sqldict['message']['msg'] = errormsg
                        return

        except Exception as e:
            self.dlog.error(self.dlogname, f'Database recordCheck exception message : {e}')
