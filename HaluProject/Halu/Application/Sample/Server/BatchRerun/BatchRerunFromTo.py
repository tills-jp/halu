# coding: UTF-8
# ***********************************************
# * Framework Name  :  Halu
# * (c) 2025 TILLS & Co.
# ***********************************************

import sys
from batchclientserver.batchclientmainserver import BatchClientMainServer



def main(args):
    """
    バッチリランの呼び出し：
    python BatchRerunFromTo.py DBName バッチID from分割番号 to分割番号 分割数

    """

    dbname          = args[1]
    controll_id     = int(args[2])
    from_division   = int(args[3])
    to_division     = int(args[4])
    division_number = int(args[5])

    # BatchClientMainServerをインスタンスする
    main_server = BatchClientMainServer()

    # BatchClientMainServerをコールする
    to_division = to_division + 1
    for cur_division in range(from_division, to_division):
        main_server.call(dbname, controll_id, cur_division, division_number)


if __name__ == '__main__':
    args = sys.argv
    main(args)
