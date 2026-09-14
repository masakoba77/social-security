// グラフ描画機能
class Chart {
  constructor(svgElement, data, options = {}) {
    this.svg = svgElement;
    this.data = data;
    this.options = {
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 30, left: 60 },
      ...options
    };
    this.clear();
  }

  clear() {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  getScale(min, max, range) {
    return range / (max - min);
  }

  drawLineChart(xKey, yKey) {
    const { width, height, margin } = this.options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yValues = this.data.map(d => d[yKey]);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);

    const xScale = this.getScale(0, this.data.length - 1, innerWidth);
    const yScale = this.getScale(minY, maxY, innerHeight);

    // グループを作成
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // Y軸
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', innerHeight);
    yAxis.setAttribute('stroke', '#ccc');
    yAxis.setAttribute('stroke-width', 1);
    group.appendChild(yAxis);

    // X軸
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', innerHeight);
    xAxis.setAttribute('x2', innerWidth);
    xAxis.setAttribute('y2', innerHeight);
    xAxis.setAttribute('stroke', '#ccc');
    xAxis.setAttribute('stroke-width', 1);
    group.appendChild(xAxis);

    // ラインを描画
    let pathData = '';
    this.data.forEach((d, i) => {
      const x = i * xScale;
      const y = innerHeight - (d[yKey] - minY) * yScale;
      pathData += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#0066cc');
    path.setAttribute('stroke-width', 2);
    path.setAttribute('fill', 'none');
    group.appendChild(path);

    // ポイントを描画
    this.data.forEach((d, i) => {
      const x = i * xScale;
      const y = innerHeight - (d[yKey] - minY) * yScale;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 3);
      circle.setAttribute('fill', '#0066cc');
      group.appendChild(circle);
    });

    // Y軸ラベル
    for (let i = 0; i <= 5; i++) {
      const y = (innerHeight / 5) * i;
      const value = maxY - (maxY - minY) * (i / 5);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', -40);
      text.setAttribute('y', y + 5);
      text.setAttribute('font-size', '12px');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', '#666');
      text.textContent = value.toFixed(1);
      group.appendChild(text);
    }

    this.svg.appendChild(group);
  }

  drawBarChart(xKey, yKey) {
    const { width, height, margin } = this.options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yValues = this.data.map(d => d[yKey]);
    const maxY = Math.max(...yValues);

    const barWidth = innerWidth / (this.data.length * 1.5);
    const scale = innerHeight / maxY;

    // グループを作成
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // 軸を描画
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', innerHeight);
    yAxis.setAttribute('stroke', '#ccc');
    group.appendChild(yAxis);

    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', innerHeight);
    xAxis.setAttribute('x2', innerWidth);
    xAxis.setAttribute('y2', innerHeight);
    xAxis.setAttribute('stroke', '#ccc');
    group.appendChild(xAxis);

    // バーを描画
    const colors = ['#0066cc', '#ff6b35', '#4caf50', '#ff9800'];
    this.data.forEach((d, i) => {
      const x = (barWidth * 1.5) * i;
      const barHeight = d[yKey] * scale;
      const y = innerHeight - barHeight;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', colors[i % colors.length]);
      group.appendChild(rect);

      // ラベル
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', innerHeight + 15);
      text.setAttribute('font-size', '12px');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#333');
      text.textContent = d[xKey].substring(0, 6);
      group.appendChild(text);

      // 値ラベル
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 5);
      valueText.setAttribute('font-size', '11px');
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('fill', '#333');
      valueText.textContent = d[yKey].toFixed(1);
      group.appendChild(valueText);
    });

    this.svg.appendChild(group);
  }
}

// グラフを描画する関数
function renderChart(elementId, data, type, xKey, yKey) {
  const svg = document.getElementById(elementId);
  if (!svg) return;

  const chart = new Chart(svg, data, {
    width: svg.parentElement.offsetWidth,
    height: 400
  });

  if (type === 'line') {
    chart.drawLineChart(xKey, yKey);
  } else if (type === 'bar') {
    chart.drawBarChart(xKey, yKey);
  }
}
