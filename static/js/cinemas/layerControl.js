// layerControl.js
import { map } from './mapCore.js';
import { fetchData } from './mapUtils.js';
import { layersButton, arrayLayers } from './mapConfig.js';
// Import hàm từ nearestCinema.js (cần đảm bảo file đó đã load)
// import { showNearestCinema, clearNearestCinema } from './nearestCinema.js';

// Biến cục bộ cho control layer
let _layerControl = null;

// Hàm generateButton gốc
function generateButton(name) {
    const id = name === layersButton ? "all-layers" : name;
    const container = document.getElementById("layer-list"); // Cần đảm bảo container tồn tại khi gọi

    if (!container) {
        console.error("Layer list container not found for button:", name);
        return;
    }

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
        showHideLayer(e.target); // Gọi hàm showHideLayer trực tiếp
    });
}

// Hàm checkedType 
function checkedType(id, type) {
    // Truy cập hàm từ global scope (window)
    const showNearest = window.showNearestCinema;
    const clearNearest = window.clearNearestCinema;

    if (id === "nearest") { // Giữ nguyên tên "nearest"
        if (type) {
            if (showNearest) showNearest(); else console.error("showNearestCinema not found");
        } else {
            if (clearNearest) clearNearest(); else console.error("clearNearestCinema not found");
        }
        return;
    }

    // Giữ nguyên cách truy cập layer qua window[ ]
    const layer = window["layer_" + id];
    if (!layer) {
        console.warn("Layer not found in window:", "layer_" + id);
        return;
    }

    if (type) { // Khi checkbox được check (hiển thị layer)
        // Chỉ thêm layer và fitBounds nếu layer chưa có trên map
        if (!map.hasLayer(layer)) {
            map.addLayer(layer);
            console.log(`Layer ${id} added to map.`);

            // *** THÊM TÍNH NĂNG FITBOUNDS ***
            // Kiểm tra xem layer có phương thức getBounds và bounds có hợp lệ không
            if (layer.getBounds && typeof layer.getBounds === 'function' && layer.getBounds().isValid()) {
                console.log(`Fitting bounds for layer ${id}`);
                // Sử dụng fitBounds để zoom và pan tới khu vực chứa layer
                // padding giúp tạo khoảng đệm xung quanh các điểm
                map.fitBounds(layer.getBounds(), { padding: [50, 50] });
            } else {
                // Có thể layer chưa có dữ liệu hoặc không phải là feature group
                console.log(`Layer ${id} has no valid bounds to fit.`);
                // Optional: Nếu không có bounds, có thể zoom về 1 điểm nếu là marker đơn lẻ
                // if (layer instanceof L.Marker) { map.setView(layer.getLatLng(), 15); }
            }
        } else {
            console.log(`Layer ${id} is already on the map.`);
            // Nếu layer đã có trên map, có thể cân nhắc vẫn fitBounds nếu muốn
            // if (layer.getBounds && layer.getBounds().isValid()) {
            //     map.fitBounds(layer.getBounds(), { padding: [50, 50] });
            // }
        }
    } else { // Khi checkbox không được check (ẩn layer)
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            console.log(`Layer ${id} removed from map.`);
        }
    }
}

// Hàm showHideLayer 
function showHideLayer(target) {
    const id = target.id;
    const layerNameValue = target.value; // Lấy value để check 'all layers'

    if (layerNameValue === layersButton) { // So sánh với value gốc 'all layers'
        // Cần đảm bảo arrayLayers chứa tên các layer thực tế (vd: "cinema")
        const actualLayers = arrayLayers.filter(name => name !== 'nearest');
        actualLayers.forEach((layerName) => {
            // Cập nhật trạng thái checkbox của layer con
            const childCheckbox = document.getElementById(layerName);
            if (childCheckbox && childCheckbox.checked !== target.checked) {
                childCheckbox.checked = target.checked;
                // Gọi checkedType cho layer con
                checkedType(layerName, target.checked);
            } else if (!childCheckbox) {
                // Nếu checkbox con không tồn tại, vẫn thử gọi checkedType
                checkedType(layerName, target.checked);
            }
        });
        // Nếu bỏ check "all layers", cũng bỏ check "nearest"
        if (!target.checked) {
            const nearestCheckbox = document.getElementById('nearest');
            if (nearestCheckbox && nearestCheckbox.checked) {
                nearestCheckbox.checked = false;
                checkedType('nearest', false); // Gọi để clear nearest
            }
        }
    } else {
        // Xử lý checkbox layer đơn lẻ hoặc "nearest"
        checkedType(id, target.checked); // Dùng id của checkbox (vd: "cinema" hoặc "nearest")

        // Cập nhật trạng thái checkbox "all layers"
        updateAllLayersCheckbox();
    }
}

