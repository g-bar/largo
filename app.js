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

// Display mode for the %/# toggle (doc section 6). "pct" shows percentages;
// "count" shows respondent counts.
//
// This page is one celebrity's scorecard, so every count on it is expressed out
// of that celebrity's own base (REF_BASE): count = round(pct * REF_BASE / 100).
// For Brad Pitt's own figures that's a real headcount. For category benchmarks
// it's an INDEXED count: the category rate projected onto his base so the two are
// comparable in one unit ("if the typical actor had been asked of the same people
// as Brad Pitt, how many would be aware"). Indexed counts are counterfactual, not
// observed, so the UI flags category figures as indexed (muted + a caption).
const state = { mode: "pct" };
const REF_BASE = getScorecard("brad-pitt", "total", DATE).base;

function toCount(pct) {
  return Math.round((pct * REF_BASE) / 100);
}

// Format one value for the active mode.
function fmtValue(pct) {
  return state.mode === "pct" ? pct + "%" : String(toCount(pct));
}

// A bar series' data for the active mode: percentages as-is, or counts.
function seriesData(pcts) {
  return state.mode === "pct" ? pcts : pcts.map(toCount);
}

function barLabel() {
  return {
    show: true,
    position: "top",
    formatter: (p) => (state.mode === "pct" ? p.value + "%" : p.value),
    color: "#515A68",
    fontSize: 11,
  };
}

// Shared axis / grid defaults for the bar charts. pctMax/pctInterval describe the
// y-axis in percent; in count mode they're scaled by REF_BASE so bars keep the
// same proportions and the axis reads in counts.
function barBase(categories, pctMax, pctInterval, rotate) {
  const scale = state.mode === "pct" ? 1 : REF_BASE / 100;
  return {
    title: state.mode === "count" ? {
      text: "Base: " + REF_BASE.toLocaleString() + " (Brad Pitt respondents)",
      left: "center",
      top: 2,
      textStyle: { color: AXIS, fontSize: 11, fontWeight: "normal" },
    } : undefined,
    grid: { left: 44, right: 16, top: state.mode === "count" ? 40 : 24, bottom: 70 },
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
      valueFormatter: (v) => (state.mode === "pct" ? v + "%" : v),
    },
  };
}

// --- Total Appeal: Brad Pitt total, bundled overall/byName/byFace ---
function renderTotalAppeal() {
  const sc = getScorecard("brad-pitt", "total", DATE);
  const cats = [
    "Top Two Box\n(Like A Lot / Like)",
    "Top Three Box\n(Like A Lot / Like / Like Some)",
    "Bottom Two Box\n(Dislike A Lot / Dislike)",
    "Bottom Three Box\n(Dislike A Lot / Dislike / Dislike Some)",
  ];
  const opt = barBase(cats, 100, 25, 0);
  opt.xAxis.axisLabel.formatter = (v) => v; // keep manual line breaks
  opt.series = [
    { name: "Total", type: "bar", data: seriesData(sc.totalAppeal.overall), itemStyle: { color: RED }, label: barLabel() },
    { name: "Name", type: "bar", data: seriesData(sc.totalAppeal.byName), itemStyle: { color: "#E87A7A" }, label: barLabel() },
    { name: "Face", type: "bar", data: seriesData(sc.totalAppeal.byFace), itemStyle: { color: "#F5B8B8" }, label: barLabel() },
  ];
  echarts.init(document.getElementById("chart-total-appeal")).setOption(opt, true);
}

// --- Attributes: Brad Pitt total/male/female, vary segmentId ---
// All three series are Brad Pitt's own data, shown as real counts out of his base.
function renderAttributes() {
  const total = getScorecard("brad-pitt", "total", DATE).attributes;
  const male = getScorecard("brad-pitt", "male", DATE).attributes;
  const female = getScorecard("brad-pitt", "female", DATE).attributes;
  const cats = Object.keys(total);
  const opt = barBase(cats, 60, 15, 30);
  opt.series = [
    { name: "Total", type: "bar", data: seriesData(cats.map((k) => total[k])), itemStyle: { color: RED }, label: barLabel() },
    { name: "Male", type: "bar", data: seriesData(cats.map((k) => male[k])), itemStyle: { color: "#4A76A8" } },
    { name: "Female", type: "bar", data: seriesData(cats.map((k) => female[k])), itemStyle: { color: "#E8A8C8" } },
  ];
  echarts.init(document.getElementById("chart-attributes")).setOption(opt, true);
}

