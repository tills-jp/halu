# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import hashlib
from commons.jsonchunk import getjsonchunkbyid


class UserDetailMainte_model():
    """
    sql.json から呼び出し("prog": "yes"の場合)

    パスワードをＳＨＡ２５６ハッシュ化して保存するための前処理を行う（Ｃ－０２２）。
    照会系ＳＱＬはパスワードを画面へ返さないため、訂正時のパスワード欄は
    「空欄＝変更なし」として扱い、パスワード有無で実行するＳＱＬを切り替える。

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
            self.mvclog.debug(self.mvclogname, 'UserDetailMainte_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'UserDetailMainte_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'UserDetailMainte_model init end')

    def hashPasswordOfInsert(self, idName):
        """
        登録処理のパスワードをＳＨＡ２５６ハッシュへ変換する
        （ユーザマスタ 登録処理（insert）の before で呼ばれる）
        　※新規登録はパスワード必須のため、空の場合はエラーメッセージを設定して中断する
        　（validation では訂正時の空欄を許容するため、必須チェックはここで担保する）

        Parameters
        ----------
        idName : str
            対象とするＳＱＬのid（sqls[].id）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, f'UserDetailMainte_model hashPasswordOfInsert start idName = {idName}')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', idName, 'input', 'record')

        if self.getPasswordValue(sqlRecord) == '':
            self.sqldict['message']['status'] = 'ERROR'
            self.sqldict['message']['msg'] = 'パスワードを入力してください。'
            status = 'ERROR'
        else:
            self.setHashedPassword(sqlRecord)
            status = 'OK'

        self.mvclog.debug(self.mvclogname,
                          f'UserDetailMainte_model hashPasswordOfInsert end status = {status}')
        return status

    def hashPasswordOfUpdate(self, idName):
        """
        訂正処理（パスワード変更あり）のパスワードをＳＨＡ２５６ハッシュへ変換する
        （ユーザマスタ 訂正処理（update）の before で呼ばれる）
        　※パスワードが空（＝変更なし）の場合は 'PASS' を返して当該ＳＱＬの実行をスキップし、
        　パスワードを含まない訂正ＳＱＬ（update_nopw）側で更新する

        Parameters
        ----------
        idName : str
            対象とするＳＱＬのid（sqls[].id）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, f'UserDetailMainte_model hashPasswordOfUpdate start idName = {idName}')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', idName, 'input', 'record')

        if self.getPasswordValue(sqlRecord) == '':
            status = 'PASS'
        else:
            self.setHashedPassword(sqlRecord)
            status = 'OK'

        self.mvclog.debug(self.mvclogname,
                          f'UserDetailMainte_model hashPasswordOfUpdate end status = {status}')
        return status

    def skipIfNoPasswordInput(self, idName):
        """
        訂正処理（パスワード変更なし）を実行するか判定する
        （ユーザマスタ 訂正処理（update_nopw）の before で呼ばれる）
        　※画面のパスワードが入力されている場合は、パスワードを含む訂正ＳＱＬ（update）が
        　実行済みのため 'PASS' を返して当該ＳＱＬの実行をスキップする

        Parameters
        ----------
        idName : str
            対象とするＳＱＬのid（sqls[].id）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, f'UserDetailMainte_model skipIfNoPasswordInput start idName = {idName}')

        requestRecord = getjsonchunkbyid(self.requestdict, 'records', 'header', 'record')

        if self.getPasswordValue(requestRecord) == '':
            status = 'OK'
        else:
            status = 'PASS'

        self.mvclog.debug(self.mvclogname,
                          f'UserDetailMainte_model skipIfNoPasswordInput end status = {status}')
        return status

    def getPasswordValue(self, record):
        """
        レコードからパスワードの値（１件目）を取得する

        Parameters
        ----------
        record : dict
            ＳＱＬの入力レコード／リクエストのレコード

        Returns
        -------
        password : str
            パスワードの値（項目・値が無い場合は空文字）
        """
        if 'パスワード' not in record:
            return ''

        values = record['パスワード']['value']
        if len(values) == 0:
            return ''

        return values[0]

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
        plain = self.getPasswordValue(sqlRecord)
        if plain == '':
            return 'OK'

        values = list(sqlRecord['パスワード']['value'])
        values[0] = hashlib.sha256(plain.encode('utf-8')).hexdigest()
        sqlRecord['パスワード']['value'] = values

        return 'OK'
