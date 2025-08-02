const container = document.getElementById("allCards");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const cardCountEl = document.getElementById("cardCount");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetSearchBtn");
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    const videoOverlay = document.getElementById("videoOverlay");
    const videoFrame = document.getElementById("videoFrame");
    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    let currentIndex = 0;
    const batchSize = 20;
    let filtered = [];
    let sortOrder = "newest";
    const all = typeof shortsCards !== "undefined" ? shortsCards : [];

    let currentCardIndex = -1;
    let startY = 0;

    function updateCardCount(count) {
      cardCountEl.textContent = `총 ${count}개 영상`;
    }

    function renderCards(data) {
      const next = data.slice(currentIndex, currentIndex + batchSize);
      next.forEach(card => {
        const el = document.createElement('a');
        el.className = 'card';
        el.href = card.link;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
        el.innerHTML = `
          <div class="thumbnail-wrapper">
            <img src="${card.thumbnail}" alt="${card.alt}" loading="lazy">
            <div class="duration-overlay">${card.duration || ''}</div>
          </div>
          <div class="card-title">${card.title}</div>
          ${card.member ? `<div class="card-member">#${card.member}</div>` : ''}
        `;
        el.onclick = e => {
          const videoId = extractYouTubeID(card.link);
          if (videoId) {
            e.preventDefault();
            currentCardIndex = filtered.indexOf(card);
            openOverlay(card);
          }
        };
        container.appendChild(el);
      });
      currentIndex += batchSize;
      loadMoreBtn.style.display = currentIndex >= data.length ? 'none' : 'block';
      updateCardCount(data.length);
    }

    function extractYouTubeID(url) {
      const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }

    function createFilterButtons(containerId, items) {
      const filterContainer = document.getElementById(containerId);
      filterContainer.innerHTML = '';
      items.forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item;
        btn.className = "category-btn";
        btn.onclick = () => {
          btn.classList.toggle("active");
          applyFilters();
        };
        filterContainer.appendChild(btn);
      });
    }

    function applyFilters() {
  const keywordInput = searchInput.value;
  const normalize = str => str.toLowerCase()
    .replace(/[^\uac00-\ud7af\u4e00-\u9fff\u0e00-\u0e7f\w]+/g, '')
    .replace(/\s+/g, '');

  const rawKeywords = keywordInput.toLowerCase()
    .replace(/[^\uac00-\ud7af\u4e00-\u9fff\u0e00-\u0e7f\w]+/g, ' ')
    .split(/\s+/).filter(Boolean);
  const normalizedKeywords = rawKeywords.map(k => normalize(k));

  const yearBtns = document.querySelectorAll("#yearFilters .category-btn.active");
  const monthBtns = document.querySelectorAll("#monthFilters .category-btn.active");

  const years = Array.from(yearBtns).map(b => b.textContent);
  const months = Array.from(monthBtns).map(b => b.textContent);

  filtered = all.filter(card => {
    if (normalizedKeywords.length) {
      const targetText = normalize(card.title + ' ' + card.member);
      if (!normalizedKeywords.every(k => targetText.includes(k))) return false;
    }

    const [y, m] = (card.date || '').split('-');
    if (years.length && !years.includes(y)) return false;
    if (months.length && !months.includes(m)) return false;

    return true;
  });

  filtered.sort((a, b) => {
    const dateA = new Date(a.date || '2000-01-01');
    const dateB = new Date(b.date || '2000-01-01');
    return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
  });

  currentIndex = 0;
  container.innerHTML = '';
  renderCards(filtered);
}


    function findNextPlayableIndex(startIndex, direction) {
      let index = startIndex;
      while (index >= 0 && index < filtered.length) {
        if (!filtered[index].link.includes("tiktok.com")) {
          return index;
        }
        index += direction;
      }
      return -1;
    }

    function openOverlay(card) {
      const videoId = extractYouTubeID(card.link);
      if (videoId) {
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        videoOverlay.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    }

    prevBtn.onclick = () => {
      const prevIndex = findNextPlayableIndex(currentCardIndex - 1, -1);
      if (prevIndex !== -1) {
        currentCardIndex = prevIndex;
        openOverlay(filtered[currentCardIndex]);
      }
    };

    nextBtn.onclick = () => {
      const nextIndex = findNextPlayableIndex(currentCardIndex + 1, 1);
      if (nextIndex !== -1) {
        currentCardIndex = nextIndex;
        openOverlay(filtered[currentCardIndex]);
      }
    };

    
    closeBtn.onclick = () => {
      videoOverlay.style.display = "none";
      videoFrame.src = "";
      document.body.style.overflow = "";
    };

    window.onload = function () {
      createFilterButtons("yearFilters", ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "PRE-DEBUT"]);
      createFilterButtons("monthFilters", ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
      searchBtn.onclick = applyFilters;
      searchInput.onkeydown = e => { if (e.key === "Enter") applyFilters(); };
      resetBtn.onclick = () => location.reload();
      scrollTopBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
      document.getElementById("toggleSortBtn").onclick = () => {
        sortOrder = sortOrder === "newest" ? "oldest" : "newest";
        document.getElementById("toggleSortBtn").textContent = sortOrder === "newest" ? "최신순" : "오래된순";
        applyFilters();
      };
      loadMoreBtn.onclick = () => renderCards(filtered);
      applyFilters();
    };
