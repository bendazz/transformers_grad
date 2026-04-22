fetch("/vocab")
    .then(res => res.json())
    .then(vocab => {
        buildTable(vocab);
        drawPlot(vocab);
    });

function buildTable(vocab) {
    const container = document.getElementById("vocab-table");
    for (const [char, info] of Object.entries(vocab)) {
        const row = document.createElement("div");
        row.className = "vocab-row";
        const display = char === " " ? "\u2423" : char;
        const vec = info.embedding.map(v => v.toFixed(4)).join(", ");
        row.innerHTML =
            `<span class="vocab-char">${display}</span>` +
            `<span class="arrow">\u2192</span>` +
            `<span class="vocab-id">${info.id}</span>` +
            `<span class="arrow">\u2192</span>` +
            `<span class="vocab-vec">[${vec}]</span>`;
        container.appendChild(row);
    }
}

function drawPlot(vocab) {
    const canvas = document.getElementById("plot");
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const padding = 50;
    const plotSize = size - padding * 2;
    const cx = padding + plotSize / 2;
    const cy = padding + plotSize / 2;

    // collect entries and find bounds
    const entries = Object.entries(vocab).map(([char, info]) => ({
        char, vec: info.embedding
    }));

    let maxAbs = 0.5;
    for (const e of entries) {
        maxAbs = Math.max(maxAbs, Math.abs(e.vec[0]), Math.abs(e.vec[1]));
    }
    maxAbs *= 1.3;
    const scale = plotSize / 2 / maxAbs;

    // grid
    const step = Math.pow(10, Math.floor(Math.log10(maxAbs)));
    ctx.strokeStyle = "#2a2a4a";
    ctx.lineWidth = 1;
    for (let v = -Math.ceil(maxAbs / step) * step; v <= maxAbs; v += step) {
        const px = cx + v * scale;
        const py = cy - v * scale;
        ctx.beginPath(); ctx.moveTo(px, padding); ctx.lineTo(px, size - padding); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padding, py); ctx.lineTo(size - padding, py); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padding, cy); ctx.lineTo(size - padding, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, padding); ctx.lineTo(cx, size - padding); ctx.stroke();

    // axis labels
    ctx.fillStyle = "#888";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("dim 0", size - padding, cy + 16);
    ctx.fillText("dim 1", cx, padding - 10);

    // tick labels
    ctx.fillStyle = "#666";
    for (let v = -Math.ceil(maxAbs / step) * step; v <= maxAbs; v += step) {
        if (Math.abs(v) < step * 0.1) continue;
        const label = Math.abs(v) >= 1 ? v.toFixed(0) : v.toFixed(1);
        ctx.fillText(label, cx + v * scale, cy + 16);
        ctx.textAlign = "right";
        ctx.fillText(label, cx - 8, cy - v * scale + 4);
        ctx.textAlign = "center";
    }

    // color palette
    const colors = [
        "#4caf50","#e05555","#5599ee","#e0a030","#aa55cc",
        "#40ccaa","#cc6688","#88bb33","#dd7744","#6688dd",
        "#cc44aa","#55cccc","#bbaa22","#7766ee","#44bb77",
        "#dd5588","#99aa55","#5577cc","#cc8844","#6644bb",
        "#33bbaa","#dd6655","#7799cc","#aacc44","#bb5599",
        "#44aadd","#cc9966"
    ];

    // draw vectors
    for (let i = 0; i < entries.length; i++) {
        const { char, vec } = entries[i];
        const color = colors[i % colors.length];
        const vx = cx + vec[0] * scale;
        const vy = cy - vec[1] * scale;

        // line
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(vx, vy);
        ctx.stroke();

        // arrowhead
        const angle = Math.atan2(cy - vy, vx - cx);
        const h = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(vx - h * Math.cos(angle - 0.4), vy + h * Math.sin(angle - 0.4));
        ctx.lineTo(vx - h * Math.cos(angle + 0.4), vy + h * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        // label
        const display = char === " " ? "\u2423" : char;
        ctx.fillStyle = color;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillText(display, vx + 6, vy - 6);
    }
}
