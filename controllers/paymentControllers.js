

import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import Order from '../models/order.js';
import Product from '../models/product.js';
import User from '../models/user.js';
import brevoEmailSender from '../emails/brevoEmailSender.js';
import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js';
import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js';


const merchant_id = process.env.PAYTR_MERCHANT_ID; // PayTR'dan alınan merchant id
const merchant_key = process.env.PAYTR_MERCHANT_KEY; // PayTR'dan alınan merchant key
const merchant_salt = process.env.PAYTR_MERCHANT_SALT; // PayTR'dan alınan merchant salt

// Create PayTR payment session => /api/v1/payment/paytr
export const paytrCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  console.log('Request body:', req.body); // Log request body
  const body = req.body;

  const errors = [];

  // Sipariş Edilen Ürünleri Kontrol Etme
  for (const item of body.orderItems) {
    const product = await Product.findOne({
      _id: item.product,
      'colors.productColorID': item.productColorID,
    });

    if (!product) {
      errors.push({
        msg: `Ürün bulunamadı: ${item.name}`,
        color: '',
        productColorID: item.productColorID,
      });

      continue; // Bu ürün için işlemi atla ve bir sonraki ürüne geç
    }

    const color = product.colors.find(
      (color) => color.productColorID === item.productColorID
    );

    if (color.colorStock < item.amount) {
      errors.push({
        msg: `Stokta yeterli miktarda ürün yok: ${item.name}`,
        color: color.color,
        productColorID: item.productColorID,
      });
    }
  }

  if (errors.length > 0) {
    console.log('Product errors:', errors); // Log errors
    return res.status(400).json({ success: false, errors });
  }

  const user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const payment_amount = body.itemsPrice * 100; // kuruş cinsinden ödeme miktarı
  const user_basket = body.orderItems.map((item) => [
    item.name, item.price * 100, item.amount
  ]);

  const data = {
    merchant_id,
    user_ip,
    merchant_oid: `oid_${new Date().getTime()}`,
    email: req.user.email,
    payment_amount,
    user_basket: JSON.stringify(user_basket),
    no_installment: 0, // Taksit yapılmasın
    max_installment: 0, // Maksimum taksit sayısı 0
    currency: 'TL',
    test_mode: 1, // Test modu, canlıya alırken 0 yapın
    merchant_ok_url: `${process.env.FRONTEND_URL}/me/orders/paytr-success`,
    merchant_fail_url: `${process.env.FRONTEND_URL}/me/orders/paytr-fail`,
    user_name: 'Test User', // Kullanıcı adı (Zorunlu)
    user_address: 'Test Address', // Kullanıcı adresi (Zorunlu)
    user_phone: '5555555555', // Kullanıcı telefon numarası (Zorunlu)
  };

  // Güvenlik Hash'ini oluştur
  const hash_str = `${merchant_id}${user_ip}${data.merchant_oid}${req.user.email}${payment_amount}${data.user_basket}${data.no_installment}${data.currency}${data.test_mode}${merchant_salt}`;
  data.paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str).digest('base64');

  console.log('PayTR request data:', data); // Log PayTR request data

  try {
    const response = await axios.post('https://www.paytr.com/odeme/api/get-token', data);
    console.log('PayTR response:', response.data); // Log PayTR response
    res.json(response.data);
  } catch (error) {
    console.log('PayTR error:', error.response ? error.response.data : error.message); // Log error
    res.status(500).send(error.message);
  }
});

