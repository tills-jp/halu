# coding: utf-8

from commons.dynamicapp      import DynamicApp
from excelprint.excelcreate  import ExcelCreate


class ExcelController():
    """
    エクセル作成の詳細手順

    excelstart：ExcelCreateの各種変数の初期設定を行う
    excelterminate：作成したエクセルをファイルへ出力し、格納先を設定したレスポンスデータを作成する
    pageheader：ページヘッダー印字処理
    pagedetail 明細行 印字処理
    pagefooter：ページフッター印字処理
    getrecordinfo_pageoutputcontroll：
        responsedictから該当するpagecontrollデータを取り出し、その中から、該当するoutputcontrollデータを取り出す
        取り出されたデータが印字対象のデータとなる
    exceloutputcontroll：
        エクセルのセルに項目の値を出力する


    Attributes
    ----------
    log : HaluLogger
    dynamicapp : DynamicApp
        form.pyに記述されたbeforeとafter メソッドの呼び出しクラス
    excelcreate : ExcelCreate
        エクセル作成ライブラリー：ReportLabの実装クラス
        現在の実装は String・Imageの２種類（必要都度追加していく）
    """


    def __init__(self, excellog, excellogname, responsedict):
        try:
            self.excellog        = excellog
            self.excellogname    = excellogname
            self.excellog.debug(self.excellogname, 'ExcelController init start')

            self.dynamicapp    = DynamicApp()
            self.excelcreate   = ExcelCreate(self.excellog, self.excellogname, responsedict)

        except Exception as e:
            self.excellog.error(self.excellogname, f'ExcelController init exception message : {e}')
            # 2026-09-15 Issue #14 握り潰すと後続で別の例外になり真因が隠れるため再送出する
            raise

        finally:
            self.excellog.debug(self.excellogname, 'ExcelController init end')


    # エクセル作成の初期処理
    def getExcelCreate(self):
        self.excellog.debug(self.excellogname, 'ExcelController getExcelCreate start')

        return self.excelcreate


    # エクセル作成の初期処理
    def excelstart(self, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelController excelstart start')

        detailinfo_list = self.getrecordinfo_pageoutputcontroll('detail', 'all_page', responsedict)
        self.excelcreate.excelstart(detailinfo_list[0])

        self.excellog.debug(self.excellogname, 'ExcelController excelstart end')


    # # エクセル作成の終了処理（作成したPDFをファイルへ出力し、格納先を設定したレスポンスデータを作成する）
    def excelterminate(self, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelController excelterminate start')

        newResponse = self.excelcreate.excelterminate(responsedict)

        self.excellog.debug(self.excellogname, 'ExcelController excelterminate end')
        return newResponse


    # ページヘッダー印字処理
    def pageheader(self, headerinfo_list, form_object):
        self.excellog.debug(self.excellogname, 'ExcelController pageheader start')


        # トータルページNOとカレントページNOをクリアする
        
        self.excelcreate.add_totalPageNo(1)
        self.excelcreate.add_currPageNo(1)

        # エクセルにシートを追加する
        self.excelcreate.newPage()

        # ページヘッダーを出力する
        self.exceloutputcontroll('page_header', headerinfo_list, 0, form_object)


        self.excellog.debug(self.excellogname, 'ExcelController pageheader end\n')

    # 明細行 印字処理
    def pagedetail(self, detailinfo_list, form_object, detailsize, row, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelController pagedetail start')

        # カレント行数・印字行の設定
        if row == 0:
            self.excelcreate.set_currLineCount(1)
            self.excelcreate.set_currRowPosion(int(self.excelcreate.rowPosion))
        else:
            self.excelcreate.add_currLineCount(1)
            self.excelcreate.add_currRowPosion(int(self.excelcreate.moveDown))

        # 明細印字
        self.exceloutputcontroll('detail', detailinfo_list, row, form_object)

        # 現在の行数が、ページ当たりの最大行数に達していない
        if self.excelcreate.currLineCount < int(self.excelcreate.pageMaxLines):
            self.excellog.debug(self.excellogname, 'ExcelController pagedetail end\n')
            return

        # 現在のカレント行数がページ最大行数と同じで
        # かつ、現在のデータ処理行数がデータ最大行数より小さい時、改ページ処理を行う
        w_row = row + 1
        if w_row < detailsize:
            # ページフッター印字処理
            footerinfo_list = self.getrecordinfo_pageoutputcontroll('page_footer', 'all_page', responsedict)
            self.pagefooter(footerinfo_list, form_object)

            # ページヘッダー印字処理
            headerinfo_list = self.getrecordinfo_pageoutputcontroll('page_header', 'all_page', responsedict)
            self.pageheader(headerinfo_list, form_object)

            # カレント行数・印字行の初期化
            self.excelcreate.currLineCount = 0
            # 2026-09-14 Issue #59 rowPosion/moveDown は excelstart() でintに変換済み（従来は文字列同士の減算でTypeError）
            self.excelcreate.currRowPosion = self.excelcreate.rowPosion - self.excelcreate.moveDown

        self.excellog.debug(self.excellogname, 'ExcelController pagedetail end\n')



    # ページフッター印字処理
    def pagefooter(self, footerinfo_list, form_object):
        self.excellog.debug(self.excellogname, 'ExcelController pagefooter start')

        self.exceloutputcontroll('page_footer', footerinfo_list, 0, form_object)

        self.excellog.debug(self.excellogname, 'ExcelController pagefooter end\n')



    # responsedictから該当するpagecontrollデータを取り出し、その中から、該当するoutputcontrollデータを取り出す
    def getrecordinfo_pageoutputcontroll(self, pagecontroll, outputcontroll, responsedict):

        recordinfo_list = []
        for recordinfo in responsedict['records']:
            # ページコントロールの判定
            if recordinfo['excelinfo']['pagecontrol'] != pagecontroll:
                continue

            # アウトプットコントロールの判定
            if recordinfo['excelinfo']['outputcontrol'] != outputcontroll:
                continue

            # マッチしたデータをリストに追加
            recordinfo_list.append(recordinfo)

        return recordinfo_list


    # 項目をエクセルのセルに出力する
    def exceloutputcontroll(self, pagecontroll, recordinfo_list, row, form_object):
        self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll start')


        for recordinfo in recordinfo_list:
            # beforeメソッド処理
            self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll beforeメソッド処理 start')

            result = self.dynamicapp.doBeforeAfterMethod('before', recordinfo['excelinfo'], form_object)

            self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll beforeメソッド処理 end')


            # 項目の値をエクセルへ出力する
            for value in recordinfo['record'].values():

                if value['excelinfo']['type'] == 'image':
                    # 画像 出力
                    self.excelcreate.imageOutput(pagecontroll, value['value'][row], value['excelinfo'])

                else:
                    # 画像以外 出力
                    self.excelcreate.valueOutput(pagecontroll, value['value'][row], value['excelinfo'])
                    

            # afterメソッド処理
            self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll afterメソッド処理 start')

            result = self.dynamicapp.doBeforeAfterMethod('after', recordinfo['excelinfo'], form_object)

            self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll afterメソッド処理 end')


        self.excellog.debug(self.excellogname, 'ExcelController exceloutputcontroll end')
        return True





# ---------------------------------------------
#    テンプレートクラス 実行開始
# ---------------------------------------------
def main():
    print('***  PdfController start  ***\n')


    print('\n***  PdfController start end  ***')


if __name__ == '__main__':
    main()
