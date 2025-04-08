/* eslint-disable no-undef */
/**
 * control layers outside the map
 */

// config map
let config = {
  minZoom: 7,
  maxZoom: 18,
  fullscreenControl: true
};
// magnification with which the map will start
const zoom = 18;
// co-ordinates
const lat = 10.8231;
const lng = 106.6297;

// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Tạo biến để lưu trữ marker vị trí của người dùng
let userLocationMarker;
let userLocationCircle;

// Thêm nút hiển thị vị trí người dùng
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

// Hàm lấy vị trí hiện tại của người dùng
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      // Thành công
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Xóa marker và circle cũ nếu đã tồn tại
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }
        if (userLocationCircle) {
          map.removeLayer(userLocationCircle);
        }

        // Tạo marker vị trí người dùng
        userLocationMarker = L.marker([userLat, userLng], {
          icon: L.divIcon({
            className: 'user-location',  // Thêm lớp CSS để tạo kiểu
            html: "<span class='emoji'>📍</span>",  // Biểu tượng vị trí người dùng
            iconSize: [40, 40],  // Điều chỉnh kích thước tổng thể của icon
            iconAnchor: [20, 20],  // Căn giữa icon (x,y vị trí giữa của icon)
            popupAnchor: [0, -25],  // Điều chỉnh vị trí popup
          })
        }).addTo(map)
          .bindPopup('Vị trí của bạn')
          .openPopup();

        // Tạo circle hiển thị độ chính xác
        userLocationCircle = L.circle([userLat, userLng], {
          radius: accuracy,
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.15
        }).addTo(map);

        // Di chuyển map đến vị trí người dùng
        map.setView([userLat, userLng], zoom);
      },
      // Lỗi
      function (error) {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Người dùng đã từ chối yêu cầu truy cập vị trí.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thông tin vị trí không có sẵn.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Yêu cầu lấy vị trí người dùng đã hết thời gian.';
            break;
          case error.UNKNOWN_ERROR:
            errorMessage = 'Đã xảy ra lỗi không xác định.';
            break;
        }
        alert(errorMessage);
      },
      // Tùy chọn
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  } else {
    alert('Trình duyệt của bạn không hỗ trợ định vị.');
  }
}

// ------------------------------------------------------------

// async function to load geojson
// Fetch dữ liệu GeoJSON từ API (lấy từ database qua Django)
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Lỗi khi fetch dữ liệu:", err);
  }
}

// Nhóm layer hiển thị các POI
const poiLayers = L.layerGroup().addTo(map);

// Khi nhấn vào marker -> zoom vào
function clickZoom(e) {
  map.setView(e.target.getLatLng(), zoom);
}

const layersContainer = document.querySelector(".layers");
const layersButton = "all layers";
const arrayLayers = ["cinema"]; // danh sách layer

// Tạo checkbox cho từng lớp
function generateButton(name) {
  const id = name === layersButton ? "all-layers" : name;

  const templateLayer = `
    <li class="layer-element">
      <label for="${id}">
        <input type="checkbox" id="${id}" name="item" class="item" value="${name}" checked>
        <span>${name}</span>
      </label>
    </li>
  `;

  layersContainer.insertAdjacentHTML("beforeend", templateLayer);

  const checkbox = document.querySelector(`#${id}`);
  checkbox.addEventListener("change", (e) => {
    showHideLayer(e.target);
  });
}

generateButton(layersButton);

// Tải dữ liệu từ Django API
arrayLayers.map((cinema) => {
  generateButton(cinema);

  // ✅ Đường dẫn đúng theo Django URL patterns
  fetchData(`/maps/api/geojson/${cinema}/`)
    .then((data) => {
      if (!data) return; // kiểm tra có dữ liệu không
      const layer = L.geoJSON(data, geojsonOpts).addTo(map);
      window["layer_" + cinema] = layer;
    });
});

// Xử lý khi checkbox được nhấn
document.addEventListener("click", (e) => {
  const target = e.target;
  const itemInput = target.closest(".item");
  if (!itemInput) return;
  showHideLayer(target);
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

  const checkedBoxes = document.querySelectorAll("input[name=item]:checked");
  document.querySelector("#all-layers").checked =
    checkedBoxes.length === arrayLayers.length;
}

function checkedType(id, type) {
  const layer = window["layer_" + id];
  if (!layer) {
    console.warn(`Layer "${id}" chưa load xong!`);
    return;
  }

  if (type) {
    map.addLayer(layer);
    map.fitBounds(layer.getBounds(), { padding: [50, 50] });
  } else {
    map.removeLayer(layer);
  }

  document.querySelector(`#${id}`).checked = type;
}


// Thêm thư viện Leaflet Routing Machine nếu chưa có
// < link rel = "stylesheet" href = "https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
//   <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
let routingControl; // Biến lưu tuyến đường
// Hàm chỉ đường từ vị trí hiện tại đến một điểm đích (rạp chiếu phim)
function routeToDestination(destination) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        // Xóa tuyến đường cũ nếu có
        if (routingControl) {
          map.removeControl(routingControl);
        }
        //Tạo tuyến đường mới
        routingControl = L.Routing.control({
          waypoints: [L.latLng(userLat, userLng), destination], // Từ vị trí người dùng đến rạp
          routeWhileDragging: true,
          createMarker: function () { return null; }, // Không hiển thị marker mặc định
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

// Cập nhật sự kiện click trên rạp chiếu phim
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
              </option>`
        ).join("")}
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

// Xử lý dropdown chọn phim

function handleMovieSelect(event, featureId) {
  const index = event.target.value;
  const detailDiv = document.getElementById(`movie-detail-${featureId}`);
  const feature = geojsonLayer.getLayer(featureId)?.feature;

  if (!feature || !feature.properties.lich_chieu || index === "") {
    detailDiv.innerHTML = "";
    return;
  }

  const item = feature.properties.lich_chieu[index];
  detailDiv.innerHTML = `
    <b>${item.ten_phim}</b><br>
    Thể loại: ${item.the_loai}<br>
    Thời lượng: ${item.thoi_luong} phút<br>
    🕒 Giờ chiếu: ${item.gio_chieu}
  `;
}



