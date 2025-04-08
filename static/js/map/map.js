// Khởi tạo bản đồ
const map = L.map("map").setView([52.2298, 21.0118], 12);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Thêm chức năng zoom góc trên phải
L.control.zoom({ position: "topright" }).addTo(map);

// Lấy danh sách các bài viết có tọa độ
const articles = document.querySelectorAll("article");

// Hàm tạo marker
function setMarker([lat, lng], title) {
    const marker = L.marker([lat, lng], { title }).addTo(map).bindPopup(title);
    return marker;
}

// Hàm di chuyển bản đồ đến tọa độ khi hiển thị bài viết
function centerMap([lat, lng], target, title) {
    const active = target.classList.contains("active");
    map.setView([lat, lng], 14);

    if (!active) {
        setMarker([lat, lng], title);
    }
}

// Xử lý khi cuộn trang, tự động căn giữa bản đồ vào địa điểm tương ứng
function onChange(changes) {
    changes.forEach((change) => {
        const data = change.target.dataset.coordinates;
        const title = change.target.dataset.title;

        if (change.intersectionRatio > 0) {
            centerMap(JSON.parse(data), change.target, title);
            change.target.classList.add("active");
        }
    });
}

// Kiểm tra nếu trình duyệt hỗ trợ IntersectionObserver
if ("IntersectionObserver" in window) {
    const config = { root: null, rootMargin: "0px", threshold: [0, 0.25, 0.5, 0.75, 1] };
    let observer = new IntersectionObserver(onChange, config);
    articles.forEach((article) => observer.observe(article));
}
