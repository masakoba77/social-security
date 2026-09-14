// グラフ描画機能
class Chart {
  constructor(svgElement, data, options = {}) {
    this.svg = svgElement;
    this.data = data;
    this.options = {
      width: 1000,
      height: 500,
      margin: { top: 30, right: 40, bottom: 60, left: 80 },
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

  drawGridLines(group, innerWidth, innerHeight, divisions = 5) {
    for (let i = 0; i <= divisions; i++) {
      const y = (innerHeight / divisions) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0);
      line.setAttribute('y1', y);
      line.setAttribute('x2', innerWidth);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'var(--border)');
      line.setAttribute('stroke-dasharray', '4');
      line.setAttribute('opacity', '0.5');
      group.appendChild(line);
    }
  }

  drawLineChart(xKey, yKey) {
    const { width, height, margin } = this.options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yValues = this.data.map(d => d[yKey]);
    const maxY = Math.max(...yValues);
    const minY = Math.min(...yValues);
    const padding = (maxY - minY) * 0.1;

    const xScale = this.getScale(0, this.data.length - 1, innerWidth);
    const yScale = this.getScale(minY - padding, maxY + padding, innerHeight);

    // グループを作成
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // グリッドラインを描画
    this.drawGridLines(group, innerWidth, innerHeight);

    // Y軸
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', innerHeight);
    yAxis.setAttribute('stroke', 'var(--text-secondary)');
    yAxis.setAttribute('stroke-width', 1.5);
    group.appendChild(yAxis);

    // X軸
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', innerHeight);
    xAxis.setAttribute('x2', innerWidth);
    xAxis.setAttribute('y2', innerHeight);
    xAxis.setAttribute('stroke', 'var(--text-secondary)');
    xAxis.setAttribute('stroke-width', 1.5);
    group.appendChild(xAxis);

    // ラインを描画
    let pathData = '';
    this.data.forEach((d, i) => {
      const x = i * xScale;
      const y = innerHeight - (d[yKey] - minY + padding) * yScale;
      pathData += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'var(--primary)');
    path.setAttribute('stroke-width', 2.5);
    path.setAttribute('fill', 'none');
    group.appendChild(path);

    // ポイントを描画
    this.data.forEach((d, i) => {
      const x = i * xScale;
      const y = innerHeight - (d[yKey] - minY + padding) * yScale;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', 'var(--primary)');
      circle.setAttribute('stroke', 'var(--bg-primary)');
      circle.setAttribute('stroke-width', 2);
      group.appendChild(circle);
    });

    // Y軸ラベル
    for (let i = 0; i <= 5; i++) {
      const y = (innerHeight / 5) * i;
      const value = maxY - (maxY - minY) * (i / 5);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', -15);
      text.setAttribute('y', y + 4);
      text.setAttribute('font-size', '12px');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', 'var(--text-secondary)');
      text.textContent = value.toFixed(1);
      group.appendChild(text);
    }

    // X軸ラベル（スパース表示）
    const labelInterval = Math.max(1, Math.floor(this.data.length / 6));
    this.data.forEach((d, i) => {
      if (i % labelInterval === 0) {
        const x = i * xScale;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', innerHeight + 20);
        text.setAttribute('font-size', '12px');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.textContent = d[xKey];
        group.appendChild(text);
      }
    });

    this.svg.appendChild(group);
  }

  drawBarChart(xKey, yKey) {
    const { width, height, margin } = this.options;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const yValues = this.data.map(d => d[yKey]);
    const maxY = Math.max(...yValues);
    const padding = maxY * 0.1;

    const barWidth = innerWidth / (this.data.length * 1.8);
    const scale = innerHeight / (maxY + padding);

    // グループを作成
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // グリッドラインを描画
    this.drawGridLines(group, innerWidth, innerHeight);

    // 軸を描画
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', 0);
    yAxis.setAttribute('y1', 0);
    yAxis.setAttribute('x2', 0);
    yAxis.setAttribute('y2', innerHeight);
    yAxis.setAttribute('stroke', 'var(--text-secondary)');
    yAxis.setAttribute('stroke-width', 1.5);
    group.appendChild(yAxis);

    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', 0);
    xAxis.setAttribute('y1', innerHeight);
    xAxis.setAttribute('x2', innerWidth);
    xAxis.setAttribute('y2', innerHeight);
    xAxis.setAttribute('stroke', 'var(--text-secondary)');
    xAxis.setAttribute('stroke-width', 1.5);
    group.appendChild(xAxis);

    // バーを描画
    const colors = ['var(--primary)', 'var(--secondary)', 'var(--success)', 'var(--warning)'];
    this.data.forEach((d, i) => {
      const x = (barWidth * 1.8) * i;
      const barHeight = d[yKey] * scale;
      const y = innerHeight - barHeight;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', barHeight);
      rect.setAttribute('fill', colors[i % colors.length]);
      rect.setAttribute('rx', 3);
      rect.setAttribute('ry', 3);
      group.appendChild(rect);

      // ラベル
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', innerHeight + 20);
      text.setAttribute('font-size', '13px');
      text.setAttribute('font-weight', '500');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--text-primary)');
      text.textContent = d[xKey].substring(0, 8);
      group.appendChild(text);

      // 値ラベル
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', x + barWidth / 2);
      valueText.setAttribute('y', y - 8);
      valueText.setAttribute('font-size', '12px');
      valueText.setAttribute('font-weight', '600');
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('fill', 'var(--text-primary)');
      valueText.textContent = d[yKey].toFixed(1);
      group.appendChild(valueText);
    });

    // Y軸ラベル
    for (let i = 0; i <= 5; i++) {
      const y = (innerHeight / 5) * i;
      const value = maxY - (maxY) * (i / 5);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', -15);
      text.setAttribute('y', y + 4);
      text.setAttribute('font-size', '12px');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('fill', 'var(--text-secondary)');
      text.textContent = value.toFixed(1);
      group.appendChild(text);
    }

    this.svg.appendChild(group);
  }
}

// グラフを描画する関数
function renderChart(elementId, data, type, xKey, yKey) {
  const svg = document.getElementById(elementId);
  if (!svg) return;

  const container = svg.parentElement;
  const width = Math.min(container.offsetWidth, 1200);
  const height = 600;

  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const chart = new Chart(svg, data, {
    width: width,
    height: height
  });

  if (type === 'line') {
    chart.drawLineChart(xKey, yKey);
  } else if (type === 'bar') {
    chart.drawBarChart(xKey, yKey);
  }
}
