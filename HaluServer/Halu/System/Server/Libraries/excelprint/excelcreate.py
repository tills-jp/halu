# coding: utf-8

import os
import subprocess
import openpyxl
from   openpyxl.drawing.image  import Image
from   datetime                import datetime
from   halumain.haluconf       import HaluConf
from   time                    import sleep

class ExcelCreate():
    """
    エクセル作成ライブラリー：openpyxlの実装クラス

    """


    def __init__(self, excellog, excellogname, responsedict):
        try:
            self.excellog        = excellog
            self.excellogname    = excellogname
            self.excellog.debug(self.excellogname, 'ExcelCreate init start')

            hconf              = HaluConf()
            self.syspath       = hconf.syspath              # System      パス
            self.apppath       = hconf.apppath              # Application パス
  
            self.html          = responsedict['html']       # プログラム json パス
            self.mode          = responsedict['mode']       # プログラム json mode
            self.excelinfo     = responsedict['excelinfo']  # excel info

            self.templatefile  = self.apppath + '/' + responsedict['html'].replace('Json', 'ExcelTemplate') + '/' + self.excelinfo['template']
            self.outdir        = self.apppath + '/' + responsedict['html'].replace('Json', 'DownLoad')      + '/'
            self.savefile      = self.outdir  + self.excelinfo['savefile']
            self.pdfname       = self.excelinfo['pdfname']
            self.soffice       = hconf.soffice + ' --headless --convert-to pdf --outdir ' + self.outdir + ' ' + self.savefile

            # テンプレートのエクセルを読み込む
            self.wb = openpyxl.load_workbook(self.templatefile, data_only=True)


            self.totalPageNo       = 0    # トータルページNO（通しのページ番号）
            self.currPageNo        = 0    # カレントページNO（プリントキー毎のページ番号）
            self.pageMaxLines      = 0    # １ページ当たりの最大行数
            self.rowPosion         = 0    # 明細の最初のRow数
            self.moveDown          = 0    # ２行目以降の相対Row
            self.currLineCount     = 0    # 現在の行数
            self.currRowPosion     = 0    # 現在のRow数

        except Exception as e:
            self.excellog.error(self.excellogname, f'ExcelCreate init exception message : {e}')
            # 2026-09-15 Issue #14 握り潰すと後続で別の例外になり真因が隠れるため再送出する
            raise

        finally:
            self.excellog.debug(self.excellogname, 'ExcelCreate init end')

    # エクセル作成の初期処理
    def excelstart(self, detaiRecord):
        self.excellog.debug(self.excellogname, 'ExcelCreate excelstart start')

        # 2026-09-14 Issue #59 tran.jsonの値は文字列で届くため、発生源でintに変換して保持する
        #   （改ページ時の rowPosion - moveDown が "8" - "1" となりTypeErrorになっていた）
        self.pageMaxLines  = int(detaiRecord["excelinfo"]["pagelines"])     # １ページの最大行数
        self.rowPosion     = int(detaiRecord["excelinfo"]["rowposition"])   # 明細の最初の行数
        self.moveDown      = int(detaiRecord["excelinfo"]["movedown"])      # ２行目以降の相対行

        self.excellog.debug(self.excellogname, 'ExcelCreate excelstart end')


    # 作成した最終エクセルのパス情報を設定した新しいResponseを作成する
    def excelterminate(self, responsedict):
        self.excellog.debug(self.excellogname, 'ExcelCreate excelterminate start')

        # 先頭のシートを削除して、指定されたファイル名で保存する
        self.excellog.debug(self.excellogname, 'ExcelCreate excelterminate エクセルを出力')
        self.wb.remove(self.wb["Sheet1"])
        self.wb.save(self.savefile)

        # エクセルをPDFに変換する
        self.excellog.debug(self.excellogname, 'ExcelCreate excelterminate エクセルをPDFに変換')
        subprocess.Popen(self.soffice, shell=True)

        # ファイル存在チェック(PDF完成または最大10秒まで待機)
        pdffile  = self.savefile.replace('.xlsx', '.pdf')
        i = 0
        while i < 20 :
            exist_file = os.path.isfile(pdffile)
            if exist_file == True:
                #ファイルができたのでレスポンスを作成する
                break
            else :
                # 0.5秒ずつ待機
                sleep(0.5)
                i = i + 1
                continue

        # 結果を反映する
        self.excellog.debug(self.excellogname, f'ExcelCreate excelterminate PDF変換結果 : {exist_file}')
        if exist_file == False:
            # 最後までファイルが作成されなかった場合、結果NGを返す
            responsedict["message"]["status"] = "ERROR"
            responsedict["message"]["msg"] = "PDF作成に失敗しました。"

        # 新しいレスポンスを作成する
        # 作成したエクセルのファイル名とダウンロードする時のファイル名を設定する
        self.excellog.debug(self.excellogname, 'ExcelCreate excelterminate 新しいレスポンスを作成')
        self.excellog.debug(self.excellogname, f'ExcelCreate excelterminate responsedict : {responsedict}')

        #newResponse = {'response: {}'}
        newResponse = {}
        for key, value in responsedict.items():
            if key == 'excelinfo':
                self.excellog.debug(self.excellogname, f'ExcelCreate excelterminate excelinfo value : {value}')
                newResponse['excelinfo'] = value
                newResponse['excelinfo']['savefile'] = self.savefile
                continue

            if key == 'message':
                self.excellog.debug(self.excellogname, f'ExcelCreate excelterminate message value : {value}')
                newResponse['message'] = value
                continue


        self.excellog.debug(self.excellogname, f'ExcelCreate excelterminate end newResponse : {newResponse}')
        return newResponse
        

    # エクセルに先頭のシートを追加する
    def newPage(self):
        self.excellog.debug(self.excellogname, 'ExcelCreate newPage start')

        # Sheet1をコピー（一番最後にコピーされる）し、新しいシート名にページ番号を付与する
        self.ws = self.wb.copy_worksheet(self.wb["Sheet1"])
        self.ws = self.wb["Sheet1 Copy"]
        self.ws.title = "page" + str(self.totalPageNo)

        self.excellog.debug(self.excellogname, 'ExcelCreate newPage end')


    # 画像以外の出力（string, integer, float, datetime, date, time）
    def valueOutput(self, pagecontroll, value, excelinfo):
        """
        "出力項目名": {
            "value": ["出力値"],
            "excelinfo" {
                "type":   "string",
                "cell" {
                    "column": "",
                    "row":    ""
                }
            }
        }

        excelinfo["type"] : "str", "int", "float", "date", "datetime", "time"
        セルの情報 : 表示形式・配置・フォント・罫線・その他はエクセル側で指定する
        """
        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput start')


        # セル位置を設定する
        if pagecontroll == "detail":
            colrow = excelinfo["cell"]["column"] + str(self.currRowPosion)
        else:
            colrow = excelinfo["cell"]["column"] + excelinfo["cell"]["row"]


        # 値を指定の型に変換する
        self.excellog.debug(self.excellogname, f'ExcelCreate valueOutput colrow  : {colrow}')
        self.excellog.debug(self.excellogname, f'ExcelCreate valueOutput type  : {excelinfo["type"]}')
        self.excellog.debug(self.excellogname, f'ExcelCreate valueOutput value : {value}')
        self.excellog.debug(self.excellogname, f'ExcelCreate valueOutput type value : {type(value)}')

        
        #if type(value) == excelinfo["type"]:
        #    self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput ==')
        #    outputValue = value
        #else:
        #    if excelinfo["type"] == "str":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput str')
        #        outputValue = str(value)
