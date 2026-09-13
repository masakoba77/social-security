// e-Stat APIから最新データを取得し、assets/data.js のDATAと同じ形に整形する。
// 取得に失敗した場合（appId未設定・通信エラー・API側の障害等）は、
// フォールバックとして静的なDATAをそのまま使う。
(function () {
  // 社会保障費用統計「社会保障給付費の部門別推移」（厚生労働省・IPSS、e-Stat統計表）
  // 1964年度以降の実績を1つの表に収録。年度が進むと表IDが変わる（令和6年度社会保障費用統計＝直近年度分）。
  const BENEFIT_STATS_DATA_ID = "0004050708";

  // 人口推計「年齢（3区分）別人口の割合」（総務省統計局、e-Stat統計表、令和2年国勢調査基準）
  // 直近の確定値のみを収録。国勢調査の基準改定でIDが変わることがある。
  const AGING_STATS_DATA_ID = "0003448226";

  const TREND_SAMPLE_YEARS = ["1970", "1980", "1990", "2000", "2010", "2020"];

  const COST_DETAIL = {
    年金: "老齢年金・遺族年金・障害年金等",
    医療: "医療保険給付・後期高齢者医療等",
    福祉その他: "介護・子ども・生活保護・雇用対策等",
  };

  function pctChange(prev, cur) {
    if (prev == null) return "";
    const rate = Math.round(((cur - prev) / prev) * 1000) / 10;
    return `${rate >= 0 ? "+" : ""}${rate}%`;
  }

  async function fetchBenefitLive() {
    const json = await EstatClient.getStatsData({ statsDataId: BENEFIT_STATS_DATA_ID });
    const values = EstatClient.extractValues(json);
    const timeNames = EstatClient.classCodeMap(json, "time");

    const withYear = (v) => ({ ...v, year: EstatClient.yearFromName(timeNames[v["@time"]]) });

    const totalRows = values
      .filter((v) => v["@tab"] === "901" && v["@cat01"] === "11")
      .map(withYear)
      .filter((v) => v.year)
      .sort((a, b) => a.year.localeCompare(b.year));
    if (!totalRows.length) throw new Error("社会保障給付費の総額データが取得できませんでした");

    const latest = totalRows[totalRows.length - 1];
    const byYear = (y) => totalRows.find((v) => v.year === y);

    let prevOku = null;
    const benefitTrend = [...TREND_SAMPLE_YEARS, latest.year]
      .map((y) => byYear(y))
      .filter(Boolean)
      .map((row) => {
        const oku = Number(row["$"]);
        const note = pctChange(prevOku, oku);
        prevOku = oku;
        return { label: row.year, oku, note };
      });

    const catNameByCode = { "12": "医療", "14": "年金", "15": "福祉その他" };
    const findLatest = (tab, cat01) =>
      values.find((v) => v["@tab"] === tab && v["@cat01"] === cat01 && v["@time"] === latest["@time"]);

    const costBreakdown = Object.keys(catNameByCode)
      .map((code) => {
        const label = catNameByCode[code];
        const amountRow = findLatest("901", code);
        const pctRow = findLatest("920", code);
        if (!amountRow || !pctRow) return null;
        return {
          label,
          detail: COST_DETAIL[label],
          oku: Number(amountRow["$"]),
          pct: Number(pctRow["$"]),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.oku - a.oku);

    const niRow = findLatest("940", "11");

    return {
      benefitTrend,
      costBreakdown,
      benefitTotalLatest: Number(latest["$"]),
      benefitTotalLatestYear: latest.year,
      nationalIncomeRatioLatest: niRow ? Number(niRow["$"]) : null,
    };
  }

  async function fetchAgingLive() {
    const json = await EstatClient.getStatsData({
      statsDataId: AGING_STATS_DATA_ID,
      cdArea: "00000", // 全国
      cdCat01: "000", // 男女計
      cdCat02: "003", // 65歳以上
      cdCat03: "001", // 総人口
    });
    const values = EstatClient.extractValues(json);
    const timeNames = EstatClient.classCodeMap(json, "time");

    const rows = values
      .map((v) => ({ year: EstatClient.yearFromName(timeNames[v["@time"]]), pct: Number(v["$"]) }))
      .filter((v) => v.year)
      .sort((a, b) => a.year.localeCompare(b.year));
    if (!rows.length) throw new Error("高齢化率のデータが取得できませんでした");

    // 2020年以前は基準改定で長期系列を1本のe-Stat表から取得できないため、
    // 静的な参考値（DATA.agingRate）を土台にし、直近の確定値だけをライブ値に差し替える。
    const liveYears = new Set(rows.map((r) => r.year));
    const backbone = DATA.agingRate.filter((d) => !liveYears.has(d.label) && Number(d.label) < 2021);
    const latestNote = "世界最高水準";
    const liveRows = rows.map((r, i) => ({
      label: r.year,
      pct: r.pct,
      note: i === rows.length - 1 ? latestNote : "",
    }));

    return { agingRate: [...backbone, ...liveRows] };
  }

  // 各セクションを個別に取得し、失敗したものだけフォールバックにする。
  async function load() {
    const sections = { benefit: "fallback", aging: "fallback" };
    let merged = {
      benefitTrend: DATA.benefitTrend,
      costBreakdown: DATA.costBreakdown,
      benefitTotalLatest: DATA.benefitTotalLatest,
      benefitTotalLatestYear: DATA.benefitTotalLatestYear,
      nationalIncomeRatioLatest: DATA.nationalIncomeRatioLatest,
      agingRate: DATA.agingRate,
      budgetBreakdown: DATA.budgetBreakdown,
      totalBudget: DATA.totalBudget,
    };

    if (typeof ESTAT_APP_ID === "string" && ESTAT_APP_ID) {
      try {
        const benefit = await fetchBenefitLive();
        merged = { ...merged, ...benefit };
        sections.benefit = "live";
      } catch (e) {
        console.warn("社会保障給付費のライブ取得に失敗、保存済みデータを使用します。", e);
      }
      try {
        const aging = await fetchAgingLive();
        merged = { ...merged, ...aging };
        sections.aging = "live";
      } catch (e) {
        console.warn("高齢化率のライブ取得に失敗、保存済みデータを使用します。", e);
      }
    }

    return { data: merged, sections };
  }

  window.LiveData = { load };
})();
