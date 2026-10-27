(function (jQuery) {
  //グローバルオブジェクトthisへのアクセス
  let root = globalThis;

  // トップレベルの名前空間。Haluのすべてのパブリックのクラスとモジュールはこれに含まれる
  let Halu = root.Halu = {};
  Halu.Application = {};
  Halu.Library = {};

  // Haluにアクセスするためのショートカット
  let $H = Halu;
  // ライブラリの現在のバージョン
  $H.Version = "1.0.0";

  // 実行モード
  $H.LogMode = "DEBUG";
  //$H.LogMode = "";

  // ログ出力
  $H.log = function (message) {
    if ($H.LogMode != "DEBUG") return;     // 実行モードの判定
    if (typeof console == "undefined") return;
    console.log(message);
  }
  /**
   * 基本クラスを定義する
   */
  class Class {
    /**
     * 
     * @param  {...any} args - 引数
     */
    constructor(...args) {
      this.init(...args);
      // プロトタイプにアクセスするためのショートカット
      this.fn = Object.getPrototypeOf(this);

    }
    //init処理
    init(...args) { };

    /**
     * クラスプロパティを追加する
     * @param {object} obj - 追加のクラスプロパティ
     */
    static extend(obj) {
      const extended = obj.extended;
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          this[key] = obj[key];
        }
      }
      if (extended) extended(this);
    }

    /**
     * インスタンスプロパティを追加する
     * @param {object} obj - 追加のインスタンスプロパティ・メソッド
     */
    static include(obj) {
      const included = obj.included;
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          this.prototype[key] = obj[key];
        }
      }
      this.fn = this.prototype;
      if (included) included(this);
    }
  }
  $H.Class = Class;

  /**
   * イベントクラス
   * @extends Class
   * @property {object} fn.lives
   */
  class Event extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.lives = {};
    }
  }
  Event.include({
    /**
     * イベントを設定し、コールバック関数を指定する
     * @memberof Event
     * @param {object} self 
     * @param {event} events 
     */
    setEvent: function (self, events) {
      $H.log("Event setEvent : start");
      /**
       * @extends Class
       * @memberof Event
       */
      class liveevent extends Class { };
      liveevent.include({
        /**
         * 全てのオブジェクトに対して、イベント登録を行う
         * @memberof Event.liveevent
         * @param {object} selector - セレクタ
         * @param {event} event - イベント情報
         * @param {object} callback - コールバック関数
         */
        execute: function (selector, event, callback) {
          // 全てのオブジェクトに対して、
          // delegate(), live() に相当するイベント登録を行う
          //★mod start 20260617 重複登録防止（ダイアログ2回目以降のイベント二重発火対策）
          $(document).off(event, selector);
          //★mod end 20260617
          $(document).on(event, selector, function (e, arg) {
            let fnc = "self." + callback + "(e, arg)";
            eval(fnc);
          });
        }
      });

      let selector, event, callback;
      let maxcount = events.length, i;
      for (i = 0; i < maxcount; i++) {
        selector = events[i][0];
        event = events[i][1];
        callback = events[i][2];

        this.lives[callback] = new liveevent();
        this.lives[callback].execute(selector, event, callback);
      }

      $H.log("Event setEvent : end");
    }
  });
  $H.Event = Event;

  /**
   * PubSubクラス(カスタムイベント管理)
   * @extends Class
   * @property {object} fn.context - 実行コンテキスト
   * @property {object} fn.callback - コールバック関数
   * @property {class} fn.model - modelクラス
   * @property {class} fn.view - viewクラス
   * @property {class} fn.controller - controllerクラス
   * @property {object} fn.formcontroll - フォームコントロール
   */
  class PubSub extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      // 実行コンテキスト
      this.fn.context = {};
      // コールバック関数
      this.fn.callback = {};
      this.fn.model = {};
      this.fn.view = {};
      this.fn.controller = {};
      this.fn.formcontroll = {};
    }
  }

  PubSub.include({
    /**
     * イベント名でコールバック関数名を格納する
     * @memberof PubSub
     * @param {object} pubsubEvent - イベント設定情報
     */
    subscribe: function (pubsubEvent) {
      $H.log("PubSub subscribe : start");

      let event, context, callback;
      let maxcount = pubsubEvent.length, i;
      for (i = 0; i < maxcount; i++) {
        event = pubsubEvent[i][0];

        if (event in this.callback) continue;

        context = pubsubEvent[i][1];
        callback = pubsubEvent[i][2];
        this.context[event] = context;
        this.callback[event] = callback;
      }

      $H.log("PubSub subscribe : end");
    },
    /**
     * イベントを削除する
     * @memberof PubSub
     * @param {event} event - イベント情報
     */
    unsubscribe: function (event) {
      $H.log("PubSub unsubscribe : start");

      if (event in this.callback) {
        delete this.context[event];
        delete this.callback[event];
      }

      $H.log("PubSub unsubscribe : end");
    },
    /**
     * イベント名でコールバック関数を実行する
     * @memberof PubSub
     * @param {event} event - イベント情報
     * @param {object} arg - コールバック関数引き渡し情報
     * @returns コールバック関数実行結果
     */
    publish: function (event, arg) {
      $H.log("PubSub publish : start");

      if (!(event in this.callback)) return;

      let callback = this.callback[event];
      let context = this.context[event];
      let self = {};
      let fnc;
      if (context == "model") {
        self = this.model;
      }
      if (context == "view") {
        self = this.view;
      }
      if (context == "controller") {
        self = this.controller;
      }
      if (context == "formcontroll") {
        self = this.formcontroll;
      }
      fnc = "self." + callback + "(arg)";

      $H.log("PubSub publish : end");
      return eval(fnc);
    }
    // PubSubイベントが登録されているか
    , isEvent: function (event) {
      return this.callback[event];
    }
  });
  $H.PubSub = PubSub;

  /**
   * 同期クラス<br>
   * (Datasetクラス・Transactionクラス・Validationクラスで使用する)
   * @extends Class
   */
  class Synchro extends Class { }
  Synchro.include({
    /**
     * 同期実行処理
     * @memberof Synchro
     * @param {object} self - 自身
     * @param {string} fnc - コールバック関数
     * @param {object} obj - コールバック関数引き渡し情報
     */
    execute: function (self, fnc, obj) {
      $H.log("Synchro execute : start");

      let times = 0;
      let recursive = {
        execute: function (self, fnc, obj) {
          $H.log("Synchro object synchro : " + obj.synchro);
          let selffnc;
          // 同期フラッグの判定
          if (obj.synchro) {
            // 真の時コールバック関数を実行する
            selffnc = "self." + fnc + "(obj)";
            eval(selffnc);
            return;
          }

          // 偽の時再帰関数を実行する
          if (times < 100) {
            times += 1;
            $H.log("Synchro execute times: " + times);
            setTimeout(function () { recursive.execute(self, fnc, obj); }, 20);
          }
          else {
            // 接続エラー
            selffnc = "self.connectError()";
            eval(selffnc);
          }
        }
      };

      recursive.execute(self, fnc, obj);

      $H.log("Synchro execute : end");
    }
  });
  $H.Synchro = Synchro;

  /**
   * データセットクラス
   * @extends Class
   * @property {string} fn.name - 画面名
   * @property {boolean} fn.synchro - 同期フラッグ(デフォルト:false)
   * @property {object} fn.data - dataset json
   * @property {number} fn.formno - フォームNo
   * @property {number} fn.elementno - element番号
   */
  class Dataset extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.name;
      this.fn.synchro = false;  // 同期フラッグ：偽
      this.fn.data;             // dataset json
      this.fn.formno;           // フォームNo
      this.fn.elementno = {};   // element番号
    }
  }
  Dataset.include({
    /**
     * dataset JSONファイルを読み込む
     * @memberof Dataset
     * @param {object} appspec - AppSpecクラス
     */
    getDatasetJSON: function (appspec) {
      $H.log("Dataset getDatasetJSON : start");

      this.fn.name = appspec.name + "_dataset.json";
      // フォームNo
      this.fn.formno = appspec.formno;
      if (appspec.jsonInfo[0].dataset == "yes") {
        let url = $H.ApplicationURL + appspec.urlInfo[1].json + Dataset.fn.name;
        $.ajax({
          url: url
          , type: "GET"
          , cache: false
          , dataType: "json"
          , success: function (data) {
            // dataset json
            Dataset.fn.data = data;
            // 同期フラッグ：真
            Dataset.fn.synchro = true;
          }
        });
      }
      $H.log("Dataset getDatasetJSON : end");
    },
    /**
     * 同期処理
     * @memberof Dataset
     * @param {object} self - 呼び出し元
     * @param {string} startFnc - callback関数
     */
    synchroData: function (self, startFnc) {
      $H.log("Dataset synchroData : start");
      // 同期クラスを作成する
      const synchro = new $H.Synchro();
      synchro.execute(self, startFnc, this);

      $H.log("Dataset synchroData : end");
    },
    // getter setter
    /**
     * データセット情報取得処理
     * @memberof Dataset
     * @returns dataset json
     */
    getData: function () {
      return this.data;
    },
    /**
     * データセット情報設定処理
     * @memberof Dataset
     * @param {object} dataset - データセット設定情報
     */
    setData: function (dataset) {
      this.data = dataset;
    },
    /**
     * 要素情報取得処理(名前指定)
     * @memberof Dataset
     * @param {string} name - 項目名
     * @param {number} index - 項目データのindex
     * @returns 取得結果
     */
    getElementData: function (name, index) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        record = records[i]["record"];
        if (!(name in record)) continue;

        if (arguments.length == 1) return record[name]["value"][0];
        return record[name]["value"][index];
      }
      return "";
    },
    /**
     * 要素情報取得処理(ID＋名前指定)
     * @memberof Dataset
     * @param {string} id - ID名
     * @param {string} name - 項目名
     * @param {number} index - 項目データのindex
     * @returns 取得結果
     */
    getIdElementData: function (id, name, index) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        if (records[i]["id"] != id) {
          continue;
        }

        record = records[i]["record"];
        if (!(name in record)) {
          return "";
        }

        if (arguments.length == 2) return record[name]["value"][0];
        return record[name]["value"][index];
      }
      return "";
    },
    /**
     * 要素情報設定処理(名前指定)
     * @memberof Dataset
     * @param {object} value - 値
     * @param {string} name - 項目名
     * @param {number} index - 項目データのindex
     * @returns 値(指定要素がない場合は"")
     */
    setElementData: function (value, name, index) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        record = records[i]["record"];
        if (!(name in record)) continue;

        if (arguments.length == 2) {
          record[name]["value"][0] = value;
        }
        else {
          record[name]["value"][index] = value;
        }
        return value;
      }
      return "";
    },
    /**
     * 要素情報取得処理(ID＋名前指定)
     * @memberof Dataset
     * @param {object} value - 値
     * @param {string} id - ID
     * @param {string} name - 項目名
     * @param {number} index - 項目データのindex
     * @returns 値(指定要素がない場合は"")
     */
    setIdElementData: function (value, id, name, index) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        if (records[i]["id"] != id) {
          continue;
        }

        record = records[i]["record"];
        if (!(name in record)) {
          return "";
        }

        if (arguments.length == 3) {
          record[name]["value"][0] = value;
        }
        else {
          record[name]["value"][index] = value;
        }
        return value;
      }
      return "";
    },
    /**
     * 要素値取得処理(名前指定)
     * @memberof Dataset
     * @param {string} name - 名前
     * @returns 値(指定要素がない場合は"")
     */
    getElementValue: function (name) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        record = records[i]["record"];
        if (!(name in record)) continue;
        return record[name]["value"];
      }
      return [""];
    },
    /**
     * マルチライン情報取得処理
     * @memberof Dataset
     * @param {string} name - 項目名
     * @returns マルチライン情報(true:マルチライン)
     */
    isMultilineByName: function (name) {
      let records = this.data["records"];
      let maxrecord = records.length;
      let record, i;
      for (i = 0; i < maxrecord; i++) {
        record = records[i]["record"];
        if (!(name in record)) continue;

        if (records[i]["multiline"] == "yes") {
          return true;
        }
        else {
          return false;
        }
      }
      return false;
    }
  });
  $H.Dataset = Dataset;

  /**
   * validationクラス
   * @extends Class
   * @property {string} fn.name - 画面名
   * @property {boolean} fn.synchro - 同期フラッグ(デフォルト:false)
   * @property {object} fn.data - dataset json
   */
  class Validation extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.name;
      this.fn.synchro = false;    // 同期フラッグ：偽
      this.fn.data;               // validation json
    }
  }
  Validation.include({
    /**
     * validation JSONファイルを読み込む
     * @memberof validation
     * @param {object} appspec - AppSpecクラス
     */
    getValidationJSON: function (appspec) {
      $H.log("Validation getValidationJSON : start");

      this.fn.name = appspec.name + "_validation.json";
      if (appspec.jsonInfo[1].validation == "yes") {
        let url = $H.ApplicationURL + appspec.urlInfo[1].json + Validation.fn.name;
        $.ajax({
          url: url
          , type: "GET"
          , cache: false
          , dataType: "json"
          , success: function (data) {
            // validation json
            Validation.fn.data = data;
            // 同期フラッグ：真
            Validation.fn.synchro = true;
          }
        });
      }

      $H.log("Validation getValidationJSON : end");
    },
    /**
     * 該当項目のvalidationルールを取得する
     * @memberof validation
     * @param {string} targetName - 項目名
     * @returns validationルール(false:ルールなし)
     */
    getTargetRule: function (targetName) {
      $H.log("Validation getTargetRule : start");

      let records = this.data["records"];
      let reclength = records.length;
      let record, i;
      for (i = 0; i < reclength; i++) {
        record = records[i]["record"];
        if (targetName in record) {
          return record[targetName];
        }
      }

      $H.log("Validation getTargetRule : end");
      return false;
    },
    /**
     * 該当項目のmultiline情報を取得する
     * @memberof validation
     * @param {string} targetName - 項目名
     * @returns multiline情報
     */
    getTargetMultline: function (targetName) {
      $H.log("Validation getTargetMultline : start");

      let records = this.data["records"];
      let reclength = records.length;
      let record, i;
      for (i = 0; i < reclength; i++) {
        record = records[i]["record"];
        if (targetName in record) {
          return records[i]["multiline"];
        }
      }

      $H.log("Validation getTargetMultline : end");
      return "no";
    },
    /**
     * xxx_validation.jsonから該当項目の noDisplayMessage 情報を取得する
     * @memberof validation
     * @param {string} targetName - 項目名
     * @returns noDisplayMessage 情報(項目がない場合:"no")
     */
    getTargetNoDisplayMessage: function (targetName) {
      $H.log("Validation getTargetNoDisplayMessage : start");

      let records = this.data["records"];
      let reclength = records.length;
      let record, i, result;
      for (i = 0; i < reclength; i++) {
        record = records[i]["record"];
        if (targetName in record) {
          result = records[i]["noDisplayMessage"];
          break;
        }
      }

      $H.log("Validation getTargetNoDisplayMessage : end");
      return (result == undefined ? "no" : result);
    },
    // getter
    /**
     * データセット情報取得処理
     * @memberof validation
     * @returns データセット情報
     */
    getData: function () {
      return this.data;
    },
    /**
     * 同期処理
     * @memberof validation
     * @param {object} self - 呼び出し元
     * @param {string} startFnc - callback関数
     */
    synchroData: function (self, startFnc) {
      $H.log("Validation synchroData : start");

      // 同期クラスを作成する
      let synchro = new $H.Synchro();
      synchro.execute(self, startFnc, this);

      $H.log("Validation synchroData : end");
    }
  });
  $H.Validation = Validation;

  // 
  /**
   * トランザクションクラス
   * @extends Class
   * @property {boolean} fn.synchro - 同期フラッグ(デフォルト:false)
   * @property {number} fn.formno - フォームNo
   * @property {string} fn.program - プログラム名
   * @property {string} fn.mode - モード
   * @property {string} fn.request - リクエスト前処理関数
   * @property {string} fn.response - レスポンス処理関数
   * @property {string} fn.error - エラー処理関数
   * @property {object} fn.data - transaction json
   */
  class Transaction extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.name;
      this.fn.synchro = false;  // 同期フラッグ：偽
      this.fn.formno;   // フォームNo
      this.fn.program;  // プログラム名
      this.fn.mode;     // モード
      this.fn.request;  // リクエスト前処理関数
      this.fn.response; // レスポンス処理関数
      this.fn.error;    // エラー処理関数
      this.fn.data = {};  // transaction json
    }
  }

  Transaction.include({
    /**
     * transaction JSONファイルを読み込む
     * @memberof Transaction
     * @param {object} appspec - AppSpecクラス
     * @param {object} callback - callback関数
     */
    setTranCallback: function (appspec, callback) {
      $H.log("Transaction setTranCallback : start");

      this.name = appspec.name + "_" + callback[0] + "_tran.json";
      // フォームNo
      this.formno = appspec.formno;
      // プログラム名
      this.program = appspec.name;
      // モード
      this.mode = callback[0];
      // リクエスト前処理関数
      this.request = callback[1];
      // レスポンス処理関数
      this.response = callback[2];
      // エラー処理関数
      this.error = callback[3];

      $H.log("Transaction setTranCallback : end");
    },
    /**
     * 外部transaction JSONファイルを読み込む
     * @memberof Transaction
     * @param {object} appspec - AppSpecクラス
     * @param {object} callback - callback関数
     */
    setExternalTranCallback: function (appspec, callback) {
      $H.log("Transaction setExternalTranCallback : start");
      //jsonファイル名
      this.name = callback[0] + "_" + callback[1] + "_tran.json";
      // フォームNo
      this.formno = appspec.formno;
      // プログラム名
      this.program = callback[0];
      // モード
      this.mode = callback[1];
      // リクエスト前処理関数
      this.request = callback[2];
      // レスポンス処理関数
      this.response = callback[3];
      // エラー処理関数
      this.error = callback[4];

      $H.log("Transaction setExternalTranCallback : end");
    },
    /**
     * 指定レコードの要素数取得処理
     * @memberof Transaction
     * @param {object} datasetRecord - データセット情報(レコード)
     * @returns 要素数
     */
    setValueLength: function (datasetRecord) {
      $H.log("Transaction setValueLength : start");
      //マルチラインではない場合、処理終了
      if (datasetRecord["multiline"] == "no") return 1;

      let name, curline, i;
      let maxline = 0;
      for (name in datasetRecord["record"]) {
        curline = datasetRecord["record"][name]["value"].length - 1;
        for (i = curline; i >= 0; i--) {
          if (datasetRecord["record"][name]["value"][i]) {
            break;
          }
        }
        if (i > maxline) {
          maxline = i;
        }
      }

      $H.log("Transaction setValueLength : end");
      return maxline + 1;
    },
    /**
     * リクエストデータを送信する
     * @memberof Transaction
     * @param {object} self - 呼び出し元
     * @returns なし
     */
    ajax: function (self) {
      $H.log("Transaction ajax : start" + " mode=" + this.mode);
      // モード
      let mode = this.mode;
      // リクエスト前処理関数
      let request = "self." + this.request;
      // レスポンス処理関数
      let responseFnc = "self." + this.response + "(data, mode)";
      // エラー処理関数
      let errorFnc = "self." + this.error + "(data, mode)";
      // サーバ接続エラー関数
      let connectError = "self." + "connectError";
      // リクエストデータ
      let reqData = this.data["request"];
      // リクエスト処理関数の結果が成功でない場合は処理終了
      let requestFnc = request + "(reqData, mode)";
      if (!eval(requestFnc)) return;

      let tranSelf = this;
      let requestData = JSON.stringify(reqData);
      this.lockScreen("lockID");
      // スピン画像を表示する
      let imagesURL = $H.SystemURL + "Html/images/gif-load.gif";
      // スピン画像を表示する
      $("#loading").html("<img src='" + imagesURL + "'/>");
      $.ajax({
        url: $H.MainASGIURL
        , type: "POST"
        , data: "data=" + encodeURIComponent(requestData)
        , dataType: "json"
        , success: function (data) {
          // 2026-09-15 Issue #14 message を持たない応答（null 等）は通信エラー扱いにする（TypeError で complete が走らずローディングが残るのを防ぐ）
          if (!data || !data["message"]) {
            $H.log("Transaction ajax : invalid response " + JSON.stringify(data));
            self.connectError(null, "invalidresponse", "response has no message");
            return;
          }
          let status = data["message"]["status"];
          if (status == "OK") {
            tranSelf.setResponseValue(data, tranSelf);
            $.proxy(eval(responseFnc), self);
          }
          else {
            $.proxy(eval(errorFnc), self);
          }
        }
        , error: $.proxy(eval(connectError), self)
        , complete: function (data) {
          // スピン画像を消去する
          $("#loading").empty();
          tranSelf.unlockScreen("lockID");
        }
      });

      $H.log("Transaction ajax : end");
    },
    /**
     * 外部プログラムのリクエストデータを送信する
     * @memberof Transaction
     * @param {object} self - 呼び出し元
     * @returns なし
     */
    ajaxExternal: function (self) {
      $H.log("Transaction ajaxExternal : start" + " mode=" + this.mode);
      // モード
      let mode = this.mode;
      // リクエスト前処理関数
      let request = "self." + this.request;
      // レスポンス処理関数
      let responseFnc = "self." + this.response + "(data, mode)";
      // エラー処理関数
      let errorFnc = "self." + this.error + "(data, mode)";
      // サーバ接続エラー関数
      let connectError = "self." + "connectError";
      // リクエストデータ
      let reqData = this.data["request"];
      let requestFnc = request + "(reqData, mode)";
      // リクエスト処理関数の結果が成功でない場合は処理終了
      if (!eval(requestFnc)) return;

      let tranSelf = this;
      let requestData = JSON.stringify(reqData);
      $.ajax({
        url: $H.MainASGIURL
        , type: "POST"
        , data: "data=" + encodeURIComponent(requestData)
        , dataType: "json"
        , success: function (data) {
          // 2026-09-15 Issue #14 message を持たない応答（null 等）は通信エラー扱いにする（TypeError で complete が走らずローディングが残るのを防ぐ）
          if (!data || !data["message"]) {
            $H.log("Transaction ajax : invalid response " + JSON.stringify(data));
            self.connectError(null, "invalidresponse", "response has no message");
            return;
          }
          let status = data["message"]["status"];
          if (status == "OK") {
            tranSelf.setResponseValue(data, tranSelf);
            $.proxy(eval(responseFnc), self);
          }
          else {
            $.proxy(eval(errorFnc), self);
          }
        }
        , error: $.proxy(eval(connectError), self)
        , complete: function (data) {
        }
      });

      $H.log("Transaction ajaxExternal : end");
    },
    /**
     * ログインリクエストデータを送信する
     * @memberof Transaction
     * @param {object} self - 呼び出し元情報
     * @returns - なし
     */
    loginAjax: function (self) {
      $H.log("Transaction loginAjax : start" + " mode=" + mode);

      let mode = this.mode; // モード
      let request = "self." + this.request; // リクエスト前処理関数
      let responseFnc = "self." + this.response + "(data, mode)"; // レスポンス処理関数
      let errorFnc = "self." + this.error + "(data, mode)"; // エラー処理関数
      let connectError = "self." + "connectError"; // サーバ接続エラー関数
      let reqData = this.data["request"]; // リクエストデータ
      let requestFnc = request + "(reqData, mode)";
      if (!eval(requestFnc)) return;

      let tranSelf = this;
      let requestData = JSON.stringify(reqData);
      this.lockScreen("lockID");
      let imagesURL = $H.SystemURL + "Html/images/gif-load.gif";           // スピン画像を表示する
      $("#loading").html("<img src='" + imagesURL + "'/>");                 // スピン画像を表示する
      $.ajax({
        url: $H.LoginASGIURL
        , type: "POST"
        , data: "data=" + encodeURIComponent(requestData)
        , dataType: "json"
        , success: function (data) {
          // 2026-09-15 Issue #14 message を持たない応答（null 等）は通信エラー扱いにする（TypeError で complete が走らずローディングが残るのを防ぐ）
          if (!data || !data["message"]) {
            $H.log("Transaction ajax : invalid response " + JSON.stringify(data));
            self.connectError(null, "invalidresponse", "response has no message");
            return;
          }
          let status = data["message"]["status"];
          if (status == "OK") {
            tranSelf.setResponseValue(data, tranSelf);
            $.proxy(eval(responseFnc), self);
          }
          else {
            $.proxy(eval(errorFnc), self);
          }
        }
        , error: $.proxy(eval(connectError), self)
        , complete: function (data) {
          $("#loading").empty();                                              // スピン画像を消去する
          tranSelf.unlockScreen("lockID");
        }
      });

      $H.log("Transaction loginAjax : end");
    },
    /**
     * 画面をロックする
     * @memberof Transaction
     * @param {string} id - 項目名
     * 
     */
    lockScreen: function (id) {
      $H.log("Transaction lockScreen : start");
      let scHeight = $(document).height();
      let scWidth = $(document).width();
      let lockTag = $("<div />").attr("id", id);
      lockTag.css("z-index", "99999")
        .css("position", "absolute")
        .css("top", "0px")
        .css("left", "0px")
        .css("background-color", "gray")
        .css("opacity", "0.3")
        .css("height", scHeight + "px")
        .css("width", scWidth + "px");
      $("body").append(lockTag);

      $H.log("Transaction lockScreen : end");
    },
    /**
     * ロックを解除する
     * @memberof Transaction
     * @param {string} id - 項目名
     */
    unlockScreen: function (id) {
      $H.log("Transaction unlockScreen : start");

      $("#" + id).remove();

      $H.log("Transaction unlockScreen : end");
    }, 
    /**
     * ajaxの結果データからトランザクションレスポンスデータのvalue値を設定する
     * @memberof Transaction
     * @param {object} data - データセ情報
     * @param {object} tranSelf - トランザクション情報
     * @returns なし
     */
    setResponseValue: function (data, tranSelf) {
      $H.log("Transaction setResponseValue : start");

      if (!data["records"]) return;

      // レスポンスデータの値をクリアする
      tranSelf.clearResponseDataValue(tranSelf);

      // レスポンスデータに値を設定する
      let responseRecords = tranSelf.data["response"]["records"];
      let responselength = responseRecords.length;
      let dataRecords = data["records"];
      let datalength = dataRecords.length;
      let responseRecord, name, idname, dataRecord, valuelength, i, j, k;
      for (i = 0; i < responselength; i++) {
        idname = responseRecords[i]["id"];
        for (j = 0; j < datalength; j++) {
          if (idname != dataRecords[j]["id"]) continue;
          responseRecord = responseRecords[i]["record"];
          dataRecord = dataRecords[j]["record"];
          valuelength = tranSelf.setValueLength(dataRecords[j]);
          for (name in responseRecord) {
            if (name in dataRecord) {
              for (k = 0; k < valuelength; k++) {
                responseRecord[name]["value"][k] = dataRecord[name]["value"][k];
              }
            }
          }
          break;
        }
      }

      $H.log("Transaction setResponseValue : end");
    },
    /**
     * レスポンスデータのvalue値をクリアする
     * @memberof Transaction
     * @param {object} tranSelf - トランザクション情報
     * @returns なし
     */
    clearResponseDataValue: function (tranSelf) {
      $H.log("Transaction clearResponseDataValue : start");

      if (!tranSelf.data["response"]["records"]) return;
      let records = tranSelf.data["response"]["records"];
      let maxrecord = records.length;
      let record, name, i;
      for (i = 0; i < maxrecord; i++) {
        record = records[i]["record"];
        for (name in record) {
          record[name]["value"] = [""];
        }
      }

      $H.log("Transaction clearResponseDataValue : end");
    },
    /**
     * (getter)データセット情報取得処理
     * @memberof Transaction
     * @returns データセット情報
     */
    getData: function () {
      return this.data;
    },
    /**
     * 同期処理
     * @memberof Transaction
     * @param {object} self - 呼び出し元
     * @param {string} startFnc - callback関数
     */
    synchroData: function (self, startFnc) {
      $H.log("Transaction synchroData : start");

      // 同期クラスを作成する
      let synchro = new $H.Synchro();
      synchro.execute(self, startFnc, this);

      $H.log("Transaction synchroData : end");
    }
  });
  $H.Transaction = Transaction;

  /**
   * トランザクション管理クラス
   * @extends Class
   * @property {object} fn.trans - Transactionクラス集合
   * @property {object} fn.externaltrans - 外部Transactionクラス集合
   */
  class TranControll extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.trans = {}; // Transactionクラス集合
      this.fn.externaltrans = {}; // 外部Transactionクラス集合
    }
  }

  TranControll.include({
    /**
     * トランザクションクラスを作成する
     * @memberof TranControll
     * @param {object} appspec - AppSpecクラス
     */
    setTran: function (appspec) {
      $H.log("TranControll setTran : start");

      let callbackes = appspec.requestInfo;
      let maxlength = callbackes.length;
      let transaction, callback, mode, i;
      for (i = 0; i < maxlength; i++) {
        callback = callbackes[i];
        mode = callback[0];
        // Transactionクラスを作成する
        TranControll.fn.trans[mode] = new Transaction();
        TranControll.fn.trans[mode].setTranCallback(appspec, callback);
      }
      this.getTranJsons(appspec);

      $H.log("TranControll setTran : end");
    },
    /**
     * トランザクション実行処理
     * @memberof TranControll
     * @param {string[]} callbackArray - callback関数
     * @param {string[]} urlArray - url
     */
    tranControllRecursive: function (callbackArray, urlArray) {
      $H.log("TranControll tranControllRecursive : start");

      let recursive = {
        execute: function (callbackArray, urlArray) {
          let callback = callbackArray.shift();
          let url = urlArray.shift();
          let mode = callback[0];
          $.ajax({
            url: url
            , type: "GET"
            , cache: false
            , dataType: "json"
            , success: function (data) {
              TranControll.fn.trans[mode].data = data;
              TranControll.fn.trans[mode].synchro = true;
              if (callbackArray.length > 0) {
                recursive.execute(callbackArray, urlArray);
              }
            }
          });
        }
      };

      recursive.execute(callbackArray, urlArray);

      $H.log("TranControll tranControllRecursive : end");
    },
    /**
     * JSONファイル情報を取得する
     * @memberof TranControll
     * @param {object} appspec - AppSpecクラス
     */
    getTranJsons: function (appspec) {
      $H.log("TranControll getTranJsons : start");

      let urlArray = [];
      let callbackArray = appspec.requestInfo;
      let maxlength = callbackArray.length;
      let url, mode, i;
      for (i = 0; i < maxlength; i++) {
        mode = callbackArray[i][0];
        url = $H.ApplicationURL + appspec.urlInfo[1].json + appspec.name + "_" + mode + "_tran.json";
        urlArray[i] = url;
      }

      if (maxlength > 0) {
        this.tranControllRecursive(callbackArray, urlArray);
      }

      $H.log("TranControll getTranJsons : end");
    },
    /**
     * 外部トランザクションクラスを作成する
     * @memberof TranControll
     * @param {object} appspec - AppSpecクラス
     * @returns なし
     */
    setExternalTran: function (appspec) {
      $H.log("TranControll setExternalTran : start");

      if (appspec.externalInfo === undefined) {
        $H.log("TranControll setExternalTran : end");
        return;
      }

      let callbackes = appspec.externalInfo;
      let maxlength = callbackes.length;
      let transaction, callback, program, mode, i;
      for (i = 0; i < maxlength; i++) {
        callback = callbackes[i];
        program = callback[0]; // プログラム名
        mode = callback[1];    // 外部Transactionモード

        // Transactionクラスを作成する
        TranControll.fn.externaltrans[program + "_" + mode] = new $H.Transaction();
        TranControll.fn.externaltrans[program + "_" + mode].setExternalTranCallback(appspec, callback);
      }
      this.getExternalTranJsons(appspec);

      $H.log("TranControll setExternalTran : end");
    },
    /**
     * 外部トランザクションを実行する(再帰処理)
     * @memberof TranControll
     * @param {string[]} callbackArray - callback関数
     * @param {string[]} urlArray - url
     */
    tranControllExternalRecursive: function (callbackArray, urlArray) {
      $H.log("TranControll tranControllExternalRecursive : start");

      let recursive = {
        execute: function (callbackArray, urlArray) {
          let callback = callbackArray.shift();
          let url = urlArray.shift();
          let mode = callback[0] + "_" + callback[1];
          $.ajax({
            url: url
            , type: "GET"
            , cache: false
            , dataType: "json"
            , success: function (data) {
              TranControll.fn.externaltrans[mode].data = data;
              TranControll.fn.externaltrans[mode].synchro = true;
              if (callbackArray.length > 0) {
                recursive.execute(callbackArray, urlArray);
              }
            }
          });
        }
      };

      recursive.execute(callbackArray, urlArray);

      $H.log("TranControll tranControllExternalRecursive : end");
    },
    /**
     * 外部トランザクションのjsonファイル情報を取得する
     * @memberof TranControll
     * @param {object} appspec - AppSpecクラス
     */
    getExternalTranJsons: function (appspec) {
      $H.log("TranControll getExternalTranJsons : start");

      let urlArray = [];
      let requestInfo = appspec.requestInfo;
      let callbackArray = appspec.externalInfo;
      let maxlength = callbackArray.length;
      let url, program, mode, jsonUrl, jsonArray, extUrl, i;
      for (i = 0; i < maxlength; i++) {
        program = callbackArray[i][0];
        mode = callbackArray[i][1];
        jsonUrl = appspec.urlInfo[1].json;
        jsonArray = jsonUrl.split("/");
        extUrl = jsonArray[0] + "/" + jsonArray[1] + "/" + jsonArray[2] + "/" + program + "/";
        url = $H.ApplicationURL + extUrl + program + "_" + mode + "_tran.json";
        urlArray[i] = url;
      }

      if (maxlength > 0) {
        this.tranControllExternalRecursive(callbackArray, urlArray);
      }

      $H.log("TranControll getExternalTranJsons : end");
    },
    /**
     * (getter)トランザクション情報取得処理
     * @memberof TranControll
     * @param {string} mode - 処理モード
     * @returns トランザクション情報
     */
    getTransaction: function (mode) {
      return this.trans[mode];
    },
    /**
     * (getter)外部トランザクション情報取得処理
     * @memberof TranControll
     * @param {string} mode - 処理モード
     * @returns 外部トランザクション情報
     */
    getExternalTransaction: function (program, mode) {
      return this.externaltrans[program + "_" + mode];
    }
  });
  $H.TranControll = TranControll;

  /**
   * アプリケーション仕様クラス
   * @extends Class
   * @property {string} sysname - システム名
   * @property {string} name -  プログラム名
   * @property {string} nextname - 次画面プログラム名
   * @property {string} beforename - 前画面プログラム名
   * @property {object} formcontroll - フォーム管理クラス
   * @property {number} formno - フォームNo
   */
  class AppSpec extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.sysname;           // システム名
      this.fn.name;              // プログラム名
      this.fn.nextname;          // 次画面プログラム名
      this.fn.beforename;        // 前画面プログラム名
      this.fn.formcontroll = {}; // フォーム管理クラス
      this.fn.formno;            // フォームNo
    }
  }
  AppSpec.include({
    /**
     * 初期情報を設定する
     * @memberof AppSpec
     * @param {object} App - アプリケーション(画面)情報
     */
    initialSetting: function (App) {
      $H.log("AppSpec initialSetting : start");

      // サーバ アクセスパスを設定する
      let url = location.href;
      let urlArray = url.split("/");
      switch (urlArray[3]) {
        case "Application":
          $H.SystemURL = urlArray[0] + "//" + urlArray[2] + "/System/";
          $H.ApplicationURL = urlArray[0] + "//" + urlArray[2] + "/Application/";
          $H.HaluASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/";
          $H.MainASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/Halumain";
          $H.HtmlASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/Haluhtml";
          $H.DownloadASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluDownload";
          $H.UploadASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluUpload";
          $H.LoginASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluLogin";
          break;
        case "HaluASGI":
          $H.SystemURL = urlArray[0] + "//" + urlArray[2] + "/System/";
          $H.ApplicationURL = urlArray[0] + "//" + urlArray[2] + "/Application/";
          $H.HaluASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/";
          $H.MainASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/Halumain";
          $H.HtmlASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/Haluhtml";
          $H.DownloadASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluDownload";
          $H.UploadASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluUpload";
          $H.LoginASGIURL = urlArray[0] + "//" + urlArray[2] + "/HaluASGI/HaluLogin";
          break;
        default:
          $H.SystemURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/System/";
          $H.ApplicationURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/Application/";
          $H.HaluASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/";
          $H.MainASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/Halumain";
          $H.HtmlASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/Haluhtml";
          $H.DownloadASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/HaluDownload";
          $H.UploadASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/HaluUpload";
          $H.LoginASGIURL = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/HaluASGI/HaluLogin";
          break;
      }

      this.setSysName(); // システム名を設定する
      this.setFormNo();  // FormNoを設定する
      let model = new App.Model(this); // モデルクラスを作成する
      let view = new App.View(this);   // ビュークラスを作成する
      let controller = new App.Controller(this, model, view); // コントローラクラスを作成する
      model.initialSetting();
      view.initialSetting();
      controller.initialSetting();

      $H.log("AppSpec initialSetting : end");
    },
    /**
     * formnoを設定する
     * @memberof AppSpec
     * @param {object} enterTabPFKey 
     */
    setFormNo: function (enterTabPFKey) {
      $H.log("AppSpec setFormNo : start");

      if (arguments.length == 0) {
        enterTabPFKey = this.enterTabPFKey;
      }
      $H.log("AppSpec setFormNo : no = " + enterTabPFKey["Forms"]);

      // フォームNoを設定する
      this.formno = enterTabPFKey["Forms"];
      $H.log("AppSpec setFormNo : end");
    },
    /**
     * システム名を設定する
     * @memberof AppSpec
     */
    setSysName: function () {
      $H.log("AppSpec setSysName : start");

      let appInfo = this.urlInfo[0]["app"];
      let appInfoArray = appInfo.split("/");
      // システム名を設定する
      this.sysname = appInfoArray[0];

      $H.log("AppSpec setSysName : end");
    }
  });
  $H.AppSpec = AppSpec;

  /**
   * モデルクラス
   * @extends Class
   * @property {object} fn.appspec - アプリケーション仕様クラス
   * @property {object} fn.dataset - Datasetクラス
   * @property {object} fn.validation - Validationクラス
   * @property {object} fn.trancontroll - トランザクション管理クラス
   * @property {event} fn.event - Eventクラス
   * @property {object} fn.pubsub - PubSubクラス
   */
  class Model extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加
      this.fn.appspec = {}; // アプリケーション仕様クラス
      this.fn.dataset;      // Datasetクラス
      this.fn.validation;   // Validationクラス
      this.fn.trancontroll; // トランザクション管理クラス
      this.fn.event = {};   // Eventクラス
      this.fn.pubsub = {};  // PubSubクラス
    }
  }

  Model.include({
    /**
     * 初期情報を設定する
     * @memberof Model
     */
    initialSetting: function () {
      $H.log("Model initialSetting : start");

      this.setDatasetJSON();
      this.setValidationJSON();
      this.setTransactionJSON();

      $H.log("Model initialSetting : end");
    },
    /**
     * dataset JSONファイルを読み込む 
     * @memberof Model
     */
    setDatasetJSON: function () {
      $H.log("Model setDatasetJSON : start");

      if (this.appspec.jsonInfo[0].dataset == "yes") {
        // Datasetクラスを作成する
        this.dataset = new $H.Dataset();
        this.dataset.getDatasetJSON(this.appspec);
      }

      $H.log("Model setDatasetJSON : end");
    },
    // 
    /**
     * validation JSONファイルを読み込む
     * @memberof Model
     */
    setValidationJSON: function () {
      $H.log("Model setValidationJSON : start");

      if (this.appspec.jsonInfo[1].validation == "yes") {
        // Validationクラスを作成する
        this.validation = new $H.Validation();
        this.validation.getValidationJSON(this.appspec);
      }

      $H.log("Model setValidationJSON : end");
    },
    /**
     * トランザクション管理クラスを作成する
     * @memberof Model
     */
    setTransactionJSON: function () {
      $H.log("Model setTransactionJSON : start");

      // TranControllクラスを作成する
      this.trancontroll = new $H.TranControll();
      this.trancontroll.setTran(this.appspec);
      this.trancontroll.setExternalTran(this.appspec);

      $H.log("Model setTransactionJSON : end");
    },
    /**
     * (getter)データセット情報を取得する
     * @memberof Model
     * @returns データセット情報
     */
    getDataset: function () {
      // Datasetクラス
      return this.dataset;
    },
    /**
     * (getter)validation情報を取得する
     * @memberof Model
     * @returns validation情報
     */
    getValidation: function () {
      // validationクラス
      return this.validation;
    },
    /**
     * (getter)トランザクション管理クラスを取得する
     * @memberof Model
     * @param {string} mode - 処理モード
     * @returns トランザクション管理クラス
     */
    getTransaction: function (mode) {
      // Transactionクラス
      return this.trancontroll.getTransaction(mode);
    },
    /**
     * (getter)外部トランザクション管理クラスを取得する
     * @memberof Model
     * @param {string} mode - 処理モード
     * @returns 外部トランザクション管理クラス
     */
    getExternalTransaction: function (program, mode) {
      // 外部Transactionクラス
      return this.trancontroll.getExternalTransaction(program, mode);
    }
  });
  $H.Model = Model;

  /**
   * ビュークラス
   * @extends Class
   * @property {object} fn.appspec - アプリケーション仕様クラス
   * @property {event} fn.event - Eventクラス
   * @property {object} fn.pubsub - PubSubクラス
   * @property {object} fn.format - フォーマット
   * @property {object} fn.elementno - element番号
   * @property {boolean} fn.guidemessage - ガイドメッセージ表示フラッグ
   */
  class View extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加      
      this.fn.appspec = {};   // アプリケーション仕様クラス
      this.fn.event = {};     // Eventクラス
      this.fn.pubsub = {};    // PubSubクラス
      this.fn.format = {};    // フォーマット
      this.fn.elementno = {}; // element番号
      this.fn.guidemessage;   // ガイドメッセージ表示フラッグ
    }
  }

  View.include({
    /**
     * 初期情報を設定する
     * @memberof View
     */
    initialSetting: function () {
      $H.log("View initialSetting : start");

      this.setOutlineEvent();

      $H.log("View initialSetting : end");
    },
    /**
     * form要素の値をクリアする
     * @memberof View
     */
    clearDataValue: function () {
      $H.log("View clearDataValue : start");

      //フォームオブジェクトを取得する
      let formobject = document.forms[this.appspec.formno];
      let maxelement = formobject.length;
      for (let i = 0; i < maxelement; i++) {
        // 画面フォームオブジェクトのvalueをクリア
        formobject.elements[i].value = "";
      }

      $H.log("View clearDataValue : end");
    },
    
    /**
     * validationJsonのformat情報をコピーする
     * @memberof View
     * @param {object} validationjson - Json情報
     * @returns なし
     */
    copyFormat: function (validationjson) {
      $H.log("View copyFormat : start");

      if (!validationjson["records"]) return;
      let records = validationjson["records"];

      let maxlength = records.length;
      let record = null;
      let name = null;

      for (let i = 0; i < maxlength; i++) {
        record = records[i]["record"];
        for (name in record) {
          if (record[name]["format"]) {
            this.format[name] = record[name]["format"];
          }
        }
      }

      $H.log("View copyFormat : end");
    },
    /**
     * ガイドメッセージ表示フラッグ設定処理
     * @memberof View
     * @param {object} value - 設定値
     */
    setGuideMessage: function (value) {
      this.guidemessage = value;
    },
    /**
     * ガイドメッセージ表示フラグ取得処理
     * @memberof View
     * @returns - ガイドメッセージ表示フラッグ設定
     */
    getGuideMessage: function () {
      return this.guidemessage;
    }
  });
  $H.View = View;

  /**
   * コントローラクラス
   * @extends Class
   * @property {object} fn.appspec - アプリケーション仕様クラス
   * @property {object} fn.model - Modelクラス
   * @property {object} fn.view - Viewクラス
   * @property {object} fn.event - Eventクラス
   * @property {object} fn.tablerowevent - TableRowEventクラス
   * @property {object} fn.tableobjectevent - TableObjEventクラス
   * @property {object} fn.pubsub - PubSubクラス
   */
  class Controller extends Class {
    constructor() {
      //親クラスのコンストラクタを呼び出し
      super();
      //プロパティ追加      
      this.fn.appspec = {};           // アプリケーション仕様クラス
      this.fn.model = {};             // Modelクラス
      this.fn.view = {};              // Viewクラス
      this.fn.event = {};             // Eventクラス
      this.fn.tablerowevent = {};     // TableRowEventクラス
      this.fn.tableobjectevent = {};  // TableObjEventクラス
      this.fn.pubsub = {};            // PubSubクラス
    }
  }

  Controller.include({
    /**
     * 初期情報を設定する
     * @memberof Controller
     */
    initialSetting: function () {
      $H.log("Controller initialSetting : start");

      //キーイベントと各イベントの紐づけ
      if (this.appspec.enterTabPFKey) {
        this.setEnterTabPFKey(this.appspec.enterTabPFKey);
      }
      if (this.appspec.navButtonEvent) {
        this.setSelectorEvent(this.appspec.navButtonEvent, "navbutton");
      }
      if (this.appspec.validationEvent) {
        this.setSelectorEvent(this.appspec.validationEvent, "validation");
      }
      if (this.appspec.selectorEvent) {
        this.setSelectorEvent(this.appspec.selectorEvent, "selector");
      }
      if (this.appspec.pubsubCheckEvent) {
        this.setPubSubEvent(this.appspec.pubsubCheckEvent);
      }
      if (this.appspec.pubsubDeriveEvent) {
        this.setPubSubEvent(this.appspec.pubsubDeriveEvent);
      }
      if (this.appspec.pubsubOtherEvent) {
        this.setPubSubEvent(this.appspec.pubsubOtherEvent);
      }

      // Dataset Jsonの同期処理
      this.synchroCheckDataset();

      // ブラウザ戻るボタンを無効にする
      this.setBrowserBackBotton(this);

      $H.log("Controller initialSetting : end");
    },
    // 
    /**
     * ナビゲーションボタンイベントを設定し、コールバック関数を指定する
     * @memberof Controller
     * @param {event} selectorEvent - イベント情報
     * @param {string} name - 要素名
     */
    setSelectorEvent: function (selectorEvent, name) {
      $H.log("Controller setSelectorEvent : start");
      // イベントクラスを作成する
      let event = this.event[name] = new Event();
      event.setEvent(this, selectorEvent);

      $H.log("Controller setSelectorEvent : end");
    },
    /**
     * PubSubイベントクラスを設定する
     * @memberof Controller
     */
    createPubSubEvent: function () {
      $H.log("Controller createPubSubEvent : start");
      // PubSubクラスを作成する
      this.pubsub = new PubSub();
      this.pubsub.subscribe(this.pubsubHaluEvent);

      $H.log("Controller createPubSubEvent : end");
    },
    /**
     * チェック用PubSubイベントを設定し、コールバック関数を指定する
     * @memberof Controller
     * @param {object} pubsubEvent - PubSubイベント
     */
    setPubSubEvent: function (pubsubEvent) {
      $H.log("Controller setPubSubEvent : start");

      this.pubsub.subscribe(pubsubEvent);

      $H.log("Controller setPubSubEvent : end");
    },
    /**
     * ブラウザ戻るボタンを無効にする
     * @memberof Controller
     * @param {object} self - 呼び出し元情報
     */
    setBrowserBackBotton: function (self) {
      $H.log("Controller setBrowserBackBotton : start");

      history.pushState(null, null, null);
      $(window).on("popstate", function (event) {
        self.onBrowserBackBotton(event);
      })

      $H.log("Controller setBrowserBackBotton : end");
    }
  });
  $H.Controller = Controller;

}(jQuery));
