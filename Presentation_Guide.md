# Hướng dẫn Thuyết trình: Quét QR & Thanh toán bằng Điện thoại

Để buổi thuyết trình "xịn" nhất, bạn có thể dùng điện thoại thật để quét mã QR trên màn hình máy tính và thực hiện thanh toán. Dưới đây là các bước thiết lập:

## 1. Điều kiện tiên quyết (Rất quan trọng)
*   **Cùng mạng Wi-Fi:** Điện thoại và Máy tính của bạn phải bắt chung một mạng Wi-Fi.
*   **IP Máy tính:** Địa chỉ IP hiện tại của máy tính bạn là: `192.168.18.127`

## 2. Thiết lập trên Điện thoại (Ví MetaMask Mobile)
Bạn cần thêm mạng Ganache vào app MetaMask trên điện thoại:
1.  Mở App MetaMask trên điện thoại.
2.  Vào **Settings** > **Networks** > **Add Network** > **Custom Networks**.
3.  Điền chính xác thông tin sau (Copy từng dòng):
    *   **Network Name:** `Ganache Local`
    *   **RPC URL:** `http://192.168.18.127:7545`
    *   **Chain ID:** `1337`
    *   **Symbol:** `ETH`
4.  **Import Ví:** Bạn cũng cần Import Private Key từ Ganache vào điện thoại (giống như đã làm trên máy tính) để có 100 ETH mà test.

## 3. Truy cập Web từ Điện thoại
Trên trình duyệt điện thoại (Safari/Chrome), bạn truy cập địa chỉ:
👉 `http://192.168.x.x:3000/` (Thay `192.168.x.x` bằng IP hiện trên Dashboard của bạn)

> Nếu điện thoại không kết nối được, hãy kiểm tra "Windows Firewall" trên máy tính và tạm thời tắt nó đi (hoặc cho phép App nhận kết nối từ bên ngoài) để điện thoại có thể "nhìn thấy" máy tính nhé!

Chúc bạn có một buổi bảo vệ đồ án thành công rực rỡ! 🚀🔥
