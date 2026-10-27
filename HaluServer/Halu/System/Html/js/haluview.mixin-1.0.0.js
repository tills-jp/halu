(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * データフォーマット関数
   * @mixin FormatMixin
   */
  App.FormatMixin = {
    /**
     * @memberof FormatMixin
     */
    formatExecute: {
      /**
       * 日付(yyyy/mm/dd)
       * @memberof FormatMixin
       */
      yyyySmmSdd: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let yyyy = value.substring(0, 4);
          let mm = value.substring(4, 6);
          let dd = value.substring(6, 8);
          return yyyy + "/" + mm + "/" + dd;
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          return new String(value).replace(/\//g, "");
        }
      },
      /**
       * 日付(yyyy年mm月dd日)
       * @memberof FormatMixin
       */
      yyyyNmmTddH: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let yyyy = value.substring(0, 4);
          let mm = value.substring(4, 6);
          let dd = value.substring(6, 8);
          return yyyy + "年" + mm + "月" + dd + "日";
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          let yyyy = value.substring(0, 4);
          let mm = value.substring(5, 7);
          let dd = value.substring(8, 10);
          return yyyy + mm + dd;
        }
      },
      /**
       * 日付(yyyy年mm月)
       * @memberof FormatMixin
       */
      yyyyNmmT: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let yyyy = value.substring(0, 4);
          let mm = value.substring(4, 6);
          return yyyy + "年" + mm + "月";
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          let yyyy = value.substring(0, 4);
          let mm = value.substring(5, 7);
          return yyyy + mm;
        }
      },
      /**
       * 数量(カンマ)
       * @memberof FormatMixin
       */
      quantity: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let formatvalue = String(value);
          // 符号付小数点の3桁カンマ編集対応
          return formatvalue.replace(/^([+-]?\d+)(?=\.|$)/, function (s) { return s.replace(/(\d+?)(?=(?:\d{3})+$)/g, '$1,'); });
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          return new String(value).replace(/,/g, "");
        }
      },
      /**
       * 数量(価格)
       * @memberof FormatMixin
       */
      price: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let formatvalue = String(value);
          // 符号付小数点の3桁カンマ編集対応
          return formatvalue.replace(/^([+-]?\d+)(?=\.|$)/, function (s) { return s.replace(/(\d+?)(?=(?:\d{3})+$)/g, '$1,'); });
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          return new String(value).replace(/,/g, "");
        }
      },
      /**
       * 数量(通貨)
       * @memberof FormatMixin
       */
      money: {
        format: function (value) {
          if (value == "" || value == null) return value;
          let formatvalue = String(value);
          // 符号付小数点の3桁カンマ編集対応
          return formatvalue.replace(/^([+-]?\d+)(?=\.|$)/, function (s) { return s.replace(/(\d+?)(?=(?:\d{3})+$)/g, '$1,'); });
        }
        , unformat: function (value) {
          if (value == "" || value == null) return value;
          return new String(value).replace(/,/g, "");
        }
      }
    },
    /**
     * 値をフォーマットする
     * @memberof FormatMixin
     * @param {object} arg - フォーマット情報
     * @returns フォーマット結果
     */
    onDataFormat: function (arg) {
      $H.log("FormatMixin dataFormat : start");

      let value = arg["value"];
      let rule = arg["rule"];
      if (rule in this.formatExecute) {
        value = this.formatExecute[rule].format(value);
      }

      $H.log("FormatMixin dataFormat : end");
      return value;
    },
    /**
     * フォーマットを元の値に戻す
     * @memberof FormatMixin
     * @param {object} arg - フォーマット情報s
     * @returns 非フォーマット結果
     */
    onDataUnformat: function (arg) {
      $H.log("FormatMixin dataUnformat : start");

      let value = arg["value"];
      let rule = arg["rule"];
      if (rule in this.formatExecute) {
        value = this.formatExecute[rule].unformat(value);
      }

      $H.log("FormatMixin dataUnformat : end");
      return value;
    }
  };
  /**
   * アウトライン関数
   * @mixin OutlineMixin
   */
  App.OutlineMixin = {
    /**
     * ローディング画像を表示する場所を設定する
     * @memberof OutlineMixin
     */
    setLoadingImage: function () {
      let data = '<div id="loading" />';
      $("body").append(data);
    },
    /**
     * アウトラインイベントを設定し、コールバック関数を指定する
     * @memberof OutlineMixin
     * @param {object} outlineEvent - アウトラインイベント情報(未使用)
     */
    setOutlineEvent: function (outlineEvent) {
      $H.log("OutlineMixin setOutlineEvent : start");

      this.setLoadingImage();

      $H.log("OutlineMixin setOutlineEvent : end");
    }
  };

  /**
   * テンプレートファイル  ロード関数
   * @mixin LoadTemplateMixin
   */
  App.LoadTemplateMixin = {
    /**
     * ナビバー  テンプレート  ファイルを設定する
     * @memberof LoadTemplateMixin
     * @param {object} arg - 画面情報 
     */
    loadNavBar: function (arg) {
      $H.log("LoadTemplateMixin loadPageNavBar : start");
      //変数宣言
      let url = null;

      if (arg["htmlName"]) {
        url = $H.ApplicationURL + "/" + arg["htmlName"];
        $('#halu-navbar').loadTemplate(url, arg);
      }

      $H.log("LoadTemplateMixin loadPageNavBar : end");
    },
    /**
     * ヘッダー  テンプレート  ファイルを設定する
     * @memberof LoadTemplateMixin
     * @param {object} arg - 画面情報 
     */
    loadHeader: function (arg) {
      $H.log("LoadTemplateMixin loadHeader : start");
      //変数宣言
      let url = null;

      if (arg["htmlName"]) {
        url = $H.ApplicationURL + "/" + arg["htmlName"];
        $('#halu-header').loadTemplate(url, arg);
      }

      $H.log("LoadTemplateMixin loadHeader : end");
    },
    /**
     * フッター  テンプレート  ファイルを設定する
     * @memberof LoadTemplateMixin
     * @param {object} arg - 画面情報
     */
    loadFooter: function (arg) {
      $H.log("LoadTemplateMixin loadFooter : start");
      //変数宣言
      let url = null;

      if (arg["htmlName"]) {
        url = $H.ApplicationURL + "/" + arg["htmlName"];
        $('#halu-footer').loadTemplate(url, arg);
      }

      $H.log("LoadTemplateMixin loadFooter : end");
    },
    /**
      * ページフッター  テンプレート  ファイルを設定する
      * @memberof LoadTemplateMixin
      * @param {object} arg - 画面情報
      */
    loadPageFooter: function (arg) {
      $H.log("LoadTemplateMixin loadPageFooter : start");
      //変数宣言
      let url = null;

      if (arg["htmlName"]) {
        url = $H.ApplicationURL + "/" + arg["htmlName"];
        $('#halu_pagefooter').loadTemplate(url, arg);
      }

      $H.log("LoadTemplateMixin loadPageFooter : end");
    },
    /**
     * HTMLテンプレートをロードする
     * @memberof LoadTemplateMixin
     * @param {object} arg - 画面情報
     */
    loadTemplate: function (arg) {
      $H.log("LoadTemplateMixin loadTemplate : start");
      //変数宣言
      let url = null;
      let wElement = null;
      let wHtmlname = null;

      //引数からデータを取得
      wElement = arg["element"];
      wHtmlname = arg["htmlName"];

      if (wElement) {
        if (wHtmlname) {
          url = $H.ApplicationURL + "/" + wHtmlname;
          $(wElement).loadTemplate(url, arg);
        }
      }

      $H.log("LoadTemplateMixin loadTemplate : end");
    },
    /**
     * CSSファイルを追加する
     * @memberof LoadTemplateMixin
     * @param {object} arg - 画面情報
     */
    appendCSS: function (arg) {
      $H.log("LoadTemplateMixin appendCSS : start");
      //変数宣言
      let url = null;

      if (arg["cssName"]) {
        // 2026-09-08 Issue #51 index.html の halutheme-preload-1.0.0.js が先読み済み（または本関数で追加済み）で、
        //   最後に読まれたテーマCSSが同じものなら二重ロードしない（別テーマへの切替時は末尾に追加して上書きさせる）
        let themeLinks = $("head link[rel='stylesheet']").filter(function () {
          return ($(this).attr("href") || "").indexOf("/css/halu-custom_") >= 0;
        });
        let lastHref = themeLinks.length > 0 ? (themeLinks.last().attr("href") || "") : "";
        if (lastHref.indexOf(arg["cssName"]) >= 0) {
          $H.log("LoadTemplateMixin appendCSS : already loaded " + arg["cssName"]);
          $H.log("LoadTemplateMixin appendCSS : end");
          return;
        }
        // 2026-09-08 Issue #51 キャッシュバスターは同一ページの halu-custom_default.css の ?var= を流用する
        let ver = "";
        $("head link[rel='stylesheet']").each(function () {
          let href = $(this).attr("href") || "";
          if (href.indexOf("halu-custom_default.css") >= 0 && href.indexOf("?") >= 0) {
            ver = href.substring(href.indexOf("?"));
            return false;
          }
        });
        url = $H.ApplicationURL + arg["cssName"] + ver;

        $("head").append("<link>");
        css = $("head").children(":last");
        css.attr({
          rel: "stylesheet",
          type: "text/css",
          href: url
        });

      }
      $H.log("LoadTemplateMixin appendCSS : end");
    }
  };

  // 
  /**
   * 関数を追加する(View)
   * @mixin ViewMixin
   */
  App.ViewMixin = {
    /**
     * フォーカス設定時イベント
     * @memberof ViewMixin
     * @param {event} event - イベント情報
     * @param {object} value - 値
     * @param {number} focusCurRow - 現在行位置
     * @returns なし
     */
    onFocus: function (event, value, focusCurRow) {
      $H.log("ViewMixin onFocus : start");
      //変数宣言
      let target = null;
      let wFocusCurRow = null;
      let idname = null;

      target = event.target;

      switch (target.type) {
        case "button":
          break;
        case "checkbox":
          break;
        case "radio":
          break;
        case "file":
          break;
        case "select-one":
          break;
        case "select-multiple":
          break;
        default:
          target.value = value;
          break;
      }

      wFocusCurRow = focusCurRow;
      if (wFocusCurRow > 0) {
        wFocusCurRow = wFocusCurRow - 1;
      }
      // 2026-06-12 後方互換: halu-ds-field を優先しエラーツールチップidを生成（なければ name）。生成側(onErrorToolTip)と同一規則
      let fieldKey = target.getAttribute("halu-ds-field") || target.name;
      idname = "#error" + fieldKey + wFocusCurRow;
      if (!$(idname)) return;
      $(idname).hide();
      $(idname).remove();

      $H.log("ViewMixin onFocus : end");
    },
    /**
     * フォーカスロスト時イベント
     * @memberof ViewMixin
     * @param {event} event - イベント情報
     */
    onBlur: function (event) {
      $H.log("ViewMixin onBlur : start");

      // 入力データをフォーマットし再表示する
      let target = event.target;
      let value = target.value;
      let rule = this.format[target.name];
      let arg = { value: value, rule: rule };

      switch (target.type) {
        case "button":
          break;
        case "checkbox":
          break;
        case "radio":
          break;
        case "file":
          break;
        case "select-one":
          break;
        case "select-multiple":
          break;
        default:
          value = this.onDataFormat(arg);
          target.value = value;
          break;
      }

      $H.log("ViewMixin onBlur : end");
    },
    // 
    /**
     * ガイドメッセージを表示する
     * @memberof ViewMixin
     * @param {object} arg - ガイドメッセージ情報
     */
    onGuideMessage: function (arg) {
      $H.log("ViewMixin onGuideMessage : start");

      if (this.guidemessage) {
        $("#footer_status").html(arg["status"]);
        $("#footer_message").html(arg["message"]);
      }

      $H.log("ViewMixin onGuideMessage : end");
    },
    // 
    // arg = {
    /**
     * エラーツールチップを表示する
     * @memberof ViewMixin
     * @param {object} arg - エラー情報
     */
    onErrorToolTip: function (arg) {
      $H.log("ViewMixin onErrorToolTip : start");

      let toolTip = function (target, errorText, multiline, index) {
        // 2026-06-12 後方互換: halu-ds-field を優先しエラーツールチップidを生成（なければ name）。消去側(onFocus)と同一規則
        let fieldKey = target.getAttribute("halu-ds-field") || target.name;
        let toolTip = $("<div id='error" + fieldKey + index + "'></div>");
        $(toolTip).addClass("errorToolTip");
        $(target).parent().append(toolTip);

        let message = $("<span>" + errorText + "</span>");
        $(message).addClass("errorMessage");
        $(toolTip).append(message);
      }

      let length = arg["message"].length;
      let errorText = "";
      for (let i = 0; i < length; i++) {
        errorText += arg["message"][i];
      }
      toolTip(arg["target"], errorText, arg["multiline"], arg["index"]);

      $H.log("ViewMixin onErrorToolTip : end");
    },
    // 
    /**
     * エラーツールチップを削除する
     * @memberof ViewMixin
     * @param {object} arg - イベントターゲット情報
     */
    onRemoveToolTip: function (arg) {
      $H.log("ViewMixin onRemoveToolTip : start");

      if (!$(".errorToolTip")) return;

      $(".errorMessage").hide();
      $(".errorMessage").remove();
      $(".errorToolTip").hide();
      $(".errorToolTip").remove();

      $H.log("ViewMixin onRemoveToolTip : end");
    },
    //★del start 20260518 メッセージダイアログ(jQuery)削除
    // /**
    //  * 警告ダイアログ 初期設定
    //  * @memberof ViewMixin
    //  */
    // initAlertDialog: function () {
    //   $H.log("ViewMixin initAlertDialog : start");

    //   let data = '<div class="modal fade" id="alertDialog" tabindex="-1" role="dialog" aria-labelledby="alertHeader" aria-hidden="true">';
    //   data += '<div class="modal-dialog">';
    //   data += '<div class="modal-content">';
    //   data += '<div class="modal-header">';
    //   data += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
    //   data += '<h4 class="modal-title" id="alertHeader">サーバ  エラー</h4>';
    //   data += '</div>';
    //   data += '<div class="modal-body" id="alertBody">';
    //   data += '<p></p></br>';
    //   data += '</div>';
    //   data += '<div class="modal-footer" id="alertFooter">'
    //   data += '<button id="alertDialogCLOSE" type="button" class="btn btn-default" data-dismiss="modal" default-value="閉じる" '
    //   data += '>閉じる</button>'
    //   data += '</div>';
    //   data += '</div>';
    //   data += '</div>';
    //   data += '</div>';
    //   $("body").append(data);

    //   $('#alertDialog').on('shown.bs.modal', function () {
    //     $("#alertDialogCLOSE").focus();
    //   })

    //   $H.log("ViewMixin initAlertDialog : end");
    // },
    // /**
    //  * 警告ダイアログを表示する
    //  * @memberof ViewMixin
    //  * @param {object} arg - 警告情報
    //  */
    // onAlertDialog: function (arg) {
    //   $H.log("ViewMixin onAlertDialog : start");

    //   // タイトル・メッセージに 複数行を設定できるようにしました
    //   if (Array.isArray(arg["title"])) {
    //     $("#alertHeader").html(arg["title"].join('<br />'));
    //   } else {
    //     $("#alertHeader").text(arg["title"]);
    //   }
    //   if (Array.isArray(arg["message"])) {
    //     $("#alertBody p").html(arg["message"].join('<br />'));
    //   } else {
    //     $("#alertBody p").text(arg["message"]);
    //   }
    //   // ボタンの文字列を設定できるようにしました
    //   this.setDialogButtonLabels($("#alertFooter"), arg);
    //   $("#alertDialog").modal("show");

    //   $H.log("ViewMixin onAlertDialog : end");
    // },
    // /**
    //  * 確認ダイアログ 初期設定
    //  * @memberof ViewMixin
    //  * @param {object} object - ダイアログ情報
    //  */
    // initConfirmDialog: function (object) {
    //   $H.log("ViewMixin initConfirmDialog : start");

    //   let self = object;
    //   let data = '<div id="confirmDialog" class="modal fade" tabindex="-1" role="dialog">';
    //   data += '  <div class="modal-dialog">';
    //   data += '    <div class="modal-content">';
    //   data += '      <div id="confirmHeader" class="modal-header">';
    //   data += '        <h4>確認</h4>';
    //   data += '      </div>';  // confirmHeader
    //   data += '      <div id="confirmBody" class="modal-body">';
    //   data += '        <p></p></br>';
    //   data += '      </div>';  // confirmBody
    //   data += '      <div id="confirmFooter" class="modal-footer">';
    //   data += '        <input id="confirmDialogYES" type="button" class="btn" data-dismiss="modal" aria-hidden="true" value="は  い" ';
    //   data += '          default-value="は  い" ';
    //   data += '          onclick="sessionStorage.setItem(\'confirmDialog\', 1);">';
    //   data += '        <input id="confirmDialogNO" type="button" class="btn" data-dismiss="modal" aria-hidden="true" value="いいえ" ';
    //   data += '          default-value="いいえ" ';
    //   data += '          onclick="sessionStorage.setItem(\'confirmDialog\', 0);">';
    //   data += '      </div>';  // confirmFooter
    //   data += '    </div>';  // confirmDialog
    //   data += '  <div>';
    //   data += '<div>';
    //   $("body").append(data);

    //   $('#confirmDialog').on('hidden.bs.modal', function () {
    //     let status = self.pubsub.publish("confirmDialogAfter");
    //   })

    //   $('#confirmDialog').on('shown.bs.modal', function () {
    //     $("#confirmDialogYES").focus();
    //   })

    //   $H.log("ViewMixin initConfirmDialog : end");
    // },
    // /**
    //  * 確認ダイアログを表示する
    //  * @memberof ViewMixin
    //  * @param {object} arg - ダイアログ情報
    //  */
    // onConfirmDialog: function (arg) {
    //   $H.log("ViewMixin onConfirmDialog : start");

    //   // タイトル・メッセージ設定(複数行可)
    //   if (Array.isArray(arg["title"])) {
    //     $("#confirmHeader h4").html(arg["title"].join('<br />'));
    //   } else {
    //     $("#confirmHeader h4").text(arg["title"]);
    //   }
    //   if (Array.isArray(arg["message"])) {
    //     $("#confirmBody p").html(arg["message"].join('<br />'));
    //   } else {
    //     $("#confirmBody p").text(arg["message"]);
    //   }
    //   // ボタンの文字列を設定
    //   this.setDialogButtonLabels($("#confirmFooter"), arg);
    //   $("#confirmDialog").modal("show");

    //   $H.log("ViewMixin onConfirmDialog : end");
    // },
    // /**
    //  * 実行確認ダイアログ 初期設定
    //  * @memberof ViewMixin
    //  * @param {object} arg - ダイアログ情報
    //  */
    // initExecuteDialog: function (object) {
    //   $H.log("ViewMixin initExecuteDialog : start");

    //   let self = object;
    //   let data = '<div id="executeDialog" class="modal fade" tabindex="-1" role="dialog">';
    //   data += '  <div class="modal-dialog">';
    //   data += '    <div class="modal-content">';
    //   data += '      <div id="executeHeader" class="modal-header">';
    //   data += '        <h4>実行確認</h4>';
    //   data += '      </div>';  // executeHeader
    //   data += '      <div id="executeBody" class="modal-body">';
    //   data += '        <p></p></br>';
    //   data += '      </div>';  // executeBody
    //   data += '      <div id="executeFooter" class="modal-footer">';
    //   data += '        <input id="executeDialogYES" type="button" class="btn" data-dismiss="modal" aria-hidden="true" value="は  い" ';
    //   data += '          default-value="は  い" ';
    //   data += '          onclick="sessionStorage.setItem(\'executeDialog\', 1);">';
    //   data += '        <input id="executeDialogNO" type="button" class="btn" data-dismiss="modal" aria-hidden="true" value="いいえ" ';
    //   data += '          default-value="いいえ" ';
    //   data += '          onclick="sessionStorage.setItem(\'executeDialog\', 0);">';
    //   data += '      </div>';  // executeFooter
    //   data += '    </div>';  // executeDialog
    //   data += '  </div>';
    //   data += '</div>';
    //   $("body").append(data);

    //   $('#executeDialog').on('hidden.bs.modal', function () {
    //     let status = self.pubsub.publish("executeDialogAfter");
    //   })

    //   $('#executeDialog').on('shown.bs.modal', function () {
    //     $("#executeDialogYES").focus();
    //   })

    //   $H.log("ViewMixin initExecuteDialog : end");
    // },
    // /**
    //  * 実行確認ダイアログを表示する
    //  * @memberof ViewMixin
    //  * @param {object} arg - ダイアログ情報
    //  */
    // onExecuteDialog: function (arg) {
    //   $H.log("ViewMixin onExecuteDialog : start");

    //   // タイトル・メッセージ設定(複数行可)
    //   if (Array.isArray(arg["title"])) {
    //     $("#executeHeader h4").html(arg["title"].join('<br />'));
    //   } else {
    //     $("#executeHeader h4").text(arg["title"]);
    //   }
    //   if (Array.isArray(arg["message"])) {
    //     $("#executeBody p").html(arg["message"].join('<br />'));
    //   } else {
    //     $("#executeBody p").text(arg["message"]);
    //   }
    //   // ボタンの文字列を設定
    //   this.setDialogButtonLabels($("#executeFooter"), arg);
    //   $("#executeDialog").modal("show");

    //   $H.log("ViewMixin onExecuteDialog : end");
    // },
    // /**
    //  * サーバ確認ダイアログ 初期設定
    //  * @memberof ViewMixin
    //  * @param {object} object - ダイアログ情報
    //  */
    // initServerDialog: function (object) {
    //   $H.log("ViewMixin initServerDialog : start");

    //   let self = object;
    //   let data = '<div class="modal fade" id="serverDialog" tabindex="-1" role="dialog" aria-labelledby="serverHeader" aria-hidden="true">';
    //   data += '  <div class="modal-dialog">';
    //   data += '    <div class="modal-content">';
    //   data += '      <div class="modal-header">';
    //   data += '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
    //   data += '        <div class="modal-header" id="serverHeader">';
    //   data += '          <h4>サーバ確認</h4>';
    //   data += '        </div>';
    //   data += '      </div>';
    //   data += '      <div class="modal-body" id="serverBody">';
    //   data += '        <p></p></br>';
    //   data += '      </div>';
    //   data += '      <div class="modal-footer" id="serverFooter">'
    //   data += '        <button id="serverDialogＯＫ" type="button" class="btn btn-default" data-dismiss="modal" default-value="ＯＫ" '
    //   data += '          onclick="sessionStorage.setItem(\'serverDialog\', 1);">ＯＫ</button>'
    //   data += '      </div>';
    //   data += '    </div>';
    //   data += '  </div>';
    //   data += '</div>';
    //   $("body").append(data);

    //   $('#serverDialog').on('hidden.bs.modal', function () {
    //     let status = self.pubsub.publish("serverDialogAfter");
    //   })

    //   $('#serverDialog').on('shown.bs.modal', function () {
    //     $("#serverDialogＯＫ").focus();
    //   })

    //   $H.log("ViewMixin initServerDialog : end");
    // },
    // /**
    //  * サーバ確認ダイアログを表示する
    //  * @memberof ViewMixin
    //  * @param {object} arg - ダイアログ情報
    //  */
    // onServerDialog: function (arg) {
    //   $H.log("ViewMixin onServerDialog : start");

    //   // タイトル・メッセージ設定(複数行可)
    //   if (Array.isArray(arg["title"])) {
    //     $("#serverHeader h4").html(arg["title"].join('<br />'));
    //   } else {
    //     $("#serverHeader h4").text(arg["title"]);
    //   }
    //   if (Array.isArray(arg["message"])) {
    //     $("#serverBody p").html(arg["message"].join('<br />'));
    //   } else {
    //     $("#serverBody p").text(arg["message"]);
    //   }
    //   // ボタンの文字列を設定
    //   this.setDialogButtonLabels($("#serverFooter"), arg);
    //   $("#serverDialog").modal("show");

    //   $H.log("ViewMixin onServerDialog : end");
    // },
    //★del end   20260518 メッセージダイアログ(jQuery)削除
    //★add start 20260518 メッセージダイアログ(Svelte)各種処理
    /**
     * 警告ダイアログ(Svelte) 初期設定
     * @memberof ViewMixin
     */
    initAlertDialog: function () {
      $H.log("ViewMixin initAlertDialog : start");
      //メッセージダイアログコンポーネントの生成
      window.createAlertDialog();
      $H.log("ViewMixin initAlertDialog : end");
    },
    /**
     * 警告ダイアログ(Svelte)を表示する
     * @memberof ViewMixin
     * @param {object} arg - 警告情報
     */
    onAlertDialog: function (arg) {
      $H.log("ViewMixin onAlertDialog : start");

      // タイトル(配列から改行に変換)
      let title = arg["title"];
      if (Array.isArray(arg["title"])) {
        title = arg["title"].join("<br />");
      }
      //未設定の場合はデフォルト値を設定
      if (!title) {
        title = "サーバ エラー";
      }

      // メッセージ(配列から改行に変換)
      let message = arg["message"];
      if (Array.isArray(arg["message"])) {
        message = arg["message"].join("<br />");
      }

      // ボタンラベル(デフォルト値)
      const defaults = ["閉じる"];
      let buttonLabel = this.setDialogButtonLabels(defaults, arg);

      //警告ダイアログを表示
      window.showAlertDialog({ title, message, buttonLabel });
      $H.log("ViewMixin onAlertDialog : end");
    },
    /**
     * 確認ダイアログ(Svelte) 初期設定
     * @memberof ViewMixin
     * @param {object} object - ダイアログ情報
     */
    initConfirmDialog: function (object) {
      $H.log("ViewMixin initConfirmDialog : start");
      let self = object;

      //クローズ後呼び出し関数の取得
      const onAfterfunction
        = () => { self.pubsub.publish("confirmDialogAfter"); };

      //確認ダイアログコンポーネントの生成
      window.createConfirmDialog(onAfterfunction);

      $H.log("ViewMixin initConfirmDialog : end");
    },
    /**
    * 確認ダイアログ(Svelte)を表示する
    * @memberof ViewMixin
    * @param {object} arg - ダイアログ情報
    */
    onConfirmDialog: function (arg) {
      $H.log("ViewMixin onConfirmDialog : start");

      // タイトル(配列から改行に変換)
      let title = arg["title"];
      if (Array.isArray(arg["title"])) {
        title = arg["title"].join("<br />");
      }
      //未設定の場合はデフォルト値を設定
      if (!title) {
        title = "確認";
      }

      // メッセージ(配列から改行に変換)
      let message = arg["message"];
      if (Array.isArray(arg["message"])) {
        message = arg["message"].join("<br />");
      }

      // ボタンラベル(デフォルト値)
      const defaults = ["は  い", "いいえ"];
      let buttonLabel = this.setDialogButtonLabels(defaults, arg);

      //確認ダイアログを表示
      window.showConfirmDialog({ title, message, buttonLabel });

      $H.log("ViewMixin onConfirmDialog : end");
    },
    /**
 * 実行ダイアログ(Svelte) 初期設定
 * @memberof ViewMixin
 * @param {object} object - ダイアログ情報
 */
    initExecuteDialog: function (object) {
      $H.log("ViewMixin initExecuteDialog : start");
      let self = object;

      //クローズ後呼び出し関数の取得
      const onAfterfunction
        = () => { self.pubsub.publish("executeDialogAfter"); };

      //実行ダイアログコンポーネントの生成
      window.createExecuteDialog(onAfterfunction);

      $H.log("ViewMixin initExecuteDialog : end");
    },
    /**
    * 実行ダイアログ(Svelte)を表示する
    * @memberof ViewMixin
    * @param {object} arg - ダイアログ情報
    */
    onExecuteDialog: function (arg) {
      $H.log("ViewMixin onExecuteDialog : start");

      // タイトル(配列から改行に変換)
      let title = arg["title"];
      if (Array.isArray(arg["title"])) {
        title = arg["title"].join("<br />");
      }

      // メッセージ(配列から改行に変換)
      let message = arg["message"];
      if (Array.isArray(arg["message"])) {
        message = arg["message"].join("<br />");
      }

      // ボタンラベル(デフォルト値)
      const defaults = ["は  い", "いいえ"];
      let buttonLabel = this.setDialogButtonLabels(defaults, arg);

      //実行確認ダイアログを表示
      window.showExecuteDialog({ title, message, buttonLabel });

      $H.log("ViewMixin onExecuteDialog : end");
    },
    /**
 * サーバダイアログ(Svelte) 初期設定
 * @memberof ViewMixin
 * @param {object} object - ダイアログ情報
 */
    initServerDialog: function (object) {
      $H.log("ViewMixin initServerDialog : start");
      let self = object;

      //クローズ後呼び出し関数の取得
      const onAfterfunction
        = () => { self.pubsub.publish("serverDialogAfter"); };

      //サーバダイアログコンポーネントの生成
      window.createServerDialog(onAfterfunction);

      $H.log("ViewMixin initServerDialog : end");
    },
    /**
    * サーバ確認ダイアログ(Svelte)を表示する
    * @memberof ViewMixin
    * @param {object} arg - ダイアログ情報
    */
    onServerDialog: function (arg) {
      $H.log("ViewMixin onServerDialog : start");

      // タイトル(配列から改行に変換)
      let title = arg["title"];
      if (Array.isArray(arg["title"])) {
        title = arg["title"].join("<br />");
      }
      //未設定の場合はデフォルト値を設定
      if(!title){
        title = "サーバ確認";
      }

      // メッセージ(配列から改行に変換)
      let message = arg["message"];
      if (Array.isArray(arg["message"])) {
        message = arg["message"].join("<br />");
      }

      // ボタンラベル(デフォルト値)
      const defaults = ["ＯＫ"];
      let buttonLabel = this.setDialogButtonLabels(defaults, arg);

      //サーバ確認ダイアログを表示
      window.showServerDialog({ title, message, buttonLabel });

      $H.log("ViewMixin onServerDialog : end");
    },
    // ★add end
    //★del start 20260518 メッセージダイアログ(jQuery)削除
    // /**
    //  * ダイアログのボタンを設定
    //  * @memberof ViewMixin
    //  * @param {object} footerObject - フッター情報
    //  * @param {object} arg - ダイアログ情報
    //  */
    // setDialogButtonLabels: function (footerObject, arg) {
    //   $H.log("ViewMixin setDialogButtonLabels : start");

    //   if ('button_labels' in arg) {
    //     footerObject.find('input[type="button"]').each(function (index) {
    //       $(this).val(arg.button_labels[index] !== undefined ?
    //         arg.button_labels[index] : $(this).attr('default-value'));
    //     });
    //   }

    //   $H.log("ViewMixin setDialogButtonLabels : end");
    // },
    //★del end   20260518 メッセージダイアログ(jQuery)削除
    //★add start 20260518 メッセージダイアログ(Svelte)各種処理
    /**
     * ダイアログのボタンラベルを設定する(Svelte用)
     * @memberof ViewMixin
     * @param {Array} defaults - デフォルトボタンラベルの配列
     * @param {object} arg - ダイアログ情報
     * @returns {Array} ボタンラベルの配列
     */
    setDialogButtonLabels: function (defaults, arg) {
      $H.log("ViewMixin setDialogButtonLabels : start");

      let buttonLabel = [];
      if (Array.isArray(arg["button_labels"])) {
        for (let i = 0; i < defaults.length; i++) {
          if (arg["button_labels"][i] !== undefined) {
            buttonLabel.push(arg["button_labels"][i]);
          } else {
            buttonLabel.push(defaults[i]);
          }
        }
      } else {
        buttonLabel = defaults;
      }

      $H.log("ViewMixin setDialogButtonLabels : end");
      return buttonLabel;
    },
    //★add end   20260518 メッセージダイアログ(Svelte)各種処理
    /**
     * セレクトボックス表示処理（ＩＤでの設定）
     * @memberof ViewMixin
     * @param {object} defSelectBox - セレクトボックス
     * @param {object} responseRecord - レスポンスデータ
     */
    onShowSelectBox: function (defSelectBox, responseRecord) {
      $H.log("ViewMixin onShowSelectBox : start");

      let selectorID = defSelectBox["selectorid"];
      let initValue = defSelectBox["init"]["initvalue"];
      let initHtml = defSelectBox["init"]["inithtml"];
      let valueName = defSelectBox["init"]["valuename"];
      let htmlName = defSelectBox["init"]["htmlname"];
      let max = responseRecord[valueName]["value"].length;

      // 2026-03-16 後方互換: halu-ds-field で要素を特定（なければ #id で検索）
      let $sel = $("[halu-ds-field='" + selectorID + "']");
      if (!$sel.length) $sel = $("#" + selectorID);

      $sel.find("option").remove();

      let option = $('<option selected:selected/>');
      if (initHtml) {
        option.val(initValue);
        option.html(initHtml);
        $sel.append(option);
      }


      for (let i = 0; i < max; i++) {
        option = $('<option />');
        option.val(responseRecord[valueName]["value"][i]);
        option.html(responseRecord[htmlName]["value"][i]);
        $sel.append(option);
      }

      $H.log("ViewMixin onShowSelectBox : end");
    },
    /**
     * セレクトボックス表示処理  ＩＤからカレント行を一括表示する
     * @memberof ViewMixin
     * @param {object} dataSetInfo - セレクトボックス情報(データ)
     * @param {object} defSelectBox - セレクトボックス(画面要素)
     */
    showCurrentSelectBox: function (dataSetInfo, defSelectBox) {
      $H.log("View showCurrentSelectBox : start");
      //変数宣言
      let selectorid = null;
      let detasetID = null;
      let codeName = null;
      let dataSetRecord = null;
      let codeValue = null;
      let max = 0;

      max = defSelectBox.length;
      for (let i = 0; i < max; i++) {
        //初期化
        selectorid = null;
        detasetID = null;
        codeName = null;
        dataSetRecord = null;
        codeValue = null;
        //データ取得
        selectorid = defSelectBox[i]["selectorid"];
        detasetID = defSelectBox[i]["change"]["datasetid"];
        codeName = defSelectBox[i]["change"]["valuename"];

        dataSetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, detasetID);
        codeValue = dataSetRecord["record"][codeName]["value"][0];

        // 2026-03-16 後方互換: halu-ds-field で要素を特定（なければ #id で検索）
        let $sel = $("[halu-ds-field='" + selectorid + "']");
        if (!$sel.length) $sel = $("#" + selectorid);
        $sel.val(codeValue);

      }

      $H.log("View showCurrentSelectBox : end");
    },
    /**
     * チェックボックス表示処理
     * @memberof ViewMixin
     * @param {object} defCheckBox - チェックボックス
     * @param {object} responseRecord - レスポンスデータ
     */
    onShowCheckBox: function (defCheckBox, responseRecord) {
      $H.log("ViewMixin onShowCheckBox : start");
      //変数宣言
      let selectorID = null;
      let datasetName = null;
      let onValue = null;
      let offValue = null;

      //チェックボックス情報取得
      selectorID = defCheckBox["selectorid"]
      datasetName = defCheckBox["datasetname"];
      onValue = defCheckBox["value"]["on"];
      offValue = defCheckBox["value"]["off"];

      // 2026-06-12 後方互換: halu-ds-id+halu-ds-field属性で要素を特定（なければ #selectorid で検索）
      let $checkbox = $("[halu-ds-id='" + defCheckBox["datasetid"] + "'][halu-ds-field='" + datasetName + "']");
      if (!$checkbox.length) $checkbox = $("#" + selectorID);

      if (responseRecord[datasetName]["value"][0] == onValue) {
        $checkbox.prop("checked", true);
      }
      if (responseRecord[datasetName]["value"][0] == offValue) {
        $checkbox.prop("checked", false);
      }

      $H.log("ViewMixin onShowCheckBox : end");
    },
    /**
     * テーブル  チェックボックス表示処理
     * @memberof ViewMixin
     * @param {object} defCheckBox - チェックボックス
     * @param {object} responseRecord - レスポンスデータ
     */
    onShowCheckBoxTable: function (defCheckBox, responseRecord) {
      $H.log("ViewMixin onShowCheckBoxTable : start");

      let selectorName = defCheckBox["selectorname"]
      let datasetName = defCheckBox["datasetname"];
      let onValue = defCheckBox["value"]["on"];
      let offValue = defCheckBox["value"]["off"];
      let max = responseRecord[datasetName]["value"].length;
      // 2026-06-12 後方互換: halu-ds-id+halu-ds-field属性で要素を特定（なければ .selectorname で検索）
      let targetObject = $("[halu-ds-id='" + defCheckBox["datasetid"] + "'][halu-ds-field='" + datasetName + "']");
      if (!targetObject.length) targetObject = $("." + selectorName);

      for (let i = 0; i < max; i++) {
        if (responseRecord[datasetName]["value"][i] == onValue) {
          $(targetObject[i]).prop("checked", true);
        }
        if (responseRecord[datasetName]["value"][i] == offValue) {
          $(targetObject[i]).prop("checked", false);
        }
      }

      $H.log("ViewMixin onShowCheckBoxTable : end");
    },
    /**
     * ラジオボタン表示処理
     * @memberof ViewMixin
     * @param {object} defRadioButton - ラジオボタン
     * @param {object} responseRecord - レスポンスデータ
     */
    onShowRadioButton: function (defRadioButton, responseRecord) {
      $H.log("ViewMixin onShowRadioButton : start");


      $H.log("ViewMixin onShowRadioButton : end");
    },
    /**
     * JsonDataから明細テーブルを再作成する
     * @param {string} tableID - 明細テーブルのID
     * @param {object} jsonData - jsonデータ
     * @param {string} idName - 項目id名
     * @param {string} itemName - 明細テーブル項目名
     */
    recreateJsonDataToTable: function (tableID, jsonData, idName, itemName) {
      $H.log("ViewMixin recreateJsonDataToTable : start");

      // 明細テーブルの２行目移行を削除する
      this.deleteTableSecondRow(tableID);

      // 明細テーブルの１行目をクリアする
      let detailRecord = this.appspec.getJSONChunkByIdAtRecords(jsonData, idName)["record"];
      this.clearTableFirstRow(detailRecord);

      // 明細テーブルの１行目をデータ件数分コピーする
      let maxSize = detailRecord[itemName]["value"].length;
      this.copyTableFirstRow(tableID, maxSize);

      $H.log("ViewMixin recreateJsonDataToTable : end");
    },
    /**
     * JsonDataの値をViewに表示する<br>
     * (テーブルデータは対象外)
     * @memberof ViewMixin
     * @param {object} jsonData - jsonデータ
     */
    fromJsonDataToView: function (jsonData) {
      $H.log("ModelMixin fromJsonDataToView : start");
      //変数宣言
      let jsonRecord = null;
      let name = null;
      let object = null;
      let jsonRecords = null;
      let maxSize = null;
      let value = null;
      let rule = null;
      let arg = null;
      let tagName = null;
      let typeName = null;

      //変数宣言
      jsonRecords = jsonData["records"];
      maxSize = jsonRecords.length;

      for (let i = 0; i < maxSize; i++) {
        //初期化
        jsonRecord = null;
        //データ取得
        jsonRecord = jsonRecords[i];

        if (jsonRecord["multiline"] == "yes") {
          continue;
        }

        for (name in jsonRecord["record"]) {
          //初期化
          object = null;
          value = null;
          rule = null;
          arg = null;
          tagName = null;
          typeName = null;

          //データ取得
          // 2026-03-06 halu-ds-id属性+halu-ds-field属性でrecord id単位に要素を特定（後方互換: なければid属性で検索）
          object = $("[halu-ds-id='" + jsonRecord["id"] + "'][halu-ds-field='" + name + "']")[0];
          if (object === undefined) {
            object = $("#" + name)[0];
          }
          if (object === undefined) {
            continue;
          }

          value = jsonRecord["record"][name]["value"][0];
          if (name in this.format) {
            rule = this.format[name];
            arg = { value: value, rule: rule };
            value = this.pubsub.publish("dataformat", arg);
          }

          tagName = $(object)[0].tagName;
          typeName = "";
          if (tagName == "INPUT") {
            typeName = $(object)[0].type;
          }

          this.setValueToObject(tagName, typeName, $(object)[0], value);
        }
      }

      $H.log("ModelMixin fromJsonDataToView : end");
    },
    /**
     * JsonDataからテーブルを再描画する
     * @memberof ViewMixin
     * @param {string} tableID - テーブルID
     * @param {object} jsonData - jsonデータ
     * @param {string} idName - id名
     */
    resetJsonDataToTable: function (tableID, jsonData, idName) {
      $H.log("ViewMixin resetJsonDataToTable : start");
      //変数宣言
      let detailRecord = null;
      let maxSize = 0;
      let name = null;

      // 明細テーブルの２行目移行を削除する
      this.deleteTableSecondRow(tableID);

      // 明細テーブルの１行目をクリアする
      detailRecord = this.appspec.getJSONChunkByIdAtRecords(jsonData, idName)["record"];
      // 2026-03-04 idNameをclearTableFirstRowに渡す
      this.clearTableFirstRow(detailRecord, idName);

      // 明細行数を設定する
      maxSize = 0;
      for (name in detailRecord) {
        maxSize = detailRecord[name]["value"].length
        break;
      }

      // 明細テーブルの１行目をデータ件数分コピーする
      this.copyTableFirstRow(tableID, maxSize);

      // 2026-03-04 idNameをshowJsonDataToTableに渡す
      this.showJsonDataToTable(detailRecord, maxSize, idName);

      $H.log("ViewMixin resetJsonDataToTable : end");
    },

    /**
     * テーブルの２行目以降を削除する
     * @param {string} tableID - テーブルid
     */
    deleteTableSecondRow: function (tableID) {
      $H.log("ViewMixin deleteTableSecondRow : start");

      $(tableID).find("tbody tr:gt(0)").remove();

      //変数宣言
      let j;
      let rows = null;

      rows = $(tableID)[0].rows;
      jQuery.each(rows, function (j) {
        let cells = rows[j].cells;
        jQuery.each(cells, function () {
          $(this).removeClass("rowBackground");
        });
      });

      $H.log("ViewMixin deleteTableSecondRow : end");
    },
    /**
     * 明細テーブルの１行目をクリアする
     * @memberof ViewMixin
     * @param {object} detailRecord - 明細データ
     * @param {string} idName - record id名
     */
    clearTableFirstRow: function (detailRecord, idName) {
      $H.log("ViewMixin clearTableFirstRow : start");
      //変数宣言
      let name = null;
      let tagName = null;
      let typeName = null;
      let objArray = null;

      for (name in detailRecord) {
        //初期化
        objArray = null;
        tagName = null;
        typeName = null;

        // 2026-03-06 halu-ds-id属性+halu-ds-field属性でrecord id単位に要素を特定（後方互換: なければclass属性のみで検索）
        if (idName) {
          objArray = $("[halu-ds-id='" + idName + "'][halu-ds-field='" + name + "']");
        }
        if (!objArray || !objArray.length) {
          objArray = $("." + name);
        }
        if (!objArray.length) {
          continue;
        }

        tagName = $(objArray)[0].tagName;
        typeName = "";
        if (tagName == "INPUT") {
          typeName = $(objArray)[0].type;
        }

        this.setValueToObject(tagName, typeName, $(objArray)[0], "");
      }

      $H.log("ViewMixin clearTableFirstRow : end");
    },
    /**
     * テーブルの１行目を指定行数分コピーする
     * @memberof ViewMixin
     * @param {string} tableID - テーブルid
     * @param {number} maxSize - 最大行数
     */
    copyTableFirstRow: function (tableID, maxSize) {
      $H.log("ViewMixin copyTableFirstRow : start");
      //変数宣言
      let copySize = null;

      copySize = maxSize - 1;
      for (let i = 0; i < copySize; i++) {
        $(tableID + " tbody tr").eq(0).clone(true).insertAfter($(tableID + " tbody tr").eq(i));
      }

      $H.log("ViewMixin copyTableFirstRow : end");
    },
    /**
     * テーブルのROWにid番号を付与する
     * @memberof ViewMixin
     * @param {string} tableID - テーブルid
     */
    setRowidOfTable: function (tableID) {
      $H.log("ViewMixin setRowidOfTable : start");
      //変数宣言
      let table = null;
      let maxSize = 0;
      let row = null;

      //データ取得
      table = document.getElementById(tableID);
      maxSize = table.rows.length;
      for (let i = 0; i < maxSize; i++) {
        //初期化
        row = null;

        //データ取得
        row = table.rows[i];
        $(row).attr('id', i);
      }

      $H.log("ViewMixin setRowidOfTable : end");
    },
    /**
     * 明細テーブルにデータを表示する
     * @memberof ViewMixin
     * @param {object} detailRecord - 明細データ
     * @param {number} maxSize - 最大行数 
     * @param {string} idName - record id名
     */
    showJsonDataToTable: function (detailRecord, maxSize, idName) {
      $H.log("ViewMixin showJsonDataToTable : start");
      //変数宣言
      let name = null;
      let objArray = null;
      let tagName = null;
      let typeName = null;
      let value = null;
      let rule = null;
      let arg = null;

      //明細テーブルにデータを表示する
      for (let i = 0; i < maxSize; i++) {
        for (name in detailRecord) {
          //初期化
          objArray = null;
          tagName = null;
          typeName = null;
          value = null;
          rule = null;
          arg = null;

          //項目名を取得
          // 2026-03-06 halu-ds-id属性+halu-ds-field属性でrecord id単位に要素を特定（後方互換: なければclass属性のみで検索）
          if (idName) {
            objArray = $("[halu-ds-id='" + idName + "'][halu-ds-field='" + name + "']");
          }
          if (!objArray || !objArray.length) {
            objArray = $("." + name);
          }
          if (!objArray.length) {
            continue;
          }
          //タグと型を取得
          tagName = $(objArray)[0].tagName;
          typeName = "";
          if (tagName == "INPUT") {
            typeName = $(objArray)[0].type;
          }

          value = detailRecord[name]["value"][i];

          if (name in this.format) {
            rule = this.format[name];
            arg = { value: value, rule: rule };
            value = this.pubsub.publish("dataformat", arg);
          }

          this.setValueToObject(tagName, typeName, $(objArray)[i], value);
        }
      }

      $H.log("ViewMixin showJsonDataToTable : end");
    },
    /**
     * 画面の各オブジェクトに値をセットする
     * @memberof ViewMixin
     * @param {string} tagName - オブジェクト名
     * @param {string} typeName - オブジェクトの種類 
     * @param {object} object - オブジェクト
     * @param {object} value - 値
     */
    setValueToObject: function (tagName, typeName, object, value) {

      switch (tagName) {
        case "INPUT":
          this.setValueToObjectOfInput(tagName, typeName, object, value);
          break;
        case "SELECT":
          this.setValueToObjectOfInput(tagName, typeName, object, value);
          break;
        case "TEXTAREA":
          this.setValueToObjectOfInput(tagName, typeName, object, value);
          break;
        default:
          this.setValueToObjectOfOther(tagName, typeName, object, value);
          break;
      }

    },
    /**
     * 画面の入力可能オブジェクトに値をセットする
     * @memberof ViewMixin
     * @param {string} tagName - オブジェクト名
     * @param {string} typeName - オブジェクトの種類
     * @param {object} object - オブジェクト
     * @param {object} value - 値
     */
    setValueToObjectOfInput: function (tagName, typeName, object, value) {

      switch (typeName) {
        case "text":
          $(object).val(value);
          break;
        case "checkbox":
          if (value == "" || value == "0") {
            $(object).prop("checked", false);
          }
          else {
            $(object).prop("checked", true);
          }
          break;
        case "radio":
          if (value == "" || value == "0") {
            $(object).prop("checked", false);
          }
          else {
            $(object).prop("checked", true);
          }
          break;
        case "button":
          break;
        default:
          $(object).val(value);
          break;
      }

    },
    /**
     * 画面の入力不可オブジェクトへ値を設定する
     * @memberof ViewMixin
     * @param {string} tagName - オブジェクト名
     * @param {string} typeName - オブジェクトの種類
     * @param {object} object - オブジェクト
     * @param {object} value - 値
     */
    setValueToObjectOfOther: function (tagName, typeName, object, value) {

      switch (tagName) {
        case "BUTTON":
          break;
        case "DIV":
          $(object).html(value);
          break;
        case "LABEL":
          $(object).text(value);
          break;
        case "TD":
          $(object).html(value);
          break;
        default:
          $(object).html(value);
          break;
      }

    },

    // -------------------------------------------------------
    // 画面遷移・選択画面  処理
    // -------------------------------------------------------
    /**
     * 画面ヘッダ  キー項目  表示＆クリア処理
     * @memberof ViewMixin
     * @param {object} dataSet - データセット
     */
    setFromDatasetToViewWithSessionStorageOfHeader: function (dataSet) {
      $H.log("ViewMixin setFromDatasetToViewWithSessionStorageOfHeader : start");

      this.setFromDatasetToViewWithKeyInfo(dataSet, this.appspec.sessionStorageHeaderKey);

      $H.log("ViewMixin setFromDatasetToViewWithSessionStorageOfHeader : end");
    },
    /**
     * 前画面からの引き継ぎデータを表示する
     * @memberof ViewMixin
     * @param {object} dataSet - 引き継ぎデータ
     */
    setFromDatasetToViewWithBeforeStorageData: function (dataSet) {
      $H.log("ViewMixin setFromDatasetToViewWithBeforeStorageData : start");

      this.setFromDatasetToViewWithKeyInfo(dataSet, this.appspec.beforeStorageData);

      $H.log("ViewMixin setFromDatasetToViewWithBeforeStorageData : end");
    },
    /**
     * 画面キー情報＆前画面からの引き継ぎデータを表示する
     * @memberof ViewMixin
     * @param {*} dataSet - 引き継ぎデータ
     * @param {*} keyInfo - 画面キー情報
     */
    setFromDatasetToViewWithKeyInfo: function (dataSet, keyInfo) {
      //変数宣言
      let maxSizeKeyInfo = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = 0;
      let itemName = null;
      let className = null;
      let typeName = null;
      let strArray = null;
      let $select = null;
      let $elements = null;

      // 検索項目をクリアする
      maxSizeKeyInfo = keyInfo.length;
      for (let i = 0; i < maxSizeKeyInfo; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = keyInfo[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = keyInfo[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;
          className = null;
          typeName = null;
          strArray = null;
          $select = null;
          $elements = null;

          //値取得
          itemName = keyInfo[i]["dataname"][j];
          className = keyInfo[i]["classname"][j];
          typeName = keyInfo[i]["typename"][j];

          // 2026-03-13 halu-ds-id+halu-ds-field属性で要素を特定
          // 後方互換: 見つからなければ classname で検索（multipleselect のみ #id セレクタ）
          $elements = $("[halu-ds-id='" + datasetID + "'][halu-ds-field='" + itemName + "']");
          if ($elements.length === 0 && className) {
            if (typeName == "multipleselect") {
              $elements = $("#" + className);
            } else {
              $elements = $("." + className);
            }
          }

          if (typeName == "text") {
            $elements.val(datasetRecord[itemName]["value"][0]);
          }
          if (typeName == "select") {
            $elements.val(datasetRecord[itemName]["value"][0]);
          }
          if (typeName == "multipleselect") {
            strArray = datasetRecord[itemName]["value"][0].split(",");
            $select = $elements;
            $select.multipleSelect("uncheckAll");
            $select.multipleSelect("setSelects", strArray);
          }
          if (typeName == "checkbox") {
            if (datasetRecord[itemName]["value"][0] == "" || datasetRecord[itemName]["value"][0] == "0") {
              $elements.prop("checked", false);
            }
            else {
              $elements.prop("checked", true);
            }
          }
          if (typeName == "td") {
            $elements.text(datasetRecord[itemName]["value"][0]);
          }
        }
      }
    },

    /**
     * 画面が表示された時、最初にフォーカスを設定する項目を指定する
     * @memberof ViewMixin
     */
    setFirstFocusItem: function () {
      $H.log("ViewMixin setFirstFocusItem : start");
      //変数宣言
      let object = null;

      if (this.appspec.isExists(this.appspec.firstFocusItem)) {
        if (this.appspec.isExists(this.appspec.firstFocusItem[0])) {
          if (this.appspec.firstFocusItem[0][0] == "class") {
            object = $("." + this.appspec.firstFocusItem[0][1])[0];
          }
          // 2026-06-12 後方互換: "field"指定時はhalu-ds-fieldで特定（第3要素があればhalu-ds-idでrecord id単位に特定）。class/id分岐は従来通り
          else if (this.appspec.firstFocusItem[0][0] == "field") {
            if (this.appspec.isExists(this.appspec.firstFocusItem[0][2])) {
              object = $("[halu-ds-id='" + this.appspec.firstFocusItem[0][2] + "'][halu-ds-field='" + this.appspec.firstFocusItem[0][1] + "']")[0];
            }
            else {
              object = $("[halu-ds-field='" + this.appspec.firstFocusItem[0][1] + "']")[0];
            }
          }
          else {
            object = $("#" + this.appspec.firstFocusItem[0][1])[0];
          }

          object.focus();
          if (object.type == "text" || object.type == "textarea") {
            // キャレットを最後に設定
            object.value += "";
          }
        }
      }

      $H.log("ViewMixin setFirstFocusItem : end");
    },

    /**
     * F12押下時、フォーカスを設定する項目を指定する
     * @memberof ViewMixin
     */
    setF12FocusItem: function () {
      $H.log("ViewMixin setF12FocusItem : start");
      //変数宣言
      let object = null;

      if (this.appspec.isExists(this.appspec.f12FocusItem)) {
        if (this.appspec.isExists(this.appspec.f12FocusItem[0])) {
          if (this.appspec.f12FocusItem[0][0] == "class") {
            object = $("." + this.appspec.f12FocusItem[0][1])[0];
          }
          // 2026-06-12 後方互換: "field"指定時はhalu-ds-fieldで特定（第3要素があればhalu-ds-idでrecord id単位に特定）。class/id分岐は従来通り
          else if (this.appspec.f12FocusItem[0][0] == "field") {
            if (this.appspec.isExists(this.appspec.f12FocusItem[0][2])) {
              object = $("[halu-ds-id='" + this.appspec.f12FocusItem[0][2] + "'][halu-ds-field='" + this.appspec.f12FocusItem[0][1] + "']")[0];
            }
            else {
              object = $("[halu-ds-field='" + this.appspec.f12FocusItem[0][1] + "']")[0];
            }
          }
          else {
            object = $("#" + this.appspec.f12FocusItem[0][1])[0];
          }

          object.focus();
          if (object.type == "text" || object.type == "textarea") {
            // キャレットを最後に設定
            object.value += "";
          }
        }
      }
      $H.log("ViewMixin setF12FocusItem : end");
    }
  };
}(jQuery, Halu));
