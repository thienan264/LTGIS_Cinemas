// Cấu hình bản đồ
let config = {
    minZoom: 7,
    maxZoom: 18,
    fullscreenControl: true
};

// Độ phóng đại khi bản đồ được mở
const zoom = 18;

// Tọa độ Trường
const lat = 10.796581883732228;
const lng = 106.66684116631185;

// Khởi tạo bản đồ
const map = L.map("map", config).setView([lat, lng], zoom);
map.attributionControl.setPrefix(false);

// Dùng để tải và trình các layer trên bản đồ
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='#'>LT GIS</a> cơ bản"
}).addTo(map);

// Thay icon bằng icon mặc định của Leaflet
const funny = L.icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// Nội dung của popup với video YouTube (URL đã sửa)
const customPopup = `
    <div style="text-align:center;">
        <iframe width="300" height="200" 
            src="https://www.youtube.com/embed/cYf-ZXgOYxQ?start=3291" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
        </iframe>
    </div>`;

// Tùy chỉnh popup
const customOptions = {
    maxWidth: "auto", // Đảm bảo popup đủ lớn
    className: "customPopup"
};

// Tạo marker, gán icon, nội dung popup, thêm vào bản đồ
L.marker([lat, lng], { icon: funny })
    .bindPopup(customPopup, customOptions)
    .addTo(map);
