# 🚀 CryptoPay: Cổng Thanh toán Blockchain Chuyên nghiệp (Sepolia)

Chào mừng bạn đến với **CryptoPay** - Giải pháp thanh toán Smart Contract thương mại thực tế. Hệ thống đã được triển khai thành công trên **Sepolia Testnet** và tối ưu hóa cho trải nghiệm "Quét để trả" 1-chạm trên di động.

## 🌐 Demo Trực tiếp
👉 **[Truy cập Dashboard Merchant](https://blockchain-nghiatran112333.vercel.app/)**

## 🌟 Tính năng Đắt giá
- **Modular Architecture**: Code được chia nhỏ thành 5 mô-đun (`config`, `ui-utils`, `blockchain`, `app-logic`, `main`) cực kỳ dễ quản lý.
- **MetaMask Deep Linking**: Tự động mở App MetaMask trên điện thoại để thanh toán ngay khi quét QR.
- **Real-time Dashboard**: Thống kê doanh thu, phí và lịch sử giao dịch cập nhật tức thì (không cần load lại trang).
- **Rút tiền trực tiếp**: Merchant có thể rút doanh thu từ Smart Contract về ví cá nhân chỉ với 1 click.
- **Tương thích Sepolia**: Hoạt động trên mạng lưới Blockchain công khai, không cần chạy Localhost.

## 🛠️ Cấu trúc dự án (Modular)
- `config.js`: Chứa địa chỉ Contract (`0x339...`) và ABI.
- `ui-utils.js`: Quản lý thông báo (Toast) và trạng thái Loading.
- `blockchain-service.js`: Xử lý kết nối ví và lắng nghe sự kiện từ chuỗi.
- `app-logic.js`: Xử lý logic nghiệp vụ (QR Code, Rút tiền, Tính toán Stats).
- `main.js`: Điểm khởi chạy của toàn bộ ứng dụng.

## 📱 Hướng dẫn Demo (1-chạm)
1. **Dành cho Merchant**:
   - Truy cập Dashboard, kết nối Ví Merchant (Sepolia).
   - Nhập giá tiền và nhấn **Tạo QR**.
2. **Dành cho Khách hàng**:
   - Dùng camera điện thoại quét mã QR.
   - Nhấn vào link hiện ra để mở **MetaMask Mobile**.
   - Xác nhận thanh toán và xem Dashboard của Merchant tự động cập nhật!

---
**Dự án đã hoàn thiện 100% cho buổi thuyết trình và sử dụng thực tế.** 🎯🏆🚀