// --- Appeal pie: Film Personality - Actor category, 6-point scale ---
// This is a category benchmark (pooled rate across all actors; Case C, matching
// Q Score methodology where every figure is count/aware*100). On Brad Pitt's page
// its raw counts (out of the category's huge base) are meaningless, so in # mode
// the slices are indexed to his base: count = round(pct * REF_BASE / 100). The
// title note flags that these are indexed.
function renderAppeal() {
  const a = getScorecard("film-personality-actor", "total", DATE).appeal;
  const slices = [
    { name: "Like A Lot", value: a.likeALot, color: "#4A76A8" },
    { name: "Like", value: a.like, color: "#6B9AD4" },
    { name: "Like Somewhat", value: a.likeSomewhat, color: "#A8C8F0" },
    { name: "Dislike Somewhat", value: a.dislikeSomewhat, color: "#F0C8A8" },
    { name: "Dislike", value: a.dislike, color: "#E89A6B" },
    { name: "Dislike A Lot", value: a.dislikeALot, color: "#D46B4A" },
  ];
  const suffix = state.mode === "pct" ? "%" : "";
  echarts.init(document.getElementById("chart-appeal")).setOption({
    title: state.mode === "count" ? {
      text: "Indexed to base: " + REF_BASE.toLocaleString() + " (Brad Pitt respondents)",
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
        value: state.mode === "pct" ? s.value : toCount(s.value),
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
// Both series share the page's base (REF_BASE). Brad Pitt's bars are real counts;
// the category-average bars are indexed to his base so the comparison reads in one
// unit. The legend flags the category series as indexed in # mode.
function renderPowerFactors() {
  const celeb = getScorecard("brad-pitt", "total", DATE).powerFactors;
  const cat = getScorecard("film-personality-actor", "total", DATE).powerFactors;
  const cats = Object.keys(celeb);
  const catName = "Film Personality - Actor Avg." + (state.mode === "count" ? " (indexed)" : "");
  const opt = barBase(cats, 60, 15, 30);
  opt.series = [
    { name: "Brad Pitt", type: "bar", data: seriesData(cats.map((k) => celeb[k])), itemStyle: { color: RED }, label: barLabel() },
    { name: catName, type: "bar", data: seriesData(cats.map((k) => cat[k])), itemStyle: { color: GREY_BAR } },
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
function renderTopCards() {
  const bp = getScorecard("brad-pitt", "total", DATE);
  document.getElementById("escore-value").textContent = bp.eScore;

  const indexed = state.mode === "count";

  const awarenessValue = document.getElementById("awareness-value");
  if (indexed) {
    awarenessValue.innerHTML =
      toCount(bp.awareness) +
      `<sup class="awareness-base"> / ${REF_BASE.toLocaleString()} *</sup>`;
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
      `<span class="cat-pct">${fmtValue(rec.awareness)}</span>`;
    list.appendChild(li);
  }
  const note = document.getElementById("awareness-indexed-note");
  note.textContent = "* Brad Pitt respondents base";
  note.hidden = !indexed;
}

// One render pass for everything the %/# toggle affects.
function render() {
  renderTopCards();
  renderTotalAppeal();
  renderAttributes();
  renderAppeal();
  renderPowerFactors();
}

render();

// --- %/# toggle ---
const pctBtn = document.getElementById("mode-pct");
const countBtn = document.getElementById("mode-count");

function setMode(mode) {
  if (state.mode === mode) return;
  state.mode = mode;
  pctBtn.classList.toggle("active", mode === "pct");
  countBtn.classList.toggle("active", mode === "count");
  pctBtn.setAttribute("aria-pressed", String(mode === "pct"));
  countBtn.setAttribute("aria-pressed", String(mode === "count"));
  render();
}

pctBtn.addEventListener("click", () => setMode("pct"));
countBtn.addEventListener("click", () => setMode("count"));

// --- News carousel ---
// NEWS lives in data.js. Shows 3 cards above 1000px, 1 at or below. Arrows
// shift by a page (3 or 1), but the start index is clamped to total - visible
// so the last view is always a full set of cards (no trailing empty slots).
const NEWS_GAP = 12;
const newsTrack = document.getElementById("news-track");
const newsPrev = document.getElementById("news-prev");
const newsNext = document.getElementById("news-next");
let newsStart = 0;

for (const item of NEWS) {
  const a = document.createElement("a");
  a.className = "card news-card";
  a.href = "#";
  a.innerHTML =
    `<div class="news-img" style="background:${item.image}">` +
      `<span class="news-date">${item.date}</span>` +
    `</div>` +
    `<div class="news-body"><div class="news-title">${item.title}</div></div>`;
  newsTrack.appendChild(a);
}

// Target card width; the number shown is however many fit in the carousel's
// current width (floored), so it adapts smoothly as the column resizes.
const NEWS_CARD_TARGET = 150;

function newsViewportWidth() {
  return newsTrack.parentElement.clientWidth;
}

function newsVisibleCount() {
  const w = newsViewportWidth();
  const fit = Math.floor((w + NEWS_GAP) / (NEWS_CARD_TARGET + NEWS_GAP));
  return Math.min(NEWS.length, Math.max(1, fit));
}

function newsMaxStart(visible) {
  return Math.max(0, NEWS.length - visible);
}

function layoutNews(animate = true) {
  const visible = newsVisibleCount();
  const maxStart = newsMaxStart(visible);
  if (newsStart > maxStart) newsStart = maxStart;

  const viewport = newsViewportWidth();
  const cardWidth = (viewport - NEWS_GAP * (visible - 1)) / visible;
  for (const card of newsTrack.children) card.style.width = cardWidth + "px";

  const step = cardWidth + NEWS_GAP;
  newsTrack.style.transition = animate ? "" : "none";
  newsTrack.style.transform = `translateX(${-newsStart * step}px)`;

  newsPrev.disabled = newsStart === 0;
  newsNext.disabled = newsStart >= maxStart;
}

newsPrev.addEventListener("click", () => {
  const visible = newsVisibleCount();
  newsStart = Math.max(0, newsStart - visible);
  layoutNews();
});
newsNext.addEventListener("click", () => {
  const visible = newsVisibleCount();
  newsStart = Math.min(newsMaxStart(visible), newsStart + visible);
  layoutNews();
});

layoutNews();

// --- Nav hamburger ---
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

window.addEventListener("resize", () => {
  layoutNews(false);
  for (const el of document.querySelectorAll(".chart")) {
    const inst = echarts.getInstanceByDom(el);
    if (inst) inst.resize();
  }
});
