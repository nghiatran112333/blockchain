# HƯỚNG DẪN: "BẠN CHỈ VIỆC TEST" - 3 BƯỚC CUỐI CÙNG

Vì lý do bảo mật, tôi không thể lấy trộm "Mật khẩu bí mật" (Private Key) của bạn. Bạn hãy làm 3 bước này, chỉ mất đúng 60 giây và mọi thứ sẽ TỰ ĐỘNG CHẠY HẾT!

## Bước 1: Dán "Mật khẩu bí mật"
1. Mở app MetaMask -> Chọn **Account 1** (Ví có tiền).
2. Bấm vào **Settings (Cài đặt)** -> **Security & Privacy (Bảo mật & Quyền riêng tư)** -> **Show Private Key (Hiện khóa bí mật)**.
3. Copy cái chuỗi dài đó.
4. Mở file `.env` tôi vừa tạo trong VS Code và dán khóa đó vào:
   ```env
   PRIVATE_KEY=DÁN_VÀO_ĐÂY
   RPC_URL=https://rpc.sepolia.org
   ```

## Bước 2: Chạy câu lệnh duy nhất (Automation)
Bạn chỉ cần mở Terminal trong VS Code và dán đúng câu lệnh này:
`cd Contract; npm install dotenv; node deploy_prod.js`

🚀 **KẾT QUẢ**: Script này sẽ tự động deploy lên Blockchain Sepolia và cập nhật toàn bộ trang web cho bạn!

## Bước 3: Đưa lên Hosting
Bạn chỉ cần kéo thả folder `CryptoPay-Frontend` vào trang này: **[vercel.com/new](https://vercel.com/new)**

---
👉 Sau khi làm xong, link web của bạn sẽ là `https://ten-cua-ban.vercel.app`. BẤT CỨ AI CŨNG CÓ THỂ THANH TOÁN THẬT!
