const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Biến lưu giao dịch mới nhất
let latestTransaction = {
    transferAmount: 0,
    code: "Đang chờ...",
    content: "Chưa có giao dịch",
    transactionDate: "---"
};

// Route nhận Webhook từ SePay (POST)
app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log("Nhận dữ liệu từ SePay:", data);

    if (data && data.transferAmount) {
        latestTransaction = {
            transferAmount: data.transferAmount,
            code: data.gateway || data.referenceCode || "Khách hàng",
            content: data.content || "",
            transactionDate: data.transactionDate || new Date().toLocaleString()
        };
    }

    res.status(200).json({ success: true });
});

// Route để trang web Netlify gọi vào lấy dữ liệu (GET)
app.get('/latest-transaction', (req, res) => {
    res.json(latestTransaction);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server HOÀNG VIP WIN đang chạy cổng ${PORT}`);
});
