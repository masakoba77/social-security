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
  renderChart('aging-chart', data.agingRate, 'line', 'year', 'rate');

  // テーブルを表示
  renderTrendTable(data.trends);
  renderBreakdownTable(data.breakdown);
  renderBudgetTable(data.budget);
  renderAgingTable(data.agingRate);
})();

// テーブル描画関数
function renderTrendTable(trends) {
  const tbody = document.getElementById('trend-tbody');
  tbody.innerHTML = '';

  trends.forEach((d, i) => {
    const row = document.createElement('tr');
    const prevYear = i > 0 ? trends[i - 1].benefit : d.benefit;
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

function renderAgingTable(aging) {
  const tbody = document.getElementById('aging-tbody');
  tbody.innerHTML = '';

  aging.forEach(d => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${d.year}年</td>
      <td>${d.rate.toFixed(1)}</td>
    `;
    tbody.appendChild(row);
  });
}
