# coding: utf-8

from commons.appcache           import AppCache
from excelprint.excelcontroller import ExcelController


class ExcelMainController():
    """
    エクセル作成のメインコントローラ（手順）
    
    excelstart：excelCreateの各種変数の初期設定を行う
    call：エクセル作成のメインロジック（ヘッダー・明細・フッターの各処理を呼び出す）
    excelterminate：作成したエクセルを別名で出力し、格納先を設定したレスポンスデータを作成する

    Attributes
    ----------
    log : HaluLogger
    app_cache : AppCache
        レスポンス情報からエクセル作成時に呼び出される form.py
    excelcontroller : ExcelController
        エクセル作成のコントローラ（詳細手順）
    """


    def __init__(self, excellog, excellogname, responsedict):
        try:
            self.excellog        = excellog
            self.excellogname    = excellogname
            self.excellog.debug(self.excellogname, 'ExcelMainController init start')

            self.app_cache       = AppCache(self.excellog, self.excellogname, 'form.py')
            self.excelcontroller = ExcelController(self.excellog, self.excellogname, responsedict)

        except Exception as e:
            self.excellog.error(self.excellogname, f'ExcelMainController init exception message : {e}')
            # 2026-09-15 Issue #14 握り潰すと後続で別の例外になり真因が隠れるため再送出する
            raise

        finally:
            self.excellog.debug(self.excellogname, 'ExcelMainController init end\n')


    # エクセル作成の初期処理
    def excelstart(self, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelMainController excelstart start')

        self.excelcontroller.excelstart(responsedict)

        self.excellog.debug(self.excellogname, 'ExcelMainController excelstart end\n')


    # エクセル作成のメイン処理：プリントキー１件に対して１回コールされる
    def call(self, responsedict, sqldict, requestdict):
        try:
            self.excellog.debug(self.excellogname, 'ExcelMainController call start')

            w_excelcreate = self.excelcontroller.getExcelCreate()
            form_object   = self.app_cache.getFormObject(w_excelcreate, responsedict, sqldict, requestdict)

    
            # カレントページNO（プリントキー１件毎のページNO）をクリアする
            self.excelcontroller.excelcreate.currPageNo = 0

            # ヘッダー処理
            self.excellog.debug(self.excellogname, 'ExcelMainController call ヘッダー処理 start')
            headerinfo_list = self.excelcontroller.getrecordinfo_pageoutputcontroll('page_header', 'all_page', responsedict)
            self.excelcontroller.pageheader(headerinfo_list, form_object)
    
    
            # 明細の行数を求める
            detailinfo_list = self.excelcontroller.getrecordinfo_pageoutputcontroll('detail', 'all_page', responsedict)
            detailsize      = 0
            for recordinfo in detailinfo_list:
                for value in recordinfo['record'].values():
                    tempsize = len(value['value'])
                    if tempsize > detailsize:
                        detailsize = tempsize
            self.excellog.debug(self.excellogname, f'ExcelMainController call 明細行数 : {detailsize}')
    
            # 明細処理
            for row in range(detailsize):
                self.excellog.debug(self.excellogname, f'ExcelMainController call 明細処理 start')
                self.excelcontroller.pagedetail(detailinfo_list, form_object, detailsize, row, responsedict)
    
    
            # フッター処理
            self.excellog.debug(self.excellogname, 'ExcelMainController call フッター処理 start')
            footerinfo_list = self.excelcontroller.getrecordinfo_pageoutputcontroll('page_footer', 'all_page', responsedict)
            self.excelcontroller.pagefooter(footerinfo_list, form_object)
    

            self.excellog.debug(self.excellogname, 'ExcelMainController call end\n')
    
        except Exception as e:
            self.excellog.error(self.excellogname, f'ExcelMainController exception message type    : {str(type(e))}')
            self.excellog.error(self.excellogname, f'ExcelMainController exception message arg     : {str(e.args)}')
            # 2026-09-15 Issue #14 e.message は存在せず AttributeError で真因のログが上書きされていたため削除。
            # 握り潰して処理を続けると部分生成の帳票が status=OK で返るため再送出する（PrintMainController がエラー応答にする）
            self.excellog.error(self.excellogname, f'ExcelMainController exception message         : {e}')
            raise




    # エクセル作成の終了処理（作成したエクセルをファイルへ出力し、格納先を設定したレスポンスデータを作成する）
    def excelterminate(self, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelMainController excelterminate start')

        new_responsedict = self.excelcontroller.excelterminate(responsedict)

        self.excellog.debug(self.excellogname, 'ExcelMainController excelterminate end\n')
        return new_responsedict



# ---------------------------------------------
#    テンプレートクラス 実行開始
# ---------------------------------------------
def main():
    print('***  ExcelMainController start  ***\n')


    print('\n***  ExcelMainController start end  ***')


if __name__ == '__main__':
    main()
