# coding: utf-8

import os
import json

# 2026-07-18 lifespan方式への変更に伴い追加
from contextlib import asynccontextmanager

from starlette.applications    import Starlette
from starlette.middleware      import Middleware
from starlette.middleware.cors import CORSMiddleware

from starlette.responses       import JSONResponse
from starlette.responses       import FileResponse
from starlette.responses       import PlainTextResponse
from starlette.routing         import Route, Mount, WebSocketRoute
   
from logger.halulogger         import HaluLogger
from halumain.haluconf         import HaluConf

from halurpc.appserverrpc      import AppClient
from halurpc.rmenuappserverrpc import RmenuClient


hconf    = HaluConf()
hlog     = HaluLogger('halu')
hlogname = 'halu'


# 2026-08-05 B-010 クライアント由来パスの共通検証ヘルパーを新設
def resolveSafePath(basedir, clientpath, require_segment=None, allow_segments=None, allow_index=0):
    """
    クライアントから受け取ったパスを、基準ディレクトリ配下に限定して解決する。

    realpath で基準ディレクトリと対象パスの双方を解決したうえで、パス境界を意識した
    判定（commonpath）で対象が基準ディレクトリ配下にあることを確認する。
    文字列の前方一致は行わない（`/app` と `/app_evil` の誤判定を避けるため）。

    Parameters
    ----------
    basedir : str
        基準ディレクトリ（絶対パス）。hconf.apppath / hconf.syspath 等。
    clientpath : str
        クライアント由来のパス。絶対パスまたは基準ディレクトリからの相対パス。
    require_segment : str, optional
        必須セグメント。指定時は基準ディレクトリからの相対パスに
        当該セグメントが含まれることを確認する（例: 'DownLoad'／'UpLoad'）。
    allow_segments : list of str, optional
        許可セグメントのリスト。指定時は相対パスの allow_index 番目のセグメントが
        リストに含まれることを確認する（例: ['Html', 'Json']）。
    allow_index : int, optional
        allow_segments を照合する相対パス上のセグメント位置。既定は 0。
        appfile（`{アプリ名}/{Html|Json}/...`）は 1、sysfile（`{Html|Server}/...`）は 0。

    Returns
    -------
    str or None
        検証を通過した場合は解決済みの絶対パス。
        基準ディレクトリ外・許可外セグメント・パス解決失敗の場合は None（呼び出し側で404化する）。
    """
    try:
        base_real = os.path.realpath(basedir)

        # 相対パスは基準ディレクトリ起点として解決する
        if os.path.isabs(clientpath):
            target_real = os.path.realpath(clientpath)
        else:
            target_real = os.path.realpath(os.path.join(base_real, clientpath))

        # 基準ディレクトリ配下かどうかをパス境界で判定する
        if os.path.commonpath([base_real, target_real]) != base_real:
            return None

        if target_real == base_real:
            return None

        # 相対パスをセグメント列へ分解する（Windowsのバックスラッシュ・スラッシュ混在に対応）
        relpath = os.path.relpath(target_real, base_real)
        segments = [seg for seg in os.path.normpath(relpath).replace(os.sep, '/').replace('\\', '/').split('/')
                    if seg not in ('', '.')]

        # 必須セグメントのチェック
        if require_segment is not None and require_segment not in segments:
            return None

        # 許可セグメントのチェック
        if allow_segments is not None:
            if len(segments) < allow_index + 1:
                return None
            if segments[allow_index] not in allow_segments:
                return None

        return target_real

    except Exception:
        # パス解決で例外が発生した場合も拒否として扱う（500を出さない）
        return None


def homepage(request):
    hlog.debug(hlogname, 'homepage request Hello, halu user!')

    return PlainTextResponse('Hello, halu user!\n\n Enter the URL of the project you want to connect to')

# -----------------------------------------
# Halu Application Server
# -----------------------------------------
async def halumain(request):
    formdata    = await request.form()    
    requestjson = formdata['data']
    requestdict = json.loads(requestjson)

    hlog.debug(hlogname, f'halumain request /HaluASGI/Halumain data={requestdict}')


    # アプリケーションクライアントをインスタンスし、アプリケーションサーバに接続する
    # リクエストデータをセットしcallを実行、レスポンスデータを受け取る
    appclient    = AppClient()
    responsedict = appclient.call(requestdict)

    # 2026-09-15 Issue #14 サーバー側で例外が握り潰され応答が None のとき、null を返すとクライアントが
    # message を読めずローディングが消えないため、エラー応答（status=ERROR）に置き換える
    if responsedict is None:
        hlog.error(hlogname, 'halumain response is None (server side exception) '
                             f'html={requestdict.get("html")} mode={requestdict.get("mode")}')
        responsedict = {'message': {'status': 'ERROR', 'msg': 'サーバー処理に失敗しました。サーバーログを確認してください。'}}

    hlog.debug(hlogname, f'halumain response data={responsedict}\n')
    return JSONResponse(responsedict)


