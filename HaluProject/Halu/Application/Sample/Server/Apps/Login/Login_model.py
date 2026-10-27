# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import hashlib
from commons.jsonchunk import getjsonchunkbyid


class Login_model():
    """
    sql.json から呼び出し("prog": "yes"の場合)

    ログイン認証時のパスワード照合をハッシュ値で行うため、
    ＳＱＬ入力値の平文パスワードをＳＨＡ２５６ハッシュへ変換する（Ｃ－０２２）。

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
            self.mvclog.debug(self.mvclogname, 'Login_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'Login_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'Login_model init end')

    def hashPassword(self, idName):
        """
        指定したＳＱＬの入力値のパスワードをＳＨＡ２５６ハッシュへ変換する
        （login_check・header の before で呼ばれる。ＤＢはハッシュ値を保持しているため、
        　平文のままでは照合が成立しない）
        　※パスワードが空の場合は変換しない（ＤＢ照合で自然に不一致となる）

        Parameters
        ----------
        idName : str
            対象とするＳＱＬのid（sqls[].id）

        Returns
        -------
        status : str
            実行結果（'OK' 固定）
        """
        self.mvclog.debug(self.mvclogname, f'Login_model hashPassword start idName = {idName}')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', idName, 'input', 'record')
        self.setHashedPassword(sqlRecord)

        self.mvclog.debug(self.mvclogname, 'Login_model hashPassword end status = OK')
        return 'OK'

    def setHashedPassword(self, sqlRecord):
        """
        ＳＱＬ入力レコードのパスワードをＳＨＡ２５６ハッシュ（小文字１６進６４桁）へ置き換える

        値配列はリクエストデータと同一オブジェクトを共有している場合があるため
        （フレームワークの項目移送は参照代入）、新しい配列へ差し替えて
        リクエスト側の平文を書き換えないようにする

        Parameters
        ----------
        sqlRecord : dict
            ＳＱＬの入力レコード -> sqls[idName]['input']['record']

        Returns
        -------
        status : str
            実行結果（'OK' 固定）
        """
        if 'パスワード' not in sqlRecord:
            return 'OK'

        values = list(sqlRecord['パスワード']['value'])
        if len(values) == 0:
            return 'OK'

        plain = values[0]
        if plain == '':
            return 'OK'

        values[0] = hashlib.sha256(plain.encode('utf-8')).hexdigest()
        sqlRecord['パスワード']['value'] = values

        return 'OK'
