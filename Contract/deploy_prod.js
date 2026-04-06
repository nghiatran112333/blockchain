const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const solc = require("solc");

async function main() {
    // 1. Compile Contract on-the-fly
    console.log("📦 Đang biên dịch CryptoPayGateway.sol...");
    const contractPath = path.resolve(__dirname, 'CryptoPayGateway.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: { 'CryptoPayGateway.sol': { content: source } },
        settings: {
            evmVersion: 'paris',
            outputSelection: { '*': { '*': ['*'] } }
        }
    };

    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractMeta = compiledCode.contracts['CryptoPayGateway.sol']['CryptoPayGateway'];
    
    if (!contractMeta) {
        console.error("❌ Lỗi biên dịch. Vui lòng kiểm tra lại mã nguồn solidity.");
        return;
    }

    const bytecode = contractMeta.evm.bytecode.object;
    const abi = contractMeta.abi;
    console.log("✅ Biên dịch thành công!");

    // 2. Cấu hình mạng Sepolia
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("-----------------------------------------");
    console.log("🚀 Đang triển khai lên SEPOLIA TESTNET...");
    console.log("Ví triển khai:", wallet.address);
    const balance = await wallet.getBalance();
    console.log("Số dư:", ethers.utils.formatEther(balance), "ETH");

    if (balance.eq(0)) {
        console.error("❌ LỖI: Ví của bạn không có Sepolia ETH.");
        return;
    }

    // 3. Deploy
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployedContract = await factory.deploy();

    console.log("⏳ Đang đợi xác nhận giao dịch...");
    await deployedContract.deployed();

    console.log("✅ HỢP ĐỒNG ĐÃ TRIỂN KHAI THÀNH CÔNG!");
    console.log("Địa chỉ:", deployedContract.address);
    console.log("-----------------------------------------");

    // 4. Cập nhật Frontend tự động
    updateFrontend(deployedContract.address);
}

function updateFrontend(address) {
    const configPath = path.join(__dirname, "../CryptoPay-Frontend/config.js");
    const payHtmlPath = path.join(__dirname, "../CryptoPay-Frontend/pay.html");

    [configPath, payHtmlPath].forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, "utf8");
            content = content.replace(/const contractAddress = "0x[a-fA-F0-9]{40}";/, `const contractAddress = "${address}";`);
            fs.writeFileSync(filePath, content);
            console.log(`Updated: ${path.basename(filePath)}`);
        }
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
