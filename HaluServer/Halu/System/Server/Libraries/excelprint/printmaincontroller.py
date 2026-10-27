# coding: utf-8

import traceback

from logger.halulogger              import HaluLogger
from commons.jsoncache              import JsonCache
from commons.appcache               import AppCache
from excelprint.printcontroller     import PrintController
from excelprint.excelmaincontroller import ExcelMainController


# 2026-09-15 Issue #14 帳票生成に失敗したときクライアントへ返すエラー応答
PRINT_ERROR_MSG = '帳票の作成に失敗しました。サーバーログを確認してください。'


def makePrintErrorResponse():
    """帳票生成の例外時に返す応答（status=ERROR）。クライアントはこの message.msg をサーバエラーダイアログに表示する"""
    return {'message': {'status': 'ERROR', 'msg': PRINT_ERROR_MSG}}


class PrintMainController():
    """
    プリントメインコントローラクラス

    call:
    １．PrintServer からsql.jsonデータ(printKey, printParam)を受け取る
    ２．PrintControllerを呼び出し、printKey, printParamからリクエストデータを作成する
    ３．modelを呼び出す指示がある場合、MainModelを呼び出しSQLデータを取得
    ４．MainViewを呼び出しレスポンスデータを取得
    ５．レスポンスデータをExcelMainController に渡し、エクセルを作成する
    ６．作成されたエクセルのパスが設定されたresponsedictをリターンする
    

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
            self.clog.debug(self.clogname, 'PrintMainController init start')

            # 利用する外部クラスをインスタンス
            self.json_cache = JsonCache(self.clog, self.clogname, 'tran.json')
            self.app_cache  = AppCache(self.clog, self.clogname, 'controller.py')

            # インスタンス変数を設定
            self.main_model = mainmodel
            self.main_view  = mainview

            self.excellog     = HaluLogger('print/excelcontroller')
            self.excellogname = 'print/excelcontroller'


        except Exception as e:
            self.clog.error(self.clogname, f'PrintMainController init exception message : {e}')

        finally:
            self.clog.debug(self.clogname, 'PrintMainController init end\n')


    def call(self, sqldict):
        """
        メイン処理（PrintServer から呼び出される）
        """
        try:
            self.clog.debug(self.clogname, f'PrintMainController: call start printdict : {sqldict}')
    
            # プリントパラメータ情報とプリントキー情報を取得する
            for sql_info in sqldict['sqls']:
                if sql_info['id'] == 'printKey':
                    if sql_info["output"]:
                        keyrecord = sql_info["output"]["record"]
                    else:
                        keyrecord = sql_info["input"]["record"]
                    continue

                if sql_info['id'] == 'printParam':
                    param_info = sql_info
                    continue


            # プリントキー情報の行数を取得する
            maxsize        = 0
            for value in keyrecord.values():
                tempsize = len(value['value'])
                if tempsize > maxsize:
                    maxsize = tempsize
    
    
            # 取得したキーの行数回 繰り返す
            for row in range(maxsize):
                # プリントキーから項目名・値のハッシュを作成する（キー値の行数が１行と複数行のデータが混在するため）
                keydict = {}
                for key, value in keyrecord.items():
                  if value["value"][row]:
                    keydict[key] = value["value"][row]
                  else:
                    keydict[key] = value["value"][0]

                
                # コントローラを実行し、プリント処理用のキーデータとパラメータデータが設定されたリクエストデータを作成する
                controller = PrintController(self.clog, self.clogname, param_info, keydict)
                requestdict = controller.call(self.json_cache, self.app_cache)
                self.clog.debug(self.clogname, f'PrintMainController: プリントコントローラが作成した requestdict : {requestdict}')

    
                # メインモデルのcallを実行し、SQLデータを取得する
                printsqldict = self.main_model.call(requestdict)
                self.clog.debug(self.clogname, f'PrintMainController: モデルが作成した sqldict : {printsqldict}')
    
    
                # メインビューのcallを実行し、レスポンスデータを取得する
                responsedict = self.main_view.call(requestdict, printsqldict)
                self.clog.debug(self.clogname, f'PrintMainController: ビューが作成した responsedict : {responsedict}\n')

    
                # エクセルメインコントローラを実行する（エクセルを作成する）
                if row == 0:
                    excelmaincontroller = ExcelMainController(self.excellog, self.excellogname, responsedict)

                    # エクセル作成の初期処理
                    excelmaincontroller.excelstart(responsedict)
    
                # エクセル作成のメイン処理
                excelmaincontroller.call(responsedict, printsqldict, requestdict)
    
    
            # エクセル作成の終了処理（作成したエクセルを出力し、格納先を設定したレスポンスデータを作成する）
            newResponse = excelmaincontroller.excelterminate(responsedict)
    
    
            self.clog.debug(self.clogname, f'PrintMainController: excelmaincontrollerが処理した newResponse : {newResponse}')
            return newResponse

        except Exception as e:
            self.clog.error(self.clogname, f'PrintMainController exception message type    : {str(type(e))}')
            self.clog.error(self.clogname, f'PrintMainController exception message arg     : {str(e.args)}')
            # 2026-09-15 Issue #14 戻り値なし（None→クライアントでは null）ではなくエラー応答を返す
            self.clog.error(self.clogname, f'PrintMainController exception traceback       : {traceback.format_exc()}')
            return makePrintErrorResponse()

        finally:
            self.clog.debug(self.clogname, 'PrintMainController: call end\n')



# ---------------------------------------------
#    テンプレートクラス 実行開始
# ---------------------------------------------
def main():
    print('***  printserver start  ***\n')


    print('\n***  printserver start end  ***')


if __name__ == '__main__':
    main()
