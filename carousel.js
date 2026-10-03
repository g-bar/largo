// News carousel.
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

window.addEventListener("resize", () => layoutNews(false));
