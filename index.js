const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Lưu trữ danh sách giao dịch (Trong thực tế nên dùng Database, nhưng dùng mảng tạm cũng được)
let transactions = [];

// Route nhận Webhook từ SePay (POST)
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log("Nhận dữ liệu từ SePay:", data);

    if (data && data.transferAmount) {
        transactions.push({
            transferAmount: data.transferAmount,
            content: data.content || "",
            transactionDate: data.transactionDate || new Date().toLocaleString()
        });
        // Giới hạn chỉ lưu 100 giao dịch gần nhất để tránh tràn RAM
        if (transactions.length > 100) transactions.shift();
    }

    res.status(200).json({ success: true });
});

// Route để Bot hoặc Netlify gọi vào kiểm tra
// Ví dụ: /check?content=NAP12312H&amount=12000
app.get('/check', (req, res) => {
    const { content, amount } = req.query;
    
    if (!content) {
        return res.status(400).json({ status: "error", message: "Thiếu nội dung chuyển khoản" });
    }

    const reqAmount = parseInt(amount);
    const reqContent = content.toUpperCase();

    // Tìm giao dịch khớp nội dung và số tiền
    const found = transactions.find(tx => 
        tx.content.toUpperCase().includes(reqContent) && 
        tx.transferAmount >= reqAmount
    );

    if (found) {
        // Đã tìm thấy -> Xóa khỏi danh sách để không bị dùng lại
        transactions = transactions.filter(tx => tx !== found);
        return res.json({ status: "success", amount: found.transferAmount });
    } else {
        return res.json({ status: "error", message: "Chưa thấy tiền" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server HOÀNG VIP WIN đang chạy cổng ${PORT}`);
});
