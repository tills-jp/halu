# coding: utf-8

import os

class HaluConf():

    def __init__(self):

        # -------------------------------------------------------------
        # OSを判定し、システムパスとアプリケーションパスを設定する
        # -------------------------------------------------------------
        if os.name == 'nt':
            self.__sysos      = 'Windows'
            self.__serverpath = 'C:/git_tills/halu/HaluServer'
            self.__syspath    = 'C:/git_tills/halu/HaluServer/Halu/System'
            self.__apppath    = 'C:/git_tills/halu/HaluProject/Halu/Application'
            self.__soffice    = 'C:/LibreOffice/program/soffice'
        elif os.name == 'posix':
            self.__sysos      = 'Linux'
            self.__serverpath = '/home/halu_user/HaluServer'
            self.__syspath    = '/home/halu_user/HaluServer/Halu/System'
            self.__apppath    = '/home/halu_user/HaluProject/Halu/Application'
            self.__soffice    = '/usr/bin/soffice'


        # -------------------------------------------------------------
        # ログレベルの設定
        # Level = DEBUG      開発者用ログを出力
        #       = INFO       指示・案内等を出力（エラーではない）
        #       = WARNING    想定外のエラーが発生（継続可能）
        #       = ERROR      致命的なエラーが発生
        #       = CRITICAL   プログラムの実行不能なエラー
        # -------------------------------------------------------------
        self.__loglebel  = 'DEBUG'


        # -------------------------------------------------------------
        # Halu アプリケーションサーバのIPアドレス＆ポート番号を設定する
        # -------------------------------------------------------------
        self.__appserver_address = 'localhost'
        self.__appserver_port    = 18800


        # -------------------------------------------------------------
        # Halu プリントサーバのIPアドレス＆ポート番号を設定する
        # -------------------------------------------------------------
        self.__printserver_address = 'localhost'
        self.__printserver_port    = 18810


        # -------------------------------------------------------------
        # Halu バッチサーバのIPアドレス＆ポート番号を設定する
        # -------------------------------------------------------------
        self.__batchserver_address = 'localhost'
        self.__batchserver_port    = 18820


        # --------------------------------------------------------------
        # Rmenu アプリケーションサーバのIPアドレス＆ポート番号を設定する
        # --------------------------------------------------------------
        self.__rmenu_appserver_address = 'localhost'
        self.__rmenu_appserver_port    = 12345

        # 2026-08-05 B-003 ipaddress_check（未結線・許可IPリスト設定が存在せず結線不能）を廃止


        # -------------------------------------------------------------
        #   プロジェクト別 データベース定義 開始
        # -------------------------------------------------------------
        # 2026-07-22 Docker対応
        # 接続先は環境変数 DATABASE_HOST / DATABASE_PORT / DATABASE_USER / DATABASE_PASSWORD を優先し、
        # 未設定時は従来値にフォールバックする（ホスト直接起動＝従来通り、Dockerコンテナ＝docker-compose.ymlが注入）。
        self.__def_database = {}

        # Sample DB
        database0             = {}
        database0['dbdriver'] = 'postgresql'
        database0['hostname'] = os.environ.get('DATABASE_HOST', '127.0.0.1')
        database0['portno']   = os.environ.get('DATABASE_PORT', '55432')
        database0['database'] = 'sample'
        database0['username'] = os.environ.get('DATABASE_USER', 'postgres')
        database0['password'] = os.environ.get('DATABASE_PASSWORD', 'postgres')
        self.__def_database['sample'] = database0

        # 追加アプリ用 DB の雛形（コピーしてコメントを外し、DB名と辞書キーを sql.json の "dbname" と一致させる）
        # database1             = {}
        # database1['dbdriver'] = 'postgresql'
        # database1['hostname'] = os.environ.get('DATABASE_HOST', '127.0.0.1')
        # database1['portno']   = os.environ.get('DATABASE_PORT', '55432')
        # database1['database'] = 'myapp'
        # database1['username'] = os.environ.get('DATABASE_USER', 'postgres')
        # database1['password'] = os.environ.get('DATABASE_PASSWORD', 'postgres')
        # self.__def_database['myapp'] = database1

        # -------------------------------------------------------------
        #   プロジェクト別 データベース定義 終了
        # -------------------------------------------------------------



    # OSの種別
    @property
    def sysos(self):
        return self.__sysos

    # サーバパス
    @property
    def serverpath(self):
        return self.__serverpath

    # システムパス
    @property
    def syspath(self):
        return self.__syspath

    # アプリケーションパス
    @property
    def apppath(self):
        return self.__apppath

    # PDF変換アプリパス
    @property
    def soffice(self):
        return self.__soffice

    # Halu アプリケーションサーバ ＩＰアドレス
    @property
    def appserver_address(self):
        return self.__appserver_address

    # Halu アプリケーションサーバ ポート番号
    @property
    def appserver_port(self):
        return self.__appserver_port

    # Halu プリントサーバ ＩＰアドレス
    @property
    def printserver_address(self):
        return self.__printserver_address

    # Halu プリントサーバ ポート番号
    @property
    def printserver_port(self):
        return self.__printserver_port

    # Halu バッチサーバ ＩＰアドレス
    @property
    def batchserver_address(self):
        return self.__batchserver_address

    # Halu バッチサーバ ポート番号
    @property
    def batchserver_port(self):
        return self.__batchserver_port

    # Rmenu アプリケーションサーバ ＩＰアドレス
    @property
    def rmenu_appserver_address(self):
        return self.__rmenu_appserver_address

    # Rmenu アプリケーションサーバ ポート番号
    @property
    def rmenu_appserver_port(self):
        return self.__rmenu_appserver_port

    # ログレベル
    @property
    def loglebel(self):
        return self.__loglebel

    # 2026-08-05 B-003 ipaddress_check（未結線・許可IPリスト設定が存在せず結線不能）を廃止

    # プロジェクト別 データベース定義
    @property
    def def_database(self):
        return self.__def_database



# ---------------------------
#    テスト＆使用法 開始
# ---------------------------
def main():
    print('***  main start  ***\n')

    conf = HaluConf()
    print(f'ＯＳ：{conf.sysos}')
    print(f'サーバパス：{conf.serverpath}')
    print(f'ＳＹＳパス：{conf.syspath}')
    print(f'ＡＰＰパス：{conf.apppath}')
    print(f'ＡＰＰサーバアドレス：{conf.appserver_address}')
    print(f'ＡＰＰサーバポート：{conf.appserver_port}')
    print(f'プリントサーバアドレス：{conf.printserver_address}')
    print(f'プリントサーバポート：{conf.printserver_port}')
    print(f'ログレベル：{conf.loglebel}')
    print(f'Rmenu ＡＰＰサーバアドレス：{conf.rmenu_appserver_address}')
    print(f'Rmenu ＡＰＰサーバポート：{conf.rmenu_appserver_port}')

    # 2026-08-05 B-003 ipaddress_check（未結線・許可IPリスト設定が存在せず結線不能）を廃止

    print('\n***  main end  ***')


if __name__ == '__main__':
    main()
