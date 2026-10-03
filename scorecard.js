// The scorecard: top cards + four charts, and the %/# mode toggle that drives them.
// Scorecard data lives in data.js (global SCORECARDS), loaded before this file.

function getScorecard(subjectId, segmentId, fieldingDate) {
  return SCORECARDS.find(
    (s) => s.subjectId === subjectId && s.segmentId === segmentId && s.fieldingDate === fieldingDate
  );
}

const DATE = "2025-07-25";

// Visual tokens (sampled from the mockup).
const RED = "#BE1E2D";
const AXIS = "#B8BDC6";
const GREY_BAR = "#D1D5DB";

// Display mode for the %/# toggle
//
// This page is one celebrity's scorecard, so every count on it is expressed out
// of that celebrity's own base (the base of the viewed record): count =
// round(pct * base / 100). For Brad Pitt's own figures that's a real headcount.
// For category benchmarks it's an INDEXED count: the category rate projected onto
// his base so the two are comparable in one unit ("if the typical actor had been
// asked of the same people as Brad Pitt, how many would be aware"). Indexed counts
// are counterfactual, not observed, so the UI flags category figures as indexed
// (muted + a caption).

// --- View adapter: the ONE place that knows about display mode. Built once per
// render from (mode, refBase); every presentation helper comes from here, so no
// renderer reads the mode or the base directly.
function makeView(mode, refBase) {
  const isPct = mode === "pct";
  const toCount = (pct) => Math.round((pct * refBase) / 100);
  return {
    mode,
    refBase,
    isPct,
    value: (pct) => (isPct ? pct : toCount(pct)),
    fmt: (pct) => (isPct ? pct + "%" : String(toCount(pct))),
    series: (pcts) => (isPct ? pcts : pcts.map(toCount)),
    axisScale: isPct ? 1 : refBase / 100,
    baseCaption: isPct ? null : "Base: " + refBase.toLocaleString() + " (Brad Pitt respondents)",
    indexedCaption: isPct ? null : "Indexed to base: " + refBase.toLocaleString() + " (Brad Pitt respondents)",
    barLabel: () => ({
      show: true,
      position: "top",
      formatter: (p) => (isPct ? p.value + "%" : p.value),
      color: "#515A68",
      fontSize: 11,
    }),
  };
}

// Shared axis / grid defaults for the bar charts. pctMax/pctInterval describe the
// y-axis in percent; in count mode they're scaled (via view.axisScale) so bars
// keep the same proportions and the axis reads in counts.
function barBase(view, categories, pctMax, pctInterval, rotate) {
  const scale = view.axisScale;
  return {
    title: view.baseCaption ? {
      text: view.baseCaption,
      left: "center",
      top: 2,
      textStyle: { color: AXIS, fontSize: 11, fontWeight: "normal" },
    } : undefined,
    grid: { left: 44, right: 16, top: view.isPct ? 24 : 40, bottom: 70 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        color: AXIS,
        fontSize: 10,
        interval: 0,
        rotate: rotate || 0,
        width: 90,
        overflow: "break",
      },
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#E5E7EB" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: Math.round(pctMax * scale),
      interval: Math.round(pctInterval * scale),
      axisLabel: { color: AXIS, fontSize: 10 },
      splitLine: { lineStyle: { color: "#EEF0F2", type: "dashed" } },
    },
    legend: { bottom: 0, textStyle: { color: "#515A68", fontSize: 12 } },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v) => (view.isPct ? v + "%" : v),
    },
  };
}

// --- Total Appeal: Brad Pitt total, bundled overall/byName/byFace ---
function renderTotalAppeal(view) {
  const a = getScorecard("brad-pitt", "total", DATE).totalAppeal;
  const cats = [
    "Top Two Box\n(Like A Lot / Like)",
    "Top Three Box\n(Like A Lot / Like / Like Some)",
    "Bottom Two Box\n(Dislike A Lot / Dislike)",
    "Bottom Three Box\n(Dislike A Lot / Dislike / Dislike Some)",
  ];
  const opt = barBase(view, cats, 100, 25, 0);
  opt.xAxis.axisLabel.formatter = (v) => v; // keep manual line breaks
  opt.series = [
    { name: "Total", type: "bar", data: view.series(a.overall), itemStyle: { color: RED }, label: view.barLabel() },
    { name: "Name", type: "bar", data: view.series(a.byName), itemStyle: { color: "#E87A7A" }, label: view.barLabel() },
    { name: "Face", type: "bar", data: view.series(a.byFace), itemStyle: { color: "#F5B8B8" }, label: view.barLabel() },
  ];
  echarts.init(document.getElementById("chart-total-appeal")).setOption(opt, true);
}

