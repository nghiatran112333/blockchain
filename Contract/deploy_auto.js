const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const solc = require('solc');

async function main() {
    console.log("🚀 Bắt đầu quá trình tự động Compile & Deploy Script...");

    // 1. Đọc và Compile Contract
    console.log("📦 Đang biên dịch CryptoPayGateway.sol...");
    const contractPath = path.resolve(__dirname, 'CryptoPayGateway.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'CryptoPayGateway.sol': {
                content: source,
            },
        },
        settings: {
            evmVersion: 'paris',
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
    const contract = compiledCode.contracts['CryptoPayGateway.sol']['CryptoPayGateway'];
    
    if (!contract) {
        console.error("❌ Lỗi biên dịch. Vui lòng kiểm tra lại mã nguồn solidity.");
        console.error(compiledCode.errors);
        return;
    }

    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;

    console.log("✅ Biên dịch thành công!");

    // 2. Kết nối Ganache và Deploy
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');
    
    // Mnemonic từ hình ảnh Ganache của bạn
    const mnemonic = "put trade hope mean perfect boat chicken clean exclude cost welcome meadow";
    let wallet;
    try {
        wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
    } catch(e) {
        console.error("Lỗi khi khôi phục ví từ Mnemonic:", e);
        return;
    }

    console.log(`🔌 Đã kết nối Ganache.`);
    console.log(`👤 Tài khoản Deployer: ${wallet.address}`);
    console.log("⏳ Đang gửi giao dịch Deploy Smart Contract lên Blockchain Local...");

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    let deployedContract;
    try {
        deployedContract = await factory.deploy();
        await deployedContract.deployed();
    } catch(e) {
        console.error("❌ Lỗi khi deploy: Hãy chắc chắn bạn đang mở Ganache ở cổng 7545!");
        console.error(e.message);
        return;
    }

    console.log(`\n🎉 DEPLOY THÀNH CÔNG!`);
    console.log(`📌 Địa chỉ Contract: ${deployedContract.address}`);

    // 3. Tự động cập nhật vào các file Frontend
    const frontendDir = path.resolve(__dirname, '../CryptoPay-Frontend');
    const filesToUpdate = ['main.js', 'pay.html'];

    filesToUpdate.forEach(fileName => {
        const filePath = path.join(frontendDir, fileName);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Tìm và thay thế biến contractAddress
            const regex = /const contractAddress\s*=\s*['"][a-zA-Z0-9x]*['"];/;
            const replacement = `const contractAddress = "${deployedContract.address}";`;
            
            if (regex.test(content)) {
                content = content.replace(regex, replacement);
                fs.writeFileSync(filePath, content);
                console.log(`✅ Đã cập nhật địa chỉ Contract vào: ${fileName}`);
            }
        }
    });
    
    console.log("\n🚀 BẠN ĐÃ CÓ THỂ RA TRANG WEB F5 VÀ TRẢI NGHIỆM NGAY!");
}

main().catch(console.error);