// Hàm cập nhật trạng thái checkbox "all layers" (thêm mới để logic hoạt động đúng)
function updateAllLayersCheckbox() {
    const allLayersCheckbox = document.getElementById('all-layers');
    if (!allLayersCheckbox) return;

    const actualLayers = arrayLayers.filter(name => name !== 'nearest');
    let allChecked = true;
    let noneChecked = true;

    actualLayers.forEach(layerName => {
        const checkbox = document.getElementById(layerName);
        if (checkbox) { // Chỉ xét những checkbox tồn tại
            if (checkbox.checked) {
                noneChecked = false;
            } else {
                allChecked = false;
            }
        } else {
            allChecked = false; // Nếu checkbox không có, coi như không được check
        }
    });

    if (allChecked) {
        allLayersCheckbox.checked = true;
        allLayersCheckbox.indeterminate = false;
    } else if (noneChecked) {
        allLayersCheckbox.checked = false;
        allLayersCheckbox.indeterminate = false;
    } else {
        // Có check, có không check -> indeterminate
        allLayersCheckbox.checked = false; // Bỏ check nhưng hiển thị là indeterminate
        allLayersCheckbox.indeterminate = true;
    }
}


// Hàm khởi tạo control (gọi từ main.js)
export function initializeLayerControl() {
    _layerControl = L.control({ position: 'topright' }); // Gán vào biến cục bộ
    _layerControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control custom-layer-control');
        // Giữ nguyên innerHTML gốc
        div.innerHTML = `
      <a href="#" title="Lớp hiển thị" style="font-size: 18px;">🗂️</a>
      <div class="layer-dropdown" style="display:none; background:white; padding: 5px; border-radius: 4px; margin-top: 5px;">
        <ul id="layer-list" style="list-style: none; padding: 0; margin: 0;"></ul>
      </div>
    `;
        // Giữ nguyên onclick gốc
        div.onclick = function (e) {
            e.stopPropagation();
            const dropdown = div.querySelector('.layer-dropdown');
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        };
        L.DomEvent.disableClickPropagation(div);

        // Tạo các button bên trong div này sau khi nó được tạo
        // Cần đảm bảo div đã được thêm vào DOM hoặc chờ chút
        setTimeout(() => {
            generateButton(layersButton); // Tạo nút "all layers"
            // Lấy geojsonOpts từ window
            const currentGeojsonOpts = window.geojsonOpts;
            arrayLayers.forEach((layerName) => {
                generateButton(layerName); // Tạo nút cho từng layer

                if (layerName !== "nearest") {
                    fetchData(`/maps/api/geojson/${layerName}/`).then((data) => {
                        if (!data) return;
                        // Giữ nguyên cách tạo layer và gán vào window gốc
                        const layer = L.geoJSON(data, currentGeojsonOpts); //.addTo(map); // Bỏ addTo(map) ban đầu
                        window["layer_" + layerName] = layer; // Gán vào global scope
                        console.log(`Layer ${layerName} loaded and assigned to window.`);
                        // Kiểm tra và thêm layer vào map nếu checkbox tương ứng đã được check sẵn
                        const checkbox = document.getElementById(layerName);
                        if (checkbox && checkbox.checked) {
                            map.addLayer(layer);
                        }
                    });
                }
            });
            updateAllLayersCheckbox(); // Cập nhật trạng thái ban đầu của checkbox "all"
        }, 0); // setTimeout 0 để chờ DOM cập nhật nhẹ


        return div;
    };
    _layerControl.addTo(map);

    // Giữ nguyên global click listener gốc
    document.addEventListener("click", function () {
        const dropdown = document.querySelector(".layer-dropdown");
        // Kiểm tra dropdown có tồn tại không trước khi ẩn
        if (dropdown && dropdown.style.display !== 'none') {
            dropdown.style.display = "none";
        }
    });

    console.log("Layer control initialized.");
}