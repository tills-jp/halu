import sys
import os
import re
import tkinter as tk
import tkinter.messagebox as mb
import tkinter.filedialog as fd
import tkinter.simpledialog as sd
import glob

# 置換文字列の設定（0:FROM, 1:TO）
# 既定は同一プロジェクト内での複製（プロジェクト名・DB名は変えない）。
# 別プロジェクトへ移す場合は、実行前に projectName・databaseName を書き換える。
CONVERT_STRING = {}
CONVERT_STRING['projectName'] = ['Sample', 'Sample']
CONVERT_STRING['databaseName'] = ['sample', 'sample']
CONVERT_STRING['programName'] = ['', '']

# 内容を置換する拡張子と、拡張子ごとの置換対象
CONVERT_KEYS = {
    '.html': ['projectName', 'programName'],
    '.js': ['projectName', 'programName'],
    '.json': ['projectName', 'programName', 'databaseName'],
    '.py': ['projectName', 'programName'],
}


def replace_name(text, key):
    """名前を置換する。別の名前の一部（例: OrderListPrint・@memberof）は置換しない。

    直前: 英数字以外、または小文字の直後に大文字で始まる名前が続く場合（例: getOffsetLineOfOrderList）は置換する。
    直後: 英数字が続く場合は別の名前とみなして置換しない（_ や . は区切り扱い）。
    """
    before, after = CONVERT_STRING[key]
    pattern = r'(?:(?<![A-Za-z0-9])|(?<=[a-z])(?=[A-Z]))' + re.escape(before) + r'(?![A-Za-z0-9])'
    return re.sub(pattern, lambda m: after, text)


# tkinter の窓を非表示
tk.Tk().withdraw()
# フォルダ選択
dirpath = fd.askdirectory(
    title='実行するフォルダを指定してください',
    initialdir='./HaluProject/Halu/Application/Sample'
)
if dirpath is None or dirpath == '':
    mb.showinfo('処理終了', '処理を終了します')
    sys.exit()

# 指定したフォルダ内のファイルを取得
files = glob.glob(dirpath + '/*.*')
if len(files) == 0:
    mb.showinfo('処理終了', 'プログラムフォルダを指定してください')
    sys.exit()

# 変更前プログラム名の設定
dirname = dirpath.split('/')[-1]
CONVERT_STRING['programName'][0] = dirname
# 変更後プログラム名の設定
program_name = sd.askstring(
    '変更後プログラム名入力', '変更後プログラム名',
    initialvalue=dirname
)
if program_name is None or program_name == '':
    mb.showinfo('処理終了', '処理を終了します')
    sys.exit()
CONVERT_STRING['programName'][1] = program_name

# ファイルごとに文字列置換
for file in files:
    ext = os.path.splitext(file)[1]
    if ext in CONVERT_KEYS:
        # ファイル内容の文字列置換・上書き保存
        with open(file, 'r', encoding='utf-8') as f:
            lines = f.read()
        for key in CONVERT_KEYS[ext]:
            lines = replace_name(lines, key)
        with open(file, mode='w', encoding='utf-8') as f:
            f.write(lines)
    else:
        # 対象外の拡張子は内容に触れず、ファイル名だけ変更する
        mb.showinfo('INFO', f'{file} は内容の置換対象外です（ファイル名のみ変更します）')

    # ファイル名の変更
    base_name = replace_name(os.path.basename(file), 'programName')
    os.rename(file, dirpath + '/' + base_name)

# フォルダ名の変更
new_dirpath = os.path.dirname(dirpath) + '/' + replace_name(dirname, 'programName')
os.rename(dirpath, new_dirpath)
