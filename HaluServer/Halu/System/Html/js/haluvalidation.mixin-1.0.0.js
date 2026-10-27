(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * バリデーション関数
   * @mixin ValidationMixin
   */
  App.ValidationMixin = {
    /**
     * バリデーションルールを設定する
     * @memberof ValidationMixin
     */
    validationRule: {
      required: [
        "入力して下さい。"
        , "必須項目"
        , function (value) {
          if (value == "0") return true;
          if (value == "") return false;
          return true;
        }
      ]
      , required9: [
        "入力して下さい。"
        , "必須項目"
        , function (value) {
          return true;
        }
      ]
      , nonrequired: [
        "入力して下さい。"
        , ""
        , function (value) {
          return true;
        }
      ]
      , integerP: [
        "数字を入力して下さい。"
        , "数字でない文字がある"
        , function (value) {
          if (value == "") return true;
          let stringvalue = String(value);
          if (stringvalue.match(/[^0-9]/g)) return false;
          return true;
        }
      ]
      , integer: [
        "符号付き（+：省略可）数字を入力して下さい。"
        , "数字と符号以外の文字がある"
        , function (value) {
          if (value == "") return true;
          let stringvalue = String(value);
          return stringvalue.match(/(\+|-)?\d+/g);
        }
      ]
      , decimals: [
        "小数を入力して下さい。"
        , "数字と小数点以外の文字がある"
        , function (value) {
          if (value == "") return true;

          let stringvalue = String(value);
          let valueArray = stringvalue.split(".");
          if (valueArray.length > 2) return false;
          if (valueArray[0].match(/[^0-9]/g)) return false;
          if (valueArray.length == 1) return true;
          if (valueArray[1].match(/[^0-9]/g)) return false;
          return true;
        }
      ]
      , decimalS: [
        "数を入力して下さい。"
        , "数字と小数点、符号以外の文字がある"
        , function (value) {
          if (value == "") return true;

          let stringvalue = String(value);
          return stringvalue.match(/^[+-]?\d+(\.\d+)?$/);
        }
      ]
      , alphabet: [
        "アルファベット（大文字・小文字）を入力して下さい。"
        , "アルファベットでない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^a-zA-Z]/g)) return false;
          return true;
        }
      ]
      , alphabetS: [
        "アルファベット（小文字）を入力して下さい。"
        , "英小文字でない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^a-z]/g)) return false;
          return true;
        }
      ]
      , alphabetB: [
        "アルファベット（大文字）を入力して下さい。"
        , "英大文字でない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^A-Z]/g)) return false;
          return true;
        }
      ]
      , alphanum: [
        "英数字を入力して下さい。"
        , "英数字以外の文字が入力されています。"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^a-zA-Z0-9]/g)) return false;
          return true;
        }
      ]
      , alphanumspace: [
        "英数字を入力して下さい。"
        , "英数字、スペースでないの文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^a-zA-Z0-9 ]/g)) return false;
          return true;
        }
      ]
      , alphanumS: [
        "英数字（0～9と小文字）を入力して下さい。"
        , "英数字（0～9と小文字）以外の文字が入力されています。"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^a-z0-9]/g)) return false;
          return true;
        }
      ]
      , alphanumB: [
        "英数字（0～9と大文字）を入力して下さい。"
        , "英大文字と数字でない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^A-Z0-9]/g)) return false;
          return true;
        }
      ]
      , hiragana: [
        "ひらがなを入力して下さい。"
        , "ひらがなでない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^あ-んが-ぼぁ-ょゎっー　]/g)) return false;
          return true;
        }
      ]
      , katakana: [
        "カタカナを入力して下さい。"
        , "全角カタカナでない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^ア-ンァィゥェォャュョッ、。ー・　]/g)) return false;
          return true;
        }
      ]
      , katakanaH: [
        "半角カタカナを入力して下さい。"
        , "半角カナでない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｬｭｮｯｰﾞﾟ･ ]/g)) return false;
          return true;
        }
      ]
      , halfchar: [
        "半角文字を入力して下さい。"
        , "半角でない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[^ｱｲｳｴｵｧｨｩｪｫｶｷｸｹｺｻｼｽｾｿﾀﾁﾂｯﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖｬｭｮﾗﾘﾙﾚﾛﾜｦﾝﾞﾟｰ･､｡ A-Za-z0-9!"#%&'\(\)=\|;:\+\*_,\.<>\/\?@\[\]\{\}\\\^\-｢｣\$]/g)) return false;
          return true;
        }
      ]
      , zenkaku: [
        // 英数、空白         [ A-Za-z0-9]
        // 英記号             [\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]
        // 半角カナ、カナ記号 [｡-ﾟ]
        "全角文字を入力して下さい。"
        , "全角でない文字がある"
        , function (value) {
          if (value == "") return true;
          if (value.match(/[ A-Za-z0-9\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E｡-ﾟ]/)) return false;
          return true;
        }
      ]
      , kanji: [
        "漢字を入力して下さい。"
        , "全角文字でない文字がある"
        , function (value) {
          if (value == "") return true;
          return true;
        }
      ]
      , yyyymmdd: [
        "年月日を入力して下さい。"
        , "年月日の誤り"
        , function (value) {
          if (value == "" || value == null) return true;

          value = value + "";
          let yyyy = value.substring(0, 4);
          let mm = value.substring(4, 6);
          let dd = value.substring(6, 8);
          let dt = new Date(yyyy, mm - 1, dd);

          if (dt.getFullYear() == yyyy && dt.getMonth() == mm - 1 && dt.getDate() == dd) return true;
          return false;
        }
      ]
      , yyyymm: [
        "年月を入力して下さい。"
        , "年月の誤り"
        , function (value) {
          if (value == "") return true;

          value = value + "";
          let yyyy = value.substring(0, 4);
          let mm = value.substring(4, 6);
          let dd = 1;
          let dt = new Date(yyyy, mm - 1, dd);

          if (dt.getFullYear() == yyyy && dt.getMonth() == mm - 1 && dt.getDate() == dd) return true;
          return false;
        }
      ]
      , mmdd: [
        "月日を入力して下さい。"
        , "月日の誤り"
        , function (value) {
          if (value == "") return true;

          value = value + "";
          let cdate = new Date();
          let yyyy = cdate.getFullYear();
          let mm = value.substring(0, 2);
          let dd = value.substring(3, 4);
          let dt = new Date(yyyy, mm - 1, dd);

          if (dt.getFullYear() == yyyy && dt.getMonth() == mm - 1 && dt.getDate() == dd) return true;
          return false;
        }
      ]
      , HHCMM: [
        // 時刻チェック（00:00 OR 0:00 ～ 24:00）
        "時刻（時：分）を入力して下さい。"
        , "時刻（時：分）の誤り"
        , function (value) {
          if (value == "") return true;

          value = value + "";
          return value.match(/^(2[0-3]|[01]?[0-9]):([0-5][0-9])|(24):(00)$/);
        }
      ]
      , free: [
        "入力して下さい。"
        , ""
        , function (value) {
          if (value == "") return true;
          return true;
        }
      ]
      , postno: [
        "郵便番号を入力して下さい。"
        , "郵便番号の誤り"
        , function (value) {
          if (value == "") return true;
          return value.match(/^\d{3}-\d{4}$|^\d{3}-\d{2}$|^\d{3}$/);
        }
      ]
      , telno: [
        //電話番号チェック
        //6～9桁または12桁の「0～9」と「-」の文字列
        //1～4桁の数字＋「-」＋4桁の数字 または
        //2～5桁の数字＋「-」＋1～4桁の数字＋「-」＋4桁の数字
        "電話番号を入力して下さい。"
        , "電話番号の誤り"
        , function (value) {
          if (value == "") return true;
          let ansShortNo = value.match(/^[0-9-]{6,9}$|^[0-9-]{12}$/);
          let ansLongNo = value.match(/^\d{1,4}-\d{4}$|^\d{2,5}-\d{1,4}-\d{4}$/);
          if (ansShortNo && ansLongNo) return true;
          return false;
        }
      ]
      , keitaino: [
        //携帯番号チェック
        //3桁の数字＋「-」＋4桁の数字＋「-」＋4桁の数字 
        //または11桁の数字
        "携帯番号を入力して下さい。"
        , "携帯番号の誤り"
        , function (value) {
          if (value == "") return true;
          return value.match(/^\d{3}-\d{4}-\d{4}$|^\d{11}$/);
        }
      ]
      , mailaddress: [
        "メールアドレスを入力して下さい。"
        , "メールアドレスの誤り"
        , function (value) {
          if (value == "") return true;
          return value.match(/\S+@\S+\.\S+$/);
        }
      ]
      , url: [
        "URLを入力して下さい。"
        , "URLの誤り"
        , function (value) {
          if (value == "") return true;
          return value.match(/(http|https|ftp):\/\/.+/);
        }
      ]
      , ipaddress: [
        "IPアドレスを入力して下さい。"
        , "IPアドレスの誤り"
        , function (value) {
          if (value == "") return true;
          return value.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
        }
      ]
      , min: [
        ""
        , "桁数の誤り"
        , function (value, size) {
          if (value == "") return true;
          if (value.length < size) return false;
          return true;
        }
      ]
      , max: [
        ""
        , "桁数の誤り"
        , function (value, size) {
          if (value == "") return true;
          if (value.length > size) return false;
          return true;
        }
      ]
      , minbyte: [
        ""
        , "バイト数の誤り"
        , function (value, size) {
          if (value == "") return true;
          let count = 0;
          let n;
          for (let i = 0; i < value.length; i++) {
            n = encodeURI(value.charAt(i));
            if (n.length < 4) {
              count++;
            }
            else {
              count += 2;
            }
          }

          if (count < size) return false;
          return true;
        }
      ]
      , maxbyte: [
        ""
        , "バイト数の誤り"
        , function (value, size) {
          if (value == "") return true;
          let count = 0;
          let n;
          for (let i = 0; i < value.length; i++) {
            n = encodeURI(value.charAt(i));
            if (n.length < 4) {
              count++;
            }
            else {
              count += 2;
            }
          }
          if (count > size) return false;
          return true;
        }
      ]
      , minbyteUnicode: [
        ""
        , "バイト数の誤り"
        , function (value, size) {
          let count = encodeURI(value).replace(/%[0-9A-F]{2}/g, '*').length;
          if (count < size) return false;
          return true;
        }
      ]
      , maxbyteUnicode: [
        ""
        , "バイト数の誤り"
        , function (value, size) {
          let count = encodeURI(value).replace(/%[0-9A-F]{2}/g, '*').length;
          if (count > size) return false;
          return true;
        }
      ]
    },
    /**
     * 桁数メッセージを作成する
     * @memberof ValidationMixin
     * @param {object} targetRule - 対象ルール
     * @returns メッセージ
     */
    setKetaMessage: function (targetRule) {
      let minsize = targetRule["min"];
      let maxsize = targetRule["max"];
      if (minsize == "" && maxsize == "") return "";

      if (minsize != "" && maxsize != "") {
        if (minsize == maxsize) return maxsize + "桁の";
        return minsize + "桁～" + maxsize + "桁の";
      }

      if (minsize != "") return minsize + "桁以上の";
      return maxsize + "桁以内の";
    },
    /**
     * バイト数メッセージを作成する
     * @memberof ValidationMixin
     * @param {object} targetRule - 対象ルール
     * @returns メッセージ
     */
    setByteMessage: function (targetRule) {
      let minsize = targetRule["minbyte"];
      let maxsize = targetRule["maxbyte"];
      if (minsize == "" && maxsize == "") return "";

      if (minsize != "" && maxsize != "") {
        if (minsize == maxsize) return maxsize + "バイトの";
        return minsize + "バイト～" + maxsize + "バイトの";
      }

      if (minsize != "") return minsize + "バイト以上の";
      return maxsize + "バイト以内の";
    },
    /**
     * requiredメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} targetRule - 対象ルール
     * @returns メッセージ
     */
    setRequiredMessage: function (targetRule) {
      if (targetRule["validation"][0] == "required") return "（必須入力です）";
      if (targetRule["validation"][0] == "nonrequired") return "（省略可能です）";
      return "";
    },
    /**
     * ルールメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} targetRule - 対象ルール
     * @returns メッセージ
     */
    setRuleMessage: function (targetRule) {
      let rule = targetRule["validation"][1];
      if (!rule) return "";
      return this.validationRule[rule][0];
    },
    /**
     * バリデーションJsonから該当項目のmultiline情報を取得する 
     * @memberof ValidationMixin
     * @param {object} targetRule - 対象ルール
     * @returns multiline情報
     */
    getTargetMultline: function (targetName) {
      // halumvc.js Validationクラス
      let validData = this.validation.getData();
      let records = validData["records"];
      let reclength = records.length;
      let record;
      for (let i = 0; i < reclength; i++) {
        record = records[i]["record"];
        if (targetName in record) {
          return records[i]["multiline"];
        }
      }
      return "no";
    },
    /**
     * データ（バリデーション）チェックを行う
     * @memberof ValidationMixin
     * @param {object} value - チェック対象値
     * @param {object} targetRule - チェックルール
     * @param {object} errorMessage - エラーメッセージ
     * @param {string} type - チェック種類
     * @param {number} index - データのindex
     * @returns なし
     */
    checkData: function (value, targetRule, errorMessage, type, index) {
      let validations = targetRule["validation"];
      let validlength = validations.length;
      let rule, message;
      for (let i = 0; i < validlength; i++) {
        rule = validations[i];
        if (index > 0) {
          if (type == "onBlur") {
            if (rule == "required") {
              continue;
            }
          }
        }
        if (rule in this.validationRule) {
          // チェック OK
          if (this.validationRule[rule][2](value)) continue;
          // エラーメッセージ設定
          message = this.validationRule[rule][1] + "\n";
          errorMessage.push(message);
          return;
        }
      }
    },
    /**
     * サイズチェックを行う
     * @memberof ValidationMixin
     * @param {object} value - チェック対象
     * @param {object} targetRule - ルール
     * @param {string} errorMessage - エラーメッセージ
     * @param {object} type - チェックの種類
     * @param {number} index - チェック対象のindex(未使用)
     */
    checkSize: function (value, targetRule, errorMessage, type, index) {
      let check = function (self, value, size, rule) {
        if (!size) return;
        // チェック OK
        if (self.validationRule[rule][2](value, size)) return;
        // エラーメッセージ設定
        let message = self.validationRule[rule][1] + "\n";
        errorMessage.push(message);
      }
      // 次に記述されているメソッドが、サイズチェック実行の候補になります
      let arrayMethod = [
        "min", "max"
        , "minbyte", "maxbyte"
        , "minbyteUnicode", "maxbyteUnicode"
      ];
      for (let i = 0, n = arrayMethod.length; i < n; i++) {
        check(this, value, targetRule[arrayMethod[i]], arrayMethod[i]);
      }
    },
    /**
     * Validationチェック 処理
     * @memberof ValidationMixin
     * @param {object} target - チェック対象(要素)
     * @param {object} value - チェック対象(値)
     * @param {number} index - チェック対象のindex
     * @param {string} type - チェック種類
     * @returns チェック結果
     */
    validationCheck: function (target, value, index, type) {
      $H.log("ValidationMixin validationCheck : start");

      let message = {};
      let okmessage = { target: target, status: "OK", message: "", multiline: "no", noDisplayMessage: "no", row: index };
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      let targetRule = this.validation.getTargetRule(fieldName);
      if (!targetRule) {
        return okmessage;
      }

      let multiline = this.validation.getTargetMultline(fieldName);
      let noDisplayMessage = this.validation.getTargetNoDisplayMessage(fieldName);
      let errorMessage = [];
      this.checkData(value, targetRule, errorMessage, type, index);
      this.checkSize(value, targetRule, errorMessage, type, index);

      if (errorMessage.length > 0) {
        message = { target: target, status: "ERROR", message: errorMessage, multiline: multiline, noDisplayMessage: noDisplayMessage, row: index };
        return message;
      }

      // チェック用カスタムイベント名設定（check + 項目名 を設定する）
      let eventname = "check" + fieldName;
      if (this.pubsub.isEvent(eventname)) {
        let arg = { target: target, value: value, multiline: multiline, noDisplayMessage: noDisplayMessage, row: index, type: type };
        message = this.pubsub.publish(eventname, arg);
        if (message["status"] == "ERROR") {
          return message;
        }
      }

      $H.log("ValidationMixin validationCheck : end");
      return okmessage;
    },
    /**
     * リクエストデータの一括チェック
     * @memberof ValidationMixin
     * @param {object} requestdata - リクエストデータ
     * @returns チェック結果(true/false)
     */
    transactionCheck: function (requestdata) {
      $H.log("ValidationMixin transactionCheck : start");

      let errorCount = 0;
      if (requestdata["records"]) {

        let message = {};
        let records = requestdata["records"];
        let maxlength = records.length;
        let record, name, value, valuelength, elementvalue, target, i, j;
        let multiline, defaultline, recId, dsElements;
        for (i = 0; i < maxlength; i++) {
          multiline = records[i]["multiline"]
          record = records[i]["record"];
          // 2026-06-12 後方互換: halu-ds-id/halu-ds-field で要素を特定（なければid/class属性で検索）
          recId = records[i]["id"];
          for (name in record) {
            value = record[name]["value"];
            valuelength = value.length;
            for (j = 0; j < valuelength; j++) {
              elementvalue = value[j];

              if (multiline == "no") {
                target = $("[halu-ds-id='" + recId + "'][halu-ds-field='" + name + "']")[0];
                if (target === undefined) {
                  target = $("#" + name)[0];
                }
              }
              else {
                dsElements = $("[halu-ds-id='" + recId + "'][halu-ds-field='" + name + "']");
                if (dsElements.length > 0) {
                  target = dsElements[j];
                }
                else {
                  target = $("." + name)[j];
                }
              }

              if (target) {
                message = this.validationCheck(target, elementvalue, j, "onTran");
                this.pubsub.publish("removeToolTip", message);
                if (message["status"] == "OK" || message["noDisplayMessage"] == "yes") {
                  this.onBlurDerive(target, elementvalue, j);
                }
                else {
                  this.pubsub.publish("errorToolTip", message);
                }
                errorCount += (message["status"] == "OK" ? 0 : 1);
              }
              if (message["status"] == "ERROR") {
                break;
              }
            }
            if (message["status"] == "ERROR") {
              break;
            }
          }
          if (message["status"] == "ERROR") {
            break;
          }
        }

      }
      $H.log("ValidationMixin transactionCheck : end");
      return (errorCount == 0);
    },
    // 
    /**
     * ボタン用のガイドメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} target - チェック対象
     * @returns ガイドメッセージ
     */
    getButtonMessage: function (target) {
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      return fieldName + " ボタンをクリックして下さい。";;
    },
    /**
     * ラジオボックス用のガイドメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} target - チェック対象 
     * @returns ガイドメッセージ
     */
    getRadioMessage: function (target) {
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      return fieldName + " を選択して下さい。";;
    },
    /**
     * チェックボックス用のガイドメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} target - チェック対象 
     * @returns ガイドメッセージ
     */
    getCheckboxMessage: function (target) {
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      return fieldName + " をチェックして下さい。";;
    },
    /**
     * セレクトボックス用のガイドメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} target - チェック対象 
     * @returns ガイドメッセージ
     */
    getSelectMessage: function (target) {
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      return fieldName + " を選択して下さい。";;
    },
    /**
     * テキストボックス用のガイドメッセージを作成する
     * @memberof ValidationMixin
     * @param {object} target - チェック対象 
     * @returns ガイドメッセージ
     */
    getNonValidMessage: function (target) {
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      return fieldName + " を入力して下さい。";;
    },
    /**
     * 入力ガイドメッセージ作成処理
     * @memberof ValidationMixin
     * @param {event} event - イベント情報
     * @returns ガイドメッセージ
     */
    onFocusMessage: function (event) {
      $H.log("ValidationMixin onFocusMessage : start");

      let target = event.target;
      let type = target.type;
      if (type == "button") {
        return this.getButtonMessage(target);
      }
      if (type == "radio") {
        return this.getRadioMessage(target);
      }
      if (type == "checkbox") {
        return this.getCheckboxMessage(target);
      }
      if (type == "select-one") {
        return this.getSelectMessage(target);
      }
      if (type == "select-multiple") {
        return this.getSelectMessage(target);
      }

      let sizemsg, requiredmsg, rulemsg, guidemsg;
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      let targetRule = this.validation.getTargetRule(fieldName);
      // ルール設定無し
      if (!targetRule) {
        guidemsg = this.getNonValidMessage(target);
        return guidemsg;
      }
      if (targetRule["max"]) {
        sizemsg = this.setKetaMessage(targetRule);
      }
      if (targetRule["maxbyte"]) {
        sizemsg = this.setByteMessage(targetRule);
      }
      requiredmsg = this.setRequiredMessage(targetRule);
      rulemsg = this.setRuleMessage(targetRule);
      guidemsg = sizemsg + rulemsg + requiredmsg;

      $H.log("ValidationMixin onFocusMessage : end");
      return guidemsg;
    },
    /**
     * onBlur データチェック処理
     * @memberof ValidationMixin
     * @param {event} event - イベント情報
     * @param {number} index - データのindex
     * @returns チェック結果メッセージ
     */
    onBlurDataCheck: function (event, index) {
      $H.log("ValidationMixin onBlurDataCheck : start");

      let target = event.target;
      let message = this.validationCheck(target, target.value, index, "onBlur");

      $H.log("ValidationMixin onBlurDataCheck : end");
      return message;
    },
    /**
     * onBlurDerive 導出項目編集処理
     * @memberof ValidationMixin
     * @param {object} target - 処理対象(要素)
     * @param {object} value - 値
     * @param {number} index - データのindex
     */
    onBlurDerive: function (target, value, index) {
      $H.log("ValidationMixin onBlurDerive : start");

      // 導出項目編集用カスタムイベント名設定（derive + 項目名 を設定する）
      // 2026-06-12 後方互換: halu-ds-fieldで項目名を特定（なければname属性で特定）
      let fieldName = target.getAttribute("halu-ds-field") || target.name;
      let eventname = "derive" + fieldName;
      if (this.pubsub.isEvent(eventname)) {
        let multiline = this.validation.getTargetMultline(fieldName);
        let arg = { target: target, value: value, row: index };
        this.pubsub.publish(eventname, arg);
      }

      $H.log("ValidationMixin onBlurDerive : end");
    }
  };
}(jQuery, Halu));
