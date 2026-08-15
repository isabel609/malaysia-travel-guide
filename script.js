const list = document.getElementById("list");

let allPlaces = [];
let itineraries = [];
let currentDay = "intro";
let currentType = "all";

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
    list.innerHTML = "<p>❌ 資料載入失敗</p>";
  }
}

/* 主畫面（穩定版本） */
function render() {
  list.innerHTML = "";

  const dayData = itineraries.find(d => d.day === currentDay);
  if (!dayData || !dayData.places) return;

  dayData.places.forEach(placeId => {
    const place = allPlaces.find(p => p.id === placeId);
    if (!place) return;

    if (currentType !== "all" && place.type !== currentType) return;

    const card = document.createElement("div");
    card.className = `card card-${place.type}`;

    card.innerHTML = `
      <div class="card-header">
        <h3>${place.name}</h3>
        <span class="card-type">
          ${place.type === "restaurant" ? "餐廳" : 
            place.type === "transportation" ? "交通" :
            place.type === "attraction" ? "景點" :
            place.type === "accommodation" ? "住宿"
            : "店鋪"
          }
        </span>
      </div>
      
      <div class="card-details">
        <p>${place.description || ""}</p>

        ${place.opening_hours ? `<p><strong>⏰ 營業時間：</strong>${place.opening_hours}</p>` : ""}
        ${place.transport ? `<p><strong>🚇 交通方式：</strong>${place.transport}</p>` : ""}

        ${
          place.tips
            ? `
              <p><strong>⚠ 注意事項：</strong></p>
              <ul>
                ${place.tips.map(t => `<li>${t}</li>`).join("")}
              </ul>
            `
            : ""
        }

        <button class="map-btn">📍 在 Google 地圖中開啟</button>
      </div>
    `;

    // 收合 / 展開
    card.querySelector(".card-header").onclick = () => {
      document.querySelectorAll(".card.open").forEach(c => {
        if (c !== card) c.classList.remove("open");
      });
      card.classList.toggle("open");
    };

    // 開 Google Maps
    card.querySelector(".map-btn").onclick = (e) => {
      e.stopPropagation();
      window.location.href = place.map_url;
    };

    list.appendChild(card);
  });
}

/* Day 分頁 */
document.querySelectorAll("#tabs button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDay = btn.dataset.day;
    render();
  };
});

/* 類型篩選 */
document.querySelectorAll("#filters button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#filters button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    render();
  };
});

/* 啟動 */
loadData();
