// 社会保障費と国の予算に関する統計データ
const FALLBACK_DATA = {
  trends: [
    { year: 2010, benefit: 105.6, ratio: 22.4 },
    { year: 2011, benefit: 106.6, ratio: 22.3 },
    { year: 2012, benefit: 108.8, ratio: 22.5 },
    { year: 2013, benefit: 111.3, ratio: 22.8 },
    { year: 2014, benefit: 114.3, ratio: 23.2 },
    { year: 2015, benefit: 117.0, ratio: 23.5 },
    { year: 2016, benefit: 120.7, ratio: 24.0 },
    { year: 2017, benefit: 123.4, ratio: 24.3 },
    { year: 2018, benefit: 125.5, ratio: 24.5 },
    { year: 2019, benefit: 127.9, ratio: 24.8 },
    { year: 2020, benefit: 131.9, ratio: 26.0 },
    { year: 2021, benefit: 134.2, ratio: 26.3 },
    { year: 2022, benefit: 136.1, ratio: 26.8 },
    { year: 2023, benefit: 137.5, ratio: 27.2 },
    { year: 2024, benefit: 138.3, ratio: 27.5 }
  ],

  breakdown: [
    { category: "年金", amount: 59.6, ratio: 43.1 },
    { category: "医療", amount: 41.3, ratio: 29.8 },
    { category: "介護", amount: 15.8, ratio: 11.4 },
    { category: "福祉・その他", amount: 21.6, ratio: 15.6 }
  ],

  budget: [
    { category: "社会保障関係費", amount: 39.1, ratio: 31.9 },
    { category: "国債費", amount: 26.9, ratio: 22.0 },
    { category: "地方交付税等", amount: 20.0, ratio: 16.3 },
    { category: "防衛関係費", amount: 7.9, ratio: 6.5 },
    { category: "その他", amount: 28.4, ratio: 23.2 }
  ],

  agingRate: [
    { year: 1970, rate: 7.1 },
    { year: 1980, rate: 9.1 },
    { year: 1990, rate: 12.1 },
    { year: 2000, rate: 17.4 },
    { year: 2010, rate: 23.1 },
    { year: 2015, rate: 26.7 },
    { year: 2020, rate: 28.8 },
    { year: 2024, rate: 29.3 }
  ]
};

// ローカルストレージからキャッシュデータを取得
function getCachedData() {
  try {
    const cached = localStorage.getItem('socialSecurityData');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.data;
      }
    }
  } catch (e) {
    console.warn('キャッシュの読み込みに失敗:', e);
  }
  return null;
}

// キャッシュデータを保存
function setCachedData(data) {
  try {
    localStorage.setItem('socialSecurityData', JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  } catch (e) {
    console.warn('キャッシュの保存に失敗:', e);
  }
}

// e-Stat APIからデータを取得（実装予定）
async function fetchFromEStat() {
  // 実装予定: e-Stat APIから動的にデータを取得
  // 現在はフォールバックデータを使用
  return FALLBACK_DATA;
}

// データを取得（キャッシュ優先）
async function loadData() {
  const cached = getCachedData();
  if (cached) {
    return cached;
  }

  try {
    const data = await fetchFromEStat();
    setCachedData(data);
    return data;
  } catch (e) {
    console.warn('データの取得に失敗、フォールバックデータを使用:', e);
    return FALLBACK_DATA;
  }
}
