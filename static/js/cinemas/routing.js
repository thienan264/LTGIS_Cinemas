// routing.js
import { map } from './mapCore.js';

// Biến cục bộ
let _routingControl = null;

// Hàm routeToDestination gốc (sửa để dùng biến cục bộ)
function routeToDestination(destination) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Xóa control cũ nếu tồn tại
                if (_routingControl) {
                    map.removeControl(_routingControl); // Dùng removeControl
                    _routingControl = null;
                }

                // Cần có Leaflet Routing Machine đã được load vào global scope (L.Routing)
                if (L.Routing && L.Routing.control) {
                    // Dùng biến cục bộ _routingControl
                    _routingControl = L.Routing.control({
                        waypoints: [L.latLng(userLat, userLng), L.latLng(destination)], // Đảm bảo destination là LatLng
                        routeWhileDragging: true, // Giữ nguyên gốc là true
                        createMarker: () => null, // Giữ nguyên gốc
                    }).addTo(map);
                } else {
                    console.warn("Leaflet Routing Machine (L.Routing.control) not found.");
                    alert("Lỗi: Tính năng chỉ đường chưa sẵn sàng.");
                }

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

// Gán vào window để popup trong layerSetup.js có thể gọi
window.routeToDestination = routeToDestination;

console.log("Routing function assigned to window.");