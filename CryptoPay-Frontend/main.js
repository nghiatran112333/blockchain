// Cấu hình Smart Contract (Cập nhật địa chỉ sau khi deploy lên Ganache)
const contractAddress = "0x3397152282E048404775bbD42a28D21D62c741F0"; 
const abi = [
    "function registerMerchant(string memory _name) public",
    "function payMerchant(address _merchantAddr) public payable",
    "function withdraw() public",
    "function getMerchantInfo(address _addr) public view returns (string memory name, uint256 balance, bool isActive)",
    "function getMerchantCount() public view returns (uint256)",
    "event PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, uint256 fee)",
    "event MerchantRegistered(address indexed merchant, string name)"
];

let provider, signer, contract;
let currentAccount;

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
    if (type === 'error') icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setBtnLoading(btnId, isLoading, text) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        const originalText = btn.innerText;
        btn.dataset.originalText = originalText;
        btn.innerHTML = `<div class="loading-spinner"></div> <span>Đang xử lý...</span>`;
    } else {
        btn.disabled = false;
        btn.innerText = text || btn.dataset.originalText;
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        showToast("Vui lòng cài đặt MetaMask!", "error");
        return;
    }
    setBtnLoading("connectBtn", true);
    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        await provider.send("eth_requestAccounts", []);
        
        // Check Network (Sử dụng 1337 đồng bộ với Ganache hiện tại)
        // Check Network (11155111 - Sepolia)
        const network = await provider.getNetwork();
        const targetChainId = 11155111; 
        const targetChainIdHex = '0xaa36a7'; 
        
        if (network.chainId !== targetChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainIdHex }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: targetChainIdHex,
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }],
                    });
                }
            }
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        signer = provider.getSigner();
        currentAccount = await signer.getAddress();
        
        document.getElementById("walletAddr").innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${currentAccount.substring(0,6)}...${currentAccount.substring(38)}`;
        
        // Remove loading state and set to Connected
        const btn = document.getElementById("connectBtn");
        btn.disabled = false;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${currentAccount.substring(0,6)}...`;
        btn.classList.add("btn-success"); // Optional: add a success class if you want
        btn.style.backgroundColor = "#10b981"; // Đổi sang màu xanh lá cho đẹp
        
        showToast("Kết nối ví thành công!", "success");

        if (contractAddress !== "0x") {
            contract = new ethers.Contract(contractAddress, abi, signer);
            checkMerchantStatus();
            loadTransactions();
        } else {
            showToast("Vui lòng điền địa chỉ Smart Contract vào file main.js!", "info");
        }
    } catch (err) {
        console.error("Lỗi kết nối ví:", err);
        showToast("Lỗi kết nối ví: " + err.message, "error");
        setBtnLoading("connectBtn", false);
    }
}


async function checkMerchantStatus() {
    if (!contract) return;
    try {
        const info = await contract.getMerchantInfo(currentAccount);
        const [name, balance, isActive] = info;
        
        if (isActive) {
            document.getElementById("shopName").innerText = name;
            document.getElementById("regStatus").innerText = "Online";
            document.getElementById("regStatus").className = "status-badge status-success";
            document.getElementById("registrationForm").style.display = "none";
            document.getElementById("systemBalance").innerText = ethers.utils.formatEther(balance) + " ETH";
        } else {
            document.getElementById("registrationForm").style.display = "block";
        }
    } catch (err) {
        console.error("Lỗi khi kiểm tra status:", err);
    }
}

async function registerMerchant() {
    const name = document.getElementById("regName").value;
    if (!name) return showToast("Vui lòng nhập tên shop", "error");
    
    if (!contract) return showToast("Vui lòng kết nối ví và cấu hình contract trước!", "error");

    setBtnLoading("registerBtn", true);
    try {
        await ensureCorrectNetwork(); // Đảm bảo đúng mạng trước khi ký
        const tx = await contract.registerMerchant(name);
        showToast("Đang xác nhận trên Blockchain...", "info");
        await tx.wait();
        showToast("Đăng ký Merchant thành công!", "success");
        checkMerchantStatus();
    } catch (err) {
        showToast("Lỗi đăng ký: " + (err.reason || err.message), "error");
    } finally {
        setBtnLoading("registerBtn", false);
    }
}


