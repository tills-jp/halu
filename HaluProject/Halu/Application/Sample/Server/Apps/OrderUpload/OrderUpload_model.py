# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import os
from commons.jsonchunk import getjsonchunkbyid
from halumain.haluconf import HaluConf


class OrderUpload_model():
    """
    sql.json から呼び出し("prog": "yes"の場合)

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
    formatErrors : list
        ＣＳＶ読込時に検出した形式エラー（1要素＝エラー明細1レコード）
    """

    # ＣＳＶのレイアウト（列数）
    CSV_COLUMN_COUNT = 11
    # 受注番号の桁数上限（受注ヘッダ・受注明細の受注番号が character varying(10) のため）
    ORDER_NO_MAX_LENGTH = 10
    # 商品コードの桁数上限（受注ＣＳＶ・商品の商品コードが character varying(20) のため）
    PRODUCT_CODE_MAX_LENGTH = 20
    # integer 列の上限値
    INT_MAX = 2147483647

    # エラー明細の項目名（単一のＣＳＶ項目に帰属しないエラーで使用する）
    ITEM_NAME_LAYOUT = 'レイアウト'
    ITEM_NAME_KEY = '受注番号・明細番号'

    def __init__(self, mvclog, mvclogname, database, sqldict, requestdict):
        try:
            self.mvclog = mvclog
            self.mvclogname = mvclogname
            self.mvclog.debug(self.mvclogname, 'OrderUpload_model init start')

            # インスタンス変数を設定
            self.database = database
            self.sqldict = sqldict
            self.requestdict = requestdict
            self.hconf = HaluConf()

            # ＣＳＶ読込時に検出した形式エラー（フック間で持ち回る）
            self.formatErrors = []

        except Exception as e:
            self.mvclog.error(self.mvclogname, f'OrderUpload_model init exception message : {e}')

        finally:
            self.mvclog.debug(self.mvclogname, 'OrderUpload_model init end')

    def checkUploadFile(self, idName):
        """
        アップロードしたＣＳＶファイルが存在するかチェックを行う
        （deleteエラー明細 の before で呼ばれる。ファイルが存在しない場合は
        　以降の削除・登録処理を実行せずに中断する）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model checkUploadFile start')

        # アップロードしたファイルのパスを設定
        filename = self.getUploadFileName(idName)

        # ファイルが存在するか？
        if os.path.exists(filename):
            status = 'OK'
        else:
            self.sqldict['message']['status'] = 'ERROR'
            self.sqldict['message']['msg'] = 'OrderUploadファイルが存在しません。'
            status = 'ERROR'

        self.mvclog.debug(self.mvclogname, f'OrderUpload_model checkUploadFile end status = {status}')
        return status

    def insertJyutyuCsv(self, idName):
        """
        ＣＳＶファイルを読み込み、受注ＣＳＶ登録ＳＱＬ（insert受注ＣＳＶ）の入力値へ設定する
        （insert受注ＣＳＶ の before で呼ばれる。登録対象が１件も無い場合は
        　'PASS' を返して当該ＳＱＬの実行をスキップする）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        status : str
            実行結果（'OK'/ 'PASS'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model insertJyutyuCsv start')

        # アップロードしたファイルのパスを設定
        filename = self.getUploadFileName(idName)

        # ＣＳＶファイルを読み込み、受注ＣＳＶ登録ＳＱＬの入力値へ設定する
        status = self.readOrderUpload(filename)

        self.mvclog.debug(self.mvclogname, f'OrderUpload_model insertJyutyuCsv end status={status}')
        return status

    def setFormatErrorData(self, idName):
        """
        ＣＳＶ読込時に検出した形式エラーを、エラー明細登録ＳＱＬ（insert形式エラー）の入力値へ設定する
        （insert形式エラー の before で呼ばれる。形式エラーが無い場合は
        　'PASS' を返して当該ＳＱＬの実行をスキップする）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）※本フックでは参照しない

        Returns
        -------
        status : str
            実行結果（'OK'/ 'PASS'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model setFormatErrorData start')

        if not self.formatErrors:
            self.mvclog.debug(self.mvclogname, 'OrderUpload_model setFormatErrorData end status = PASS')
            return 'PASS'

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', 'insert形式エラー', 'input', 'record')

        for idx in range(len(self.formatErrors)):
            errorData = self.formatErrors[idx]
            for name, value in errorData.items():
                if name not in sqlRecord:
                    continue

                if idx == 0:
                    sqlRecord[name]['value'][0] = value
                else:
                    sqlRecord[name]['value'].append(value)

        self.mvclog.error(self.mvclogname,
                          f'OrderUpload_model setFormatErrorData 形式エラー {len(self.formatErrors)} 件')
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model setFormatErrorData end status = OK')
        return 'OK'

    def passIfNoImportError(self, idName):
        """
        エラー明細の件数を判定し、1件以上あれば取込を中止する
        （delete受注ＣＳＶ中止 の before で呼ばれる。エラーが無い場合は 'PASS' を返して
        　受注ＣＳＶの削除をスキップする＝取込を確定させる。
        　エラーがある場合は 'OK' を返して受注ＣＳＶを全件削除する。
        　**ここで 'ERROR' を返さないのは、ERROR にするとフレームワークがロールバックし
        　エラー明細の登録も消えてしまうため**（C-041 依頼者決定④）。
        　バッチは check モードでは起動されず、クライアントがエラー件数を見て
        　execute モード（バッチ起動）を要求しないことで抑止される）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）※本フックでは参照しない

        Returns
        -------
        status : str
            実行結果（'OK'＝取込中止／'PASS'＝取込確定）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model passIfNoImportError start')

        errorCount = self.getImportErrorCount()

        if errorCount == 0:
            self.mvclog.debug(self.mvclogname, 'OrderUpload_model passIfNoImportError end status = PASS')
            return 'PASS'

        self.mvclog.error(self.mvclogname,
                          f'OrderUpload_model passIfNoImportError エラー {errorCount} 件のため取込を中止（受注ＣＳＶを全件削除）')
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model passIfNoImportError end status = OK')
        return 'OK'

    def checkCsvNotEmpty(self, idName):
        """
        受注ＣＳＶに取込データが存在するかチェックする（C-041）
        （count受注ＣＳＶ の after で呼ばれる。0件のときは 'ERROR' を返して
        　以降のsqlsを実行させず、`message.status='ERROR'` によって
        　**バッチを起動させない**（maincontrollerは status=='OK' のときだけ
        　batchStartupを検知する）。
        　checkモードを経ずにexecuteが呼ばれた場合や、取込が中止された直後に
        　executeが呼ばれた場合に、空のステージングでバッチが起動して
        　原因の分かりにくいNOT NULL制約違反で落ちるのを防ぐ）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）※本フックでは参照しない

        Returns
        -------
        status : str
            実行結果（'OK'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model checkCsvNotEmpty start')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', 'count受注ＣＳＶ', 'output', 'record')
        countValue = str(sqlRecord['取込件数']['value'][0])

        if countValue.isdigit() and int(countValue) > 0:
            self.mvclog.debug(self.mvclogname,
                              f'OrderUpload_model checkCsvNotEmpty end status = OK （取込件数 {countValue} 件）')
            return 'OK'

        self.sqldict['message']['status'] = 'ERROR'
        self.sqldict['message']['msg'] = \
            '取込対象のデータがありません。ＣＳＶファイルをアップロードしてから実行してください。'

        self.mvclog.error(self.mvclogname,
                          'OrderUpload_model checkCsvNotEmpty 受注ＣＳＶが0件のためバッチを起動しません')
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model checkCsvNotEmpty end status = ERROR')
        return 'ERROR'

    def getImportErrorCount(self):
        """
        エラー件数取得ＳＱＬ（countエラー）の結果を数値で取得する

        Returns
        -------
        errorCount : int
            エラー明細の件数
        """
        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', 'countエラー', 'output', 'record')
        countValue = str(sqlRecord['エラー件数']['value'][0])

        if not countValue.isdigit():
            return 0

        return int(countValue)

    def deleteUploadFile(self, idName):
        """
        アップロードしたＣＳＶファイルを削除する
        （batchStartup の after で呼ばれる。取込が中止された場合は execute モード自体が
        　呼ばれないためファイルが残り、ＣＳＶを再アップロードせずに実行し直せる）

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        status : str
            実行結果（'OK'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model deleteUploadFile start')

        filename = self.getUploadFileName(idName)
        if os.path.exists(filename):
            os.remove(filename)

        self.mvclog.debug(self.mvclogname, 'OrderUpload_model deleteUploadFile end status = OK')
        return 'OK'

    def getUploadFileName(self, idName):
        """
        アップロードしたファイルのパスを取得する

        Parameters
        ----------
        idName : str
            対象とする項目名（キー項目）

        Returns
        -------
        filename : str
            アップロードしたファイルのパス
        """
        requestRecord = getjsonchunkbyid(self.requestdict, 'records', idName, 'record')
        filename = self.hconf.apppath + '/Sample/UpLoad/Apps/OrderUpload/' \
            + requestRecord['ファイル名']['value'][0]

        return filename

    def readOrderUpload(self, filename):
        """
        ＣＳＶファイルを読み込み、受注ＣＳＶ登録ＳＱＬの入力値へ１行＝１配列要素で設定する
        （形式エラー（レイアウト・必須・型・桁数・ＣＳＶ内のキー重複）の行は
        　受注ＣＳＶへ登録せず self.formatErrors へ退避する。C-041）

        Parameters
        ----------
        filename : str
            対象とするファイル名

        Returns
        -------
        status : str
            実行結果（'OK'/ 'PASS'/ 'ERROR'）
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model readOrderUpload start')

        sqlRecord = getjsonchunkbyid(self.sqldict, 'sqls', 'insert受注ＣＳＶ', 'input', 'record')

        # ＣＳＶファイルの読み込み
        readList = self.readLines(filename)
        if readList is None:
            self.sqldict['message']['status'] = 'ERROR'
            self.sqldict['message']['msg'] = \
                'ＣＳＶファイルを読み込めませんでした。文字コードがＵＴＦ－８か確認してください。'
            self.mvclog.debug(self.mvclogname, 'OrderUpload_model readOrderUpload end status = ERROR')
            return 'ERROR'

        # ＣＳＶ内のキー重複を検出するための既出キー
        keySet = set()

        status = 'PASS'
        j = 0
        for index in range(len(readList)):
            # 先頭行（ヘッダ行）は読み飛ばす
            if index == 0:
                continue

            readLine = readList[index].strip()
            if readLine == '':
                continue

            w_ListData = readLine.split(",")
            self.mvclog.debug(self.mvclogname, f'OrderUpload_model readOrderUpload  : {w_ListData}')

            # ＣＳＶファイル上の物理行番号（１行目＝ヘッダ行）
            lineNo = index + 1
            csvData = self.checkCsvLine(lineNo, readLine, w_ListData, keySet)
            if csvData is None:
                continue

            self.setJyutyuCsvData(sqlRecord, csvData, j)
            status = 'OK'
            j += 1

        # 2026-08-04 C-045: アップロードファイルの削除は取込の成否が確定してから行う
        #   （batchStartup の after -> deleteUploadFile）。ここで削除してしまうと
        #   取込を中止したときにＣＳＶの再アップロードが必要になる。

        self.mvclog.debug(self.mvclogname,
                          f'OrderUpload_model readOrderUpload end status = {status} '
                          f'（登録対象 {j} 行／形式エラー {len(self.formatErrors)} 件）')
        return status

    def readLines(self, file):
        """
        ＣＳＶファイルの読み込み

        Parameters
        ----------
        file : str
            対象とするファイル

        Returns
        -------
        readlist : list
            ファイル読込結果（読み込めなかった場合は None）
        """
        try:
            with open(file, mode="r", encoding='UTF-8') as f:
                readlist = f.readlines()

            return readlist
        except Exception as e:
            self.mvclog.error(self.mvclogname,
                              f'OrderUpload_model readLines exception message type    : {str(type(e))}')
            self.mvclog.error(self.mvclogname,
                              f'OrderUpload_model readLines exception message arg     : {str(e.args)}')
            self.mvclog.error(self.mvclogname, f'OrderUpload_model readLines exception message         : {e}')
            return None

    def checkCsvLine(self, lineNo, readLine, w_ListData, keySet):
        """
        ＣＳＶ１行分の形式チェックを行う（C-041）
        （レイアウト＝列数／必須／型（整数・日付８桁）／桁数／ＣＳＶ内のキー重複。
        　マスタ未登録（顧客ＩＤ・商品コード）は受注ＣＳＶへ取込んだ後にＳＱＬで判定する）

        Parameters
        ----------
        lineNo : int
            ＣＳＶファイル上の物理行番号
        readLine : str
            ＣＳＶ１行分の文字列（レイアウトエラー時の項目値として記録する）
        w_ListData : list
            ＣＳＶファイルより取得した項目値
        keySet : set
            既出の（受注番号, 明細番号）

        Returns
        -------
        csvData : dict
            受注ＣＳＶへ登録する項目値（エラーがある場合は None）
        """
        # レイアウト（列数）チェック
        if len(w_ListData) != self.CSV_COLUMN_COUNT:
            self.addFormatError(lineNo, '', '', self.ITEM_NAME_LAYOUT, readLine,
                                f'列数が{self.CSV_COLUMN_COUNT}列ではありません。（{len(w_ListData)}列）')
            return None

        orderNo = w_ListData[0].strip()
        detailNo = w_ListData[1].strip()

        errorCount = len(self.formatErrors)

        # 必須・桁数・型のチェック
        if self.checkRequired(lineNo, orderNo, detailNo, '受注番号', orderNo):
            self.checkLength(lineNo, orderNo, detailNo, '受注番号', orderNo, self.ORDER_NO_MAX_LENGTH)
        if self.checkRequired(lineNo, orderNo, detailNo, '明細番号', detailNo):
            self.checkInteger(lineNo, orderNo, detailNo, '明細番号', detailNo)
        if self.checkRequired(lineNo, orderNo, detailNo, '顧客ＩＤ', w_ListData[2].strip()):
            self.checkInteger(lineNo, orderNo, detailNo, '顧客ＩＤ', w_ListData[2].strip())
        if self.checkRequired(lineNo, orderNo, detailNo, '商品コード', w_ListData[5].strip()):
            self.checkLength(lineNo, orderNo, detailNo, '商品コード', w_ListData[5].strip(),
                             self.PRODUCT_CODE_MAX_LENGTH)

        self.checkDate8(lineNo, orderNo, detailNo, '受注日', w_ListData[3].strip())
        self.checkDate8(lineNo, orderNo, detailNo, '納期日', w_ListData[6].strip())
        self.checkInteger(lineNo, orderNo, detailNo, '受注金額合計', w_ListData[4].strip())
        self.checkInteger(lineNo, orderNo, detailNo, '受注数量', w_ListData[7].strip())
        self.checkInteger(lineNo, orderNo, detailNo, '受注単価', w_ListData[8].strip())
        self.checkInteger(lineNo, orderNo, detailNo, '受注金額', w_ListData[9].strip())

        # キー項目が正常な行だけＣＳＶ内のキー重複を判定する
        if len(self.formatErrors) == errorCount:
            keyValue = (orderNo, detailNo)
            if keyValue in keySet:
                self.addFormatError(lineNo, orderNo, detailNo, self.ITEM_NAME_KEY,
                                    f'{orderNo},{detailNo}',
                                    'ＣＳＶ内で受注番号・明細番号が重複しています。')
            else:
                keySet.add(keyValue)

        # エラーが1件でも増えていれば受注ＣＳＶへは登録しない
        if len(self.formatErrors) != errorCount:
            return None

        # ＣＳＶの列順と受注ＣＳＶの項目の対応（日付はＤＢの日付型が解釈できる形式へ整形する）
        # 2026-08-04 C-045: ６列目を商品名称から商品コードへ変更（商品マスタとの名寄せキー）。
        #   受注明細の商品名称は商品マスタから転記するため、ＣＳＶからは受け取らない。
        csvData = {
            '受注番号': orderNo,
            '明細番号': detailNo,
            '顧客ＩＤ': w_ListData[2].strip(),
            '受注日': self.editDateString(w_ListData[3]),
            '受注金額合計': w_ListData[4].strip(),
            '商品コード': w_ListData[5].strip(),
            '納期日': self.editDateString(w_ListData[6]),
            '受注数量': w_ListData[7].strip(),
            '受注単価': w_ListData[8].strip(),
            '受注金額': w_ListData[9].strip(),
            '備考': w_ListData[10].strip(),
        }

        return csvData

    def checkRequired(self, lineNo, orderNo, detailNo, itemName, value):
        """
        必須チェック（C-041）

        Returns
        -------
        result : bool
            チェックＯＫなら True
        """
        if value != '':
            return True

        self.addFormatError(lineNo, orderNo, detailNo, itemName, value, '必須項目が未入力です。')
        return False

    def checkLength(self, lineNo, orderNo, detailNo, itemName, value, maxLength):
        """
        桁数チェック（C-041）

        Returns
        -------
        result : bool
            チェックＯＫなら True
        """
        if len(value) <= maxLength:
            return True

        self.addFormatError(lineNo, orderNo, detailNo, itemName, value,
                            f'{maxLength}桁を超えています。（{len(value)}桁）')
        return False

    def checkInteger(self, lineNo, orderNo, detailNo, itemName, value):
        """
        整数チェック（C-041。未入力は対象外＝ＤＢへNULLで登録する）

        Returns
        -------
        result : bool
            チェックＯＫなら True
        """
        if value == '':
            return True

        if not value.isdigit():
            self.addFormatError(lineNo, orderNo, detailNo, itemName, value, '数値ではありません。')
            return False

        if int(value) > self.INT_MAX:
            self.addFormatError(lineNo, orderNo, detailNo, itemName, value,
                                f'数値が大きすぎます。（上限 {self.INT_MAX}）')
            return False

        return True

    def checkDate8(self, lineNo, orderNo, detailNo, itemName, value):
        """
        日付チェック（C-041。ＣＳＶの日付はYYYYMMDDの8桁。未入力は対象外）

        Returns
        -------
        result : bool
            チェックＯＫなら True
        """
        if value == '':
            return True

        if not value.isdigit() or len(value) != 8:
            self.addFormatError(lineNo, orderNo, detailNo, itemName, value,
                                '日付（ＹＹＹＹＭＭＤＤの8桁）ではありません。')
            return False

        month = int(value[4:6])
        day = int(value[6:8])
        if month < 1 or month > 12 or day < 1 or day > 31:
            self.addFormatError(lineNo, orderNo, detailNo, itemName, value, '日付として正しくありません。')
            return False

        return True

    def addFormatError(self, lineNo, orderNo, detailNo, itemName, itemValue, message):
        """
        形式エラーを1件退避する（insert形式エラー の入力値になる。C-041）

        Parameters
        ----------
        lineNo : int
            ＣＳＶファイル上の物理行番号
        orderNo : str
            ＣＳＶ上の受注番号
        detailNo : str
            ＣＳＶ上の明細番号
        itemName : str
            エラー対象の項目名
        itemValue : str
            ＣＳＶ上の生値
        message : str
            エラー内容
        """
        self.formatErrors.append({
            '行番号': str(lineNo),
            '受注番号': orderNo,
            '明細番号': detailNo,
            '項目名': itemName,
            '項目値': itemValue,
            'エラー内容': message,
        })

    def setJyutyuCsvData(self, sqlRecord, csvData, idx):
        """
        ＣＳＶ１行分の項目値を受注ＣＳＶ登録ＳＱＬの入力値へ設定する

        Parameters
        ----------
        sqlRecord : dict
            受注ＣＳＶ登録ＳＱＬの入力レコード -> sqls['insert受注ＣＳＶ']['input']['record']
        csvData : dict
            形式チェック済みのＣＳＶ１行分の項目値
        idx : int
            設定先の値配列のインデックス（０＝１行目）

        Returns
        -------
        status : str
            'OK' 固定
        """
        self.mvclog.debug(self.mvclogname, 'OrderUpload_model setJyutyuCsvData start')

        status = 'OK'

        for name, value in csvData.items():
            if name not in sqlRecord:
                continue

            if idx == 0:
                sqlRecord[name]['value'][0] = value
            else:
                sqlRecord[name]['value'].append(value)

        self.mvclog.debug(self.mvclogname, f'OrderUpload_model setJyutyuCsvData end status = {status}')
        return status

    def editDateString(self, csvDate):
        """
        ＣＳＶの日付（YYYYMMDD）をＤＢの日付型が解釈できる文字列（YYYY/MM/DD）へ整形する
        （旧実装の TO_DATE(値, 'YYYYMMDD') 相当。８桁以外は整形せずそのまま返す）

        Parameters
        ----------
        csvDate : str
            ＣＳＶファイルより取得した日付（YYYYMMDD）

        Returns
        -------
        editDate : str
            整形後の日付（YYYY/MM/DD）
        """
        w_date = csvDate.strip()
        if len(w_date) != 8:
            return w_date

        editDate = w_date[0:4] + '/' + w_date[4:6] + '/' + w_date[6:8]
        return editDate
