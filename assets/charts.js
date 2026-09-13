// 依存ライブラリなしの軽量SVGチャート描画ユーティリティ
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const k in attrs || {}) node.setAttribute(k, attrs[k]);
    (children || []).forEach((c) => node.appendChild(c));
    return node;
  }

  function niceMax(v) {
    const mag = Math.pow(10, Math.floor(Math.log10(v || 1)));
    const norm = v / mag;
    let step;
    if (norm <= 1) step = 1;
    else if (norm <= 2) step = 2;
    else if (norm <= 5) step = 5;
    else step = 10;
    return step * mag;
  }

  function fmtOku(v) {
    const cho = v / 10000;
    return (Math.round(cho * 100) / 100).toLocaleString("ja-JP") + "兆円";
  }

  function fmtPct(v) {
    return v.toLocaleString("ja-JP") + "%";
  }

  function ensureTooltip(container) {
    let tip = container.querySelector(".tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.className = "tooltip";
      container.style.position = "relative";
      container.appendChild(tip);
    }
    return tip;
  }

  function bindTooltip(mark, tip, container, html) {
    mark.classList.add("mark");
    mark.addEventListener("mouseenter", (e) => showTip(e));
    mark.addEventListener("mousemove", (e) => showTip(e));
    mark.addEventListener("mouseleave", () => tip.classList.remove("show"));
    mark.addEventListener("focus", (e) => showTip(e));
    mark.addEventListener("blur", () => tip.classList.remove("show"));

    function showTip(e) {
      tip.innerHTML = html;
      const rect = container.getBoundingClientRect();
      const markRect = mark.getBoundingClientRect();
      const x = markRect.left + markRect.width / 2 - rect.left;
      const y = markRect.top - rect.top;
      tip.style.left = x + "px";
      tip.style.top = Math.max(y, 24) + "px";
      tip.classList.add("show");
    }
  }

  function wireTableToggle(card, table) {
    const btn = card.querySelector(".table-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const showing = table.classList.toggle("show");
      btn.textContent = showing ? "グラフで見る" : "表で見る";
    });
  }

  // 縦棒グラフ（単一系列）: 年度推移など
  function renderVerticalBar(card, data, opts) {
    const svg = card.querySelector("svg");
    const W = 640, H = 300;
    const padL = 56, padR = 16, padT = 16, padB = 44;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const maxVal = niceMax(Math.max(...data.map((d) => d[opts.valueKey])) * 1.15);
    const n = data.length;
    const bandW = plotW / n;
    const barW = Math.min(48, bandW * 0.5);
    const tip = ensureTooltip(card);

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";

    const gridGroup = el("g");
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const val = (maxVal / ticks) * i;
      const y = padT + plotH - (val / maxVal) * plotH;
      gridGroup.appendChild(
        el("line", {
          x1: padL, x2: W - padR, y1: y, y2: y,
          stroke: "var(--grid)", "stroke-width": 1,
        })
      );
      const label = el("text", {
        x: padL - 8, y: y + 4, "text-anchor": "end",
        fill: "var(--text-muted)", "font-size": 11,
      });
      label.textContent = opts.axisFormat(val);
      gridGroup.appendChild(label);
    }
    svg.appendChild(gridGroup);

    svg.appendChild(
      el("line", {
        x1: padL, x2: W - padR, y1: padT + plotH, y2: padT + plotH,
        stroke: "var(--baseline)", "stroke-width": 1,
      })
    );

    data.forEach((d, i) => {
      const val = d[opts.valueKey];
      const barH = (val / maxVal) * plotH;
      const cx = padL + bandW * i + bandW / 2;
      const x = cx - barW / 2;
      const y = padT + plotH - barH;
      const r = 4;
      const color = opts.color(d, i);

      const path = el("path", {
        d: `M${x},${y + r} a${r},${r} 0 0 1 ${r},-${r} h${barW - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${barH - r} h${-barW} z`,
        fill: color,
      });
      bindTooltip(path, tip, card, `<strong>${d.label.replace("\n", " ")}</strong><br>${opts.tooltip(d)}`);
      svg.appendChild(path);

      if (opts.directLabel) {
        const t = el("text", {
          x: cx, y: y - 8, "text-anchor": "middle",
          fill: "var(--text-primary)", "font-size": 12, "font-weight": 600,
        });
        t.textContent = opts.directLabel(d);
        svg.appendChild(t);
      }

      String(d.label).split("\n").forEach((line, li) => {
        const t = el("text", {
          x: cx, y: padT + plotH + 18 + li * 13, "text-anchor": "middle",
          fill: "var(--text-secondary)", "font-size": 11.5,
        });
        t.textContent = line;
        svg.appendChild(t);
      });
    });
  }

  // 横棒グラフ（比較・強調用）: 予算内訳など
  function renderHorizontalBar(card, data, opts) {
    const svg = card.querySelector("svg");
    const rowH = 34;
    const W = 640;
    const H = data.length * rowH + 20;
    const padL = 8, padR = 90, labelW = opts.labelWidth || 190;
    const plotW = W - padL - padR - labelW;
    const maxVal = Math.max(...data.map((d) => d[opts.valueKey])) * 1.08;
    const tip = ensureTooltip(card);

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = "";

    data.forEach((d, i) => {
      const val = d[opts.valueKey];
      const barW = (val / maxVal) * plotW;
      const y = 10 + i * rowH;
      const barH = 20;
      const r = 4;
      const x0 = padL + labelW;
      const color = opts.color(d, i);

      const label = el("text", {
        x: padL, y: y + barH / 2 + 4, "text-anchor": "start",
        fill: d.highlight ? "var(--text-primary)" : "var(--text-secondary)",
        "font-size": 12.5, "font-weight": d.highlight ? 600 : 400,
      });
      label.textContent = d.label;
      svg.appendChild(label);

      let dAttr;
      if (barW > r) {
        dAttr = `M${x0},${y} h${barW - r} a${r},${r} 0 0 1 ${r},${r} v${barH - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(barW - r)} z`;
      } else {
        dAttr = `M${x0},${y} h${barW} v${barH} h${-barW} z`;
      }
      const path = el("path", { d: dAttr, fill: color });
      bindTooltip(path, tip, card, `<strong>${d.label}</strong><br>${opts.tooltip(d)}`);
      svg.appendChild(path);

      const valText = el("text", {
        x: x0 + barW + 8, y: y + barH / 2 + 4, "text-anchor": "start",
        fill: "var(--text-primary)", "font-size": 12, "font-weight": d.highlight ? 600 : 400,
      });
      valText.textContent = opts.directLabel(d);
      svg.appendChild(valText);
    });
  }

  window.Charts = { renderVerticalBar, renderHorizontalBar, wireTableToggle, fmtOku, fmtPct };
})();