// PayTR Webhook
export const paytrWebhook = catchAsyncErrors(async (req, res, next) => {
  const paytr = req.body;
  console.log('PayTR webhook payload:', paytr); // Log webhook payload
  const hash = crypto
    .createHmac('sha256', process.env.PAYTR_MERCHANT_SALT)
    .update(
      `${paytr.merchant_oid}${process.env.PAYTR_MERCHANT_SALT}${paytr.status}${paytr.total_amount}`
    )
    .digest('base64');

  if (paytr.hash !== hash) {
    console.log('Invalid hash:', paytr.hash, 'Expected hash:', hash); // Log invalid hash
    return res.status(400).send('Invalid Hash');
  }

  if (paytr.status === 'success') {
    const session = await Order.findOne({ merchant_oid: paytr.merchant_oid });
    if (!session) return res.status(404).send('Order not found');

    // Sipariş ve ürün güncellemelerini burada yapabilirsiniz
    session.paymentInfo = {
      id: paytr.merchant_oid,
      status: 'Paid',
    };

    await session.save();

    // E-posta gönderimi
    const user = await User.findById(session.user);
    const orderProducts = session.orderItems;
    const orderInfo = {
      itemsPrice: session?.orderItems
        ?.reduce((acc, item) => acc + item.price * item.amount, 0)
        .toFixed(2),
      taxAmount: session.taxAmount,
      shippingAmount: session.shippingAmount,
      totalAmount: session.totalAmount,
      orderNumber: session._id,
      paymentMethod: session.paymentMethod,
    };

    const userShippingInfo = session.shippingInfo;

    const message = orderDetailTemplateForCustomer(
      userShippingInfo,
      orderInfo,
      orderProducts
    );

    await brevoEmailSender({
      email: user.email,
      subject: 'Siparişiniz Onaylandı',
      message,
      name: user.name,
    });

    // Satıcıya e-posta gönderme
    const sellerEmail = 'seller@example.com';
    const sellerName = 'Seller';

    const messageForSeller = orderDetailTemplateForSeller(
      userShippingInfo,
      orderInfo,
      orderProducts
    );

    await brevoEmailSender({
      email: sellerEmail,
      subject: 'Yeni Sipariş',
      message: messageForSeller,
      name: sellerName,
    });

    res.status(200).send('OK');
  } else {
    res.status(400).send('Payment Failed');
  }
});

const getOrderItems = async (items) => {
  const cartItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (product) {
      cartItems.push({
        product: item.productId,
        name: item.name,
        price: item.price / 100,
        amount: item.amount,
        image: item.image,
        colors: item.colors,
      });
    }
  }

  return cartItems;
};

export default {
  paytrCheckoutSession,
  paytrWebhook,
};




// import express from 'express';
// import axios from 'axios';
// import bodyParser from 'body-parser';
// import crypto from 'crypto';
// import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
// import Order from '../models/order.js';
// import Product from '../models/product.js';
// import User from '../models/user.js';
// import brevoEmailSender from '../emails/brevoEmailSender.js';
// import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js';
// import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js';

// const app = express();
// app.use(bodyParser.json());

// const merchant_id = process.env.PAYTR_MERCHANT_ID; // PayTR'dan alınan merchant id
// const merchant_key = process.env.PAYTR_MERCHANT_KEY; // PayTR'dan alınan merchant key
// const merchant_salt = process.env.PAYTR_MERCHANT_SALT; // PayTR'dan alınan merchant salt

// // Create PayTR payment session => /api/v1/payment/paytr
// export const paytrCheckoutSession = catchAsyncErrors(async (req, res, next) => {
//   const body = req.body;
//   const errors = [];

//   // Sipariş Edilen Ürünleri Kontrol Etme
//   for (const item of body.orderItems) {
//     const product = await Product.findOne({
//       _id: item.product,
//       'colors.productColorID': item.productColorID,
//     });

//     if (!product) {
//       errors.push({
//         msg: `Ürün bulunamadı: ${item.name}`,
//         color: '',
//         productColorID: item.productColorID,
//       });

//       continue; // Bu ürün için işlemi atla ve bir sonraki ürüne geç
//     }

//     const color = product.colors.find(
//       (color) => color.productColorID === item.productColorID
//     );

//     if (color.colorStock < item.amount) {
//       errors.push({
//         msg: `Stokta yeterli miktarda ürün yok: ${item.name}`,
//         color: color.color,
//         productColorID: item.productColorID,
//       });
//     }
//   }

//   if (errors.length > 0) {
//     return res.status(400).json({ success: false, errors });
//   }

//   const user_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//   const payment_amount = body.itemsPrice * 100; // kuruş cinsinden ödeme miktarı
//   const user_basket = body.orderItems.map((item) => [
//     item.name, item.price * 100, item.amount
//   ]);

