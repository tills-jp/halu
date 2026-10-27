# coding: utf-8

import json
import msgpackrpc

from logger.halulogger               import HaluLogger
from halumain.haluconf               import HaluConf
from model.mainmodel                 import MainModel
from view.mainview                   import MainView
from excelprint.printmaincontroller  import PrintMainController, makePrintErrorResponse


class PrintServer():
    """
    起動元：halumain/printserver.pyから起動される常駐型のプリントサーバ

    呼び出し元：PrintClient
    仮引数：sqldict
           sqldict[sqls]内の
               id='printParam'・・・プリント作成時のパラメータ情報
               id='printKey'  ・・・プリント作成時のキー情報
    戻り値：responsedict
    """
    
    def __init__(self):
        self.pserverlog     = HaluLogger('print/printserver')  # ログファイル名を設定
        self.pserverlogname = 'print/printserver'

        self.pserverlog.debug(self.pserverlogname, 'PrintServer init start')

        # MVCをインスタンスする
        mlog                 = HaluLogger('print/printmodel')
        mlogname             = 'print/printmodel'
        dlog                 = HaluLogger('print/printdatabase')
        dlogname             = 'print/printdatabase'
        self.main_model      = MainModel(mlog, mlogname, dlog, dlogname)

        vlog                 = HaluLogger('print/printview')
        vlogname             = 'print/printview'
        self.main_view       = MainView(vlog, vlogname)

        clog                 = HaluLogger('print/printcontroller')
        clogname             = 'print/printcontroller'
        self.main_controller = PrintMainController(clog, clogname, self.main_model, self.main_view)

        self.pserverlog.debug(self.pserverlogname, 'PrintServer init end\n')

        
    def call(self, sqldict):
        # 2026-09-15 Issue #14 例外時も応答を返す（finally の参照エラー防止のため先に初期化）
        responsedict = None
        try:
            self.pserverlog.debug(self.pserverlogname, f'PrintServer call start printdict   : {sqldict}')

            # プリント メインコントローラをコールする
            responsedict    = self.main_controller.call(sqldict)

            return responsedict

        except Exception as e:
            self.pserverlog.error(self.pserverlogname, f'PrintServer abnormal message : {e}')
            # 2026-09-15 Issue #14 戻り値なしではなくエラー応答を返す
            responsedict = makePrintErrorResponse()
            return responsedict

        finally:
            self.pserverlog.debug(self.pserverlogname, f'PrintServer call end responsedict : {responsedict}\n')


class PrintClient():
    """
    プリントサーバへの接続

    呼び出し元：MainController
        main_modelをcallした戻り値sqldict内に
        id='printParam', id='printKey'がある時、
        PrintClientをインスタンスし、callする

    呼び出し先：PrintServer
    仮引数：sqldict
           sqldict[sqls]内の
               id='printParam'・・・プリント作成時のパラメータ情報
               id='printKey'  ・・・プリント作成時のキー情報
    戻り値：responsedict
    """

    def __init__(self):
        hconf          = HaluConf()
        self.ipaddress = hconf.printserver_address
        self.port      = hconf.printserver_port


    def call(self, sqldict):
        client       = msgpackrpc.Client(msgpackrpc.Address(self.ipaddress, self.port), unpack_encoding='utf-8')

        # RPC プリントサーバへプリントキー・パラメータを送信し、レスポンスデータを受け取る
        #responsedict = client.call('call', printparamdict)
        future       = client.call_async('call', sqldict)
        responsedict = future.get()
        return responsedict