function generateQR() {
    const amount = document.getElementById("amountInput").value;
    if (!amount) return showToast("Vui lòng nhập số tiền", "error");
    if (!currentAccount) return showToast("Vui lòng kết nối ví trước", "error");
    
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    
    // Tạo hiệu ứng loading cho QR
    qrDiv.style.opacity = "0.5";
    
    setTimeout(() => {
        let origin = window.location.origin;
        const currentIP = window.location.hostname;
        
        // Tạo MetaMask Deep Link nếu đang ở trên Hosting (không phải localhost)
        let qrData = `${origin}/pay.html?merchant=${currentAccount}&amount=${amount}`;
        
        if (currentIP !== 'localhost' && currentIP !== '127.0.0.1') {
            // Loại bỏ http/https để tạo deep link chuẩn của MetaMask
            const cleanOrigin = origin.replace(/^https?:\/\//, '');
            qrData = `https://metamask.app.link/dapp/${cleanOrigin}/pay.html?merchant=${currentAccount}&amount=${amount}`;
        } else {
            showToast("CẢNH BÁO: Đang dùng localhost. Hãy đưa lên Vercel để dùng Deep Link!", "warning");
        }

        new QRCode(qrDiv, {
            text: qrData,
            width: 180,
            height: 180,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        qrDiv.style.opacity = "1";
        document.getElementById("qrLabel").innerText = `Quét để trả ${amount} ETH`;
        // document.getElementById("copyContainer").style.display = "flex"; // Nút copy đã bị ẩn theo yêu cầu
        showToast("Đã tạo mã QR thanh toán!", "success");
    }, 300);
}

function copyPaymentLink() {
    const amount = document.getElementById("amountInput").value;
    let origin = window.location.origin;
    const currentIP = window.location.hostname;
    
    let qrData = `${origin}/pay.html?merchant=${currentAccount}&amount=${amount}`;
    if (currentIP !== 'localhost' && currentIP !== '127.0.0.1') {
        const cleanOrigin = origin.replace(/^https?:\/\//, '');
        qrData = `https://metamask.app.link/dapp/${cleanOrigin}/pay.html?merchant=${currentAccount}&amount=${amount}`;
    }
    
    navigator.clipboard.writeText(qrData).then(() => {
        showToast("Đã copy link thanh toán!", "success");
    }).catch(err => {
        showToast("Không thể copy link", "error");
    });
}

function openSimulation() {
    const amount = document.getElementById("amountInput").value;
    if (!amount) return showToast("Vui lòng nhập số tiền", "error");
    
    const origin = window.location.origin;
    const qrData = `${origin}/pay.html?merchant=${currentAccount}&amount=${amount}`;
    
    // Mở trang thanh toán trong tab mới
    window.open(qrData, '_blank');
}

async function withdrawFunds() {
    if (!contract) return;
    try {
        const tx = await contract.withdraw();
        showToast("Đang thực hiện lệnh rút tiền...", "info");
        await tx.wait();
        showToast("Rút tiền về ví thành công!", "success");
        checkMerchantStatus();
    } catch (err) {
        showToast("Lỗi rút tiền: " + (err.reason || err.message), "error");
    }
}


async function updateFinancialStats() {
    if (!contract || !currentAccount) return;
    
    try {
        console.log("Cập nhật số liệu tài chính cho:", currentAccount);
        // Dùng 0 để lấy từ block đầu tiên của contract (Sepolia hỗ trợ tốt)
        const startBlock = 0; 
        
        // 1. Lấy tất cả các giao dịch thanh toán
        const payFilter = contract.filters.PaymentProcessed(null, currentAccount);
        const payLogs = await contract.queryFilter(payFilter, startBlock); 
        
        let totalGross = ethers.BigNumber.from(0);
        let totalFees = ethers.BigNumber.from(0);
        
        payLogs.forEach(log => {
            if (log.args && log.args.amount) {
                totalGross = totalGross.add(log.args.amount);
                totalFees = totalFees.add(log.args.fee || 0);
            }
        });

        // 2. Lấy tất cả các lệnh rút tiền
        const withdrawFilter = contract.filters.Withdrawal(currentAccount);
        const withdrawLogs = await contract.queryFilter(withdrawFilter, startBlock);
        
        let totalWithdrawn = ethers.BigNumber.from(0);
        withdrawLogs.forEach(log => {
            if (log.args && log.args.amount) {
                totalWithdrawn = totalWithdrawn.add(log.args.amount);
            }
        });

        // Hiển thị lên UI - Đảm bảo ID đúng
        const revenueEl = document.getElementById("totalRevenue");
        const feesEl = document.getElementById("totalFees");
        const withdrawnEl = document.getElementById("totalWithdrawn");
        const txCountEl = document.getElementById("totalTx");

        if (revenueEl) revenueEl.innerText = ethers.utils.formatEther(totalGross.sub(totalFees)) + " ETH";
        if (feesEl) feesEl.innerText = ethers.utils.formatEther(totalFees) + " ETH";
        if (withdrawnEl) withdrawnEl.innerText = ethers.utils.formatEther(totalWithdrawn) + " ETH";
        if (txCountEl) txCountEl.innerText = payLogs.length;

    } catch (e) {
        console.error("Lỗi cập nhật tài chính:", e);
    }
}

async function loadTransactions() {
    const table = document.getElementById("txTable");
    if (!table || !contract) return;
    
    try {
        // Cập nhật stats trước
        await updateFinancialStats();
        
        const filter = contract.filters.PaymentProcessed(null, currentAccount);
        const logs = await contract.queryFilter(filter, 0);
        
        table.innerHTML = "";
        
        if (logs.length === 0) {
            table.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.5; padding: 2rem;">Chưa có giao dịch minh bạch nào</td></tr>`;
            return;
        }

        const reversedLogs = logs.slice().reverse();
        for (const log of reversedLogs) {
            const { customer, amount, fee } = log.args;
            const block = await log.getBlock();
            const date = new Date(block.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const netAmount = amount.sub(fee);
            const etherscanUrl = `https://sepolia.etherscan.io/tx/${log.transactionHash}`;

            const row = `
                <tr>
                    <td><a href="${etherscanUrl}" target="_blank" style="color:var(--text-muted); text-decoration:none;">#${log.blockNumber} ↗</a></td>
                    <td>${customer.substring(0,6)}...${customer.substring(38)}</td>
                    <td style="color:var(--text-muted); font-size:0.8rem; text-decoration:line-through;">${ethers.utils.formatEther(amount)}</td>
                    <td><span style="color:#ef4444; font-size:0.8rem;">-${ethers.utils.formatEther(fee)} (1%)</span></td>
                    <td><span style="color:#10b981; font-weight:700;">+${ethers.utils.formatEther(netAmount)} ETH</span></td>
                    <td style="font-size:0.8rem; opacity:0.7;">${date}</td>
                </tr>
            `;
            table.innerHTML += row;
        }
    } catch (e) { 
        console.error("Lỗi load lịch sử:", e); 
    }
}

// Chạy kiểm tra URL khi vừa load trang
window.addEventListener('load', () => {
    // Hiển thị thông tin Network cho Merchant biết
    displayNetworkInfo();

    // Lắng nghe sự kiện thanh toán THỰC TẾ từ Blockchain
    if (contract) {
        contract.on("PaymentProcessed", (customer, merchant, amount, fee) => {
            if (merchant.toLowerCase() === currentAccount.toLowerCase()) {
                // 1. Thông báo cực mạnh
                showToast(`🚀 NHẬN THÀNH CÔNG ${ethers.utils.formatEther(amount)} ETH!`, "success");
                
                // 2. Hủy mã QR ngay lập tức cho chuyên nghiệp
                const qrDiv = document.getElementById("qrcode");
                qrDiv.innerHTML = `
                    <div style="text-align:center; padding: 2rem;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" style="margin-bottom:1rem;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <p style="color:#10b981; font-weight:700;">GIAO DỊCH HOÀN TẤT</p>
                    </div>
                `;
                document.getElementById("qrLabel").innerText = "Hóa đơn đã được thanh toán!";
                document.getElementById("amountInput").value = "";

                // 3. Cập nhật số liệu tức thì
                loadTransactions();
                updateFinancialStats();
                checkMerchantStatus();
            }
        });
        // Lắng nghe sự kiện Rút tiền để cập nhật stats
        contract.on("Withdrawal", (merchant, amount) => {
            if (merchant.toLowerCase() === currentAccount.toLowerCase()) {
                showToast(`💸 Bạn vừa rút thành công ${ethers.utils.formatEther(amount)} ETH!`, "success");
                updateFinancialStats();
                checkMerchantStatus();
            }
        });
    }

    // Lắng nghe sự kiện đổi mạng/tài khoản (Fix lỗi đồng bộ)
    if (window.ethereum) {
        window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
        window.ethereum.on('accountsChanged', (_accounts) => window.location.reload());
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
                Bạn đang chạy web ở <b>localhost</b>. Điện thoại sẽ KHÔNG thể quét được.<br><br>
                Hãy mở lại trang web bằng địa chỉ IP máy tính (Ví dụ: 192.168.x.x:3000)
            </p>
        `;
    } else {
        netInfo.style.background = "rgba(34, 197, 94, 0.05)";
        netInfo.style.borderColor = "rgba(34, 197, 94, 0.3)";
        netInfo.innerHTML = `
            <div style="font-size: 0.75rem; color: var(--success); font-weight: 800; margin-bottom: 0.5rem;">CẤU HÌNH MOBILE SẴN SÀNG:</div>
            <div style="font-family: monospace; background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: 0.5rem; font-size: 0.8rem; border: 1px solid var(--border);">
                <span style="color:var(--text-muted)">RPC:</span> http://${ip}:7545<br>
                <span style="color:var(--text-muted)">WEB:</span> http://${ip}:${port}
            </div>
            <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.75rem;">
                Dùng trình duyệt <b>MetaMask Mobile</b> truy cập link WEB ở trên.
            </p>
        `;
    }
}

// Hàm hỗ trợ đảm bảo đúng mạng
async function ensureCorrectNetwork() {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    const targetChainId = 11155111; // Sepolia
    
    if (network.chainId !== targetChainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }],
                    });
                } catch (addError) { console.error(addError); }
            }
        }
    }
}