//   const data = {
//     merchant_id,
//     user_ip,
//     merchant_oid: `oid_${new Date().getTime()}`,
//     email: req.user.email,
//     payment_amount,
//     user_basket: JSON.stringify(user_basket),
//     no_installment: 0, // Taksit yapılmasın
//     max_installment: 0, // Maksimum taksit sayısı 0
//     currency: 'TL',
//     test_mode: 1, // Test modu, canlıya alırken 0 yapın
//     merchant_ok_url: `${process.env.FRONTEND_URL}/me/orders/paytr-success`,
//     merchant_fail_url: `${process.env.FRONTEND_URL}/me/orders/paytr-fail`,
//     user_name: 'Test User', // Kullanıcı adı (Zorunlu)
//     user_address: 'Test Address', // Kullanıcı adresi (Zorunlu)
//     user_phone: '5555555555', // Kullanıcı telefon numarası (Zorunlu)
//   };

//   // Güvenlik Hash'ini oluştur
//   const hash_str = `${merchant_id}${user_ip}${data.merchant_oid}${req.user.email}${payment_amount}${data.user_basket}${data.no_installment}${data.currency}${data.test_mode}${merchant_salt}`;
//   data.paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str).digest('base64');

//   try {
//     const response = await axios.post('https://www.paytr.com/odeme/api/get-token', data);
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// // PayTR Webhook
// export const paytrWebhook = catchAsyncErrors(async (req, res, next) => {
//   const paytr = req.body;
//   const hash = crypto
//     .createHmac('sha256', process.env.PAYTR_MERCHANT_SALT)
//     .update(
//       `${paytr.merchant_oid}${process.env.PAYTR_MERCHANT_SALT}${paytr.status}${paytr.total_amount}`
//     )
//     .digest('base64');

//   if (paytr.hash !== hash) {
//     return res.status(400).send('Invalid Hash');
//   }

//   if (paytr.status === 'success') {
//     const session = await Order.findOne({ merchant_oid: paytr.merchant_oid });
//     if (!session) return res.status(404).send('Order not found');

//     // Sipariş ve ürün güncellemelerini burada yapabilirsiniz
//     session.paymentInfo = {
//       id: paytr.merchant_oid,
//       status: 'Paid',
//     };

//     await session.save();

//     // E-posta gönderimi
//     const user = await User.findById(session.user);
//     const orderProducts = session.orderItems;
//     const orderInfo = {
//       itemsPrice: session?.orderItems
//         ?.reduce((acc, item) => acc + item.price * item.amount, 0)
//         .toFixed(2),
//       taxAmount: session.taxAmount,
//       shippingAmount: session.shippingAmount,
//       totalAmount: session.totalAmount,
//       orderNumber: session._id,
//       paymentMethod: session.paymentMethod,
//     };

//     const userShippingInfo = session.shippingInfo;

//     const message = orderDetailTemplateForCustomer(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     );

//     await brevoEmailSender({
//       email: user.email,
//       subject: 'Siparişiniz Onaylandı',
//       message,
//       name: user.name,
//     });

//     // Satıcıya e-posta gönderme
//     const sellerEmail = 'seller@example.com';
//     const sellerName = 'Seller';

//     const messageForSeller = orderDetailTemplateForSeller(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     );

//     await brevoEmailSender({
//       email: sellerEmail,
//       subject: 'Yeni Sipariş',
//       message: messageForSeller,
//       name: sellerName,
//     });

//     res.status(200).send('OK');
//   } else {
//     res.status(400).send('Payment Failed');
//   }
// });

// const getOrderItems = async (items) => {
//   const cartItems = [];

//   for (const item of items) {
//     const product = await Product.findById(item.productId);
//     if (product) {
//       cartItems.push({
//         product: item.productId,
//         name: item.name,
//         price: item.price / 100,
//         amount: item.amount,
//         image: item.image,
//         colors: item.colors,
//       });
//     }
//   }

//   return cartItems;
// };

// export default {
//   paytrCheckoutSession,
//   paytrWebhook,
// };






