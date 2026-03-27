// app-logic.js - Chứa các nghiệp vụ kinh doanh của App
let isFetchingData = false;

async function initializeApp() {
    await checkMerchantStatus();
    await loadDataAndStats();
}

async function checkMerchantStatus() {
    const { contract, currentAccount } = window.cryptoPay;
    if (!contract || !currentAccount) return;
    try {
        const info = await contract.getMerchantInfo(currentAccount);
        const [name, balance, isActive] = info;
        
        if (isActive) {
            updateUIStat("shopName", name);
            updateUIStat("regStatus", "Online");
            const regBadge = document.getElementById("regStatus");
            if (regBadge) regBadge.className = "status-badge status-success";
            
            const regForm = document.getElementById("registrationForm");
            if (regForm) regForm.style.display = "none";
            
            updateUIStat("systemBalance", ethers.utils.formatEther(balance) + " ETH");
            
            const statusDiv = document.getElementById("merchantStatus");
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div style="margin-bottom: 1rem;">
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Tên cửa hàng:</p>
                        <p style="font-size: 1.1rem; font-weight: 700; color: var(--secondary);">${name}</p>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <p style="color: var(--text-muted); font-size: 0.85rem;">Số dư khả dụng:</p>
                        <p style="font-size: 1.5rem; font-weight: 800; color: #10b981;">${ethers.utils.formatEther(balance)} ETH</p>
                    </div>
                    <button id="withdrawBtn" class="btn btn-primary" onclick="withdrawFunds()" style="width: 100%; height: 50px;" ${balance.eq(0) ? 'disabled' : ''}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        ${balance.eq(0) ? 'Không có tiền để rút' : 'Rút tiền ngay'}
                    </button>
                `;
            }
        } else {
            const regForm = document.getElementById("registrationForm");
            if (regForm) regForm.style.display = "block";
        }
    } catch (err) { console.error(err); }
}

async function loadDataAndStats() {
    const table = document.getElementById("txTable");
    const { contract, currentAccount } = window.cryptoPay;
    if (!table || !contract || !currentAccount || isFetchingData) return;
    
    try {
        isFetchingData = true;
        const [payLogs, withdrawLogs] = await Promise.all([
            contract.queryFilter(contract.filters.PaymentProcessed(null, currentAccount), 0),
            contract.queryFilter(contract.filters.Withdrawal(currentAccount), 0)
        ]);
        
        let totalRevenueNet = ethers.BigNumber.from(0);
        let totalFeesPaid = ethers.BigNumber.from(0);
        let totalWithdrawn = ethers.BigNumber.from(0);
        
        const displayLogs = payLogs.slice().reverse().slice(0, 20);
        const rows = await Promise.all(displayLogs.map(async (log) => {
            const { customer, amount, fee } = log.args;
            const net = amount.sub(fee || 0);

            totalRevenueNet = totalRevenueNet.add(net);
            totalFeesPaid = totalFeesPaid.add(fee || 0);

            const block = await log.getBlock();
            const date = new Date(block.timestamp * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const etherscanUrl = `https://sepolia.etherscan.io/tx/${log.transactionHash}`;

            return `
                <tr>
                    <td><a href="${etherscanUrl}" target="_blank" style="color:var(--text-muted); text-decoration:none;">#${log.blockNumber} ↗</a></td>
                    <td>${customer.substring(0,6)}...${customer.substring(38)}</td>
                    <td style="color:var(--text-muted); font-size:0.8rem; text-decoration:line-through;">${ethers.utils.formatEther(amount)}</td>
                    <td><span style="color:#ef4444; font-size:0.8rem;">-${ethers.utils.formatEther(fee || 0)}</span></td>
                    <td><span style="color:#10b981; font-weight:700;">+${ethers.utils.formatEther(net)} ETH</span></td>
                    <td style="font-size:0.8rem; opacity:0.7;">${date}</td>
                </tr>
            `;
        }));

        if (payLogs.length > 20) {
            payLogs.slice(0, payLogs.length - 20).forEach(log => {
                totalRevenueNet = totalRevenueNet.add(log.args.amount.sub(log.args.fee || 0));
                totalFeesPaid = totalFeesPaid.add(log.args.fee || 0);
            });
        }
        
        withdrawLogs.forEach(l => totalWithdrawn = totalWithdrawn.add(l.args.amount));

        table.innerHTML = rows.length > 0 ? rows.join('') : `<tr><td colspan="6" style="text-align:center; opacity:0.5; padding: 2rem;">Chưa có giao dịch nào</td></tr>`;
        updateUIStat("totalRevenue", ethers.utils.formatEther(totalRevenueNet) + " ETH");
        updateUIStat("totalFees", ethers.utils.formatEther(totalFeesPaid) + " ETH");
        updateUIStat("totalWithdrawn", ethers.utils.formatEther(totalWithdrawn) + " ETH");
        updateUIStat("totalTx", payLogs.length);

    } catch (e) { console.error(e); } finally { isFetchingData = false; }
}

async function registerMerchant() {
    const { contract } = window.cryptoPay;
    if (!contract) return;
    const name = document.getElementById("merchantName").value;
    if (!name || name.length < 3) return showToast("Tên cửa hàng quá ngắn!", "error");
    
    setBtnLoading("regBtn", true);
    try {
        const tx = await contract.registerMerchant(name);
        showToast("Đang gửi yêu cầu đăng ký lên Blockchain...", "info");
        await tx.wait();
        showToast("Đăng ký cửa hàng thành công!", "success");
        checkMerchantStatus();
    } catch (err) {
        showToast("Lỗi đăng ký: " + (err.reason || err.message), "error");
    } finally { setBtnLoading("regBtn", false); }
}

function generateQR() {
    const { currentAccount } = window.cryptoPay;
    const amount = document.getElementById("amountInput").value;
    if (!amount || amount <= 0) return showToast("Nhập số tiền hợp lệ!", "error");
    
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = "";
    
    const paymentUrl = `https://metamask.app.link/dapp/${window.location.host}/pay.html?merchant=${currentAccount}&amount=${amount}`;
    
    new QRCode(qrDiv, { text: paymentUrl, width: 220, height: 220 });
    document.getElementById("qrLabel").innerHTML = `Quét để trả <span style="color:var(--secondary)">${amount} ETH</span>`;
    showToast("Đã tạo mã QR thanh toán!", "success");
}

async function withdrawFunds() {
    const { contract } = window.cryptoPay;
    if (!contract) return showToast("Vui lòng kết nối ví!", "error");
    
    setBtnLoading("withdrawBtn", true);
    try {
        const tx = await contract.withdraw();
        showToast("Đang xử lý giao dịch rút tiền...", "info");
        await tx.wait();
        showToast("Tiền đã được rút về ví của bạn!", "success");
        checkMerchantStatus();
    } catch (err) {
        console.error(err);
        showToast("Lỗi rút tiền: " + (err.reason || err.message), "error");
    } finally { setBtnLoading("withdrawBtn", false); }
}
