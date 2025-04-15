/* eslint-disable no-undef */
/**
 * control layers inside the map
 */

// config map
let config = {
  minZoom: 7,
  maxZoom: 18,
  fullscreenControl: true
};

const zoom = 18;
const lat = 10.8231;
const lng = 106.6297;

const map = L.map("map", config).setView([lat, lng], zoom);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let userLocationMarker;
let userLocationCircle;
let nearestCinemaLayer = null;
let nearestCinemaRouting = null;

const locationButton = L.control({ position: 'topleft' });
locationButton.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
  div.innerHTML = '<a href="#" title="Hiển thị vị trí của tôi" style="font-size: 18px;">📍</a>';
  div.style.background = 'white';
  div.style.cursor = 'pointer';

  div.onclick = function () {
    getCurrentLocation();
    return false;
  };

  return div;
};
locationButton.addTo(map);

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (userLocationMarker) map.removeLayer(userLocationMarker);
        if (userLocationCircle) map.removeLayer(userLocationCircle);

        userLocationMarker = L.marker([userLat, userLng], {
          icon: L.divIcon({
            className: 'user-location',
            html: "<span class='emoji'>📍</span>",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -25],
          })
        }).addTo(map).bindPopup('Vị trí của bạn').openPopup();

        userLocationCircle = L.circle([userLat, userLng], {
          radius: accuracy,
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.15
        }).addTo(map);

        map.setView([userLat, userLng], zoom);
      },
      function (error) {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Người dùng đã từ chối yêu cầu truy cập vị trí.'; break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không có sẵn.'; break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí người dùng đã hết thời gian.'; break;
          default:
            errorMessage = 'Đã xảy ra lỗi không xác định.'; break;
        }
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    alert('Trình duyệt của bạn không hỗ trợ định vị.');
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Lỗi khi fetch dữ liệu:", err);
  }
}

const poiLayers = L.layerGroup().addTo(map);
function clickZoom(e) {
  map.setView(e.target.getLatLng(), zoom);
}

const layersButton = "all layers";
const arrayLayers = ["cinema", "nearest"];

