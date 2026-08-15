const list = document.getElementById("list");

let allPlaces = [];
let itineraries = [];
let currentDay = "intro";
let currentType = "all";

/* 類型對應名稱 */
const typeMap = {
  attraction: "🏛️ 景點",
  restaurant: "🍜 美食 PIT",
  transportation: "🏎️ 交通",
  accommodation: "🏨 基地",
  store: "🛍️ 購物",
  shop: "🛍️ 購物"
};

/* 載入資料 */
async function loadData() {
  try {
    const placesRes = await fetch("./data/places.json");
    const itineraryRes = await fetch("./data/itinerary.json");

    allPlaces = await placesRes.json();
    itineraries = await itineraryRes.json();

    render();
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p style='text-align:center; padding:20px; color: var(--f1-red); font-family: Orbitron;'>⚠️ TELEMETRY DATA LOAD FAILED</p>";
  }
}

/* 渲染清單 */
function render() {
  list.innerHTML = "";

  const dayData = itineraries.find(d => d.day === currentDay);
  if (!dayData || !dayData.places) {
    list.innerHTML = "<p style='text-align:center; color: var(--f1-text-muted); padding:30px; font-family: Orbitron;'>NO SESSION DATA FOR THIS DAY.</p>";
    return;
  }

  const filteredPlaces = dayData.places
    .map(placeId => allPlaces.find(p => p.id === placeId))
    .filter(place => {
      if (!place) return false;
      if (currentType === "all") return true;
      if (currentType === "store") return place.type === "store" || place.type === "shop";
      return place.type === currentType;
    });

  if (filteredPlaces.length === 0) {
    list.innerHTML = "<p style='text-align:center; color: var(--f1-text-muted); padding:30px; font-family: Orbitron;'>NO PIT STOPS IN THIS CATEGORY.</p>";
    return;
  }

  filteredPlaces.forEach(place => {
    const card = document.createElement("article");
    const pType = place.type || "attraction";
    card.className = `card card-${pType}`;

    const typeLabel = typeMap[pType] || "📍 景點";

    card.innerHTML = `
      <div class="card-header">
        <div class="card-header-left">
          <h3>${place.name}</h3>
        </div>
        <div class="card-header-right">
          <span class="card-type">${typeLabel}</span>
          <span class="toggle-icon">▼</span>
        </div>
      </div>
      
      <div class="card-details">
        ${place.description ? `<p>${place.description}</p>` : ""}

        ${place.opening_hours ? `<p><strong>⏱️ 營業時間：</strong>${place.opening_hours}</p>` : ""}
        ${place.transport ? `<p><strong>🏎️ 交通接駁：</strong>${place.transport}</p>` : ""}

        ${
          place.tips && place.tips.length > 0
            ? `
              <p><strong>🏁 戰術與注意事項：</strong></p>
              <ul>
                ${place.tips.map(t => `<li>${t}</li>`).join("")}
              </ul>
            `
            : ""
        }

        ${
          place.map_url
            ? `<button class="map-btn" data-url="${place.map_url}">📡 LAUNCH GPS NAVIGATION</button>`
            : ""
        }
      </div>
    `;

    // 展開/收合卡片
    card.querySelector(".card-header").onclick = () => {
      const isOpen = card.classList.contains("open");
      
      document.querySelectorAll(".card.open").forEach(c => {
        if (c !== card) c.classList.remove("open");
      });

      card.classList.toggle("open", !isOpen);
    };

    // Google 地圖按鈕防止事件冒泡
    const mapBtn = card.querySelector(".map-btn");
    if (mapBtn) {
      mapBtn.onclick = (e) => {
        e.stopPropagation();
        window.open(place.map_url, "_blank");
      };
    }

    list.appendChild(card);
  });
}

/* Day 切換 */
document.querySelectorAll("#tabs button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDay = btn.dataset.day;
    render();
  };
});

/* 類型切換 */
document.querySelectorAll("#filters button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#filters button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    render();
  };
});

loadData();
