// blockchain-service.js - Xử lý kết nối ví và sự kiện mạng
let isInitializing = false;

async function connectWallet() {
    if (!window.ethereum || isInitializing) return;
    
    setBtnLoading("connectBtn", true);
    isInitializing = true;
    
    try {
        const { targetChainId, targetChainHex, contractAddress, abi } = window.cryptoPay;
        
        window.cryptoPay.provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.cryptoPay.provider.send("eth_requestAccounts", []);
        
        const network = await window.cryptoPay.provider.getNetwork();
        
        if (network.chainId !== targetChainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetChainHex }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: targetChainHex,
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                            rpcUrls: ['https://rpc.sepolia.org'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }],
                    });
                }
            }
            window.cryptoPay.provider = new ethers.providers.Web3Provider(window.ethereum);
        }
        
        window.cryptoPay.signer = window.cryptoPay.provider.getSigner();
        window.cryptoPay.currentAccount = await window.cryptoPay.signer.getAddress();
        
        // Update Bottom Bar UI
        const addrEl = document.getElementById("walletAddr");
        if (addrEl) addrEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${window.cryptoPay.currentAccount.substring(0,6)}...${window.cryptoPay.currentAccount.substring(38)}`;
        
        const btn = document.getElementById("connectBtn");
        if (btn) {
            const connectedText = "Đã kết nối";
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${connectedText}`;
            btn.style.backgroundColor = "#10b981";
            btn.dataset.originalText = connectedText; // Cập nhật để setBtnLoading không ghi đè lại
        }
        
        showToast("Kết nối ví thành công!", "success");

        if (contractAddress && !window.cryptoPay.contract) {
            window.cryptoPay.contract = new ethers.Contract(contractAddress, abi, window.cryptoPay.signer);
            setupEventListeners();
        }
        
        // Khởi tạo nghiệp vụ App
        if (typeof initializeApp === "function") initializeApp();

    } catch (err) {
        console.error("Lỗi kết nối ví:", err);
        showToast("Lỗi kết nối: " + (err.reason || err.message), "error");
    } finally {
        setBtnLoading("connectBtn", false);
        isInitializing = false;
    }
}

function setupEventListeners() {
    const { contract, currentAccount } = window.cryptoPay;
    if (!contract) return;
    
    contract.removeAllListeners();

    contract.on("PaymentProcessed", (customer, merchant, amount, fee) => {
        if (merchant.toLowerCase() === currentAccount.toLowerCase()) {
            showToast(`🚀 NHẬN THÀNH CÔNG ${ethers.utils.formatEther(amount)} ETH!`, "success");
            
            const qrDiv = document.getElementById("qrcode");
            if (qrDiv) {
                qrDiv.innerHTML = `
                    <div style="text-align:center; padding: 2rem;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <p style="color:#10b981; font-weight:700; margin-top:1rem;">GIAO DỊCH HOÀN TẤT</p>
                    </div>
                `;
                const label = document.getElementById("qrLabel");
                if (label) label.innerText = "Hóa đơn đã được thanh toán!";
            }
            if (typeof loadDataAndStats === "function") loadDataAndStats();
            if (typeof checkMerchantStatus === "function") checkMerchantStatus();
        }
    });
    
    contract.on("Withdrawal", (merchant, amount) => {
        if (merchant.toLowerCase() === currentAccount.toLowerCase()) {
            showToast(`💸 Rút thành công ${ethers.utils.formatEther(amount)} ETH về ví!`, "success");
            if (typeof loadDataAndStats === "function") loadDataAndStats();
            if (typeof checkMerchantStatus === "function") checkMerchantStatus();
        }
    });
}
