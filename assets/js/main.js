document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("allCards");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const searchInput = document.getElementById("searchInput");
  const resetSearchBtn = document.getElementById("resetSearchBtn");
  const searchBtn = document.getElementById("searchBtn");
  const cardCountEl = document.getElementById("cardCount");
  const toggleSortBtn = document.getElementById("toggleSortBtn");
  const homeBtn = document.getElementById("homeBtn");

  let currentIndex = 0;
  const batchSize = 12;
  let sortOrder = "newest"; // newest | oldest

  // data/* 에서 로드된 전역 배열들을 합치기
  const all = [].concat(
    typeof releasesCards !== 'undefined' ? releasesCards : [],
    typeof broadcastStageCards !== 'undefined' ? broadcastStageCards : [],
    typeof officialChannelCards !== 'undefined' ? officialChannelCards : [],
    typeof originalVarietyCards !== 'undefined' ? originalVarietyCards : [],
    typeof recordingBehindCards !== 'undefined' ? recordingBehindCards : [],
    typeof specialReleasesCards !== 'undefined' ? specialReleasesCards : [],
    typeof festivalStageCards !== 'undefined' ? festivalStageCards : [],
    typeof mediaPerformanceCards !== 'undefined' ? mediaPerformanceCards : [],
    typeof mediaContentCards !== 'undefined' ? mediaContentCards : [],
    typeof liveStreamsCards !== 'undefined' ? liveStreamsCards : [],
    typeof radioPodcastCards !== 'undefined' ? radioPodcastCards : [],
    typeof interviewsCards !== 'undefined' ? interviewsCards : [],
    typeof commercialsCards !== 'undefined' ? commercialsCards : [],
    typeof etcCards !== 'undefined' ? etcCards : [],
    typeof shortsCards !== 'undefined' ? shortsCards : []
  );

  let filtered = [...all];

  function updateCardCount(count) {
    cardCountEl.textContent = `총 ${count}개 영상`;
  }

  function applySearch() {
    const normalize = str => str.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '').replace(/\s+/g, '');
    const rawKeywords = searchInput.value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(Boolean);
    const keywords = rawKeywords.map(k => normalize(k));

    filtered = all.filter(c => {
      const combinedText = normalize(c.title + c.member);
      return keywords.every(k => combinedText.includes(k));
    });

    sortAndRender();
  }

  function sortAndRender() {
    filtered.sort((a, b) => {
      const dateA = new Date(a.date || '2000-01-01');
      const dateB = new Date(b.date || '2000-01-01');
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    currentIndex = 0;
    renderCards(filtered);
  }

  function renderCards(cards) {
    container.innerHTML = '';
    cards.slice(0, currentIndex + batchSize).forEach(data => {
      const card = document.createElement("a");
      card.className = "card";
      card.innerHTML = `
        <div class="card-meta"><div class="meta-category">${data.category}</div></div>
        <div class="thumbnail-wrapper"><img src="${data.thumbnail}" alt="${data.alt}"><div class="duration-overlay">${data.duration || ''}</div></div>
        <div class="card-title">${data.title}</div>
        <div class="card-member">#${data.member}</div>
      `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(data.link, "_blank");
      });
      container.appendChild(card);

      const img = card.querySelector("img");
      img.onload = function () {
        const isVertical = img.naturalHeight > img.naturalWidth;
        img.style.objectFit = isVertical ? 'contain' : 'cover';
        img.style.backgroundColor = '#000';
      };
    });

    currentIndex += batchSize;
    loadMoreBtn.style.display = currentIndex >= cards.length ? "none" : "block";
    updateCardCount(cards.length);
  }

  toggleSortBtn.addEventListener("click", () => {
    sortOrder = sortOrder === "newest" ? "oldest" : "newest";
    toggleSortBtn.textContent = sortOrder === "newest" ? "최신순" : "오래된순";
    sortAndRender();
  });

  loadMoreBtn.addEventListener("click", () => {
    renderCards(filtered);
  });

  searchBtn.addEventListener("click", applySearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applySearch();
  });

  resetSearchBtn.addEventListener("click", () => location.reload());
  scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  homeBtn.addEventListener("click", () => { location.href = 'index.html'; });

  sortAndRender();
});