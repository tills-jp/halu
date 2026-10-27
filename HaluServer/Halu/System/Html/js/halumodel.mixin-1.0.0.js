(function ($, $H) {
  // 名前空間を設定する
  let App = $H.Library;

  /**
   * Model共通関数群
   * @mixin ModelMixin
   */
  App.ModelMixin = {
    /**
     * コントロールにフォーカスが当たった時のイベント処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {number} row - 行情報
     * @returns コントロールに紐づくデータの値
     */
    onFocus: function (event, row) {
      $H.log("ModelMixin onFocus : start");
      let target = event.target;
      let value = "";

      //イベントターゲットの種類チェック
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
          // 2026-03-13 halu-ds-field属性を後方互換フォールバックとして対応
          value = this.dataset.getElementData(target.name || target.getAttribute("halu-ds-field") || "", row);
          break;
      }

      $H.log("ModelMixin onFocus : end");
      return value;
    },

    /** 
     * コントロールからフォーカスが外れた時のイベント処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {number} row - 行情報
     */
    onBlur: function (event, row) {
      $H.log("ModelMixin onBlur : start");

      let target = event.target;

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
          // 2026-03-13 halu-ds-field属性を後方互換フォールバックとして対応
          this.dataset.setElementData(target.value, target.name || target.getAttribute("halu-ds-field") || "", row);
          break;
      }

      $H.log("ModelMixin onBlur : end");
    },

    /**
     * セレクトボックス チェンジ処理
     * @memberof ModelMixin
     * @param {object} event - イベント情報
     * @param {object} defSelectBox - セレクトボックス情報
     * @returns 変更後の選択値
     */
    onChangeSelectBox: function (event, defSelectBox) {
      $H.log("ModelMixin onChangeSelectBox : start");

      //イベント関連情報
      // 2026-03-16 後方互換: halu-ds-field で要素を特定（なければ id を使用）
      let targetID = event.target.id || event.target.getAttribute("halu-ds-field") || "";
      let $target = $(event.target);
      let targetValue = $target.val();
      let targetHtml = $target.find("option:selected").text();

      let max = defSelectBox.length;
      let datasetRecord = null;
      let valueName = null;
      let htmlName = null;

      //セレクトボックスの要素分ループ
      for (let i = 0; i < max; i++) {
        //変数初期化
        datasetRecord = null;
        valueName = null;
        htmlName = null;

        //セレクトボックスとイベント対象のオブジェクトのIDが一致しているか
        if (targetID != defSelectBox[i]["selectorid"]) {
          continue;
        }

        //データ取得
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(this.dataset.data, defSelectBox[i]["change"]["datasetid"]);
        valueName = defSelectBox[i]["change"]["valuename"];
        if (valueName) {
          if (this.appspec.isExists(defSelectBox[i]["multiple"])) {
            if (defSelectBox[i]["multiple"] == "multiple") {
              if ($.isArray(targetValue)) {
                datasetRecord["record"][valueName]["value"][0] = targetValue.join(',');
              }
              else {
                if (this.appspec.isExists(targetValue)) {
                  datasetRecord["record"][valueName]["value"][0] = targetValue;
                }
                else {
                  datasetRecord["record"][valueName]["value"][0] = "";
                }
              }
            }
            else {
              datasetRecord["record"][valueName]["value"][0] = targetValue;
            }
          }
          else {
            datasetRecord["record"][valueName]["value"][0] = targetValue;
          }
        }

        htmlName = defSelectBox[i]["change"]["htmlname"];
        if (htmlName) {
          datasetRecord["record"][htmlName]["value"][0] = targetHtml;
        }

        break;
      }//end of for

      $H.log("ModelMixin onChangeSelectBox : end");
      return targetValue;
    },

    /**
     * テーブル セレクトボックス チェンジ処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {number} index - セレクトボックスのindex
     * @param {object} defSelectBox - テーブル セレクトボックス情報
     * @returns 変更後の選択値
     */
    onChangeTableSelectBox: function (event, index, defSelectBox) {
      $H.log("ModelMixin onChangeTableSelectBox : start");

      //イベント情報用変数
      // 2026-06-12 後方互換: halu-ds-field 属性があればそれをフィールド名として使用（なければ name 属性）
      let targetName = event.target.getAttribute("halu-ds-field") || event.target.name;
      // 2026-06-12 後方互換: target に halu-ds 属性があれば属性セレクタで要素特定（なければ従来の class 検索）
      let targetDsId = event.target.getAttribute("halu-ds-id");
      let targetDsField = event.target.getAttribute("halu-ds-field");
      let targetObject = null;
      if (targetDsField) {
        if (targetDsId !== null) {
          targetObject = $("[halu-ds-id='" + targetDsId + "'][halu-ds-field='" + targetDsField + "']");
        }
        else {
          targetObject = $("[halu-ds-field='" + targetDsField + "']");
        }
      }
      else {
        targetObject = $("." + targetName);
      }
      let targetValue = $(targetObject[index]).val();

      //ループ用変数
      let max = defSelectBox.length;
      let datasetRecord = null;
      let valueName = null;

      //セレクトボックスの要素分ループ
      for (let i = 0; i < max; i++) {
        //変数初期化
        datasetRecord = null;
        valueName = null;

        // 2026-06-12 後方互換: selectorname 一致を優先し、なければ datasetname での一致も許容（新方式HTMLは name 属性を持たないため）
        if (targetName != defSelectBox[i]["selectorname"] && targetName != defSelectBox[i]["datasetname"]) {
          continue;
        }
        //データ取得
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(this.dataset.data, defSelectBox[i]["change"]["datasetid"]);
        valueName = defSelectBox[i]["change"]["valuename"];
        if (valueName) {
          datasetRecord["record"][valueName]["value"][index] = targetValue;
        }

        break;
      }

      $H.log("ModelMixin onChangeTableSelectBox : end");
      return targetValue;
    },

    /**
     * チェックボックス チェンジ処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {object} defCheckBox - チェックボックス情報
     * @returns 変更後の値
     */
    onChangeCheckBox: function (event, defCheckBox) {
      $H.log("ModelMixin onChangeCheckBox : start");
      //イベント情報用変数
      // 2026-06-12 後方互換: halu-ds-field 属性があればそれをキーとして使用（なければ id 属性）
      let targetID = event.target.getAttribute("halu-ds-field") || event.target.id;

      //ループ用変数
      let max = defCheckBox.length;
      let datasetID = null;
      let datasetName = null;
      let checkValue = null;
      let datasetRecord = null;

      //チェックボックス配列分ループ
      for (let i = 0; i < max; i++) {
        //変数初期化
        datasetID = null;
        datasetName = null;
        checkValue = null;
        datasetRecord = null;

        //IDチェック
        // 2026-06-12 後方互換: selectorid 一致を優先し、なければ datasetname での一致も許容（新方式HTMLは id 属性を持たないため）
        if (targetID != defCheckBox[i]["selectorid"] && targetID != defCheckBox[i]["datasetname"]) {
          continue;
        }

        //データ取得
        datasetID = defCheckBox[i]["datasetid"];
        datasetName = defCheckBox[i]["datasetname"];

        // 2026-06-12 後方互換: change発火元の event.target 自身の状態を参照（id 依存の $("#id") を排除し新旧両方式に対応）
        if ($(event.target).is(":checked")) {
          checkValue = defCheckBox[i]["value"]["on"];
        }
        else {
          checkValue = defCheckBox[i]["value"]["off"];
        }

        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(this.dataset.data, datasetID);
        datasetRecord["record"][datasetName]["value"][0] = checkValue;

        break;
      }

      $H.log("ModelMixin onChangeCheckBox : end");
      return checkValue;
    },

    /**
     * テーブル チェックボックス チェンジ処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {number} index - 変更対象のindex
     * @param {object} defCheckBox - チェックボックス(配列)
     * @returns 変更後の値
     */
    onChangeTableCheckBox: function (event, index, defCheckBox) {
      $H.log("ModelMixin onChangeTableCheckBox : start");
      //変数宣言
      // 2026-06-12 後方互換: halu-ds-field 属性があればそれをフィールド名として使用（なければ name 属性）
      let targetName = event.currentTarget.getAttribute("halu-ds-field") || event.currentTarget.name;
      // 2026-06-12 後方互換: target に halu-ds 属性があれば属性セレクタで要素特定（なければ従来の class 検索）
      let targetDsId = event.currentTarget.getAttribute("halu-ds-id");
      let targetDsField = event.currentTarget.getAttribute("halu-ds-field");
      let checkValue; //戻り値

      //ループ用変数
      let max = defCheckBox.length;
      let datasetID = null;
      let datasetName = null;
      let targetObject = null;
      let datasetRecord = null;

      //チェックボックス分ループ
      for (let i = 0; i < max; i++) {
        //変数初期化
        datasetID = null;
        datasetName = null;
        targetObject = null;
        datasetRecord = null;

        //チェックボックス名前チェック
        // 2026-06-12 後方互換: selectorname 一致を優先し、なければ datasetname での一致も許容（新方式HTMLは name 属性を持たないため）
        if (targetName != defCheckBox[i]["selectorname"] && targetName != defCheckBox[i]["datasetname"]) {
          continue;
        }

        //データ取得
        datasetID = defCheckBox[i]["datasetid"];
        datasetName = defCheckBox[i]["datasetname"];
        // 2026-06-12 後方互換: halu-ds 属性があれば属性セレクタで要素特定（なければ従来の class 検索）
        if (targetDsField) {
          if (targetDsId !== null) {
            targetObject = $("[halu-ds-id='" + targetDsId + "'][halu-ds-field='" + targetDsField + "']");
          }
          else {
            targetObject = $("[halu-ds-field='" + targetDsField + "']");
          }
        }
        else {
          targetObject = $("." + targetName);
        }
        if ($(targetObject[index]).prop("checked")) {
          checkValue = defCheckBox[i]["value"]["on"];
        }
        else {
          checkValue = defCheckBox[i]["value"]["off"];
        }

        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(this.dataset.data, datasetID);
        datasetRecord["record"][datasetName]["value"][index] = checkValue;

        break;
      }

      $H.log("ModelMixin onChangeTableCheckBox : end");
      return checkValue;
    },

    /**
     * ラジオボタン チェンジ処理
     * @memberof ModelMixin
     * @param {event} event - イベント情報
     * @param {object} defRadioButton - ラジオボタン
     */
    onChangeonRadioButton: function (event, defRadioButton) {
      $H.log("ModelMixin onChangeonRadioButton : start");


      $H.log("ModelMixin onChangeonRadioButton : end");
    },

    /**
     * セレクトボックス ＩＤに対応する名称にデータを一括設定する
     * @memberof ModelMixin
     * @param {object} dataSetInfo - データセット情報
     * @param {object} defSelectBox - セレクトボックス(配列)
     */
    setFromCodeToNameOfSelectBoxALL: function (dataSetInfo, defSelectBox) {
      $H.log("Model setFromIdToNameOfSelectBox : start");
      //変数宣言
      let maxI = 0;
      let selectID = null;
      let selectRecord = null;
      let selectValue = null;
      let selectName = null;
      let detasetID = null;
      let dataSetRecord = null;
      let dataValue = null;
      let dataName = null;
      let maxJ = 0;

      //セレクトボックス要素分ループ
      maxI = defSelectBox.length;
      for (let i = 0; i < maxI; i++) {
        //初期化
        selectID = null;
        selectRecord = null;
        selectValue = null;
        selectName = null;
        detasetID = null;
        dataSetRecord = null;
        dataValue = null;
        dataName = null;
        maxJ = 0;

        //データ取得
        selectID = defSelectBox[i]["init"]["datasetid"];
        selectRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, selectID);
        selectValue = defSelectBox[i]["init"]["valuename"];
        selectName = defSelectBox[i]["init"]["htmlname"];

        detasetID = defSelectBox[i]["change"]["datasetid"];
        dataSetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, detasetID);
        dataValue = defSelectBox[i]["change"]["valuename"];
        dataName = defSelectBox[i]["change"]["htmlname"];

        maxJ = selectRecord["record"][selectValue]["value"].length;

        //ＩＤに対応する名称にデータを設定
        for (let j = 0; j < maxJ; j++) {
          if (dataSetRecord["record"][dataValue]["value"][0] == selectRecord["record"][selectValue]["value"][j]) {
            dataSetRecord["record"][dataName]["value"][0] = selectRecord["record"][selectName]["value"][j];
            break;
          }
        }
      }

      $H.log("Model setFromIdToNameOfSelectBox : end");
    },

    /**
     * セレクトボックス ＩＤに対応する名称にデータを設定する
     * @memberof ModelMixin
     * @param {object} dataSetInfo - データセット情報
     * @param {object} defSelectBox - セレクトボックス
     * @param {string} selectorid - セレクタＩＤ
     */
    setFromCodeToNameOfSelectBox: function (dataSetInfo, defSelectBox, selectorid) {
      $H.log("Model setFromIdToNameOfSelectBox : start");
      //変数宣言
      let maxI = 0;
      let selectID = null;
      let selectRecord = null;
      let selectValue = null;
      let selectName = null;
      let detasetID = null;
      let dataSetRecord = null;
      let dataValue = null;
      let dataName = null;
      let maxJ = 0;

      //セレクトボックスの要素数分ループ
      maxI = defSelectBox.length;
      for (let i = 0; i < maxI; i++) {
        //変数初期化
        selectID = null;
        selectRecord = null;
        selectValue = null;
        selectName = null;
        detasetID = null;
        dataSetRecord = null;
        dataValue = null;
        dataName = null;
        maxJ = 0;

        //idが違う場合は次へ
        if (selectorid != defSelectBox[i]["selectorid"]) {
          continue;
        }

        //データ取得
        selectID = defSelectBox[i]["init"]["datasetid"];
        selectRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, selectID);
        selectValue = defSelectBox[i]["init"]["valuename"];
        selectName = defSelectBox[i]["init"]["htmlname"];

        detasetID = defSelectBox[i]["change"]["datasetid"];
        dataSetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, detasetID);
        dataValue = defSelectBox[i]["change"]["valuename"];
        dataName = defSelectBox[i]["change"]["htmlname"];

        maxJ = selectRecord["record"][selectValue]["value"].length;

        //ＩＤに対応する名称にデータを設定する
        for (let j = 0; j < maxJ; j++) {
          if (dataSetRecord["record"][dataValue]["value"][0] == selectRecord["record"][selectValue]["value"][j]) {
            dataSetRecord["record"][dataName]["value"][0] = selectRecord["record"][selectName]["value"][j];
            break;
          }
        }
      }

      $H.log("Model setFromIdToNameOfSelectBox : end");
    },

    /**
     * セレクトボックス 名称に対応するＩＤにデータを設定する
     * @memberof ModelMixin
     * @param {object} dataSetInfo - データセット情報
     * @param {object} defSelectBox - セレクトボックス
     * @param {string} selectorid - セレクタＩＤ
     */
    setFromNameToCodeOfSelectBox: function (dataSetInfo, defSelectBox, selectorid) {
      $H.log("Model setFromNameToCodeOfSelectBox : start");
      //変数宣言
      let maxI = 0;
      let selectID = null;
      let selectRecord = null;
      let selectValue = null;
      let selectName = null;
      let detasetID = null;
      let dataSetRecord = null;
      let dataValue = null;
      let dataName = null;
      let maxJ = 0;

      //セレクトボックスの要素数分ループ
      maxI = defSelectBox.length;
      for (let i = 0; i < maxI; i++) {
        //変数初期化
        selectID = null;
        selectRecord = null;
        selectValue = null;
        selectName = null;
        detasetID = null;
        dataSetRecord = null;
        dataValue = null;
        dataName = null;
        maxJ = 0;

        //ＩＤが一致しない場合は次へ
        if (selectorid != defSelectBox[i]["selectorid"]) {
          continue;
        }

        //データ取得
        selectID = defSelectBox[i]["init"]["datasetid"];
        selectRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, selectID);
        selectValue = defSelectBox[i]["init"]["valuename"];
        selectName = defSelectBox[i]["init"]["htmlname"];

        detasetID = defSelectBox[i]["change"]["datasetid"];
        dataSetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSetInfo, detasetID);
        dataValue = defSelectBox[i]["change"]["valuename"];
        dataName = defSelectBox[i]["change"]["htmlname"];

        maxJ = selectRecord["record"][selectName]["value"].length;

        //ＩＤに対応する名称にデータを設定する
        for (let j = 0; j < maxJ; j++) {
          if (dataSetRecord["record"][dataName]["value"][0] == selectRecord["record"][selectName]["value"][j]) {
            dataSetRecord["record"][dataValue]["value"][0] = selectRecord["record"][selectValue]["value"][j];
            break;
          }
        }
      }
      $H.log("Model setFromNameToCodeOfSelectBox : end");
    }

  };

  /**
   * 画面遷移関数群
   * @mixin HtmlTransitionMixin
   */
  App.HtmlTransitionMixin = {
    /**
     * 画面遷移情報をクリアする
     * @memberof HtmlTransitionMixin
     */
    clearTransitionData: function () {
      sessionStorage.removeItem("画面遷移");
    },
    /**
     * カレント画面名を画面遷移情報に格納する
     * @param {string} htmlName - カレント画面名
     */
    setTransitionData: function (htmlName) {
      let newTransition = null;
      let htmlTransition = sessionStorage.getItem("画面遷移");
      if (htmlTransition) {
        newTransition = htmlTransition + ":" + htmlName;
      }
      else {
        newTransition = htmlName
      }
      sessionStorage.setItem("画面遷移", newTransition);
    },
    /**
     * 前画面名を取得する
     * @memberof HtmlTransitionMixin
     * @returns 前画面名
     */
    getBeforeHtmlName: function () {
      let htmlTransition = sessionStorage.getItem("画面遷移");
      let arrayTransition = htmlTransition.split(":");
      let max = arrayTransition.length - 1;
      let stringTransition = arrayTransition[max];
      arrayTransition = stringTransition.split("/");
      max = arrayTransition.length - 1;

      return arrayTransition[max];
    },
    /**
     * 前画面名をセッションストレージから削除する
     * @memberof HtmlTransitionMixin
     * @returns - 前画面名
     */
    getTransitionData: function () {
      let htmlTransition = sessionStorage.getItem("画面遷移");
      let arrayTransition = htmlTransition.split(":");
      let max = arrayTransition.length - 1;
      let htmlName = arrayTransition[max];
      let newTransition = "";
      let i;

      for (i = 0; i < max; i++) {
        if (i == 0) {
          newTransition = arrayTransition[i];
        }
        else {
          newTransition = newTransition + ":" + arrayTransition[i];
        }
      }
      sessionStorage.setItem("画面遷移", newTransition);
      return htmlName;
    },
    /**
     * 前画面に遷移する
     * @memberof HtmlTransitionMixin
     */
    previousTransition: function () {
      //★add start 20260724 選択ダイアログiframe分離方式：iframe内で動作中なら親のクローズ経路へ委譲する
      // 自画面がHaluの選択ダイアログiframe内で動いている場合はフルページPOST遷移を行わず、
      // 親documentのクローズハンドラ（遷移スタック復元・アンマウント・選択結果反映）に委譲する。
      // 同一オリジンのため window.frameElement / window.parent にアクセスできる。
      try {
        if (window.frameElement &&
          window.frameElement.getAttribute("data-halu-select-dialog") === "true" &&
          window.parent &&
          typeof window.parent.__haluDialogCloseHandler === "function") {
          window.parent.__haluDialogCloseHandler();
          return;
        }
      } catch (e) {
        //クロスオリジン等で frameElement にアクセスできない場合は従来動作へフォールバックする
        $H.log("previousTransition frameElement check error : " + e);
      }
      //★add end 20260724
      let htmlName = this.getTransitionData();
      this.postHtmlTransition(htmlName);
    },
    /**
     * 表示中の画面を消し、新しい画面を表示する
     * @memberof HtmlTransitionMixin
     * @param {string} htmlName - 表示中の画面名
     */
    postHtmlTransition: function (htmlName) {
      let form = document.createElement("form");
      form.action = $H.HtmlASGIURL;
      form.method = 'post';
      this.postTransition(form, htmlName);
    },
    /**
     * タブを追加し、新しい画面を表示する
     * @memberof HtmlTransitionMixin
     * @param {string} htmlName - 新しい画面名
     */
    postTabTransition: function (htmlName) {
      window.open("", htmlName);

      let form = document.createElement("form");
      form.action = $H.HtmlASGIURL;
      form.target = htmlName;
      form.method = 'post';
      this.postTransition(form, htmlName);
    },
    /**
     * ポップアップ画面を表示する
     * @memberof HtmlTransitionMixin
     * @param {string} htmlName - 画面名
     * @param {*} argWin - popup画面情報
     */
    postPopupTransition: function (htmlName, argWin) {
      //変数宣言
      let form;

      //ポップアップ画面表示
      window.open("", htmlName, argWin);

      form = document.createElement("form");
      form.action = $H.HtmlASGIURL;
      form.target = htmlName;
      form.method = 'post';
      this.postTransition(form, htmlName);
    },
    /**
     * 子画面表示
     * @memberof HtmlTransitionMixin
     * @param {object} form - 遷移先画面情報
     * @param {string} htmlName - 遷移先画面名
     */
    postTransition: function (form, htmlName) {
      //変数宣言
      let input, body;

      //フォーム追加
      input = document.createElement('input');
      input.setAttribute("type", "hidden");
      input.setAttribute("name", "gamen");
      input.setAttribute("value", htmlName);
      form.appendChild(input);

      //データ取得・子画面クローズ
      body = document.getElementsByTagName("body")[this.appspec.formno];
      body.appendChild(form);
      form.submit();
      body.removeChild(form);
    },
    /**
     * ★未使用
     * ASGIダウンロード画面表示
     * @memberof HtmlTransitionMixin
     * @param {object} argHash - 画面情報
     */
    postDownloadASGI: function (argHash) {
      //変数宣言
      let form, body, input, key;

      //フォーム追加
      form = document.createElement("form");
      form.action = $H.DownloadASGIURL;
      form.method = 'post';

      for (key in argHash) {
        //初期化
        input = null;

        //フォーム追加
        input = document.createElement('input');
        input.setAttribute("type", "hidden");
        input.setAttribute("name", key);
        input.setAttribute("value", argHash[key]);
        form.appendChild(input);
      }
      //データ取得・子画面クローズ
      body = document.getElementsByTagName("body")[0];
      body.appendChild(form);
      form.submit();
      body.removeChild(form);
    },
    /**
     * dataset.jsonのvalue値をクリアする
     * @memberof HtmlTransitionMixin
     * @param {object} dataset - dataset.json情報
     */
    clearDatasetJson: function (dataset) {
      $H.log("ModelMixin clearDatasetJson : start");
      //変数宣言
      let datasetRecords = dataset["records"];
      let maxSize = datasetRecords.length;

      for (let i = 0; i < maxSize; i++) {
        this.clearDatasetRecord(datasetRecords[i]);
      }
      $H.log("ModelMixin clearDatasetJson : end");
    },
    /**
     * datasetの指定レコードの値をクリアする
     * @memberof HtmlTransitionMixin
     * @param {object} datasetRecord - datasetのレコード情報
     */
    clearDatasetRecord: function (datasetRecord) {
      //変数宣言
      let multiline = null;
      let defaultline = null;
      let name = null;

      multiline = datasetRecord["multiline"];

      if (multiline == "yes") {
        defaultline = datasetRecord["defaultline"];
      }
      else {
        defaultline = 1;
      }

      for (name in datasetRecord["record"]) {
        for (let i = 0; i < defaultline; i++) {
          datasetRecord["record"][name]["value"][i] = "";
        }
      }

      $H.log("ViewMixin clearDataOfItemNameInRecord : end");
    },
    /**
     * dataset.json request.json response.jsonのvalue値をクリアする
     * @memberof HtmlTransitionMixin
     * @param {object} jsonData - jsonデータ情報
     */
    clearJsonRecords: function (jsonData) {
      $H.log("ModelMixin clearJsonRecords : start");

      //変数宣言
      let jsonRecords = jsonData["records"];
      let maxSize = jsonRecords.length;

      for (let i = 0; i < maxSize; i++) {
        this.clearJsonRecord(jsonRecords[i]);
      }

      $H.log("ModelMixin clearJsonRecords : end");
    },
    /**
     * jsonの指定レコードのvalue値をクリアする
     * @memberof HtmlTransitionMixin
     * @param {object} jsonRecord - jsonレコード情報
     */
    clearJsonRecord: function (jsonRecord) {
      //変数宣言
      let name = null;

      //JSONのレコードをクリアする
      for (name in jsonRecord["record"]) {
        jsonRecord["record"][name]["value"] = [""];
      }
    },
    /**
     * datasetからjsondata(request)をセットする
     * @memberof HtmlTransitionMixin 
     * @param {object} dataset - データセット情報
     * @param {request} request - リクエスト情報
     */
    setDatasetToJsonRecords: function (dataset, request) {
      $H.log("ModelMixin setDatasetToJsonRecords : start");
      //変数宣言
      let datasetRecords = null;
      let requestRecords = null;
      let datasetSize = null;
      let requestSize = null;
      let requestRecord = null;
      let datasetRecord = null;

      //JSONデータをクリア
      this.clearJsonRecords(request);

      //データ取得
      datasetRecords = dataset["records"];
      requestRecords = request["records"];
      datasetSize = datasetRecords.length;
      requestSize = requestRecords.length;
      for (let i = 0; i < requestSize; i++) {
        //変数初期化
        requestRecord = null;
        //データ取得
        requestRecord = requestRecords[i];

        for (let j = 0; j < datasetSize; j++) {
          //変数初期化
          datasetRecord = null;
          //データ取得
          datasetRecord = datasetRecords[j];

          //IDが一致したら、datasetからrequestをセットする
          if (requestRecord["id"] == datasetRecord["id"]) {
            this.setDatasetRecordToJsonRecord(datasetRecord, requestRecord);
            break;
          }
        }
      }

      $H.log("ModelMixin setDatasetToJsonRecords : end");
    },
    /**
     * datasetからrequestに値をセットする(レコード指定)
     * @memberof HtmlTransitionMixin 
     * @param {*} datasetRecord - データセット情報(レコード指定)
     * @param {*} requestRecord - リクエスト情報(レコード指定)
     */
    setDatasetRecordToJsonRecord: function (datasetRecord, requestRecord) {
      //変数宣言
      let name = null;

      for (name in requestRecord["record"]) {
        if (name in datasetRecord["record"]) {
          this.setDatasetValueToJsonValue(datasetRecord["record"][name]["value"], requestRecord["record"][name]["value"]);
        }
      }
    },
    /**
     * datasetからrequestに値をセットする(項目指定)
     * @memberof HtmlTransitionMixin 
     * @param {object} datasetValue - データセット情報(項目指定)
     * @param {object} requestValue - リクエスト情報(項目指定)
     */
    setDatasetValueToJsonValue: function (datasetValue, requestValue) {
      //変数宣言
      let maxSize = datasetValue.length;

      for (let i = 0; i < maxSize; i++) {
        requestValue[i] = datasetValue[i];
      }
    },
    /**
     * datasetの空行を除いた行をjsondataにコピーする
     * @memberof HtmlTransitionMixin
     * @param {object} dataset - データセット情報
     * @param {object} request - リクエスト情報
     */
    setDatasetToJsonRecordsNoEmptyLine: function (dataset, request) {
      $H.log("ModelMixin setDatasetToJsonRecordsNoEmptyLine : start");
      //JSONデータクリア
      this.clearJsonRecords(request);

      //変数宣言
      let datasetRecords = null;
      let requestRecords = null;
      let datasetSize = null;
      let requestSize = null;
      let requestRecord = null;
      let datasetRecord = null;
      //データ取得
      datasetRecords = dataset["records"];
      requestRecords = request["records"];
      datasetSize = datasetRecords.length;
      requestSize = requestRecords.length;

      for (let i = 0; i < requestSize; i++) {
        //変数初期化
        requestRecord = null;
        //データ取得
        requestRecord = requestRecords[i];
        for (let j = 0; j < datasetSize; j++) {
          //変数初期化
          datasetRecord = null;
          //データ取得
          datasetRecord = datasetRecords[j];
          if (requestRecord["id"] == datasetRecord["id"]) {
            this.setDatasetRecordToJsonRecordNoEmptyLine(datasetRecord, requestRecord);
            break;
          }
        }
      }
      $H.log("ModelMixin setDatasetToJsonRecordsNoEmptyLine : end");
    },
    /**
     *  datasetの空行を除いた行をjsondataにコピーする(レコード指定)
     * @memberof HtmlTransitionMixin
     * @param {object} datasetRecord - データセット情報(レコード指定)
     * @param {object} requestRecord - リクエスト情報(レコード指定)
     * @returns なし
     */
    setDatasetRecordToJsonRecordNoEmptyLine: function (datasetRecord, requestRecord) {
      //変数宣言
      let maxSize = 0;
      let name = null;
      let toNo = 0;
      let fromNo = 0;
      let emptySW = 0;

      // マルチラインでないとき
      if (datasetRecord["multiline"] != "yes") {
        this.setDatasetRecordToJsonRecord(datasetRecord, requestRecord);
        return;
      }
      // マルチライン処理
      maxSize = 0;
      for (name in datasetRecord["record"]) {
        if (maxSize < datasetRecord["record"][name]["value"].length) {
          maxSize = datasetRecord["record"][name]["value"].length;
        }
      }
      //全項目チェック
      toNo = 0;
      for (fromNo = 0; fromNo < maxSize; fromNo++) {
        //変数初期化
        emptySW = 0;
        name = null;

        //空項目チェック
        for (name in datasetRecord["record"]) {
          if (datasetRecord["record"][name]["value"][fromNo] != "") {
            emptySW = 1;
            break;
          }
        }

        // 全項目が空の時
        if (emptySW == 0) {
          continue;
        }

        //変数初期化
        name = null;
        //datasetの値をrequestへ設定
        for (name in requestRecord["record"]) {
          if (name in datasetRecord["record"]) {
            requestRecord["record"][name]["value"][toNo] = datasetRecord["record"][name]["value"][fromNo];
          }
        }
        toNo = toNo + 1;
      }
    },
    /**
     * datasetの空行を除いた行をjsondataにコピーする<br>
     * マルチラインの時は、削除行をjsondataに出力する
     * @memberof HtmlTransitionMixin
     * @param {object} dataset - データセット情報
     * @param {object} request - リクエスト情報
     */
    setDatasetToJsonRecordsInDeleteLine: function (dataset, request) {
      $H.log("ModelMixin setDatasetToJsonRecordsInDeleteLine : start");
      //変数宣言
      let datasetRecords = null;
      let requestRecords = null;
      let datasetSize = null;
      let requestSize = null;
      let requestRecord = null;
      let datasetRecord = null;

      //JSONレコードクリア
      this.clearJsonRecords(request);

      //データ取得
      datasetRecords = dataset["records"];
      requestRecords = request["records"];
      datasetSize = datasetRecords.length;
      requestSize = requestRecords.length;

      //リクエストデータ分ループ
      for (let i = 0; i < requestSize; i++) {
        //初期化
        requestRecord = null;
        //データ取得
        requestRecord = requestRecords[i];
        for (let j = 0; j < datasetSize; j++) {
          //初期化
          datasetRecord = null;
          //データ取得
          datasetRecord = datasetRecords[j];
          if (requestRecord["id"] == datasetRecord["id"]) {
            this.setDatasetRecordToJsonRecordInDeleteLine(datasetRecord, requestRecord);
            break;
          }
        }
      }

      $H.log("ModelMixin setDatasetToJsonRecordsInDeleteLine : end");
    },
    /**
     * datasetの空行を除いた行をjsondataにコピーする<br>
     * マルチラインの時は、削除行をjsondataに出力する(レコード指定)
     * @memberof HtmlTransitionMixin
     * @param {object} datasetRecord - データセット情報
     * @param {object} requestRecord - リクエスト情報
     * @returns なし
     */
    setDatasetRecordToJsonRecordInDeleteLine: function (datasetRecord, requestRecord) {
      //変数宣言
      let maxSize = 0;
      let toNo = 0;
      let name = null;
      let fromNo = 0;
      let emptySW = 0;

      // マルチラインでないとき
      if (datasetRecord["multiline"] != "yes") {
        this.setDatasetRecordToJsonRecord(datasetRecord, requestRecord);
        return;
      }

      // マルチライン処理
      maxSize = 0;
      for (name in datasetRecord["record"]) {
        if (maxSize < datasetRecord["record"][name]["value"].length) {
          maxSize = datasetRecord["record"][name]["value"].length;
        }
      }
      //空行かどうか判定
      toNo = 0;
      for (fromNo = 0; fromNo < maxSize; fromNo++) {
        //ループごとに変数初期化
        emptySW = 0;
        name = null;

        //レコードチェック
        for (name in datasetRecord["record"]) {

          //削除チェックボックスの列はチェックしない
          if (name == "削除") {
            continue;
          }
          //行追加ボタンの列はチェックしない
          if (name == "行追加") {
            continue;
          }

          //該当列のセルに値がある場合
          if (datasetRecord["record"][name]["value"][fromNo] != "") {
            emptySW = 1;
            break;
          }
        }

        // 全項目が空の時
        if (emptySW == 0) {
          continue;
        }
        //変数初期化
        name = null;
        //データセット
        for (name in requestRecord["record"]) {
          if (name in datasetRecord["record"]) {
            requestRecord["record"][name]["value"][toNo] = datasetRecord["record"][name]["value"][fromNo];
          }
        }
        //コピー先のindexを加算
        toNo = toNo + 1;
      }
    },
    /**
     * datasetの空行を除いた行をjsondataにコピーする<br>
     * マルチラインの時は、削除行をjsondataに出力しない
     * @memberof HtmlTransitionMixin
     * @param {object} dataset - データセット情報
     * @param {object} request - リクエスト情報
     */
    setDatasetToJsonRecordsNoDeleteLine: function (dataset, request) {
      $H.log("ModelMixin setDatasetToJsonRecordsNoDeleteLine : start");
      //変数宣言
      let datasetRecords = null;
      let requestRecords = null;;
      let datasetSize = 0;
      let requestSize = 0;
      let requestRecord = null;;
      let datasetRecord = null;;

      //JSONデータクリア
      this.clearJsonRecords(request);

      //引数からデータ取得
      datasetRecords = dataset["records"];
      requestRecords = request["records"];
      datasetSize = datasetRecords.length;
      requestSize = requestRecords.length;

      //リクエストデータ分ループ
      for (let i = 0; i < requestSize; i++) {
        //初期化
        requestRecord = null;
        //データ取得
        requestRecord = requestRecords[i];
        for (let j = 0; j < datasetSize; j++) {
          //初期化
          datasetRecord = null;
          //データ取得
          datasetRecord = datasetRecords[j];
          if (requestRecord["id"] == datasetRecord["id"]) {
            this.setDatasetRecordToJsonRecordNoDeleteLine(datasetRecord, requestRecord);
            break;
          }
        }
      }
      $H.log("ModelMixin setDatasetToJsonRecordsNoDeleteLine : end");
    },
    /**
     * datasetの空行を除いた行をjsondataにコピーする<br>
     * マルチラインの時は、削除行をjsondataに出力しない(レコード指定)
     * @memberof HtmlTransitionMixin
     * @param {object} datasetRecord - データセット情報
     * @param {object} requestRecord - リクエスト情報
     * @returns なし
     */
    setDatasetRecordToJsonRecordNoDeleteLine: function (datasetRecord, requestRecord) {
      //変数宣言
      let maxSize = 0;
      let toNo = 0;
      let name = null;
      let fromNo = 0;
      let emptySW = null;

      // マルチラインでないとき
      if (datasetRecord["multiline"] != "yes") {
        this.setDatasetRecordToJsonRecord(datasetRecord, requestRecord);
        return;
      }

      // マルチライン処理
      maxSize = 0;
      for (name in datasetRecord["record"]) {
        if (maxSize < datasetRecord["record"][name]["value"].length) {
          maxSize = datasetRecord["record"][name]["value"].length;
        }
      }

      //空行チェック
      toNo = 0;
      for (fromNo = 0; fromNo < maxSize; fromNo++) {
        //変数初期化
        emptySW = 0;
        name = null;

        for (name in datasetRecord["record"]) {
          //行追加ボタンの列は処理しない
          if (name == "行追加") {
            continue;
          }
          //削除チェックボックスの列は処理しない
          if (name == "削除") {
            continue;
          }

          //値があるセルのみ処理
          if (datasetRecord["record"][name]["value"][fromNo] != "") {
            emptySW = 1;
            break;
          }
        }

        // 全項目が空の時
        if (emptySW == 0) {
          continue;
        }

        //変数初期化
        emptySW = 0;
        name = null;

        //削除列のみ処理する
        for (name in datasetRecord["record"]) {
          if (name != "削除") {
            continue;
          }

          if (datasetRecord["record"]["削除"]["value"][fromNo] == "1") {
            emptySW = 1;
            break;
          }
          if (datasetRecord["record"]["削除"]["value"][fromNo] == "9") {
            emptySW = 1;
            break;
          }
        }

        //変数初期化
        name = null;
        //削除列がない場合
        if (emptySW == 0) {
          //データをセット
          for (name in requestRecord["record"]) {
            if (name in datasetRecord["record"]) {
              requestRecord["record"][name]["value"][toNo] = datasetRecord["record"][name]["value"][fromNo];
            }
          }
          //コピー先のindexを加算
          toNo = toNo + 1;
        }
      }
    },
    /**
     * jsondata(response)からdataset.jsonをセットする
     * @memberof HtmlTransitionMixin
     * @param {object} response - レスポンスデータ
     * @param {object} dataset - データセット情報
     * @param {object} pubsub - pubsubクラス
     * @param {boolean} nonclear - 未使用項目
     */
    setJsonRecordsToDataset: function (response, dataset, pubsub, nonclear) {
      $H.log("ModelMixin setJsonRecordsToDataset : start");
      //変数宣言
      let responseRecords = null;
      let datasetRecords = null;
      let responseSize = null;
      let datasetSize = null;

      let responseRecord = null;
      let datasetRecord = null;

      //データ取得
      responseRecords = response["records"];
      datasetRecords = dataset["records"];
      responseSize = responseRecords.length;
      datasetSize = datasetRecords.length;

      for (let i = 0; i < responseSize; i++) {
        //初期化
        responseRecord = null;
        //データ取得
        responseRecord = responseRecords[i];
        for (let j = 0; j < datasetSize; j++) {
          //初期化
          datasetRecord = null;
          //データ取得
          datasetRecord = datasetRecords[j];
          //responseからdataset.jsonをセットする
          if (responseRecord["id"] == datasetRecord["id"]) {
            this.setJsonRecordToDatasetRecord(responseRecord, datasetRecord, pubsub, nonclear);
            break;
          }
        }
      }
      $H.log("ModelMixin setJsonRecordsToDataset : end");
    },
    /**
     * jsondata(response)からdataset.jsonをセットする(レコード指定)
     * @memberof HtmlTransitionMixin
     * @param {*} responseRecord - レスポンス情報
     * @param {*} datasetRecord - データセット情報
     * @param {*} pubsub - pubsubクラス情報
     * @param {*} nonclear - 未使用項目
     * @returns なし
     */
    setJsonRecordToDatasetRecord: function (responseRecord, datasetRecord, pubsub, nonclear) {
      //変数宣言
      let multiline = null;
      let defaultline = null;
      let deleteSW = 0;
      let name = null;

      //データ取得
      multiline = datasetRecord["multiline"];
      defaultline = datasetRecord["defaultline"];

      if (arguments.length == 3) {
        if (multiline == "yes") {
          this.clearJsonRecord(datasetRecord);
        }
      }

      deleteSW = 0;
      for (name in responseRecord["record"]) {
        if (name == "削除") {
          deleteSW = 1;
        }

        if (name in datasetRecord["record"]) {
          // 2026-06-12 後方互換: derive で halu-ds-id 要素特定に使うため record id を引き渡す（末尾オプション引数）
          this.setJsonValueToDatasetValue(responseRecord["record"][name]["value"], datasetRecord["record"][name]["value"], multiline, defaultline, name, pubsub, datasetRecord["id"]);
        }
      }

      if (deleteSW == 1) {
        return;
      }
      if (multiline != "yes") {
        return;
      }

      // 削除クリア
      name = null;
      for (name in datasetRecord["record"]) {
        if (name != "削除") {
          continue;
        }
        for (let i = 0; i < defaultline; i++) {
          datasetRecord["record"]["削除"]["value"][i] = "";
        }
        break;
      }
    },
    /**
     * jsondata(response)からdataset.jsonをセットする(項目指定)
     * @memberof HtmlTransitionMixin
     * @param {object} responseValue - レスポンス情報
     * @param {object} datasetValue - データセット情報 
     * @param {string} multiline - multiline有無設定
     * @param {object} defaultline - 1ページあたりの表示行数
     * @param {string} name - 項目名
     * @param {object} pubsub - pubsubクラス
     * @param {string} [id] - レコードid（halu-ds-id 要素特定用。省略可、未指定でも従来動作）
     * @returns なし
     */
    setJsonValueToDatasetValue: function (responseValue, datasetValue, multiline, defaultline, name, pubsub, id) {
      // 変数宣言
      let responseSize = null;

      if (multiline == "no") {
        datasetValue[0] = responseValue[0];
        // 2026-06-12 後方互換: halu-ds-id 要素特定用に record id を引き渡す（末尾オプション引数、未指定でも従来動作）
        this.deriveJsonValueToDatasetValue(pubsub, name, datasetValue[0], 0, id);
        return;
      }

      responseSize = responseValue.length;
      datasetValue.splice(0, datasetValue.length);

      for (let i = 0; i < responseSize; i++) {
        datasetValue[i] = responseValue[i];
        // 2026-06-12 後方互換: halu-ds-id 要素特定用に record id を引き渡す（末尾オプション引数、未指定でも従来動作）
        this.deriveJsonValueToDatasetValue(pubsub, name, datasetValue[i], i, id);
      }

      if (defaultline > responseSize) {
        for (let j = responseSize; j < defaultline; j++) {
          datasetValue[j] = "";
        }
      }

    },
    /**
     * 受け取った情報をもとにdatasetの指定位置に値をセットする
     * @memberof HtmlTransitionMixin
     * @param {object} pubsub - pubsucクラス
     * @param {string} name - 項目名
     * @param {object} value - 値
     * @param {number} index - datasetのindex
     * @param {string} [id] - レコードid（halu-ds-id 要素特定用。省略可、未指定でも従来動作）
     * @returns なし
     */
    deriveJsonValueToDatasetValue: function (pubsub, name, value, index, id) {
      //変数宣言
      let objArray = null;
      let eventname = null;

      if (pubsub === undefined) {
        return;
      }

      // 2026-06-12 後方互換: record id があれば halu-ds 属性セレクタで要素特定→0件なら halu-ds-field→それも0件なら従来の class 検索
      if (id !== undefined && id !== null) {
        objArray = $("[halu-ds-id='" + id + "'][halu-ds-field='" + name + "']");
      }
      if (objArray === null || objArray.length === 0) {
        objArray = $("[halu-ds-field='" + name + "']");
      }
      if (objArray.length === 0) {
        objArray = $("." + name);
      }
      eventname = "derive" + name;

      if (pubsub.isEvent(eventname)) {
        target = objArray[index];
        arg = { target: target, value: value, row: index, name: name };
        pubsub.publish(eventname, arg);
      }

    },
    /**
     * detailRecordの指定行に空行を挿入する
     * @memberof HtmlTransitionMixin
     * @param {object} detailRecord - 明細レコード
     * @param {number} index - detailRecordのindex
     * @returns 空行挿入後のdetailRecord
     */
    insertRowOfDetailRecord: function (detailRecord, index) {
      $H.log("ModelMixin insertRowOfDetailRecord : start");
      //変数宣言
      let name = null;

      //detailRecordの指定行に空行を挿入する
      for (name in detailRecord["record"]) {
        detailRecord["record"][name]["value"].splice(index, 0, "")
      }

      detailRecord["defaultline"] = String(parseInt(detailRecord["defaultline"]) + 1);

      $H.log("ModelMixin insertRowOfDetailRecord : end");
      return detailRecord;
    },
    /**
     * detailRecordの指定行を削除する
     * @memberof HtmlTransitionMixin
     * @param {object} detailRecord - 明細レコード
     * @param {number} index - detailRecordのindex
     * @returns 行削除後のdetailRecord
     */
    deleteRowOfDetailRecord: function (detailRecord, index) {
      $H.log("ModelMixin deleteRowOfDetailRecord : start");
      //変数宣言
      let name = null;

      for (name in detailRecord["record"]) {
        detailRecord["record"][name]["value"].splice(index, 1)
      }

      detailRecord["defaultline"] = String(parseInt(detailRecord["defaultline"]) - 1);

      $H.log("ModelMixin deleteRowOfDetailRecord : end");
      return detailRecord;
    },
    /**
     * detailRecordの指定行を連想配列に取り出す
     * @memberof HtmlTransitionMixin
     * @param {object} detailRecord - 明細レコード
     * @param {number} index - detailRecordのindex
     * @returns 連想配列
     */
    fromDetailRecordtoHash: function (detailRecord, index) {
      $H.log("ModelMixin fromDetailRecordtoHash : start");
      //変数宣言
      let name = null;
      let detailHash = {};

      for (name in detailRecord["record"]) {
        detailHash[name] = detailRecord["record"][name]["value"][index];
      }

      $H.log("ModelMixin fromDetailRecordtoHash : end");
      return detailHash;
    },
    /**
     * 連想配列をdetailRecordの指定行に挿入する
     * @memberof HtmlTransitionMixin
     * @param {object} detailHash - 連想配列
     * @param {object} detailRecord - 明細レコード
     * @param {number} index - detailRecordのindex
     * @returns 挿入後のdetailRecord
     */
    insertHashtoDetailRecord: function (detailHash, detailRecord, index) {
      $H.log("ModelMixin insertHashtoDetailRecord : start");
      //変数宣言
      let name = null;

      for (name in detailHash["record"]) {
        detailRecord["record"][name]["value"].splice(index, 0, detailHash[name])
      }

      detailRecord["defaultline"] = String(parseInt(detailRecord["defaultline"]) + 1);

      $H.log("ModelMixin insertHashtoDetailRecord : end");
      return detailRecord;
    },
    /**
     * 連想配列をdetailRecordの指定行に置換する
     * @memberof HtmlTransitionMixin
     * @param {object} detailHash - 連想配列
     * @param {object} detailRecord - 明細レコード
     * @param {number} index - detailRecordのindex
     * @returns 置換後のdetailRecord
     */
    replaceHashtoDetailRecord: function (detailHash, detailRecord, index) {
      $H.log("ModelMixin replaceHashtoDetailRecord : start");
      //変数宣言
      let name = null;

      for (name in detailHash["record"]) {
        detailRecord["record"][name]["value"][index] = detailHash[name];
      }

      $H.log("ModelMixin replaceHashtoDetailRecord : end");
      return detailRecord;
    },
    // -------------------------------------------------------
    // 画面遷移・選択画面 処理
    // -------------------------------------------------------
    /**
     * 各種キー定義情報をセッションストレージに保存する
     * @memberof HtmlTransitionMixin
     */
    saveSessionStorage: function () {
      $H.log("Model saveSessionStorage : start");

      this.saveSessionStorageOfKeyInfo(this.appspec.sessionStorageHeaderKey);
      this.saveSessionStorageOfDetail();
      this.saveSessionStorageOfKeyInfo(this.appspec.sessionStorageFooterKey);

      $H.log("Model saveSessionStorage : end");
    },
    /**
     * 画面ヘッダ キー定義情報をセッションストレージに保存する
     * @memberof HtmlTransitionMixin
     * @param {object} keyInfo - キー定義情報
     */
    saveSessionStorageOfKeyInfo: function (keyInfo) {
      //変数宣言
      let dataSet = null;
      let maxSizeKeyInfo = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = null;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // データセットを設定する
      dataSet = this.dataset.getData();

      // 画面ヘッダ キー定義情報をセッションストレージに保存する
      maxSizeKeyInfo = keyInfo.length;
      for (let i = 0; i < maxSizeKeyInfo; i++) {
        //変数初期化
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
          //データ取得
          itemName = keyInfo[i]["dataname"][j];
          //セッションストレージに保存
          sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][0]);
        }
      }
    },
    /**
     *  画面明細 キー定義情報をセッションストレージに保存する
     * @memberof HtmlTransitionMixin
     */
    saveSessionStorageOfDetail: function () {
      //変数宣言
      let dataSet = null;
      let clickRow = null;
      let maxSizeDatail = 0;

      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = 0;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // データセットを設定する
      dataSet = this.dataset.getData();

      // 画面明細 キー定義情報をセッションストレージに保存する
      clickRow = sessionStorage.loadItem("クリック行");
      maxSizeDatail = this.appspec.sessionStorageDetailKey.length;
      for (let i = 0; i < maxSizeDatail; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = this.appspec.sessionStorageDetailKey[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.sessionStorageDetailKey[i]["dataname"].length;

        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;

          //データ取得
          itemName = this.appspec.sessionStorageDetailKey[i]["dataname"][j];
          //セッションストレージに保存する
          if (clickRow === undefined) {
            sessionStorage.saveItem(itemName, "");
            continue;
          }
          sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][clickRow]);
        }
      }
    },
    /**
     * セッションストレージのキー定義情報をクリアする
     * @memberof HtmlTransitionMixin
     */
    clearSessionStorage: function () {
      $H.log("Model clearSessionStorage : start");

      this.clearSessionStorageOfKeyInfo(this.appspec.sessionStorageHeaderKey);
      this.clearSessionStorageOfKeyInfo(this.appspec.sessionStorageDetailKey);
      this.clearSessionStorageOfKeyInfo(this.appspec.sessionStorageFooterKey);

      $H.log("Model clearSessionStorage : end");
    },
    /**
     * 指定されたキー定義情報をセッションストレージから削除する
     * @memberof HtmlTransitionMixin
     * @param {object} keyInfo - キー定義情報
     */
    clearSessionStorageOfKeyInfo: function (keyInfo) {
      //変数宣言
      let maxSizeKeyInfo = 0;
      let maxSizeDataName = 0;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // セッションストレージの画面ヘッダ キー定義情報をクリアする
      maxSizeKeyInfo = keyInfo.length;
      for (let i = 0; i < maxSizeKeyInfo; i++) {
        //変数初期化
        maxSizeDataName = 0;
        //データ取得
        maxSizeDataName = keyInfo[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //変数初期化
          itemName = null;
          //データ取得
          itemName = keyInfo[i]["dataname"][j];
          //セッションストレージに保存
          if (this.appspec.isExists(keyInfo[i]["initvalue"])) {
            sessionStorage.saveItem(itemName, keyInfo[i]["initvalue"][j]);
          }
          else {
            sessionStorage.saveItem(itemName, "");
          }
        }
      }
    },
    /**
     * ★未使用
     * キー定義情報の番号を指定して、セッションストレージをクリアする
     * @memberof HtmlTransitionMixin
     * @param {object} keyInfo - キー定義情報
     * @param {*} clearNumber - クリア対象番号
     */
    clearSessionStorageOfKeyInfoOfNumber: function (keyInfo, clearNumber) {
      //変数宣言
      let maxSizeKeyInfo = 0;
      let maxSizeDataName = 0;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // セッションストレージの画面ヘッダ キー定義情報をクリアする
      maxSizeKeyInfo = keyInfo.length;
      for (let i = 0; i < maxSizeKeyInfo; i++) {
        //初期化
        maxSizeDataName = 0;
        //該当キー情報がない場合次データへ
        if (clearNumber != keyInfo[i]["datasetid"].slice(-1)) {
          continue;
        }
        //データ取得
        maxSizeDataName = keyInfo[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;

          //データ取得
          itemName = keyInfo[i]["dataname"][j];
          //initValueがある場合、セッションストレージへ保存
          if (this.appspec.isExists(keyInfo[i]["initvalue"])) {
            sessionStorage.saveItem(itemName, keyInfo[i]["initvalue"][j]);
          }
          else {
            //ない場合、空データを保存
            sessionStorage.saveItem(itemName, "");
          }
        }
      }
    },
    /**
     * セッションストレージのキー定義情報をデータセットに設定する
     * @memberof HtmlTransitionMixin
     * @returns 更新後のデータセット
     */
    setFromSessionStorageToDataset: function () {
      $H.log("Model setFromSessionStorageToDataset : start");
      //変数宣言
      let dataSet = null;

      // データセットを設定する
      dataSet = this.dataset.getData();

      this.setFromSessionStorageToDatasetOfKeyInfo(dataSet, this.appspec.sessionStorageHeaderKey);
      this.setFromSessionStorageToDatasetOfKeyInfo(dataSet, this.appspec.sessionStorageFooterKey);

      $H.log("Model setFromSessionStorageToDataset : end");
      return dataSet;
    },
    /**
     * 指定されたキー定義情報をセッションストレージからデータセットにセットする
     * @memberof HtmlTransitionMixin
     * @param {object} dataSet - データセット
     * @param {object} keyInfo - キー定義情報
     * @returns データセット
     */
    setFromSessionStorageToDatasetOfKeyInfo: function (dataSet, keyInfo) {
      // 変数宣言
      let maxSizeKeyInfo = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = 0;
      let itemName = null;
      let value = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // セッションストレージの画面ヘッダ キー定義情報をデータセットに設定する
      maxSizeKeyInfo = keyInfo.length;
      for (let i = 0; i < maxSizeKeyInfo; i++) {
        //変数初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = null;

        //データ取得
        datasetID = keyInfo[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = keyInfo[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //変数初期化
          itemName = null;
          value = null;
          //データ取得
          itemName = keyInfo[i]["dataname"][j];
          value = sessionStorage.loadItem(itemName);
          if (value === undefined) {
            continue;
          }
          //セッションストレージの値をdatasetに保存
          datasetRecord[itemName]["value"][0] = value;
        }
      }
      return dataSet;
    },
    // /**
    //  * キー定義情報の番号を指定して、セッションストレージからデータセットへ値をセットする
    //  * @memberof HtmlTransitionMixin
    //  * @param {object} dataSet - データセット情報
    //  * @param {object} keyInfo - キー情報
    //  * @param {number} clearNumber - 番号
    //  * @returns データセット情報
    //  */
    // setFromSessionStorageToDatasetOfKeyInfoOfNumber: function (dataSet, keyInfo, clearNumber) {
    //   //変数宣言
    //   let maxSizeKeyInfo = 0;
    //   let datasetID = null;
    //   let datasetRecord = null;
    //   let maxSizeDataName = 0;
    //   let itemName = null;
    //   let value = null;

    //   // セッションストレージに識別名を保存する
    //   sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

    //   // セッションストレージの画面ヘッダ キー定義情報をデータセットに設定する
    //   maxSizeKeyInfo = keyInfo.length;
    //   for (let i = 0; i < maxSizeKeyInfo; i++) {
    //     //変数初期化
    //     datasetID = null;
    //     datasetRecord = null;
    //     maxSizeDataName = 0;

    //     if (clearNumber != keyInfo[i]["datasetid"].slice(-1)) {
    //       continue;
    //     }
    //     //データ取得
    //     datasetID = keyInfo[i]["datasetid"];
    //     datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
    //     maxSizeDataName = keyInfo[i]["dataname"].length;
    //     for (let j = 0; j < maxSizeDataName; j++) {
    //       //初期化
    //       itemName = null;
    //       value = null;

    //       //データ取得
    //       itemName = keyInfo[i]["dataname"][j];
    //       value = sessionStorage.loadItem(itemName);
    //       if (value === undefined) {
    //         continue;
    //       }

    //       datasetRecord[itemName]["value"][0] = value;
    //     }
    //   }
    //   return dataSet;
    // },
    /**
     * 画面遷移処理：次画面の処理モードを設定する
     * @memberof HtmlTransitionMixin
     * @param {string} guiName - 次画面名
     * @param {string} mode - 処理モード
     */
    saveSessionStorageOfNextMode: function (guiName, mode) {
      $H.log("Model saveSessionStorageOfNextMode : start");

      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("処理モード", mode);

      sessionStorage.setIdName(this.appspec.sysname + "." + guiName);
      sessionStorage.saveItem("処理モード", mode);

      $H.log("Model saveSessionStorageOfNextMode : end");
    },
    /**
     * 画面遷移処理：次画面への引き継ぎデータをチェックする
     * @memberof HtmlTransitionMixin
     * @returns チェック結果
     */
    checkNextStorageData: function () {
      //変数宣言
      let arg = null;
      let clickRow = 0;
      let dataSet = null;
      let maxSizeStrage = 0;
      let maxSizeDataName = 0;
      let datasetID = null;
      let datasetRecord = null;
      let itemName = null;
      let titleName = null;

      arg = { status: "OK" };

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      clickRow = sessionStorage.loadItem("クリック行");

      // データセットを設定する
      dataSet = this.dataset.getData();

      // 次画面への引き継ぎデータをチェックする
      maxSizeStrage = this.appspec.nextStorageData.length;
      //データ(行)分ループ
      for (let i = 0; i < maxSizeStrage; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = this.appspec.nextStorageData[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.nextStorageData[i]["dataname"].length;

        //データ(列)分ループ
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;
          titleName = null;

          //データ取得
          itemName = this.appspec.nextStorageData[i]["dataname"][j];
          titleName = this.appspec.nextStorageData[i]["titlename"][j];

          // ヘッダ・フッター項目 チェック
          if (datasetID != "detail") {
            if (this.appspec.nextStorageData[i]["validation"][j] == "required") {
              if (datasetRecord[itemName]["value"][0] == "") {
                arg = {};
                arg["title"] = "入力（選択）エラー";
                arg["status"] = "ERROR";
                arg["message"] = titleName + "は必須項目です。入力（選択）して下さい。";
                return arg;
              }
            }
            continue;
          }

          // 明細項目 チェック
          if (this.appspec.nextStorageData[i]["validation"][j] == "required") {
            if (clickRow === undefined) {
              arg = {};
              arg["title"] = "行選択エラー";
              arg["status"] = "ERROR";
              arg["message"] = titleName + "は必須項目です。行を選択して下さい。";
              return arg;
            }
            if (datasetRecord[itemName]["value"][clickRow] == "") {
              arg = {};
              arg["title"] = "行選択エラー";
              arg["status"] = "ERROR";
              arg["message"] = titleName + "は必須項目です。行を選択して下さい。";
              return arg;
            }
          }
        }
      }
      return arg;
    },
    /**
     * 画面遷移処理：次画面への引き継ぎデータを設定する
     * @memberof HtmlTransitionMixin
     * @param {string} guiName - 次画面名
     */
    setNextStorageData: function (guiName) {
      //変数宣言
      let clickRow = 0;
      let dataSet = null;
      let maxSizeStrage = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = 0;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      clickRow = sessionStorage.loadItem("クリック行");

      // データセットを設定する
      dataSet = this.dataset.getData();

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + guiName);

      // 次画面への引き継ぎデータを次画面セッションストレージに保存する
      maxSizeStrage = this.appspec.nextStorageData.length;
      for (let i = 0; i < maxSizeStrage; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = this.appspec.nextStorageData[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.nextStorageData[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;
          //データ取得
          itemName = this.appspec.nextStorageData[i]["dataname"][j];
          //セッションストレージに保存
          if (datasetID != "detail") {
            sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][0]);
            continue;
          }
          if (clickRow === undefined) {
            sessionStorage.saveItem(itemName, "");
          }
          else {
            sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][clickRow]);
          }
        }
      }
    },
    /**
     * 画面遷移処理：次画面への引き継ぎデータを設定する（アクティブタブ）
     * @memberof HtmlTransitionMixin
     * @param {string} guiName - 次画面名
     * @param {number} activetabnumber - アクティブタブの番号
     */
    setNextStorageTabData: function (guiName, activetabnumber) {
      //初期化
      let clickRow = 0;
      let dataSet = null;
      let maxSizeStrage = 0;
      let maxSizeDataName = 0;
      let datasetID = null;
      let datasetRecord = null;
      let itemName = null;

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      clickRow = sessionStorage.loadItem("クリック行_" + activetabnumber);

      // データセットを設定する
      dataSet = this.dataset.getData();

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + guiName);

      // 次画面への引き継ぎデータを次画面セッションストレージに保存する
      maxSizeStrage = this.appspec.nextStorageData.length;
      for (let i = 0; i < maxSizeStrage; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = this.appspec.nextStorageData[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.nextStorageData[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;
          //データ取得
          itemName = this.appspec.nextStorageData[i]["dataname"][j];
          //セッションストレージに保存
          if (datasetID != ("detail_" + activetabnumber)) {
            sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][0]);
            continue;
          }
          if (clickRow === undefined) {
            sessionStorage.saveItem(itemName, "");
          }
          else {
            sessionStorage.saveItem(itemName, datasetRecord[itemName]["value"][clickRow]);
          }
        }
      }
    },
    /**
     * 画面遷移処理：前画面からの引き継ぎデータをセータセットに設定する
     * @memberof HtmlTransitionMixin
     * @returns 処理結果
     */
    setFromBeforeStorageDataToDataset: function () {
      //変数宣言
      let status = null;
      let dataSet = null;
      let maxSizeStrage = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = null;
      let itemName = null;

      //戻り値初期値
      status = "OK";

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      // データセットを設定する
      dataSet = this.dataset.getData();

      // 前画面からの引き継ぎデータをセータセットに設定する
      maxSizeStrage = this.appspec.beforeStorageData.length;
      for (let i = 0; i < maxSizeStrage; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName - 0;

        //データ取得
        datasetID = this.appspec.beforeStorageData[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.beforeStorageData[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;

          //データ取得
          itemName = this.appspec.beforeStorageData[i]["dataname"][j];
          // 引き継ぎデータなし
          if (sessionStorage.loadItem(itemName) === undefined) {
            continue;
          }
          // 引き継ぎデータあり
          status = "OK";
          datasetRecord[itemName]["value"][0] = sessionStorage.loadItem(itemName);
        }
      }
      return status;
    },
    /**
     * 画面遷移処理：画面遷移後、自画面に戻って来た時、<br>
     * 画面ヘッダ キー定義が設定されている時 ：遷移直前の状態にdataSetを設定する<br>
     * 画面ヘッダ キー定義が設定されていない時：メニューから遷移した。何もしない
     * @memberof HtmlTransitionMixin
     * @returns 処理結果
     */
    setMyUIStorageData: function () {
      //変数宣言
      let arg = null;
      let dataSet = null;
      let maxSizeStrage = 0;
      let datasetID = null;
      let datasetRecord = null;
      let maxSizeDataName = null;
      let itemName = null;
      let value = null;

      //戻り値初期化
      arg = {};
      arg["status"] = "NO";

      // セッションストレージに識別名を保存する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // データセットを設定する
      dataSet = this.dataset.getData();

      // セッションストレージの画面ヘッダ キー定義情報をデータセットに設定する
      maxSizeStrage = this.appspec.sessionStorageHeaderKey.length;
      for (let i = 0; i < maxSizeStrage; i++) {
        //初期化
        datasetID = null;
        datasetRecord = null;
        maxSizeDataName = 0;

        //データ取得
        datasetID = this.appspec.sessionStorageHeaderKey[i]["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        maxSizeDataName = this.appspec.sessionStorageHeaderKey[i]["dataname"].length;
        for (let j = 0; j < maxSizeDataName; j++) {
          //初期化
          itemName = null;
          value = null;

          //データ取得
          itemName = this.appspec.sessionStorageHeaderKey[i]["dataname"][j];
          if (datasetID != "detail") {
            value = sessionStorage.loadItem(itemName);
            if (value === undefined) {
              return arg;
            }

            datasetRecord[itemName]["value"][0] = value;
            arg["status"] = "OK";
            continue;
          }
        }
      }
      return arg;
    },
    // ★add start 20250714
    /**
     * 選択画面ダイアログ呼び出し元処理：表示処理(Dialog)
     * @memberof HtmlTransitionMixin
     * @param {object} selectStorageRequestData - 選択リクエストデータ
     * @param {object} selectStorageResponseData - 選択レスポンスデータ
     * @param {number} index - クリック行のindex
     */
    on選択画面ダイアログ表示: function (selectStorageRequestData, selectStorageResponseData, index, closeHandler) {
      $H.log("Model on選択画面ダイアログ表示 : start");
      //変数宣言
      let dataSet = null;
      let maxSize = 0;
      let datasetID = null;
      let datasetRecord = null;
      let name = null;
      let value = null;
      let currName = null;
      let nextArray = null;
      let nextName = null;
      let argDialog = {};

      //ダイアログ情報を取得する
      argDialog["dialogid"] = selectStorageRequestData["dialogid"];
      argDialog["dialogstyle"] = selectStorageRequestData["dialogstyle"];

      //データ取得
      dataSet = this.dataset.getData();

      // 表示前にデータセットを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("選択画面名", selectStorageRequestData["requestname"]);
      sessionStorage.saveItem("クリック行退避", index);
      sessionStorage.saveObject("データセット退避", dataSet);

      // ダイアログ画面のリクエストデータをセットする
      maxSize = selectStorageRequestData["dataname"].length;
      if (maxSize > 0) {
        datasetID = selectStorageRequestData["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        for (let i = 0; i < maxSize; i++) {
          //初期化
          name = null;
          value = null;
          //データ取得
          name = selectStorageRequestData["dataname"][i];
          if (datasetRecord[name] == undefined) {
            continue;
          }
          value = datasetRecord[name]["value"][0];
          selectStorageRequestData["value"][i] = value;
        }
      }

      // ダイアログ画面のセッションストレージにリクエストデータを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + selectStorageRequestData["requestname"]);
      sessionStorage.saveObject("リクエストデータ", selectStorageRequestData);

      // ダイアログ画面のセッションストレージにレスポンスデータを退避する
      sessionStorage.saveObject("レスポンスデータ", selectStorageResponseData);

      // ダイアログ画面を表示する
      currName = this.appspec.urlInfo[0]["app"];
      nextArray = currName.split("/");
      nextArray[3] = selectStorageRequestData["requestname"];
      nextName = nextArray.join("/");

      this.setTransitionData(currName.slice(0, -1));

      //★add start 20260526
      //ダイアログ表示前に親画面のキーイベントを解除する
      this.pubsub.publish("keydownUnbind");
      //★add end 20260526

      //★add start 20260724 選択ダイアログのiframe分離方式（dialogtype:"iframe"）
      // dialogtype未指定は従来方式（同一documentへHTML移植）を完全温存する
      if (selectStorageRequestData["dialogtype"] === "iframe") {
        //iframe分離方式：ダイアログを別documentのiframe内にHalu画面として表示する
        this.showSelectDialogIframe(nextName.slice(0, -1), argDialog["dialogid"], argDialog["dialogstyle"]);
        $H.log("Model on選択画面ダイアログ表示 : end (iframe)");
        return;
      }
      //★add end 20260724

      //選択ダイアログ(Svelte)をマウントする
      window.mountSelectDialog(argDialog["dialogid"], argDialog["dialogstyle"]);
      //選択ダイアログのHTMLを挿入してモーダル表示する
      this.showSelectDialog(nextName.slice(0, -1), argDialog["dialogid"], $H.HtmlASGIURL, closeHandler);

      $H.log("Model on選択画面ダイアログ表示 : end");
    },
    //★add end 20250714
    //★add start 20260724 選択ダイアログiframe分離方式
    /**
     * 選択ダイアログをiframe内にHalu画面として表示する（iframe分離方式）<br>
     * ダイアログのDOMは親documentと分離されるため、halu-ds属性のdocument全域検索と衝突しない。<br>
     * 従来のshowSelectDialog(fetch＋DOM移植方式)は変更せず、本メソッドは並存する。
     * @memberof HtmlTransitionMixin
     * @param {string} url - ダイアログ画面のgamen(screen path)
     * @param {string} dialogId - ダイアログのDOM ID
     * @param {string} dialogStyle - ダイアログのstyle情報
     */
    showSelectDialogIframe: function (url, dialogId, dialogStyle) {
      $H.log("Model showSelectDialogIframe : start");
      //変数宣言
      let self = this;
      let iframeName = "haluSelectDialogFrame";

      //クローズ経路を配線する（ダイアログiframe内のpreviousTransitionから window.parent 経由で呼ばれる）
      window.__haluDialogCloseHandler = function () {
        $H.log("Model __haluDialogCloseHandler : start");
        //多重呼び出しを防止するため即時に無効化する
        delete window.__haluDialogCloseHandler;

        //呼び出し元(iframe)の実行スタックを巻き戻してからDOM破棄・反映を行う
        //（呼び出し中のiframeを同期的に破棄しないため setTimeout で遅延する）
        setTimeout(function () {
          //①遷移スタックを1段戻す（親画面名をpop。親画面は再ロードしない）
          try {
            self.getTransitionData();
          } catch (e) {
            $H.log("__haluDialogCloseHandler getTransitionData error : " + e);
          }

          //②iframe入りダイアログシェル(Svelte)をアンマウントする
          if (typeof window.unmountSelectDialog === "function") {
            window.unmountSelectDialog();
          }

          //③親画面のキーバインドを復元する
          //   従来方式は親画面がフルページ再ロードされ初期処理でキーが再設定されたが、
          //   iframe方式は親画面が再ロードされないため、keydownUnbindで解除したキーをここで再設定する。
          if (self.appspec.enterTabPFKey) {
            self.pubsub.publish("keydownBind", self.appspec.enterTabPFKey);
          }

          //④選択結果を親画面へ反映する
          //   フルページ再ロード時に on初期処理 の選択画面戻り分岐が担っていた
          //   「on選択画面戻り→データセット反映→view反映→後処理関数呼出」を controller 側で実行する。
          self.pubsub.publish("selectDialogReturn");

          $H.log("Model __haluDialogCloseHandler : end");
        }, 0);
      };

      //iframe入りダイアログシェルをマウントする
      window.mountSelectDialog(dialogId, dialogStyle, "iframe");

      //SvelteのDOM生成後にiframeへPOST送信する（activateSelectDialogと同様に setTimeout で遅延する）
      setTimeout(function () {
        //ダイアログ要素を取得する(取得できなければ処理終了)
        let dialogEl = document.getElementById(dialogId);
        if (!dialogEl) {
          $H.log("Model showSelectDialogIframe : dialog element not found");
          return;
        }
        //モーダル表示する
        dialogEl.classList.add("show");
        dialogEl.style.display = "block";
        dialogEl.removeAttribute("aria-hidden");

        //★add start 20260727 ダイアログ表示直後からEsc/F1等のキーが届くよう、読み込み完了時にiframeへフォーカスを移す
        //（キーイベントはフォーカスのあるdocumentに配送される。親側キーはkeydownUnbindで解除済みのため、
        //  フォーカスを移さないとダイアログをクリックするまでキー操作が効かない）
        let iframeEl = dialogEl.querySelector("iframe[name='" + iframeName + "']");
        if (iframeEl) {
          iframeEl.addEventListener("load", function () {
            try {
              iframeEl.contentWindow.focus();
            } catch (e) {
              $H.log("Model showSelectDialogIframe : iframe focus error : " + e);
            }
          });
        }
        //★add end 20260727

        //親documentに動的formを生成し、iframeをtargetにダイアログ画面をPOST表示する
        let form = document.createElement("form");
        form.method = "post";
        form.action = $H.HtmlASGIURL;
        form.target = iframeName;

        //表示する画面名(gamen)
        let inputGamen = document.createElement("input");
        inputGamen.setAttribute("type", "hidden");
        inputGamen.setAttribute("name", "gamen");
        inputGamen.setAttribute("value", url);
        form.appendChild(inputGamen);

        //モーダルフラグ（従来のfetch方式と同一パラメータ）
        let inputModal = document.createElement("input");
        inputModal.setAttribute("type", "hidden");
        inputModal.setAttribute("name", "modal");
        inputModal.setAttribute("value", "true");
        form.appendChild(inputModal);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }, 0);

      $H.log("Model showSelectDialogIframe : end");
    },
    //★add end 20260724
    //★add start 20260518
    /**
     * 選択ダイアログ画面のHTMLを取得してモーダル表示する
     * @memberof HtmlTransitionMixin
     * @param {string} url - 画面URL
     * @param {string} dialogId - ダイアログのDOM ID
     * @param {string} fetchUrl - HTML取得先URL
     * @param {function} closeHandler - クローズ時コールバック
     */
    showSelectDialog: function (url, dialogId, fetchUrl, closeHandler) {
      $H.log("Model showSelectDialog : start");
      //変数宣言
      let gamen = null;
      let self = this;

      //URLをエンコードする
      gamen = encodeURIComponent(url);

      //サーバーからダイアログ表示する画面のHTMLを取得する
      fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `gamen=${gamen}&modal=true`,
      })
        .then(function (res) { return res.text(); })
        .then(function (content) {
          // SvelteのDOM更新後にスクリプトを実行するためsetTimeoutで遅延する
          setTimeout(function () {
            self.activateSelectDialog(content, dialogId, closeHandler);
          }, 0);
        })
        .catch(function (error) {
          $H.log("Model showSelectDialog : fetch error : " + error);
          self.closeDialog(dialogId);
          self.pubsub.publish("alertDialog", {
            title: "通信エラー",
            status: "ERROR",
            message: error
          });
        });
      $H.log("Model showSelectDialog : end");
    },
    /**
     * 選択ダイアログのHTMLを挿入してスクリプトを順次実行しモーダルを表示する
     * @memberof HtmlTransitionMixin
     * @param {string} html - サーバーから取得したHTML文字列
     * @param {string} dialogId - ダイアログのDOM ID
     * @param {function} closeHandler - クローズ時コールバック
     */
    activateSelectDialog: function (html, dialogId, closeHandler) {
      $H.log("Model activateSelectDialog : start");
      //変数宣言
      let dialogEl = null;
      let temp = null;
      let scripts = null;

      //ダイアログ要素を取得する(取得できなければ処理終了)
      dialogEl = document.getElementById(dialogId);
      if (!dialogEl) return;

      //★mod start 20260616 ダイアログcloseHandlerをグローバルに保存する（自己クリーン型・遷移スタック復元付き）
      let self = this;
      window.__haluDialogCloseHandler = function () {
        delete window.__haluDialogCloseHandler;
        try {
          self.getTransitionData();
        } catch (e) {
          $H.log("activateSelectDialog: getTransitionData error: " + e);
        }
        if (typeof window.unmountSelectDialog === "function") {
          window.unmountSelectDialog();
        }
        if (typeof closeHandler === "function") {
          closeHandler();
        }
      };
      //★mod end 20260616

      //ダイアログの中身をクリアする
      dialogEl.innerHTML = "";

      //★mod start 20260703 DOMParserでhead/bodyを確実に分離してbody挿入→script実行の順を保証する
      // temp.innerHTML=html(フルページ)方式ではブラウザ実装によりhead要素がdialogElに移動された時点で
      // head内scriptが即時実行され、body(#dialogTable等)未挿入のままon初期処理が走るタイミング問題が発生する
      let parsedDoc = (new DOMParser()).parseFromString(html, "text/html");

      //bodyのscriptタグ以外の要素をダイアログに追加する（head内コンテンツは除外し、scriptより先にDOMを確定する）
      Array.from(parsedDoc.body.children).forEach(function (el) {
        if (el.tagName !== "SCRIPT") dialogEl.appendChild(el);
      });

      //scriptタグを取得する（headのscript→bodyのscriptの順で結合）
      scripts = Array.from(parsedDoc.head.querySelectorAll("script")).concat(
        Array.from(parsedDoc.body.querySelectorAll("script"))
      );
      //★mod end 20260703

      //scriptを順次実行する（外部スクリプトはonloadを待ち、インラインは即時実行）
      (async function () {
        for (const script of scripts) {
          const newScript = document.createElement("script");
          //★mod start 20260527 type="module"属性を引き継ぐ
          if (script.type) newScript.type = script.type;
          //★mod end 20260527
          if (script.src) {
            //外部スクリプト：ロード完了を待ってから次を実行する
            newScript.src = script.src;
            newScript.async = false;
            await new Promise(function (resolve) {
              newScript.onload = resolve;
              dialogEl.appendChild(newScript);
            });
          } else {
            //インラインスクリプト：そのまま追加して実行する
            newScript.textContent = script.textContent;
            dialogEl.appendChild(newScript);
          }
        }
        //モーダル表示する
        dialogEl.classList.add("show");
        dialogEl.style.display = "block";
        dialogEl.removeAttribute("aria-hidden");
      })();
      $H.log("Model activateSelectDialog : end");
    },
    /**
     * ダイアログ画面を閉じる(HTMLから削除する)
     * @memberof HtmlTransitionMixin
     * @param {string} dialogID - ダイアログのDOM ID
     */
    closeDialog: function (dialogID) {
      $H.log("model closeDialog : start");
      let dialog = null;
      let loadingElements = null;
      let lastElement = null;
      // id="loading" を持つ要素をすべて取得（ダイアログ表示により複数存在してしまうため)
      //★mod start 20260619 getElementById→querySelectorAllに修正（NodeListで複数取得）
      loadingElements = document.querySelectorAll('#loading');
      //★mod end 20260619
      // 複数ある場合、末尾（最後）の要素を削除
      if (loadingElements.length > 1) {
        lastElement = loadingElements[loadingElements.length - 1];
        lastElement.remove();
      }

      dialog = document.getElementById(dialogID);
      //存在すれば閉じる
      if (dialog) {
        if (dialog.tagName === "DIALOG") {
          // dialog要素の場合
          dialog.close();
        } else if (dialog.classList.contains("modal")) {
          // div.modal の場合（Bootstrap風）
          // aria-hidden設定前にダイアログ内フォーカスを外す（aria-hidden警告対策）
          if (dialog.contains(document.activeElement)) {
            document.activeElement.blur();
          }
          dialog.classList.remove("show");
          dialog.style.display = "none";
          dialog.setAttribute("aria-hidden", "true");

          // Svelteコンポーネントのアンマウント（backdropsより先に実行しないとnodes_start辿りが失敗する）
          if (typeof window.unmountSelectDialog === "function") {
            window.unmountSelectDialog();
          }
          // 背景（.modal-backdrop）も削除（非Svelteダイアログまたはアンマウント失敗時の保険）
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) backdrop.remove();
        }
      }

      $H.log("model closeDialog : end");
    },
    //★add end 20260518
    /**
     * 選択画面呼び出し元処理：遷移処理
     * @memberof HtmlTransitionMixin
     * @param {object} selectStorageRequestData - 選択リクエストデータ
     * @param {object} selectStorageResponseData - 選択レスポンスデータ
     * @param {number} index - クリック行のindex
     */
    on選択画面遷移: function (selectStorageRequestData, selectStorageResponseData, index) {
      $H.log("Model on選択画面遷移 : start");
      //変数宣言
      let dataSet = null;
      let maxSize = 0;
      let datasetID = null;
      let datasetRecord = null;
      let name = null;
      let value = null;
      let currName = null;
      let nextArray = null;
      let nextName = null;

      //データ取得
      dataSet = this.dataset.getData();

      // 遷移前にデータセットを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      sessionStorage.saveItem("選択画面名", selectStorageRequestData["requestname"]);
      sessionStorage.saveItem("クリック行退避", index);
      sessionStorage.saveObject("データセット退避", dataSet);

      // 次画面のリクエストデータをセットする
      maxSize = selectStorageRequestData["dataname"].length;
      if (maxSize > 0) {
        datasetID = selectStorageRequestData["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
        for (let i = 0; i < maxSize; i++) {
          //初期化
          name = null;
          value = null;
          //データ取得
          name = selectStorageRequestData["dataname"][i];
          value = datasetRecord[name]["value"][0];
          selectStorageRequestData["value"][i] = value;
        }
      }

      // 次画面のセッションストレージにリクエストデータを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + selectStorageRequestData["requestname"]);
      sessionStorage.saveObject("リクエストデータ", selectStorageRequestData);

      // 次画面のセッションストレージにレスポンスデータを退避する
      sessionStorage.saveObject("レスポンスデータ", selectStorageResponseData);

      // 次画面へ遷移する
      currName = this.appspec.urlInfo[0]["app"];
      nextArray = currName.split("/");
      nextArray[3] = selectStorageRequestData["requestname"];
      nextName = nextArray.join("/");

      this.setTransitionData(currName.slice(0, -1));
      this.postHtmlTransition(nextName.slice(0, -1));

      $H.log("Model on選択画面遷移 : end");
    },
    /**
     * 選択画面呼び出し元処理：戻り処理
     * @memberof HtmlTransitionMixin
     * @returns 処理結果
     */
    on選択画面戻り: function () {
      $H.log("Model on選択画面戻り : start");
      //変数宣言
      let arg = {};
      let selectName = null;
      let clickRow = 0;
      let dataSet = null;
      let selectStorageResponseData = null;
      let maxSize = 0;
      let datasetid = null;
      let datasetRecord = null;
      let dataName = null;

      //戻り値初期化
      arg["status"] = "NO";
      arg["selected"] = "";

      // 遷移前にデータセットを復元する
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      selectName = sessionStorage.loadItem("選択画面名");
      if (selectName === undefined) {
        sessionStorage.deleteItem("選択画面名");

        $H.log("Model on選択画面戻り : end");
        return arg;
      }

      clickRow = sessionStorage.loadItem("クリック行退避");
      if (clickRow === undefined) {
        clickRow = 0;
      }

      dataSet = sessionStorage.loadObject("データセット退避");
      selectStorageResponseData = sessionStorage.loadObject("レスポンスデータ");
      sessionStorage.deleteItem("選択画面名");

      // 選択画面で選択データなし
      arg["status"] = "OK";
      arg["responseData"] = selectStorageResponseData;
      arg["clickRow"] = clickRow;
      arg["selected"] = "CANCEL";

      if (selectStorageResponseData["status"] == "CANCEL") {
        this.dataset.setData(dataSet);

        $H.log("Model on選択画面戻り : end");
        return arg;
      }
      // 選択画面で選択データあり
      arg["selected"] = "OK";
      maxSize = selectStorageResponseData["dataname"].length;
      if (maxSize > 0) {
        datasetid = selectStorageResponseData["datasetid"];
        datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetid)["record"];
        for (let i = 0; i < maxSize; i++) {
          //初期化
          dataName = null;

          //データ取得
          dataName = selectStorageResponseData["dataname"][i];
          datasetRecord[dataName]["value"][clickRow] = selectStorageResponseData["value"][i];
        }
      }
      this.dataset.setData(dataSet);

      $H.log("Model on選択画面戻り : end");
      return arg;
    },
    /**
     * 選択画面(呼び出される側)処理：選択画面のリクエストデータを設定
     * @memberof HtmlTransitionMixin
     */
    setリクエストデータOf選択画面: function () {
      $H.log("Model setリクエストデータOf選択画面 : start");
      //変数宣言
      let selectStorageRequestData = null;
      let selectStorageResponseData = null;
      let dataSet = null;
      let maxSize = 0;
      let datasetID = null;
      let datasetRecord = null;
      let name = null;

      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);

      // 前画面からのリクエスト情報を設定する
      selectStorageRequestData = sessionStorage.loadObject("リクエストデータ");
      this.appspec.selectStorageRequestData[0] = selectStorageRequestData

      // 前画面からのレスポンス情報を設定する
      selectStorageResponseData = sessionStorage.loadObject("レスポンスデータ");
      this.appspec.selectStorageResponseData[0] = selectStorageResponseData

      dataSet = this.dataset.getData();

      // 前画面のリクエストデータをデータセットにセットする
      if (this.appspec.isExists(selectStorageRequestData)) {
        maxSize = selectStorageRequestData["dataname"].length;
        if (maxSize > 0) {
          datasetID = selectStorageRequestData["datasetid"];
          datasetRecord = this.appspec.getJSONChunkByIdAtRecords(dataSet, datasetID)["record"];
          for (let i = 0; i < maxSize; i++) {
            //初期化
            name = null;
            //データ取得
            name = selectStorageRequestData["dataname"][i];
            datasetRecord[name]["value"][0] = selectStorageRequestData["value"][i];
          }
        }
      }

      $H.log("Model setリクエストデータOf選択画面 : end");
    },

    /**
     * 選択画面(呼び出される側)処理：選択画面のレスポンスデータを設定（選択あり）
     * @memberof HtmlTransitionMixin
     */
    set選択レスポンスデータOf選択画面: function () {
      $H.log("Model set選択レスポンスデータOf選択画面 : start");
      //変数宣言
      let selectStorageResponseData = null;
      let maxSizeData = null;
      let maxSizeDetailKey = null;
      let dataName = null;

      //データ取得
      sessionStorage.setIdName(this.appspec.sysname + "." + this.appspec.name);
      selectStorageResponseData = this.appspec.selectStorageResponseData[0];

      maxSizeData = selectStorageResponseData["dataname"].length;
      maxSizeDetailKey = this.appspec.sessionStorageDetailKey[0]["dataname"].length;
      for (let i = 0; i < maxSizeData; i++) {
        //初期化
        dataName = null;

        //データ取得
        selectStorageResponseData["value"][i] = "";
        dataName = selectStorageResponseData["dataname"][i]

        for (let j = 0; j < maxSizeDetailKey; j++) {
          if (dataName == this.appspec.sessionStorageDetailKey[0]["dataname"][j]) {
            selectStorageResponseData["value"][i] = sessionStorage.loadItem(dataName);
            break;
          }
        }
      }

      // ステータスを設定する
      selectStorageResponseData["status"] = "OK";

      // 前画面のセッションストレージにレスポンスデータを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + selectStorageResponseData["responsename"]);
      sessionStorage.saveObject("レスポンスデータ", selectStorageResponseData);


      $H.log("Model set選択レスポンスデータOf選択画面 : end");
    },
    /**
     * 選択画面(呼び出される側)処理：選択画面のレスポンスデータを設定（選択なし）
     * @memberof HtmlTransitionMixin
     */
    set戻るレスポンスデータOf選択画面: function () {
      $H.log("Model set戻るレスポンスデータOf選択画面 : start");
      //変数宣言
      let selectStorageResponseData = null;
      let maxSize = 0;

      //データ取得
      selectStorageResponseData = this.appspec.selectStorageResponseData[0];

      if (this.appspec.isExists(selectStorageResponseData)) {
        maxSize = selectStorageResponseData["dataname"].length;
        for (let i = 0; i < maxSize; i++) {
          selectStorageResponseData["value"][i] = "";
        }
      }

      // ステータスを設定する
      selectStorageResponseData["status"] = "CANCEL";

      // 前画面のセッションストレージにレスポンスデータを退避する
      sessionStorage.setIdName(this.appspec.sysname + "." + selectStorageResponseData["responsename"]);
      sessionStorage.saveObject("レスポンスデータ", selectStorageResponseData);

      $H.log("Model set戻るレスポンスデータOf選択画面 : end");
    },
  };
}(jQuery, Halu));
