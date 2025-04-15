// nearestCinema.js
import { map } from './mapCore.js';
// import { geojsonOpts } from './layerSetup.js'; // Không import trực tiếp, dùng window.geojsonOpts

// Khai báo biến trạng thái cục bộ
let _nearestCinemaLayer = null;
let _nearestCinemaRouting = null;

// Hàm showNearestCinema gốc (sửa để dùng biến cục bộ)
function showNearestCinema() {
    if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ định vị.");
        return;
    }

    navigator.geolocation.getCurrentPosition(function (position) {
        const userLatLng = [position.coords.latitude, position.coords.longitude];
        let nearestLayer = null;
        let minDistance = Infinity;

        // Truy cập layer cinema qua window gốc
        const cinemaLayer = window["layer_cinema"];
        if (!cinemaLayer) {
            alert("Lớp 'cinema' chưa được tải.");
            // Bỏ check ô nearest nếu có lỗi
            const nearestCheckbox = document.getElementById('nearest');
            if (nearestCheckbox) nearestCheckbox.checked = false;
            return;
        }

        cinemaLayer.eachLayer(function (layer) {
            const cinemaLatLng = layer.getLatLng();
            // Dùng map.distance gốc
            const distance = map.distance(userLatLng, cinemaLatLng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLayer = layer;
            }
        });

        // Lấy geojsonOpts từ window
        const currentGeojsonOpts = window.geojsonOpts;
        if (!currentGeojsonOpts) {
            console.error("geojsonOpts not found on window");
            alert("Lỗi cấu hình hiển thị điểm.");
            return;
        }


        if (nearestLayer) {
            // Gọi hàm clear trước khi hiển thị cái mới
            clearNearestCinema();

            const nearestFeature = nearestLayer.feature;
            // Dùng biến cục bộ _nearestCinemaLayer
            _nearestCinemaLayer = L.geoJSON(nearestFeature, currentGeojsonOpts).addTo(map);
            map.setView(nearestLayer.getLatLng(), 15); // Giữ nguyên setView

            // Mở popup cho layer vừa thêm
            // Cần lấy đúng marker bên trong _nearestCinemaLayer (thường là layer đầu tiên)
            const marker = _nearestCinemaLayer.getLayers()[0];
            if (marker && marker.openPopup) {
                marker.openPopup();
            } else {
                console.warn("Could not find marker in nearestCinemaLayer to open popup.");
            }


            // Dùng biến cục bộ _nearestCinemaRouting
            // Cần có Leaflet Routing Machine đã được load vào global scope (L.Routing)
            if (L.Routing && L.Routing.control) {
                _nearestCinemaRouting = L.Routing.control({
                    waypoints: [L.latLng(userLatLng), nearestLayer.getLatLng()],
                    routeWhileDragging: false,
                    createMarker: () => null, // Giữ nguyên createMarker gốc
                }).addTo(map);
            } else {
                console.warn("Leaflet Routing Machine (L.Routing.control) not found.");
            }

        } else {
            alert("Không tìm thấy rạp nào gần bạn.");
            // Bỏ check ô nearest nếu không tìm thấy
            const nearestCheckbox = document.getElementById('nearest');
            if (nearestCheckbox) nearestCheckbox.checked = false;
        }
    }, function () {
        alert("Không thể lấy vị trí hiện tại của bạn.");
        // Bỏ check ô nearest nếu có lỗi
        const nearestCheckbox = document.getElementById('nearest');
        if (nearestCheckbox) nearestCheckbox.checked = false;
    });
}

// Hàm clear để xóa hiển thị nearest (sửa để dùng biến cục bộ)
function clearNearestCinema() {
    if (_nearestCinemaLayer) {
        map.removeLayer(_nearestCinemaLayer);
        _nearestCinemaLayer = null;
    }
    if (_nearestCinemaRouting) {
        // Routing control cần dùng removeControl
        map.removeControl(_nearestCinemaRouting);
        _nearestCinemaRouting = null;
    }
}

// Gán các hàm vào window để layerControl.js có thể gọi
window.showNearestCinema = showNearestCinema;
window.clearNearestCinema = clearNearestCinema;

console.log("Nearest cinema functions assigned to window.");