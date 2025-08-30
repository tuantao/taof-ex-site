// Thay 'ID_EXTENSION_CUA_BAN' bằng ID thật của extension
const EXTENSION_ID = "epmonfbcjiklobbhjkjkgkjaclnknmmk"; // <-- THAY ID CỦA BẠN VÀO ĐÂY

const statusEl = document.getElementById('status');
const modeEl = document.getElementById('mode');

// === CÁC BIẾN MỚI CHO PHẦN KẾT QUẢ ===
const resultsCardEl = document.getElementById('resultsCard');
const scanSummaryEl = document.getElementById('scanSummary');
const resultsTextareaEl = document.getElementById('resultsTextarea');

// Hàm gửi lệnh đến extension
function sendCommand(command, callback) {
    statusEl.textContent = `Đang gửi lệnh: ${command.cmd}...`;
    chrome.runtime.sendMessage(EXTENSION_ID, command, (response) => {
        if (chrome.runtime.lastError) {
            statusEl.textContent = 'Lỗi: Không thể kết nối đến extension. Bạn đã cài đặt và tải lại nó chưa?';
            console.error(chrome.runtime.lastError.message);
        } else if (callback) {
            callback(response);
        } else {
            statusEl.textContent = `Phản hồi từ lệnh ${command.cmd}: ${JSON.stringify(response)}`;
        }
    });
}

// === HÀM MỚI: Tải kết quả đã lưu từ extension ===
function loadScanResults() {
    sendCommand({ cmd: "PROXY_GET_SCAN_RESULTS" }, (response) => {
        if (response && response.status === 'success' && response.data.friends && response.data.friends.length > 0) {
            const friends = response.data.friends;
            const timestamp = response.data.timestamp ? new Date(response.data.timestamp).toLocaleString('vi-VN') : 'Không rõ';
            
            resultsCardEl.classList.remove('hidden');
            scanSummaryEl.textContent = `Tìm thấy ${friends.length} bạn bè không tương tác. Lần quét cuối: ${timestamp}.`;
            resultsTextareaEl.value = friends.join('\n');
            statusEl.textContent = "Đã tải kết quả quét lần trước.";
        } else {
            statusEl.textContent = "Không tìm thấy kết quả quét nào đã lưu.";
        }
    });
}

// Hàm cập nhật giao diện dựa trên chế độ được chọn
function updateVisibility() {
    const mode = modeEl.value;
    document.getElementById('boxFilters').classList.toggle('hidden', !["ADD", "ACCEPT_INCOMING", "UNFRIEND"].includes(mode));
    document.getElementById('boxList').classList.toggle('hidden', !["ADD_FROM_LIST", "PAGES_UNFOLLOW", "PAGES_UNLIKE", "GROUPS_JOIN"].includes(mode));
    document.getElementById('groupAssistBox').classList.toggle('hidden', mode !== "GROUPS_POST_ASSIST");
}

// Bắt sự kiện thay đổi chế độ
modeEl.addEventListener('change', updateVisibility);

// Nút Start
document.getElementById('btnStart').addEventListener('click', () => {
    const config = {
        mode: modeEl.value,
        maxPerRun: parseInt(document.getElementById('limit').value, 10),
        minDelayMs: parseInt(document.getElementById('minDelay').value, 10),
        maxDelayMs: parseInt(document.getElementById('maxDelay').value, 10),
        minMutual: parseInt(document.getElementById('minMutual').value, 10),
        inc: document.getElementById('nameInclude').value,
        exc: document.getElementById('nameExclude').value,
        gender: document.getElementById('gender').value,
        region: document.getElementById('region').value,
        minFriends: parseInt(document.getElementById('minFriends').value, 10),
        ageMin: parseInt(document.getElementById('ageMin').value, 10),
        ageMax: parseInt(document.getElementById('ageMax').value, 10),
        postText: document.getElementById('postText').value,
        scanPostLimit: parseInt(document.getElementById('scanPostLimit').value, 10)
    };
    
    const urls = document.getElementById('urls').value.split('\n').map(s => s.trim()).filter(Boolean);
    const groups = Array.from(document.querySelectorAll('#groupList input:checked')).map(chk => chk.dataset.url);
    
    let queue = [];
    if (["ADD_FROM_LIST", "PAGES_UNFOLLOW", "PAGES_UNLIKE", "GROUPS_JOIN"].includes(config.mode)) {
        queue = urls;
    } else if (config.mode === "GROUPS_POST_ASSIST") {
        queue = groups;
    }

    sendCommand({ cmd: "PROXY_START", config, queue }, (res) => {
        statusEl.textContent = "Lệnh START đã được gửi đến extension.";
    });
});