async def haluhtml(request):
    formdata = await request.form()
    htmlname = formdata['gamen']
    hlog.debug(hlogname, f'haluhtml request /HaluASGI/Haluhtml gamen={htmlname}')

    # ファイルの存在チェック
    url = hconf.apppath + '/' + htmlname + '/index.html'
    hlog.debug(hlogname, f'haluhtml request /HaluASGI/Haluhtml url={url}')

    # 2026-08-05 B-010 クライアント指定の画面パスを apppath 配下へ限定する
    safe_url = resolveSafePath(hconf.apppath, url)
    if safe_url is None:
        hlog.error(hlogname, f'haluhtml request REJECT 許可されないパスを拒否しました gamen={htmlname}')
        return PlainTextResponse('Not Found', status_code=404)

    exist_file = os.path.isfile(safe_url)
    if exist_file:
        response = FileResponse(safe_url)
    else:
        dir_list = htmlname.split('/')
        dir_list[-1] = 'Error404'

        error_url = hconf.apppath + '/' + '/'.join(dir_list) + '/index.html'

        # 2026-08-05 B-010 Error404 へのフォールバック経路も同様に検証する
        safe_error_url = resolveSafePath(hconf.apppath, error_url)
        if safe_error_url is None:
            hlog.error(hlogname, f'haluhtml request REJECT 許可されないパスを拒否しました error_url={error_url}')
            return PlainTextResponse('Not Found', status_code=404)

        response = FileResponse(safe_error_url)

    # return FileResponse(f'{hconf.apppath}/{htmlname}/index.html')
    return response


async def haludownload(request):
    formdata     = await request.form()    
    hlog.debug(hlogname, f'haludownload request /HaluASGI/haludownload formdata={formdata}')

    fileurl  = formdata['file']
    filetype = formdata['type']

    # 2026-08-05 B-010 クライアント指定パスを apppath 配下の DownLoad ディレクトリに限定する
    safe_fileurl = resolveSafePath(hconf.apppath, fileurl, require_segment='DownLoad')
    if safe_fileurl is None:
        hlog.error(hlogname, f'haludownload request REJECT 許可されないパスを拒否しました file={fileurl}')
        return PlainTextResponse('Not Found', status_code=404)

    if 'download' in formdata.keys():
        newname  = formdata['download']
    else:
        newname  = fileurl.split('/')[-1]

    # 2026-08-05 B-010 ダウンロード名にパス区切りが混入しないよう basename 化する
    newname = os.path.basename(newname.replace('\\', '/'))

    return FileResponse(safe_fileurl, media_type=filetype, filename=newname)


async def haluupload(request):
    formdata = await request.form()
    hlog.debug(hlogname, f'haluupload request /HaluASGI/haluupload start')

    # アップロードファイルの名前を取得
    # 2026-08-05 B-010 ディレクトリ成分を捨てて（../・絶対パスの無害化）ファイル名のみとする
    filename = os.path.basename((formdata["file"].filename or '').replace('\\', '/'))
    if filename in ('', '.', '..'):
        hlog.error(hlogname, f'haluupload request REJECT 不正なファイル名を拒否しました file={filename}')
        return PlainTextResponse('ファイルアップロードに失敗しました。', status_code=400)

    # アップロードファイルの格納先を取得する
    datalist = formdata["data"]

    # 2026-08-05 B-010 格納先を apppath 配下の UpLoad ディレクトリに限定する
    safe_dir = resolveSafePath(hconf.apppath, datalist, require_segment='UpLoad')
    if safe_dir is None:
        hlog.error(hlogname, f'haluupload request REJECT 許可されない格納先を拒否しました data={datalist}')
        return PlainTextResponse('ファイルアップロードに失敗しました。', status_code=400)

    # アップロードファイルを読み込む
    contents = await formdata["file"].read()

    # アップロードファイルの格納先フォルダーの有無を確認し、なければ作成する
    # 2026-08-05 B-010 os.mkdir は Apps/{画面名} のような中間階層が無いと失敗するため makedirs へ変更
    os.makedirs(safe_dir, exist_ok=True)

    # 読み込んだデータを指定の場所に出力する
    # 2026-08-05 B-010 例外時のファイルディスクリプタリークを防ぐため with 構文へ変更
    filename9 = os.path.join(safe_dir, filename)
    with open(filename9, 'wb') as f:
        f.write(contents)

    return PlainTextResponse('ファイルアップロードは正常に終了しました。')


async def halulogin(request):
    pass

# -----------------------------------------
# Rmenu Application Server
# -----------------------------------------
async def rmenumain(request):
    formdata    = await request.form()    
    requestjson = formdata['data']
    requestdict = json.loads(requestjson)

    hlog.debug(hlogname, f'rmenumain request /RmenuASGI/Rmenumain data={requestdict}')


    # アプリケーションクライアントをインスタンスし、アプリケーションサーバに接続する
    # リクエストデータをセットしcallを実行、レスポンスデータを受け取る
    rmenuclient  = RmenuClient()
    responsedict = rmenuclient.call(requestdict)


    hlog.debug(hlogname, f'rmenumain response data={responsedict}\n')
    return JSONResponse(responsedict)


