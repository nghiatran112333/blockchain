# Yêu cầu: Node.js, ví MetaMask có Sepolia ETH.

# BƯỚC 1: TRIỂN KHAI SMART CONTRACT LÊN SEPOLIA
1. Mở folder `Contract` trong VS Code.
2. Tạo file mới tên là `.env` và dán nội dung sau vào (điền thông tin của bạn):
   ```env
   RPC_URL=https://rpc.sepolia.org
   PRIVATE_KEY=VÍ_CỦA_BẠN_TRONG_METAMASK
   ```
3. Mở Terminal và chạy: 
   `npm install dotenv`
   `node deploy_prod.js`
4. Copy địa chỉ hợp đồng vừa hiện ra để kiểm tra (không bắt buộc).

# BƯỚC 2: ĐƯA LÊN HOSTING (VERCEL)
1. Tải ứng dụng **Vercel** hoặc vào [vercel.com](https://vercel.com/dashboard).
2. Nén folder `CryptoPay-Frontend` thành file `.zip` (hoặc kéo thả cả folder vào Vercel).
3. Đặt tên project là `CryptoPay-Demo`.
4. Bấm **Deploy**.

**KẾT QUẢ**: Bạn sẽ có một link dạng `cryptopay-demo.vercel.app`. 
Bất kỳ ai ở bất kỳ đâu cũng có thể vào link này để thực hiện thanh toán THẬT trên mạng Sepolia!