// --- Attributes: Brad Pitt total/male/female, vary segmentId ---
// All three series are Brad Pitt's own data, shown as real counts out of his base.
function renderAttributes(view) {
  const total = getScorecard("brad-pitt", "total", DATE).attributes;
  const male = getScorecard("brad-pitt", "male", DATE).attributes;
  const female = getScorecard("brad-pitt", "female", DATE).attributes;
  const cats = Object.keys(total);
  const opt = barBase(view, cats, 60, 15, 30);
  opt.series = [
    { name: "Total", type: "bar", data: view.series(cats.map((k) => total[k])), itemStyle: { color: RED }, label: view.barLabel() },
    { name: "Male", type: "bar", data: view.series(cats.map((k) => male[k])), itemStyle: { color: "#4A76A8" } },
    { name: "Female", type: "bar", data: view.series(cats.map((k) => female[k])), itemStyle: { color: "#E8A8C8" } },
  ];
  echarts.init(document.getElementById("chart-attributes")).setOption(opt, true);
}

// --- Appeal pie: Film Personality - Actor category, 6-point scale ---
// This is a category benchmark (pooled rate across all actors; Case C, matching
// Q Score methodology where every figure is count/aware*100). On Brad Pitt's page
// its raw counts (out of the category's huge base) are meaningless, so in # mode
// the slices are indexed to his base: count = round(pct * base / 100). The
// title note flags that these are indexed.
function renderAppeal(view) {
  const a = getScorecard("film-personality-actor", "total", DATE).appeal;
  const slices = [
    { name: "Like A Lot", value: a.likeALot, color: "#4A76A8" },
    { name: "Like", value: a.like, color: "#6B9AD4" },
    { name: "Like Somewhat", value: a.likeSomewhat, color: "#A8C8F0" },
    { name: "Dislike Somewhat", value: a.dislikeSomewhat, color: "#F0C8A8" },
    { name: "Dislike", value: a.dislike, color: "#E89A6B" },
    { name: "Dislike A Lot", value: a.dislikeALot, color: "#D46B4A" },
  ];
  const suffix = view.isPct ? "%" : "";
  echarts.init(document.getElementById("chart-appeal")).setOption({
    title: view.indexedCaption ? {
      text: view.indexedCaption,
      left: "center",
      top: 2,
      textStyle: { color: AXIS, fontSize: 11, fontWeight: "normal" },
    } : undefined,
    tooltip: { trigger: "item", formatter: (p) => `${p.name}: ${p.value}${suffix}` },
    series: [{
      type: "pie",
      radius: "62%",
      center: ["50%", "52%"],
      clockwise: false,
      startAngle: 0,
      data: slices.map((s) => ({
        name: s.name,
        value: view.value(s.value),
        itemStyle: { color: s.color },
      })),
      label: {
        formatter: (p) => `${p.name}, ${p.value}${suffix}`,
        color: "#515A68",
        fontSize: 12,
      },
      labelLine: { length: 12, length2: 14 },
    }],
  }, true);
}

