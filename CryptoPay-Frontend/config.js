// config.js - Cấu hình Smart Contract & Mạng
const contractAddress = "0x3397152282E048404775bbD42a28D21D62c741F0"; 

const abi = [
    "function registerMerchant(string memory _name) public",
    "function payMerchant(address _merchantAddr) public payable",
    "function withdraw() public",
    "function getMerchantInfo(address _addr) public view returns (string memory name, uint256 balance, bool isActive)",
    "function getMerchantCount() public view returns (uint256)",
    "event PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, uint256 fee)",
    "event MerchantRegistered(address indexed merchant, string name)",
    "event Withdrawal(address indexed merchant, uint256 amount)"
];

const TARGET_CHAIN_ID = 11155111; // Sepolia
const TARGET_CHAIN_HEX = "0xaa36a7";
