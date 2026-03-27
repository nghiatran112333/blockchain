// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CryptoPayGateway
 * @dev Hệ thống thanh toán Blockchain mô phỏng VNPAY.
 * Hỗ trợ đăng ký Merchant, thanh toán qua QR (mô phỏng) và thu phí nền tảng.
 */
contract CryptoPayGateway {
    address public owner;
    uint256 public platformFeePercent = 1; // 1% phí giao dịch
    bool private _locked;

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    struct Merchant {
        string name;
        address payable wallet;
        uint256 balance;
        bool isActive;
    }

    mapping(address => Merchant) public merchants;
    address[] public merchantList;

    event PaymentProcessed(address indexed customer, address indexed merchant, uint256 amount, uint256 fee);
    event MerchantRegistered(address indexed merchant, string name);
    event Withdrawal(address indexed merchant, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Đăng ký Merchant mới
    function registerMerchant(string memory _name) public {
        require(!merchants[msg.sender].isActive, "Merchant already registered");
        merchants[msg.sender] = Merchant(_name, payable(msg.sender), 0, true);
        merchantList.push(msg.sender);
        emit MerchantRegistered(msg.sender, _name);
    }

    // Thanh toán cho Merchant (Mô phỏng quét mã QR gọi hàm này)
    function payMerchant(address _merchantAddr) public payable nonReentrant {
        require(merchants[_merchantAddr].isActive, "Merchant not found or inactive");
        require(msg.value > 0, "Amount must be > 0");

        uint256 fee = (msg.value * platformFeePercent) / 100;
        uint256 netAmount = msg.value - fee;

        merchants[_merchantAddr].balance += netAmount;
        
        // Gửi phí về platform owner (Dùng call thay cho transfer để bảo mật hơn)
        (bool success, ) = payable(owner).call{value: fee}("");
        require(success, "Platform fee transfer failed");

        emit PaymentProcessed(msg.sender, _merchantAddr, msg.value, fee);
    }


    // Rút tiền về ví cho Merchant
    function withdraw() public nonReentrant {
        Merchant storage m = merchants[msg.sender];
        require(m.isActive, "Not a merchant");
        uint256 amount = m.balance;
        require(amount > 0, "No balance to withdraw");

        m.balance = 0;
        (bool success, ) = m.wallet.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }


    // Admin cập nhật phí
    function setPlatformFee(uint256 _fee) public onlyOwner {
        platformFeePercent = _fee;
    }

    // Các hàm xem thông tin
    function getMerchantInfo(address _addr) public view returns (string memory name, uint256 balance, bool isActive) {
        Merchant memory m = merchants[_addr];
        return (m.name, m.balance, m.isActive);
    }

    function getMerchantCount() public view returns (uint256) {
        return merchantList.length;
    }
}
