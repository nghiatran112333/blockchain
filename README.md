# 🚀 CryptoPay: Hệ thống Thanh toán Blockchain Cao cấp (Premium)

Chào mừng bạn đến với **CryptoPay** - Một giải pháp thanh toán Smart Contract chuyên nghiệp với giao diện Glassmorphism hiện đại, hỗ trợ tích hợp Ganache và MetaMask hoàn chỉnh.

## 🌟 Tính năng chính
- **Giao diện Glassmorphism**: Thiết kế hiệu ứng kính mờ, gradient mượt mà và chuyển cảnh cao cấp.
- **Hệ thống Toast Notification**: Thông báo trượt trực quan cho mọi hành động (Kết nối, Đăng ký, Rút tiền).
- **Automated Deployment**: Tự động biên dịch và triển khai Smart Contract chỉ với 1 lệnh Node.js.
- **Bảo mật**: Tích hợp `ReentrancyGuard` để bảo vệ các giao dịch rút tiền.
- **QR Code Payment**: Tự động tạo mã QR chứa dữ liệu thanh toán cho khách hàng quét.

---

## 🛠️ Hướng dẫn Cài đặt & Chạy Dự án

### 1. Khởi động Ganache (Cơ sở dữ liệu Blockchain)
- Mở **Ganache GUI** trên máy tính.
- Đảm bảo Server chạy tại: `http://127.0.0.1:7545`
- Mnemonic mặc định (đã cấu hình cho script): `put trade hope mean perfect boat chicken clean exclude cost welcome meadow`

### 2. Triển khai Smart Contract (Chuyên nghiệp)
Thay vì dùng Remix thủ công, hãy dùng script tự động để "bơm" contract vào Ganache và tự cập nhật Frontend:
```bash
cd Contract
node deploy_auto.js
```
*Script sẽ tự động cập nhật địa chỉ Contract mới nhất vào file `main.js` cho bạn.*

### 3. Cấu hình MetaMask
- Thêm mạng **Ganache Local**: RPC `http://127.0.0.1:7545` (trên máy tính) hoặc `http://192.168.18.127:7545` (trên điện thoại), Chain ID `1337`.
- Nhập **Private Key** từ một ví bất kỳ trong Ganache vào MetaMask để có 100 ETH làm lộ phí.

### 4. Chạy Frontend
```bash
# Tại thư mục gốc
npx serve -s CryptoPay-Frontend -p 3000
```
Truy cập trên máy tính: [http://localhost:3000](http://localhost:3000)
Truy cập trên điện thoại: [http://192.168.18.127:3000](http://192.168.18.127:3000)

---

## 📱 Hướng dẫn Thuyết trình (Demo trên điện thoại)
Để buổi trình bày thêm thuyết phục, bạn có thể xem hướng dẫn chi tiết cách dùng điện thoại quét mã QR tại đây:
👉 **[Presentation_Guide.md](file:///c:/Users/tranm/.gemini/antigravity/scratch/blockchain1/Presentation_Guide.md)**

---
**Lưu ý**: Nếu giao dịch bị kẹt (nút Confirm không sáng), hãy vào **MetaMask -> Settings -> Advanced -> Clear activity tab data**.
