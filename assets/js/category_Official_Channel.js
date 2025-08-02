const container = document.getElementById("allCards");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const cardCountEl = document.getElementById("cardCount");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetSearchBtn");
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    const subtagFilter = document.getElementById("subtagFilter");

    let currentIndex = 0;
    const batchSize = 20;
    let filtered = [];
    let sortOrder = "newest";
    let selectedSubtag = "";

    const all = typeof officialChannelCards !== "undefined" ? officialChannelCards : [];

    function updateCardCount(count) {
      cardCountEl.textContent = `총 ${count}개 영상`;
    }

    function renderCards(data) {
      const next = data.slice(currentIndex, currentIndex + batchSize);
      next.forEach(card => {
        const el = document.createElement('a');
        el.className = 'card';
        el.innerHTML = `
          <div class="thumbnail-wrapper">
            <img src="${card.thumbnail}" alt="${card.alt}" loading="lazy">
            <div class="duration-overlay">${card.duration || ''}</div>
          </div>
          <div class="card-title">${card.title}</div>
          ${card.member ? `<div class="card-member">#${card.member}</div>` : ''}
        `;
        el.onclick = e => { e.preventDefault(); window.open(card.link, '_blank'); };
        container.appendChild(el);

        const img = el.querySelector('img');
        img.onload = () => {
          const isVertical = img.naturalHeight > img.naturalWidth;
          img.style.objectFit = isVertical ? 'contain' : 'cover';
          img.style.backgroundColor = '#000';
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
  const normalize = str => str.toLowerCase()
    .replace(/[^\uac00-\ud7af\u4e00-\u9fff\u0e00-\u0e7f\w]+/g, '')
    .replace(/\s+/g, '');

  const keywords = searchInput.value.toLowerCase()
    .replace(/[^\uac00-\ud7af\u4e00-\u9fff\u0e00-\u0e7f\w]+/g, ' ')
    .split(/\s+/).filter(Boolean)
    .map(normalize);

  const yearBtns = document.querySelectorAll("#yearFilters .category-btn.active");
  const monthBtns = document.querySelectorAll("#monthFilters .category-btn.active");

  const years = Array.from(yearBtns).map(b => b.textContent);
  const months = Array.from(monthBtns).map(b => b.textContent);

  filtered = all.filter(card => {
    if (selectedSubtag && normalize(card.subtag || '') !== normalize(selectedSubtag)) return false;
    if (keywords.length && !keywords.every(k => normalize(card.title + ' ' + card.member).includes(k))) return false;

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


    window.onload = () => {
      createFilterButtons("yearFilters", ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "PRE-DEBUT"]);
      createFilterButtons("monthFilters", ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);

      subtagFilter.addEventListener("change", () => { selectedSubtag = subtagFilter.value; applyFilters(); });
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
