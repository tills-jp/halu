# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import sys
from halumain.haluconf         import HaluConf
from batchstartup.batchstartup import BatchStartup



def main(args):
    # 受注ヘッダ・受注明細 更新

    # バッチ起動用トランザクションのファイルパスを設定する
    conf        = HaluConf()
    file_path   = conf.apppath + "/Sample/Json/Apps/BatchOrderUploadStart/BatchOrderUploadStart_start_tran.json"
    output_path = conf.apppath + "/Sample/Server/BatchLoadOut/BatchOrderUploadStart_start_result.txt"

    # バッチ起動用クラスのインスタンス
    batch_run = BatchStartup(file_path, output_path)

    # テストランの実行
    batch_run.call(args)

if __name__ == '__main__':
    args = sys.argv
    main(args)
