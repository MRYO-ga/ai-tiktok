const express = require('express');
const router = express.Router();
const { createOrder, checkPaymentStatus } = require('../services/paymentService');

router.post('/create-order', async (req, res) => {
  try {
    const { plan, method, isYearly } = req.body;
    const order = await createOrder(plan, method, isYearly);
    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: "创建订单失败，请稍后重试" });
  }
});

router.get('/check-payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const status = await checkPaymentStatus(orderId);
    res.json(status);
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ success: false, message: "检查支付状态失败，请稍后重试" });
  }
});

module.exports = router;