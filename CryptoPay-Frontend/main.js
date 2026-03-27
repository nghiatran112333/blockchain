// main.js - Entry point, glue code and lifecycle hooks
window.addEventListener('load', () => {
    // 1. Render Network Info
    if (typeof displayNetworkInfo === "function") displayNetworkInfo();

    // 2. Chào mừng UI
    console.log("CryptoPay App Started. Checking wallet status...");

    // 3. Tự động kết nối nếu đã từng kết nối
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts.length > 0) connectWallet();
        });
        
        window.ethereum.on('chainChanged', () => window.location.reload());
        window.ethereum.on('accountsChanged', () => window.location.reload());
    }
});

function displayNetworkInfo() {
    const ip = window.location.hostname;
    const port = window.location.port || '3000';
    const netInfo = document.getElementById("networkInfo");
    if (!netInfo) return;

    if (ip === 'localhost' || ip === '127.0.0.1') {
        netInfo.style.background = "rgba(239, 68, 68, 0.1)";
        netInfo.innerHTML = `
            <div style="font-size: 0.75rem; color: #ef4444; font-weight: 800; margin-bottom: 0.5rem;">CẢNH BÁO: ĐANG DÙNG LOCALHOST</div>
            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
                Mở lại trang bằng IP (Ví dụ: 192.168.x.x:3000) để điện thoại quét được.
            </p>
        `;
    } else {
        netInfo.style.background = "rgba(34, 197, 94, 0.05)";
        netInfo.innerHTML = `
            <div style="font-size: 0.75rem; color: var(--success); font-weight: 800; margin-bottom: 0.5rem;">TRẠNG THÁI:</div>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem;">
                Hệ thống sẵn sàng kết nối ví Sepolia.
            </p>
        `;
    }
}