#
        #    elif excelinfo["type"] == "int":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput int')
        #        #outputValue = int(value)
        #        outputValue = value
#
        #    elif excelinfo["type"] == "float":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput float')
        #        outputValue = float(value)
#
        #    elif excelinfo["type"] == "date":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput date')
        #        outputValue = datetime.strptime (value, '%Y%m%d')
#
        #    elif excelinfo["type"] == "datetime":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput datetime')
        #        outputValue = datetime.strptime (value, '%Y%m%d %H:%M:%S')
#
        #    elif excelinfo["type"] == "time":
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput time')
        #        outputValue = datetime.strptime (value, '%H:%M:%S')
#
        #    else:
        #        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput other')
        #        outputValue = str(value)
#
        # 値をセルに出力する
        self.ws[colrow].value = value
        

        self.excellog.debug(self.excellogname, 'ExcelCreate valueOutput end')


    # 画像の出力
    def imageOutput(self, pagecontroll, value, excelinfo):
        """
        "画像項目名": {
            "value": ["画像のパス情報"],
            "excelinfo" {
                "type":   "image",
                "cell" {
                    "column": "",
                    "row":    ""
                "width":  "画像の幅(ピクセル単位 int)",
                "height": "画像の高さ(ピクセル単位 int)"
            }
        }
        """
        self.excellog.debug(self.excellogname, 'ExcelCreate imageOutput start')


        # セル位置を設定する
        if pagecontroll == "detail":
            # 2026-09-14 Issue #59 行位置はintのため文字列化して連結する（valueOutputと同じ）
            colrow = excelinfo["cell"]["column"] + str(self.currRowPosion)
        else:
            colrow = excelinfo["cell"]["column"] + excelinfo["cell"]["row"]


        # 画像をロード
        img = Image(value)
    
        # 画像のサイズを設定
        if excelinfo["width"]:
            img.width, img.height = excelinfo["width"], excelinfo["height"]
        
        # 画像を指定されたセル位置に挿入
        self.ws.add_image(img, colrow)
            

        self.excellog.debug(self.excellogname, 'ExcelCreate imageOutput end')

    # totalPageNo カウントアップ
    def get_totalPageNo(self):
        return self.totalPageNo

    # totalPageNo カウントアップ
    def add_totalPageNo(self, pageno):
        self.totalPageNo = self.totalPageNo + pageno

    # currPageNo カウントアップ
    def get_currPageNo(self):
        return self.currPageNo

    # currPageNo カウントアップ
    def add_currPageNo(self, pageno):
        self.currPageNo = self.currPageNo + pageno

    # currLineCount
    def get_currLineCount(self):
        return self.currLineCount

    # currLineCount 設定
    def set_currLineCount(self, line):
        self.currLineCount = line

    # currLineCount カウントアップ
    def add_currLineCount(self, line):
        self.currLineCount = self.currLineCount + line

    # currRowPosion 設定
    def get_currRowPosion(self):
        return self.currRowPosion

    # currRowPosion 設定
    def set_currRowPosion(self, row):
        self.currRowPosion = row

    # add_currRowPosion カウントアップ
    def add_currRowPosion(self, row):
        self.currRowPosion = self.currRowPosion + row


# ---------------------------------------------
#    テンプレートクラス 実行開始
# ---------------------------------------------
def main():
    print('***  ExcelCreate start  ***\n')


    print('\n***  ExcelCreate start end  ***')


if __name__ == '__main__':
    main()
