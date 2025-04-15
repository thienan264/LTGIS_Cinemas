// mapUtils.js
// Giữ nguyên hàm fetchData gốc
export async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
        // Trả về undefined giống hành vi gốc nếu fetch lỗi và không return gì
    }
}