// Các nút điều khiển khác
document.getElementById('btnStop').addEventListener('click', () => sendCommand({ cmd: "PROXY_STOP" }));
document.getElementById('btnPause').addEventListener('click', () => sendCommand({ cmd: "PROXY_PAUSE" }));
document.getElementById('btnResume').addEventListener('click', () => sendCommand({ cmd: "PROXY_RESUME" }));
document.getElementById('btnExport').addEventListener('click', () => sendCommand({ cmd: "PROXY_EXPORT_CSV" }));
document.getElementById('btnClear').addEventListener('click', () => sendCommand({ cmd: "PROXY_CLEAR_LOG" }));

// Nút quét nhóm
document.getElementById('scanGroups').addEventListener('click', () => {
    sendCommand({ cmd: "PROXY_SCAN_GROUPS" }, (response) => {
        if (response && response.groups) {
            const groupListEl = document.getElementById('groupList');
            groupListEl.innerHTML = response.groups.map(g => `
                <label>
                    <input type="checkbox" data-url="${g.url}" checked />
                    ${g.name}
                </label>
            `).join('<br>');
            statusEl.textContent = `Đã quét xong và tìm thấy ${response.groups.length} nhóm.`;
        } else {
            statusEl.textContent = "Quét nhóm thất bại hoặc không tìm thấy nhóm nào.";
        }
    });
});


// === SỰ KIỆN MỚI: Nút Export kết quả quét bạn bè ===
document.getElementById('btnExportResults').addEventListener('click', () => {
    sendCommand({ cmd: "PROXY_EXPORT_SCAN_RESULTS" }, (response) => {
        if (response && response.status === 'success') {
            statusEl.textContent = "Lệnh export đã được gửi. Trình duyệt sẽ sớm mở hộp thoại lưu file.";
        } else {
            statusEl.textContent = "Export thất bại. Có thể chưa có dữ liệu để export.";
        }
    });
});


// Chạy lần đầu để hiển thị đúng và tải kết quả
updateVisibility();
document.addEventListener('DOMContentLoaded', loadScanResults);
// ... (code cũ của bạn)

// === SỰ KIỆN MỚI: Nút Tải Dữ Liệu Bạn Bè ===
document.getElementById('btnFetchFriends').addEventListener('click', () => {
    statusEl.textContent = 'Đang gửi lệnh tải danh sách bạn bè... Vui lòng chờ...';
    sendCommand({ cmd: "PROXY_FETCH_ALL_FRIENDS" }, (response) => {
        if (response && response.status === 'success' && response.friends) {
            statusEl.textContent = `Tải thành công! Tìm thấy ${response.friends.length} bạn bè.`;
            console.log("Đã nhận được danh sách bạn bè:", response.friends);
            
            // Ở các bước sau, chúng ta sẽ hiển thị dữ liệu này ra bảng
            // Tạm thời chỉ hiển thị ở console
            alert(`Tải thành công! Tìm thấy ${response.friends.length} bạn bè. Kiểm tra Console (F12) để xem chi tiết.`);

        } else {
            statusEl.textContent = "Tải danh sách bạn bè thất bại.";
            console.error(response);
        }
    });
});

// Chạy lần đầu để hiển thị đúng và tải kết quả
updateVisibility();
document.addEventListener('DOMContentLoaded', loadScanResults);