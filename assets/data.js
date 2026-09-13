// 静的フォールバックデータ。
// assets/live-data.js によるe-Stat APIからのライブ取得に失敗した場合に使用する。
// 数値は2026年9月にe-Stat APIで取得・検証済み（社会保障費用統計・人口推計）。
// 単位は特記なき限り億円。
const DATA = {
  // 社会保障給付費の推移（実績ベース）
  // 出典: 国立社会保障・人口問題研究所（IPSS）「社会保障費用統計」（e-Stat統計表ID: 0004050708）
  benefitTrend: [
    { label: "1970", oku: 35239, note: "制度拡充前" },
    { label: "1980", oku: 249290, note: "+607%" },
    { label: "1990", oku: 474238, note: "+90%" },
    { label: "2000", oku: 784075, note: "+65%" },
    { label: "2010", oku: 1053660, note: "+34%" },
    { label: "2020", oku: 1322206, note: "+26%（コロナ禍）" },
    { label: "2024", oku: 1383019, note: "+5%" },
  ],

  // 65歳以上人口が総人口に占める割合（高齢化率）の推移
  // 出典: 総務省統計局「人口推計」（2020年以前は長期時系列の参考値、2021年以降はe-Stat統計表ID: 0003448226）
  agingRate: [
    { label: "1970", pct: 7.1, note: "「高齢化社会」入り" },
    { label: "1990", pct: 12.1, note: "" },
    { label: "2000", pct: 17.4, note: "「超高齢社会」に近づく" },
    { label: "2010", pct: 23.0, note: "" },
    { label: "2020", pct: 28.6, note: "" },
    { label: "2024", pct: 29.3, note: "世界最高水準" },
  ],

  // 令和8年度 一般会計歳出 主要経費別内訳
  // 出典: 財務省「日本の財政関係資料」（予算書ベースのためe-Stat対象外・手動更新）
  budgetBreakdown: [
    { label: "社会保障関係費", oku: 390559, pct: 31.9, highlight: true },
    { label: "国債費", oku: 313000, pct: 25.6, highlight: false },
    { label: "地方交付税交付金等", oku: 208778, pct: 17.1, highlight: false },
    { label: "文教・科学振興費等その他", oku: 159663, pct: 13.1, highlight: false },
    { label: "防衛関係費", oku: 89843, pct: 7.3, highlight: false },
    { label: "公共事業関係費", oku: 61078, pct: 5.0, highlight: false },
  ],

  // 社会保障給付費の内訳（2024年度、138.3兆円ベース）
  // 出典: IPSS「社会保障費用統計」（e-Stat統計表ID: 0004050708）
  costBreakdown: [
    { label: "年金", detail: "老齢年金・遺族年金・障害年金等", oku: 578528, pct: 41.8 },
    { label: "医療", detail: "医療保険給付・後期高齢者医療等", oku: 448055, pct: 32.4 },
    { label: "福祉その他", detail: "介護・子ども・生活保護・雇用対策等", oku: 356436, pct: 25.8 },
  ],

  totalBudget: 1223000, // 令和8年度一般会計歳出総額（億円）
  benefitTotalLatest: 1383019, // 社会保障給付費（億円）
  benefitTotalLatestYear: "2024", // 上記の年度
  nationalIncomeRatioLatest: 30.60, // 社会保障給付費の対国民所得比（%、benefitTotalLatestYearと同年度）
};
