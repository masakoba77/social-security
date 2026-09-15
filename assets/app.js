// メインアプリケーション
(async function() {
  // データを読み込み
  const data = await loadData();

  // 統計値を表示
  const latestTrend = data.trends[data.trends.length - 1];
  const latestAging = data.agingRate[data.agingRate.length - 1];

  document.getElementById('benefit-value').textContent = latestTrend.benefit.toFixed(1);
  document.getElementById('ratio-value').textContent = latestTrend.ratio.toFixed(1);
  document.getElementById('aging-value').textContent = latestAging.rate.toFixed(1);

  // グラフを描画
  renderChart('trend-chart', data.trends, 'line', 'year', 'benefit');
  renderChart('breakdown-chart', data.breakdown, 'bar', 'category', 'amount');
  renderChart('budget-chart', data.budget, 'bar', 'category', 'amount');
  renderChart('details-chart', data.benefitDetails, 'bar', 'category', 'amount');
  renderChart('category-chart', data.benefitTrends, 'line', 'year', 'pension');
  renderChart('aging-chart', data.agingRate, 'line', 'year', 'rate');

  // テーブルを表示
  renderTrendTable(data.trends);
  renderBreakdownTable(data.breakdown);
  renderBudgetTable(data.budget);
  renderDetailsTable(data.benefitDetails);
  renderCategoryTable(data.benefitTrends);
  renderAgingTable(data.agingRate);
})();

// テーブル描画関数
function renderTrendTable(trends) {
  const tbody = document.getElementById('trend-tbody');
  tbody.innerHTML = '';

  // 直近6年のデータのみを表示
  const recentTrends = trends.slice(-6);
  const startIndex = trends.length - 6;

  recentTrends.forEach((d, i) => {
    const row = document.createElement('tr');
    const actualIndex = startIndex + i;
    const prevYear = actualIndex > 0 ? trends[actualIndex - 1].benefit : d.benefit;
    const change = ((d.benefit - prevYear) / prevYear * 100).toFixed(1);

    row.innerHTML = `
      <td>${d.year}年度</td>
      <td>${d.benefit.toFixed(1)}</td>
      <td>${change}%</td>
    `;
    tbody.appendChild(row);
  });
}

function renderBreakdownTable(breakdown) {
  const tbody = document.getElementById('breakdown-tbody');
  tbody.innerHTML = '';

  breakdown.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.category}</td>
      <td>${d.amount.toFixed(1)}</td>
      <td>${d.ratio.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderBudgetTable(budget) {
  const tbody = document.getElementById('budget-tbody');
  tbody.innerHTML = '';

  budget.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.category}</td>
      <td>${d.amount.toFixed(1)}</td>
      <td>${d.ratio.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderDetailsTable(details) {
  const tbody = document.getElementById('details-tbody');
  tbody.innerHTML = '';

  details.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.category}</td>
      <td>${d.subcategory}</td>
      <td>${d.amount.toFixed(1)}</td>
      <td>${d.ratio.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderCategoryTable(trends) {
  const tbody = document.getElementById('category-tbody');
  tbody.innerHTML = '';

  trends.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.year}年度</td>
      <td>${d.pension.toFixed(1)}</td>
      <td>${d.medical.toFixed(1)}</td>
      <td>${d.care.toFixed(1)}</td>
      <td>${d.welfare.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderAgingTable(aging) {
  const tbody = document.getElementById('aging-tbody');
  tbody.innerHTML = '';

  // 直近5年のデータのみを表示
  const recentAging = aging.slice(-5);

  recentAging.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.year}年</td>
      <td>${d.rate.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}
