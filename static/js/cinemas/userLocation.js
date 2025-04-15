// userLocation.js
import { map } from './mapCore.js';
import { zoom } from './mapConfig.js';

// Biến cục bộ cho module này, không cần export vì chỉ dùng nội bộ
let _userLocationMarker = null;
let _userLocationCircle = null;

// Giữ nguyên hàm getCurrentLocation gốc
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Sử dụng biến cục bộ _userLocationMarker, _userLocationCircle
                if (_userLocationMarker) map.removeLayer(_userLocationMarker);
                if (_userLocationCircle) map.removeLayer(_userLocationCircle);

                _userLocationMarker = L.marker([userLat, userLng], {
                    icon: L.divIcon({
                        className: 'user-location',
                        html: "<span class='emoji'>📍</span>",
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        popupAnchor: [0, -25],
                    })
                }).addTo(map).bindPopup('Vị trí của bạn').openPopup();

                _userLocationCircle = L.circle([userLat, userLng], {
                    radius: accuracy,
                    color: '#4285F4',
                    fillColor: '#4285F4',
                    fillOpacity: 0.15
                }).addTo(map);

                map.setView([userLat, userLng], zoom); // Giữ nguyên setView
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

// Hàm để thêm nút vào bản đồ (cần gọi từ main.js)
export function initializeLocationButton() {
    const locationButton = L.control({ position: 'topleft' });
    locationButton.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = '<a href="#" title="Hiển thị vị trí của tôi" style="font-size: 18px;">📍</a>';
        div.style.background = 'white';
        div.style.cursor = 'pointer';

        // Giữ nguyên onclick gốc
        div.onclick = function () {
            getCurrentLocation();
            return false;
        };
        L.DomEvent.disableClickPropagation(div); // Thêm dòng này để tránh click xuyên qua nút
        return div;
    };
    locationButton.addTo(map);
    console.log("Location button initialized.");
}