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

const barLabel = {
  show: true,
  position: "top",
  formatter: "{c}%",
  color: "#515A68",
  fontSize: 11,
};

// Shared axis / grid defaults for the bar charts.
function barBase(categories, max, interval, rotate) {
  return {
    grid: { left: 36, right: 16, top: 24, bottom: 70 },
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
      max: max,
      interval: interval,
      axisLabel: { color: AXIS, fontSize: 10 },
      splitLine: { lineStyle: { color: "#EEF0F2", type: "dashed" } },
    },
    legend: { bottom: 0, textStyle: { color: "#515A68", fontSize: 12 } },
    tooltip: { trigger: "axis", valueFormatter: (v) => v + "%" },
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
  const opt = barBase(cats, 100, 25);
  opt.xAxis.axisLabel.formatter = (v) => v; // keep manual line breaks
  opt.series = [
    { name: "Total", type: "bar", data: sc.totalAppeal.overall, itemStyle: { color: RED }, label: barLabel },
    { name: "Name", type: "bar", data: sc.totalAppeal.byName, itemStyle: { color: "#E87A7A" }, label: barLabel },
    { name: "Face", type: "bar", data: sc.totalAppeal.byFace, itemStyle: { color: "#F5B8B8" }, label: barLabel },
  ];
  echarts.init(document.getElementById("chart-total-appeal")).setOption(opt);
}

// --- Attributes: Brad Pitt total/male/female, vary segmentId ---
function renderAttributes() {
  const total = getScorecard("brad-pitt", "total", DATE).attributes;
  const male = getScorecard("brad-pitt", "male", DATE).attributes;
  const female = getScorecard("brad-pitt", "female", DATE).attributes;
  const cats = Object.keys(total);
  const opt = barBase(cats, 60, 15, 30);
  opt.series = [
    { name: "Total", type: "bar", data: cats.map((k) => total[k]), itemStyle: { color: RED }, label: barLabel },
    { name: "Male", type: "bar", data: cats.map((k) => male[k]), itemStyle: { color: "#4A76A8" } },
    { name: "Female", type: "bar", data: cats.map((k) => female[k]), itemStyle: { color: "#E8A8C8" } },
  ];
  echarts.init(document.getElementById("chart-attributes")).setOption(opt);
}

// --- Appeal pie: Film Personality - Actor category, 6-point scale ---
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
  echarts.init(document.getElementById("chart-appeal")).setOption({
    tooltip: { trigger: "item", formatter: "{b}: {c}%" },
    series: [{
      type: "pie",
      radius: "62%",
      center: ["50%", "52%"],
      clockwise: false,
      startAngle: 0,
      data: slices.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
      label: {
        formatter: "{b}, {c}%",
        color: "#515A68",
        fontSize: 12,
      },
      labelLine: { length: 12, length2: 14 },
    }],
  });
}

// --- Power Factors: Brad Pitt vs Film Personality - Actor average, vary subjectId ---
function renderPowerFactors() {
  const celeb = getScorecard("brad-pitt", "total", DATE).powerFactors;
  const cat = getScorecard("film-personality-actor", "total", DATE).powerFactors;
  const cats = Object.keys(celeb);
  const opt = barBase(cats.map((k) => "% " + k), 60, 15, 30);
  opt.series = [
    { name: "Brad Pitt", type: "bar", data: cats.map((k) => celeb[k]), itemStyle: { color: RED }, label: barLabel },
    { name: "Film Personality - Actor Avg.", type: "bar", data: cats.map((k) => cat[k]), itemStyle: { color: GREY_BAR } },
  ];
  echarts.init(document.getElementById("chart-power-factors")).setOption(opt);
}

// --- Top cards ---
const AWARENESS_CATEGORIES = [
  { id: "film-personality-actor", label: "Film Personality - Actor", color: "#4A76A8" },
  { id: "film-personality-actor-action-adventure", label: "Film Personality - Actor - Action-Adventure", color: "#6B9AD4" },
  { id: "spokesperson", label: "Spokesperson", color: "#8AB4E8" },
  { id: "film-personality-actor-romance", label: "Film Personality - Actor - Romance", color: "#A8C8F0" },
  { id: "streaming-actor", label: "Streaming Actor", color: "#C4DBF5" },
];

function renderTopCards() {
  const bp = getScorecard("brad-pitt", "total", DATE);
  document.getElementById("escore-value").textContent = bp.eScore;
  document.getElementById("awareness-value").textContent = bp.awareness + "%";

  const list = document.getElementById("awareness-list");
  for (const cat of AWARENESS_CATEGORIES) {
    const rec = getScorecard(cat.id, "total", DATE);
    const li = document.createElement("li");
    li.innerHTML =
      `<span class="dot" style="background:${cat.color}"></span>` +
      `<span class="cat-name">${cat.label}</span>` +
      `<span class="cat-pct">${rec.awareness}%</span>`;
    list.appendChild(li);
  }
}

renderTopCards();
renderTotalAppeal();
renderAttributes();
renderAppeal();
renderPowerFactors();

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
