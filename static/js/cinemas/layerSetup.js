// layerSetup.js
import { map } from './mapCore.js';
import { zoom } from './mapConfig.js';

// Hàm xử lý chọn phim (đặt ở đây để dễ truy cập feature)
function handleMovieSelect(event, featureId) {
    const selectedIndex = event.target.value;
    const detailDiv = document.getElementById(`movie-detail-${featureId}`);

    // Cách truy cập feature gốc là thông qua 'this' của bindPopup hoặc tìm layer
    // Tìm layer chứa popup đang mở (cách này không ổn định lắm)
    let currentFeature = null;
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.getPopup() && layer.getPopup().isOpen()) {
            if (layer.feature && layer.feature.id == featureId) { // Giả sử feature có id trùng
                currentFeature = layer.feature;
            }
        } else if (layer instanceof L.GeoJSON) { // Nếu popup mở từ layer group
            layer.eachLayer(marker => {
                if (marker.feature && marker.feature.id == featureId && marker.getPopup() && marker.getPopup().isOpen()) {
                    currentFeature = marker.feature;
                }
            });
        }
    });

    // Nếu không tìm được, thử truy cập qua biến global (nếu có) - không khuyến khích
    // currentFeature = window.lastClickedFeature; // Cần gán biến này ở đâu đó

    if (!detailDiv) { // Bỏ kiểm tra feature vì khó lấy chính xác ở đây
        console.error("Could not find details div for", featureId);
        return;
    }

    // Lấy dữ liệu phim (cần có cách lấy feature đáng tin cậy)
    // Giả sử currentFeature đã lấy được ở trên
    const lichChieu = currentFeature?.properties?.lich_chieu || [];


    if (selectedIndex === "" || !currentFeature) {
        detailDiv.innerHTML = ""; // Clear details
    } else {
        const movie = lichChieu[parseInt(selectedIndex, 10)];
        if (movie) {
            detailDiv.innerHTML = `
                <b>Phim:</b> ${movie.ten_phim}<br>
                <b>Giờ chiếu:</b> ${movie.gio_chieu}<br>
                <b>Thể loại:</b> ${movie.the_loai}<br>
                
                
            `;
        } else {
            detailDiv.innerHTML = "<em>Không có thông tin chi tiết.</em>";
        }
    }
}
// Gán vào window để onclick trong HTML string gọi được
window.handleMovieSelect = handleMovieSelect;

// Hàm clickZoom gốc
export function clickZoom(e) {
    map.setView(e.target.getLatLng(), zoom);
}

// Khai báo biến geojsonOpts gốc (dùng var để giống scope gốc)
// và gán vào window để file khác dùng được (cách giữ code gốc)
var geojsonOpts = {
    pointToLayer: function (feature, latlng) {
        // Gán feature.id nếu chưa có để handleMovieSelect có thể dùng
        if (!feature.id) feature.id = L.Util.stamp(feature);

        return L.marker(latlng, {
            icon: L.divIcon({
                className: "cinema-icon",
                html: "<span class='emoji'>🎥</span>",
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -25],
            }),
        }).bindPopup(function (layer) { // Dùng function thường để có 'this'
            // Gán feature vào layer để dễ truy cập sau này nếu cần
            layer.feature = feature;
            // Có thể gán vào biến global tạm thời khi popup mở (không khuyến khích)
            // window.lastClickedFeature = feature;


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

            // Gọi hàm routeToDestination từ global scope (window)
            return `
          🎥 <b>Rạp chiếu phim</b><br>
          <b>${feature.properties.name}</b><br>
          <em>${feature.properties.address}</em><br>
          <p>${feature.properties.description || ''}</p>
          ${dropdownHtml}
          <br><br>
          <button onclick="window.routeToDestination([${latlng.lat}, ${latlng.lng}])">Chỉ đường</button>
        `;
        }).on("click", clickZoom); // Giữ nguyên on click gọi clickZoom
    },
};

// Gán vào window để các file khác (nearestCinema) có thể truy cập
window.geojsonOpts = geojsonOpts;

console.log("Layer setup (geojsonOpts) done.");