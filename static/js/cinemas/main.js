// main.js
// Import các hàm khởi tạo và chạy chúng theo đúng thứ tự

// Chỉ import các hàm khởi tạo hoặc các biến cần thiết ở đây
import { map } from './mapCore.js'; // Import map để biết nó đã sẵn sàng
import { initializeLocationButton } from './userLocation.js';
import './layerSetup.js'; // Chạy để định nghĩa geojsonOpts và gán vào window
import { initializeLayerControl } from './layerControl.js';
import './nearestCinema.js'; // Chạy để gán hàm vào window
import './routing.js'; // Chạy để gán hàm vào window

// Đảm bảo DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Ready. Initializing map components...");

    // Kiểm tra xem map đã được tạo chưa (từ mapCore.js)
    if (map) {
        console.log("Map instance confirmed.");
        // Khởi tạo các thành phần giao diện
        initializeLocationButton();
        initializeLayerControl(); // Hàm này sẽ tự động fetch layer và tạo nút

        console.log("Map application initialization sequence complete.");
    } else {
        console.error("Map initialization failed!");
    }
});