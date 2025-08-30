// Thay 'ID_EXTENSION_CUA_BAN' bằng ID thật của extension
const EXTENSION_ID = "epmonfbcjiklobbhjkjkgkjaclnknmmk"; 

const statusEl = document.getElementById('status');

// Gắn sự kiện cho các nút
document.getElementById('btnScanGroups').addEventListener('click', () => {
    statusEl.textContent = 'Đang gửi lệnh quét nhóm...';
    chrome.runtime.sendMessage(EXTENSION_ID, { cmd: "PROXY_SCAN_GROUPS" }, (response) => {
        if (response && response.status === 'started') {
            statusEl.textContent = 'Extension đã bắt đầu quét nhóm!';
        } else {
            statusEl.textContent = 'Lỗi: Không thể kết nối đến extension. Bạn đã cài đặt chưa?';
            console.error(response);
        }
    });
});

document.getElementById('btnScanFriends').addEventListener('click', () => {
    const limit = document.getElementById('postLimit').value;
    statusEl.textContent = 'Đang gửi lệnh quét bạn bè...';
    
    const command = {
        cmd: "PROXY_SCAN_FRIENDS",
        limit: parseInt(limit, 10) || 50
    };

    chrome.runtime.sendMessage(EXTENSION_ID, command, (response) => {
        if (response && response.status === 'started') {
            statusEl.textContent = 'Extension đã bắt đầu quét bạn bè không tương tác!';
        } else {
            statusEl.textContent = 'Lỗi: Không thể kết nối đến extension.';
            console.error(response);
        }
    });
});