const layerControl = L.control({ position: 'topright' });
layerControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-layer-control');
  div.innerHTML = `
    <a href="#" title="Lớp hiển thị" style="font-size: 18px;">🗂️</a>
    <div class="layer-dropdown" style="display:none; background:white; padding: 5px; border-radius: 4px; margin-top: 5px;">
      <ul id="layer-list" style="list-style: none; padding: 0; margin: 0;"></ul>
    </div>
  `;
  div.onclick = function (e) {
    e.stopPropagation();
    const dropdown = div.querySelector('.layer-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  };
  L.DomEvent.disableClickPropagation(div);
  return div;
};
layerControl.addTo(map);

function generateButton(name) {
  const id = name === layersButton ? "all-layers" : name;
  const container = document.getElementById("layer-list");

  const templateLayer = `
    <li class="layer-element" style="margin-bottom: 5px;">
      <label for="${id}">
        <input type="checkbox" id="${id}" name="item" class="item" value="${name}">
        <span>${name}</span>
      </label>
    </li>
  `;

  container.insertAdjacentHTML("beforeend", templateLayer);

  const checkbox = document.querySelector(`#${id}`);
  checkbox.addEventListener("change", (e) => {
    showHideLayer(e.target);
  });
}

generateButton(layersButton);
arrayLayers.forEach((layerName) => {
  generateButton(layerName);

  if (layerName !== "nearest") {
    fetchData(`/maps/api/geojson/${layerName}/`).then((data) => {
      if (!data) return;
      const layer = L.geoJSON(data, geojsonOpts).addTo(map);
      window["layer_" + layerName] = layer;
    });
  }
});

document.addEventListener("click", function () {
  const dropdown = document.querySelector(".layer-dropdown");
  if (dropdown) dropdown.style.display = "none";
});

function showHideLayer(target) {
  const id = target.id;

  if (id === "all-layers") {
    arrayLayers.forEach((layerName) => {
      checkedType(layerName, target.checked);
    });
  } else {
    checkedType(id, target.checked);
  }
}

function checkedType(id, type) {
  if (id === "nearest") {
    if (type) {
      showNearestCinema();
    } else {
      if (nearestCinemaLayer) map.removeLayer(nearestCinemaLayer);
      if (nearestCinemaRouting) map.removeControl(nearestCinemaRouting);
    }
    return;
  }

  const layer = window["layer_" + id];
  if (!layer) return;

  if (type) {
    map.addLayer(layer);
    map.fitBounds(layer.getBounds(), { padding: [50, 50] });
  } else {
    map.removeLayer(layer);
  }
}

function showNearestCinema() {
  if (!navigator.geolocation) {
    alert("Trình duyệt không hỗ trợ định vị.");
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    const userLatLng = [position.coords.latitude, position.coords.longitude];
    let nearestLayer = null;
    let minDistance = Infinity;

    window["layer_cinema"].eachLayer(function (layer) {
      const cinemaLatLng = layer.getLatLng();
      const distance = map.distance(userLatLng, cinemaLatLng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLayer = layer;
      }
    });

    if (nearestLayer) {
      if (nearestCinemaLayer) map.removeLayer(nearestCinemaLayer);
      if (nearestCinemaRouting) map.removeControl(nearestCinemaRouting);

      const nearestFeature = nearestLayer.feature;
      nearestCinemaLayer = L.geoJSON(nearestFeature, geojsonOpts).addTo(map);
      map.setView(nearestLayer.getLatLng(), 15);
      nearestCinemaLayer.openPopup();

      nearestCinemaRouting = L.Routing.control({
        waypoints: [L.latLng(userLatLng), nearestLayer.getLatLng()],
        routeWhileDragging: false,
        createMarker: () => null,
      }).addTo(map);
    } else {
      alert("Không tìm thấy rạp nào gần bạn.");
    }
  }, function () {
    alert("Không thể lấy vị trí hiện tại của bạn.");
  });
}

let routingControl;
function routeToDestination(destination) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        if (routingControl) map.removeControl(routingControl);
        routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLng), destination],
          routeWhileDragging: true,
          createMarker: () => null,
        }).addTo(map);
      },
      function () {
        alert("Không thể lấy vị trí của bạn!");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  } else {
    alert("Trình duyệt của bạn không hỗ trợ định vị.");
  }
}

geojsonOpts = {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.divIcon({
        className: "cinema-icon",
        html: "<span class='emoji'>🎥</span>",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
      }),
    }).bindPopup(function () {
      let lichChieu = feature.properties.lich_chieu || [];

      let dropdownHtml = "<em>Chưa có lịch chiếu</em>";
      if (lichChieu.length > 0) {
        dropdownHtml = `
          <label for="movie-select-${feature.id}"><b>Danh sách phim:</b></label><br>
          <select id="movie-select-${feature.id}" onchange="handleMovieSelect(event, '${feature.id}')">
            <option value="">-- Phim đang chiếu --</option>
            ${lichChieu.map((item, index) =>
          `<option value="${index}">
                ${item.ten_phim} (${item.gio_chieu})
              </option>`).join("")}
          </select>
          <div id="movie-detail-${feature.id}" style="margin-top: 10px; font-size: 0.9em;"></div>
        `;
      }

      return `
        🎥 <b>Rạp chiếu phim</b><br>
        <b>${feature.properties.name}</b><br>
        <em>${feature.properties.address}</em><br>
        <p>${feature.properties.description || ''}</p>
        ${dropdownHtml}
        <br><br>
        <button onclick="routeToDestination([${latlng.lat}, ${latlng.lng}])">Chỉ đường</button>
      `;
    }).on("click", function () {
      map.setView(latlng, zoom);
    });
  },
};
