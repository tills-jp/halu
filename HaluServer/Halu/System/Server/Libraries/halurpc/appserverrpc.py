# coding: utf-8

import json
import msgpackrpc

from logger.halulogger         import HaluLogger
from halumain.haluconf         import HaluConf
from model.mainmodel           import MainModel
from view.mainview             import MainView
from controller.maincontroller import MainController


class AppServer():
    """
    起動元：halumain/appserver.pyから起動される常駐型のアプリケーションサーバ

    呼び出し元：AppClient
    仮引数：requestdict
    戻り値：responsedict
    """
    def __init__(self):
        self.alog     = HaluLogger('appserver')
        self.alogname = 'appserver'
        
        self.alog.debug(self.alogname, 'app server init start')

        # MVCをインスタンスする
        mlog                 = HaluLogger('model')
        mlogname             = 'model'
        dlog                 = HaluLogger('database')
        dlogname             = 'database'
        self.main_model      = MainModel(mlog, mlogname, dlog, dlogname)

        vlog                 = HaluLogger('view')
        vlogname             = 'view'
        self.main_view       = MainView(vlog, vlogname)

        clog                 = HaluLogger('controller')
        clogname             = 'controller'
        self.main_controller = MainController(clog, clogname, self.main_model, self.main_view)

        self.alog.debug(self.alogname, 'app server init end\n')


    def call(self, requestdict):
        # 2026-09-15 Issue #14 例外時に finally が未定義変数を参照しないよう先に初期化する
        responsedict = None
        try:
            self.alog.debug(self.alogname, f'app server start requestdict : {requestdict}')

            # メインコントローラをコールする
            responsedict    = self.main_controller.call(requestdict)

            return responsedict

        except Exception as e:
            self.alog.error(self.alogname, f'app server abnormal  message : {e}')
            # 2026-09-15 Issue #14 None を明示的に返す（halumain が status=ERROR の応答に置き換える）
            return None

        finally:
            self.alog.debug(self.alogname, f'app server end  responsedict : {responsedict}\n')


class AppClient():
    """
    halu/halu.pyのhalumain内でインスタンスされ、callが実行される

    呼び出し先：AppServer
    実引数：requestdict
    戻り値：responsedict
    """
    def __init__(self):
        hconf          = HaluConf()
        self.ipaddress = hconf.appserver_address
        self.port      = hconf.appserver_port


    def call(self, requestdict):
        # アプリケーションサーバへ接続する
        client = msgpackrpc.Client(msgpackrpc.Address(self.ipaddress, self.port), unpack_encoding='utf-8')

        # アプリケーションサーバへリクエストデータを送信し、レスポンスデータを受け取る
        #responsedict = client.call('call', requestdict)
        future       = client.call_async('call', requestdict)
        responsedict = future.get()
        return responsedict
