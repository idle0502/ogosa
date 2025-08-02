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

    let filtered = [], sortOrder = "newest", currentIndex = 0;
    const batchSize = 20;
    const container = document.getElementById("allCards");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const cardCountEl = document.getElementById("cardCount");
    const mainTitle = document.getElementById("mainTitle");

    function extractDate(title) {
      const match = title.match(/\((\d{4}-\d{2}-\d{2})\)/);
      return match ? match[1] : '2000-01-01';
    }

    function updateCardCount(count) {
      cardCountEl.textContent = `총 ${count}개 영상`;
    }

    function renderCards(data) {
      const next = data.slice(currentIndex, currentIndex + batchSize);
      if (!next.length) { loadMoreBtn.style.display = 'none'; return; }

      next.forEach(card => {
        const el = document.createElement('a');
        el.className = 'card';
        el.innerHTML = `
          <div class="thumbnail-wrapper">
            <img src="${card.thumbnail || ''}" alt="${card.title}" loading="lazy">
            <div class="duration-overlay">${card.duration || ''}</div>
          </div>
          <div class="card-text">
            <div class="card-title">${card.title}</div>
            ${card.member ? `<div class="card-member">#${card.member}</div>` : ''}
          </div>
        `;
        el.onclick = e => { e.preventDefault(); window.open(card.link, '_blank'); };
        container.appendChild(el);

        const img = el.querySelector('img');
        img.onload = () => {
          const isVertical = img.naturalHeight > img.naturalWidth;
          img.style.objectFit = isVertical ? 'contain' : 'cover';
          img.style.backgroundColor = '#000';
        };
        // ✅ Robust thumbnail fallback chain
        img.onerror = () => {
          const u = img.src || '';
          // 1) Force HTTPS if needed
          if (u.startsWith('http://')) { img.src = u.replace('http://', 'https://'); return; }
          // 2) YouTube thumbnail fallbacks
          if (u.includes('/maxresdefault.jpg')) { img.src = u.replace('/maxresdefault.jpg', '/sddefault.jpg'); return; }
          if (u.includes('/sddefault.jpg')) { img.src = u.replace('/sddefault.jpg', '/hqdefault.jpg'); return; }
          if (u.includes('/hqdefault.jpg')) { img.src = u.replace('/hqdefault.jpg', '/mqdefault.jpg'); return; }
          if (u.includes('/mqdefault.jpg')) { img.src = u.replace('/mqdefault.jpg', '/default.jpg'); return; }
          // 3) As last resort, placeholder
          img.src = 'images/placeholder-thumb.jpg';
        };
      });

      currentIndex += batchSize;
      loadMoreBtn.style.display = currentIndex >= data.length ? 'none' : 'block';
      updateCardCount(data.length);
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
  const selectedCategory = new URLSearchParams(window.location.search).get("category") || "";
  const keyword = document.getElementById("searchInput").value;

  const normalize = str => str.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '').replace(/\s+/g, '');
  const keywords = keyword.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(/\s+/).filter(Boolean).map(normalize);

  const yearBtns = document.querySelectorAll("#yearFilters .category-btn.active");
  const monthBtns = document.querySelectorAll("#monthFilters .category-btn.active");
  const years = Array.from(yearBtns).map(b => b.textContent);
  const months = Array.from(monthBtns).map(b => b.textContent);

  filtered = all.filter(card => {
    if (card.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (keywords.length && !keywords.every(k => normalize(card.title + ' ' + card.member).includes(k))) return false;

    const cardYear = (card.date || extractDate(card.title)).slice(0, 4);
    const cardMonth = (card.date || extractDate(card.title)).slice(5, 7);
    if (years.length && !years.includes(cardYear)) return false;
    if (months.length && !months.includes(cardMonth)) return false;
    return true;
  });

      filtered.sort((a, b) => {
        const dateA = new Date(a.date || extractDate(a.title));
        const dateB = new Date(b.date || extractDate(b.title));
        return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
      });

      currentIndex = 0;
      container.innerHTML = '';
      renderCards(filtered);
    }

    window.onload = () => {
      const selectedCategory = new URLSearchParams(window.location.search).get("category") || "";
      mainTitle.textContent = selectedCategory || "전체 영상";
      createFilterButtons("yearFilters", ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "PRE-DEBUT"]);
      createFilterButtons("monthFilters", ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);

      document.getElementById("searchBtn").onclick = applyFilters;
      document.getElementById("searchInput").onkeydown = e => { if (e.key === "Enter") applyFilters(); };
      document.getElementById("resetSearchBtn").onclick = () => location.reload();
      document.getElementById("scrollTopBtn").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
      document.getElementById("toggleSortBtn").onclick = () => {
        sortOrder = sortOrder === "newest" ? "oldest" : "newest";
        document.getElementById("toggleSortBtn").textContent = sortOrder === "newest" ? "최신순" : "오래된순";
        applyFilters();
      };
      loadMoreBtn.onclick = () => renderCards(filtered);
      applyFilters();
    };