// --- Power Factors: Brad Pitt vs Film Personality - Actor average ---
// Both series share the page's base. Brad Pitt's bars are real counts;
// the category-average bars are indexed to his base so the comparison reads in one
// unit. The legend flags the category series as indexed in # mode.
function renderPowerFactors(view) {
  const celeb = getScorecard("brad-pitt", "total", DATE).powerFactors;
  const cat = getScorecard("film-personality-actor", "total", DATE).powerFactors;
  const cats = Object.keys(celeb);
  const catName = "Film Personality - Actor Avg." + (view.isPct ? "" : " (indexed)");
  const opt = barBase(view, cats, 60, 15, 30);
  opt.series = [
    { name: "Brad Pitt", type: "bar", data: view.series(cats.map((k) => celeb[k])), itemStyle: { color: RED }, label: view.barLabel() },
    { name: catName, type: "bar", data: view.series(cats.map((k) => cat[k])), itemStyle: { color: GREY_BAR } },
  ];
  echarts.init(document.getElementById("chart-power-factors")).setOption(opt, true);
}

// --- Top cards ---
const AWARENESS_CATEGORIES = [
  { id: "film-personality-actor", label: "Film Personality - Actor", color: "#4A76A8" },
  { id: "film-personality-actor-action-adventure", label: "Film Personality - Actor - Action-Adventure", color: "#6B9AD4" },
  { id: "spokesperson", label: "Spokesperson", color: "#8AB4E8" },
  { id: "film-personality-actor-romance", label: "Film Personality - Actor - Romance", color: "#A8C8F0" },
  { id: "streaming-actor", label: "Streaming Actor", color: "#C4DBF5" },
];

// E-Score is an index, not a respondent percentage, so it never switches to a
// count. Brad Pitt's own awareness headline is a real count out of his base. The
// category benchmarks are indexed to his base in # mode (counterfactual counts),
// shown muted with a caption so they don't read as observed headcounts.
function renderTopCards(view) {
  const bp = getScorecard("brad-pitt", "total", DATE);
  document.getElementById("escore-value").textContent = bp.eScore;

  const indexed = !view.isPct;

  const awarenessValue = document.getElementById("awareness-value");
  if (indexed) {
    awarenessValue.innerHTML =
      view.value(bp.awareness) +
      `<sup class="awareness-base"> / ${view.refBase.toLocaleString()} *</sup>`;
  } else {
    awarenessValue.textContent = bp.awareness + "%";
  }

  const sub = document.getElementById("awareness-sub");
  sub.textContent = "Category Averages for this Celebrity:" + (indexed ? " *" : "");

  const list = document.getElementById("awareness-list");
  list.innerHTML = "";
  for (const cat of AWARENESS_CATEGORIES) {
    const rec = getScorecard(cat.id, "total", DATE);
    const li = document.createElement("li");
    if (indexed) li.className = "indexed";
    li.innerHTML =
      `<span class="dot" style="background:${cat.color}"></span>` +
      `<span class="cat-name">${cat.label}</span>` +
      `<span class="cat-pct">${view.fmt(rec.awareness)}</span>`;
    list.appendChild(li);
  }
  const note = document.getElementById("awareness-indexed-note");
  note.textContent = "* Brad Pitt respondents base";
  note.hidden = !indexed;
}

// One render pass for everything the %/# toggle affects. Mode enters only here,
// via makeView; every renderer above is a pure function of (view).
const pctBtn = document.getElementById("mode-pct");
const countBtn = document.getElementById("mode-count");

// The buttons own the mode; read it from them.
function getMode() {
  return pctBtn.classList.contains("active") ? "pct" : "count";
}

function render() {
  const base = getScorecard("brad-pitt", "total", DATE).base;
  const view = makeView(getMode(), base);
  renderTopCards(view);
  renderTotalAppeal(view);
  renderAttributes(view);
  renderAppeal(view);
  renderPowerFactors(view);
}

function setMode(mode) {
  pctBtn.classList.toggle("active", mode === "pct");
  countBtn.classList.toggle("active", mode === "count");
  pctBtn.setAttribute("aria-pressed", String(mode === "pct"));
  countBtn.setAttribute("aria-pressed", String(mode === "count"));
  render();
}

pctBtn.addEventListener("click", () => setMode("pct"));
countBtn.addEventListener("click", () => setMode("count"));

render(); // initial mode read from whichever button starts active in the HTML

window.addEventListener("resize", () => {
  for (const el of document.querySelectorAll(".chart")) {
    const inst = echarts.getInstanceByDom(el);
    if (inst) inst.resize();
  }
});