async def rmenuhtml(request):
    formdata = await request.form()    
    htmlname = formdata['gamen']

    hlog.debug(hlogname, f'rmenuhtml request /RmenuASGI/Rmenuhtml gamen={htmlname}')
    return FileResponse(f'{hconf.apppath}/{htmlname}/index.html')


async def rmenudownload(request):
    pass


async def rmenuupload(request):
    pass


async def rmenulogin(request):
    pass


# -----------------------------------------
# Application File Request
# -----------------------------------------
async def appfile(request):
    apppath = request.path_params['appfile']

    hlog.debug(hlogname, f'appfile request /Application/{apppath}')

    # 2026-08-05 B-010 アプリ名直下のセグメントを Html/Json に限定し apppath 配下かを検証する
    #                              URLの二重スラッシュ（/Application//{パス}）で先頭に付く '/' は
    #                              絶対パスではなく apppath 起点として扱う（修正前の挙動を維持する）
    safe_path = resolveSafePath(hconf.apppath, apppath.lstrip('/'),
                                allow_segments=['Html', 'Json'], allow_index=1)
    if safe_path is None:
        hlog.error(hlogname, f'appfile request REJECT 許可されないパスを拒否しました appfile={apppath}')
        return PlainTextResponse('Not Found', status_code=404)

    return FileResponse(safe_path)


# -----------------------------------------
# System File Request
# -----------------------------------------
async def sysfile(request):
    syspath = request.path_params['sysfile']

    hlog.debug(hlogname, f'sysfile request /System/{syspath}')

    # 2026-08-05 B-010 "Server/" ブラックリスト（Windowsのバックスラッシュ表記で迂回可能）を
    #                              Html ホワイトリスト＋realpath 検証へ置換する
    #                              先頭 '/' は appfile と同様に syspath 起点として扱う
    safe_path = resolveSafePath(hconf.syspath, syspath.lstrip('/'), allow_segments=['Html'], allow_index=0)
    if safe_path is None:
        hlog.error(hlogname, f'sysfile request REJECT 許可されないパスを拒否しました sysfile={syspath}')
        return PlainTextResponse('Not Found', status_code=404)

    return FileResponse(safe_path)

# -----------------------------------------
# WebSocket EndPoint
# -----------------------------------------
async def websocket_endpoint(websocket):
    await websocket.accept()
    await websocket.send_text('Hello, websocket!')
    await websocket.close()


# -----------------------------------------
# Start Up
# -----------------------------------------
# 2026-07-18 Starlette 1.0で削除されたon_startupをlifespan方式へ変更（Starlette 0.26以降互換）
@asynccontextmanager
async def lifespan(app):
    hlog.debug(hlogname, 'startup Ready Starlette to go!\n')
    yield

# -----------------------------------------
# CORSMiddleware 定義
# -----------------------------------------
middleware = [
    Middleware(CORSMiddleware, allow_origins=['*'])
]

# -----------------------------------------
# Routes 定義
# -----------------------------------------
routes = [
    Route('/', homepage),

    # -----------------------------------------
    # WebSocket EndPoint
    # -----------------------------------------
    WebSocketRoute('/ws', websocket_endpoint),


    # -----------------------------------------
    # Halu Application Server
    # -----------------------------------------
    Route('/HaluASGI/Halumain', halumain, methods=['POST']),
    Route('/HaluASGI/Haluhtml', haluhtml, methods=['POST']),
    Route('/HaluASGI/HaluDownload', haludownload, methods=['POST']),
    Route('/HaluASGI/HaluUpload', haluupload, methods=['POST']),
    Route('/HaluASGI/HaluLogin', halulogin, methods=['POST']),


    # -----------------------------------------
    # Rmenu Application Server
    # -----------------------------------------
    Route('/RmenuASGI/Rmenumain', rmenumain, methods=['POST']),
    Route('/RmenuASGI/Rmenuhtml', rmenuhtml, methods=['POST']),
    Route('/RmenuASGI/RmenuDownload', rmenudownload, methods=['POST']),
    Route('/RmenuASGI/RmenuUpload', rmenuupload, methods=['POST']),
    Route('/RmenuASGI/RmenuLogin', rmenulogin, methods=['POST']),


    # -----------------------------------------
    # Halu Application & System File Request
    # -----------------------------------------
    Route('/Application/{appfile:path}', appfile),
    Route('/System/{sysfile:path}', sysfile),
    

    # -----------------------------------------
    # Rmenu Application & System File Request
    # -----------------------------------------
    Route('/Rmenu/Application/{appfile:path}', appfile),
    Route('/Rmenu/System/{sysfile:path}', sysfile),
]

# 2026-07-18 on_startup=[startup] を lifespan へ変更
app = Starlette(debug=True, routes=routes, middleware=middleware, lifespan=lifespan)
