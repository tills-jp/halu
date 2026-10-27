# coding: utf-8

from commons.jsoncache         import JsonCache
from commons.appcache          import AppCache
from controller.controller     import Controller
from batchstartup.batchexecute import BatchExecute
from halurpc.printserverrpc    import PrintClient
#from halurpc.batchserverrpc    import BatchClient

class MainController():
    """
    1.AppServer からリクエストデータを受け取る
    2.Controllerを呼び出し、リクエストデータをチェック
    3.modelを呼び出す指示がある場合、MainModelを呼び出しSQLデータを取得
    4.MainViewを呼び出しレスポンスデータを取得
    5.レスポンスデータをAppServer に返す

    Attributes
    ----------
    log : HaluLogger
    main_model : MainModel
        メインモデル オブジェクト
    main_view  : MainView
        メインビュー オブジェクト
    json_cache : JsonCache
        validation定義情報のキャッシュ
    app_cache  : AppCache
        コントローラAPPのキャッシュ
    """
    def __init__(self, clog, clogname, mainmodel, mainview):
        try:
            self.clog     = clog
            self.clogname = clogname
            self.clog.debug(self.clogname, 'MainController init start')

            # 利用する外部クラスをインスタンス
            self.json_cache = JsonCache(self.clog, self.clogname, 'validation.json')
            self.app_cache  = AppCache(self.clog, self.clogname, 'controller.py')

            # インスタンス変数を設定
            self.main_model = mainmodel
            self.main_view  = mainview

        except Exception as e:
            self.clog.error(self.clogname, f'MainController init exception message : {e}')

        finally:
            self.clog.debug(self.clogname, 'MainController init end\n')


    def call(self, requestdict):
        """
        メイン処理（AppServer から呼び出される）

        Parameters
        ----------
        requestdict : dict
            1. リクエストJSONの  "message": {"status": "OK",の時
            2. "model": を検索する
            3. "model": "yes",の時
            4. main_modelからsqldictを貰う
            5.sqldict["sqls"]内に
              sql_info['id'] == 'printParam'、もしくは、sql_info['id'] == 'printKey'がある時
              プリント処理を起動し、レスポンスデータを取得する。
              どちらもない時は、メインビューのcallを実行し、レスポンスデータを取得する

        Returns
        -------
        responsedict : dict
            レスポンスデータ
            main_view.call の戻り値
        """
        # 2026-09-15 Issue #14 モデル呼び出し前の例外（帳票サーバー未起動等）で except の return が
        # 未定義変数を参照しないよう先に初期化する（None は halumain がエラー応答に置き換える）
        responsedict = None
        try:
            self.clog.debug(self.clogname, f'MainController: call start requestdict : {requestdict}')

            controller = Controller(self.clog, self.clogname, requestdict)
            requestdict = controller.call(self.json_cache, self.app_cache)
            self.clog.debug(self.clogname, f'MainController: チェック済 requestdict : {requestdict}')

            # メインモデルのcallを実行し、SQLデータを取得する
            sqldict = {}
            if requestdict['message']['status'] == 'OK':
                if 'model' in requestdict:
                    if requestdict['model'] == 'yes':
                        sqldict = self.main_model.call(requestdict)
                        self.clog.debug(self.clogname, f'MainController: モデルが処理した sqldict : {sqldict}')


            # プリント処理の判定
            next_sw = 'OFF'
            if requestdict['message']['status'] == 'OK':
                if 'model' in requestdict:
                    if requestdict['model'] == 'yes':
                        # 2026-08-02 B-008 SQL実行・フックがERRORの場合はバッチ/帳票を起動せずエラー応答へ
                        if sqldict['message']['status'] == 'OK':
                            for sql_info in sqldict['sqls']:
                                if sql_info['id'] == 'printParam':
                                    next_sw       = 'print'
                                    break
                                if sql_info['id'] == 'batchStartup':
                                    next_sw       = 'batchStartup'
                                    break


            if next_sw == 'print':
                # プリントサーバに接続し、PDF情報を取得する
                printclient  = PrintClient()
                responsedict = printclient.call(sqldict)
            elif next_sw == 'batchStartup':
                # バッチファイルを起動する
                batch_execute = BatchExecute(self.clog, self.clogname)
                responsedict  = batch_execute.call(sql_info, sqldict)
            else:
                # メインビューのcallを実行し、レスポンスデータを取得する
                responsedict = self.main_view.call(requestdict, sqldict)


            self.clog.debug(self.clogname, f'MainController: ビューが処理した responsedict : {responsedict}')
            return responsedict

        except Exception as e:
            self.clog.error(self.clogname, f'MainController: call exception message : {e}')
            return responsedict

        finally:
            self.clog.debug(self.clogname, 'MainController: call end\n')
