// e-Stat API 3.0 汎用クライアント
// JSON形式のレスポンスはCORSに対応しているため、ブラウザから直接呼び出せる。
// 仕様: https://www.e-stat.go.jp/api/api-info/api-spec
(function () {
  const BASE = "https://api.e-stat.go.jp/rest/3.0/app/json";

  async function callApi(path, params) {
    const qs = new URLSearchParams({ appId: ESTAT_APP_ID, ...params });
    const res = await fetch(`${BASE}/${path}?${qs.toString()}`);
    if (!res.ok) throw new Error(`e-Stat API HTTPエラー: ${res.status}`);
    return res.json();
  }

  function getStatsData(params) {
    return callApi("getStatsData", params);
  }

  // getStatsDataの応答からDATA_INF.VALUEを常に配列として取り出す
  // （該当件数が1件のときAPIがオブジェクト単体で返すことがあるため）
  function extractValues(json) {
    const result = json?.GET_STATS_DATA?.RESULT;
    if (!result || result.STATUS !== 0) {
      throw new Error(`e-Stat APIエラー: ${result ? result.ERROR_MSG : "不正な応答"}`);
    }
    const values = json.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
    return Array.isArray(values) ? values : [values];
  }

  // CLASS_OBJ（分類メタ情報）から、指定した分類軸(id)のコード→名称マップを作る
  function classCodeMap(json, classId) {
    const classObj = json.GET_STATS_DATA.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ;
    const target = classObj.find((c) => c["@id"] === classId);
    if (!target) return {};
    const list = Array.isArray(target.CLASS) ? target.CLASS : [target.CLASS];
    const map = {};
    list.forEach((c) => {
      map[c["@code"]] = c["@name"];
    });
    return map;
  }

  // 分類名から西暦年を取り出す（例: "2024年度" "2024年10月1日現在" -> "2024"）
  function yearFromName(name) {
    const m = /([0-9]{4})年/.exec(name || "");
    return m ? m[1] : null;
  }

  window.EstatClient = { getStatsData, extractValues, classCodeMap, yearFromName };
})();
