import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import Iyzipay from 'iyzipay';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY,
  secretKey: process.env.IYZIPAY_SECRET_KEY,
  uri: 'https://sandbox-api.iyzipay.com', // Test ortamı için sandbox URI kullanılıyor
});

export const iyzicoCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  console.log('iyzicoCheckoutSession started');
  const body = req.body;
  console.log('Request body:', body);

  // Sabit tarihler
  const lastLoginDate = '2024-06-05 12:43:35';
  const registrationDate = '2020-04-21 15:12:09';

  // Ödeme isteği oluşturma
  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: uuidv4(),
    price: '100.0', // Ödeme tutarını burada belirleyin
    paidPrice: '120.0', // Ödeme tutarı + KDV olarak burada belirleyin
    currency: Iyzipay.CURRENCY.TRY,
    basketId: 'B67832',
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    buyer: {
      id: '123', // Müşteri ID'si
      name: 'Murat',
      surname: 'Yönev',
      gsmNumber: '+905424571437',
      email: 'murat@example.com',
      identityNumber: '74300864791',
      lastLoginDate: lastLoginDate, // Sabit olarak belirtilen son giriş tarihi
      registrationDate: registrationDate, // Sabit olarak belirtilen kayıt tarihi
      registrationAddress: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8, Gölcük, 41650, Türkiye',
      ip: req.ip,
      city: 'Gölcük',
      country: 'Türkiye',
      zipCode: '41650',
    },
    shippingAddress: {
      contactName: 'Murat',
      city: 'Gölcük',
      country: 'Türkiye',
      address: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8',
      zipCode: '41650',
    },
    billingAddress: {
      contactName: 'Murat',
      city: 'Gölcük',
      country: 'Türkiye',
      address: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8',
      zipCode: '41650',
    },
    basketItems: [
      {
        id: '1', // Ürün ID'si
        name: 'Ürün Adı',
        category1: 'Collectibles',
        category2: 'Accessories',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: '10000', // Kuruş cinsinden fiyat (örneğin, 100.00 TL için 10000)
      },
    ],
    paymentCard: {
      cardHolderName: 'John Doe',
      cardNumber: '5528790000000008',
      expireMonth: '12',
      expireYear: '2030',
      cvc: '123',
      registerCard: '0',
    },
  };

  console.log('Iyzico request:', request);

  // Iyzipay API'si üzerinden gerçek bir ödeme isteği gönderme
  iyzipay.payment.create(request, function (err, result) {
    if (err) {
      console.error('Payment error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Ödeme hatası oluştu',
      });
    }

    console.log('Payment result:', result);

    // Ödeme başarılı ise
    if (result.status === 'success') {
      console.log('Ödeme başarılı');
      res.status(200).json({ success: true, message: 'Ödeme başarılı' });
    } else {
      // Ödeme başarısız ise
      console.log('Ödeme başarısız:', result.errorMessage || 'Ödeme başarısız');
      res.status(400).json({
        success: false,
        message: result.errorMessage || 'Ödeme başarısız',
      });
    }
  });
});

// import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
// import Iyzipay from 'iyzipay';
// import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid';

// dotenv.config();

// const iyzipay = new Iyzipay({
//   apiKey: process.env.IYZIPAY_API_KEY,
//   secretKey: process.env.IYZIPAY_SECRET_KEY,
//   uri: 'https://sandbox-api.iyzipay.com', // Test ortamı için sandbox URI kullanılıyor
// });

// export const iyzicoCheckoutSession = catchAsyncErrors(async (req, res, next) => {
//   console.log('iyzicoCheckoutSession started');
//   const body = req.body;
//   console.log('Request body:', body);

//   // Ödeme isteği oluşturma
//   const request = {
//     locale: Iyzipay.LOCALE.TR,
//     conversationId: uuidv4(),
//     price: '100.0', // Ödeme tutarını burada belirleyin
//     paidPrice: '120.0', // Ödeme tutarı + KDV olarak burada belirleyin
//     currency: Iyzipay.CURRENCY.TRY,
//     basketId: 'B67832',
//     paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
//     buyer: {
//       id: '123', // Müşteri ID'si
//       name: 'Murat',
//       surname: 'Yönev',
//       gsmNumber: '+905424571437',
//       email: 'murat@example.com',
//       identityNumber: '74300864791',
//       lastLoginDate: new Date().toISOString(),
//       registrationDate: new Date().toISOString(),
//       registrationAddress: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8, Gölcük, 41650, Türkiye',
//       ip: req.ip,
//       city: 'Gölcük',
//       country: 'Türkiye',
//       zipCode: '41650',
//     },
//     shippingAddress: {
//       contactName: 'Murat',
//       city: 'Gölcük',
//       country: 'Türkiye',
//       address: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8',
//       zipCode: '41650',
//     },
//     billingAddress: {
//       contactName: 'Murat',
//       city: 'Gölcük',
//       country: 'Türkiye',
//       address: 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8',
//       zipCode: '41650',
//     },
//     basketItems: [
//       {
//         id: '1', // Ürün ID'si
//         name: 'Ürün Adı',
//         category1: 'Collectibles',
//         category2: 'Accessories',
//         itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
//         price: '10000', // Kuruş cinsinden fiyat (örneğin, 100.00 TL için 10000)
//       },
//     ],
//     paymentCard: {
//       cardHolderName: 'John Doe',
//       cardNumber: '5528790000000008',
//       expireMonth: '12',
//       expireYear: '2030',
//       cvc: '123',
//       registerCard: '0',
//     },
//   };

//   console.log('Iyzico request:', request);

//   // Iyzipay API'si üzerinden gerçek bir ödeme isteği gönderme
//   iyzipay.payment.create(request, function (err, result) {
//     if (err) {
//       console.error('Payment error:', err);
//       return res.status(400).json({
//         success: false,
//         message: err.errorMessage || err.message,
//       });
//     }

//     console.log('Payment result:', result);

//     // Ödeme başarılı ise
//     if (result.status === 'success') {
//       console.log('Ödeme başarılı');
//       res.status(200).json({ success: true, message: 'Ödeme başarılı' });
//     } else {
//       // Ödeme başarısız ise
//       console.log('Ödeme başarısız:', result.errorMessage || 'Ödeme başarısız');
//       res.status(400).json({
//         success: false,
//         message: result.errorMessage || 'Ödeme başarısız',
//       });
//     }
//   });
// });

// import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
// import Order from '../models/order.js';
// import Product from '../models/product.js';
// import User from '../models/user.js';
// import Iyzipay from 'iyzipay';
// import brevoEmailSender from '../emails/brevoEmailSender.js';
// import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js';
// import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js';
// import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid';

// dotenv.config();

// const iyzipay = new Iyzipay({
//   apiKey: process.env.IYZIPAY_API_KEY,
//   secretKey: process.env.IYZIPAY_SECRET_KEY,
//   uri: 'https://sandbox-api.iyzipay.com', // Production için 'https://api.iyzipay.com' kullanın
// });

// export const iyzicoCheckoutSession = catchAsyncErrors(async (req, res, next) => {
//   console.log('iyzicoCheckoutSession started');
//   const body = req.body;
//   console.log('Request body:', body);

//   const errors = [];

//   // 2. Adım: Sipariş Edilen Ürünleri Kontrol Etme
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

//       continue;
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
//     console.log('Errors found:', errors);
//     return res.status(400).json({ success: false, errors });
//   }

//   const basketItems = body.orderItems.map((item) => ({
//     id: item.product,
//     name: item.name,
//     category1: 'Collectibles',
//     category2: 'Accessories',
//     itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
//     price: (item.price * 100).toString(),
//   }));

//   const buyer = {
//     id: req.user._id.toString(),
//     name: req.user.name || "Murat",
//     surname: req.user.surname || "Yönev",
//     gsmNumber: req.user.phone || '+905424571437',
//     email: req.user.email,
//     identityNumber: '74300864791',
//     lastLoginDate: new Date().toISOString(),
//     registrationDate: req.user.createdAt.toISOString(),
//     registrationAddress: req.user.address || 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8, Gölcük, 41650, Türkiye',
//     ip: req.ip,
//     city: req.user.city || 'Gölcük',
//     country: req.user.country || 'Türkiye',
//     zipCode: req.user.zipCode || '41650',
//   };

//   const address = {
//     contactName: req.user.name || 'murat',
//     city: req.user.city || 'Gölcük',
//     country: req.user.country || 'Türkiye',
//     address: req.user.address || 'Donanma mah. İlhantuba var. No:25 Altınşehir sitesi I-8',
//     zipCode: req.user.zipCode || '41650',
//   };

//   const request = {
//     locale: Iyzipay.LOCALE.TR,
//     conversationId: uuidv4(),
//     price: body.itemsPrice.toString(),
//     paidPrice: (body.itemsPrice * 1.2).toString(),
//     currency: Iyzipay.CURRENCY.TRY,
//     basketId: 'B67832',
//     paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
//     callbackUrl: `${process.env.FRONTEND_URL}/me/orders/iyzico-success`,
//     buyer: buyer,
//     shippingAddress: address,
//     billingAddress: address,
//     basketItems: basketItems,
//     paymentCard: {
//       cardHolderName: 'John Doe',
//       cardNumber: '5528790000000008',
//       expireMonth: '12',
//       expireYear: '2030',
//       cvc: '123',
//       registerCard: '0',
//     },
//   };

//   console.log('Iyzico request:', request);

//   iyzipay.checkoutFormInitialize.create(request, (err, result) => {
//     if (err) {
//       console.error('Iyzico error:', err);
//       return res.status(500).json({ success: false, message: err });
//     }
//     console.log('Iyzico result:', result);
//     res.status(200).json({
//       success: true,
//       checkoutFormContent: result.checkoutFormContent,
//     });
//   });
// });

// export const iyzicoWebhook = catchAsyncErrors(async (req, res, next) => {
//   console.log('iyzicoWebhook started');
//   const { paymentId, status, conversationData } = req.body;
//   console.log('Webhook data:', req.body);

//   if (status === 'success') {
//     const orderData = JSON.parse(conversationData);
//     const { user, shippingInfo, shippingInvoiceInfo, orderItems, itemsPrice } = orderData;

//     const orderItemsDetails = await getOrderItems(orderItems);
//     console.log('Order items details:', orderItemsDetails);

//     const totalAmount = itemsPrice * 1.2; // KDV oranınızı uygulayın
//     const taxAmount = itemsPrice * 0.2;
//     const shippingAmount = totalAmount - itemsPrice - taxAmount;

//     const paymentInfo = {
//       id: paymentId,
//       status: status,
//     };

//     const order = await Order.create({
//       shippingInfo,
//       shippingInvoiceInfo,
//       orderItems: orderItemsDetails,
//       itemsPrice,
//       taxAmount,
//       shippingAmount,
//       totalAmount,
//       paymentInfo,
//       paymentMethod: 'Card',
//       user,
//     });

//     console.log('Order created:', order);

//     // Sipariş oluşturulduktan sonra stok ve renk stok güncelleme işlemleri
//     for (const item of order.orderItems) {
//       const product = await Product.findById(item.product);

//       if (product) {
//         for (const colorItem of item.colors) {
//           const productColor = product.colors.find(
//             (color) => color.color === colorItem.color
//           );

//           if (productColor) {
//             productColor.colorStock -= item.amount;
//           }
//         }

//         product.stock -= item.amount;

//         await Product.findByIdAndUpdate(
//           item.product,
//           { $set: { stock: product.stock, colors: product.colors } },
//           { new: true, runValidators: true }
//         );
//       }
//     }

//     console.log('Stock updated');

//     // SEND EMAIL TO USER

//     const orderProducts = order.orderItems;
//     const orderInfo = {
//       itemsPrice: order.orderItems
//         .reduce((acc, item) => acc + item.price * item.amount, 0)
//         .toFixed(2),
//       taxAmount: order.taxAmount,
//       shippingAmount: order.shippingAmount,
//       totalAmount: order.totalAmount,
//       orderNumber: order._id,
//       paymentMethod: order.paymentMethod,
//     };

//     const userShippingInfo = order.shippingInfo;

//     const message = orderDetailTemplateForCustomer(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     );

//     const userInfo = await User.findById(user);

//     await brevoEmailSender({
//       email: userInfo.email,
//       subject: 'Beybuilmek Sipariş Verildi.',
//       message,
//       name: userInfo.name,
//     });

//     console.log('Email sent to user');

//     // SEND EMAIL TO SELLER

//     const sellerEmail = 'beybuilmek@gmail.com';
//     const sellerName = 'beybuilmek';

//     const messageForSeller = orderDetailTemplateForSeller(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     );

//     await brevoEmailSender({
//       email: sellerEmail,
//       subject: 'Beybuilmek Sipariş Verildi.',
//       message: messageForSeller,
//       name: sellerName,
//     });

//     console.log('Email sent to seller');

//     res.status(200).json({ success: true });
//   } else {
//     console.log('Payment failed');
//     res.status(400).json({ success: false, message: 'Payment failed' });
//   }
// });

// import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
// import Order from '../models/order.js';
// import Product from '../models/product.js';
// import User from '../models/user.js';
// import Stripe from 'stripe';

// import brevoEmailSender from '../emails/brevoEmailSender.js';
// import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js';
// import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js';

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// // Create stripe checkout session => /api/v1/payment/checkout_session
// export const stripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {
//   const body = req.body;

//   const errors = [];

//   // 2. Adım: Sipariş Edilen Ürünleri Kontrol Etme
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

//   const line_items = body.orderItems.map((item) => {
//     const price = item.price; // KDV dahil fiyat (örneğin, $1.08)
//     const tax_rate = 8; // KDV oranı %8

//     // KDV'siz fiyatı hesapla
//     const base_price = price / (1 + tax_rate / 100);

//     // KDV miktarını hesapla
//     // const tax_amount = price - base_price

//     // Stripe'a gönderilecek cent cinsinden fiyatı hesapla
//     const unit_amount_exceptTax = Math.round(base_price * 100);

//     return {
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: item.name,
//           images: [item.image],
//           metadata: {
//             productId: item.product,
//             colors: JSON.stringify(item.colors),
//           },
//         },
//         unit_amount: unit_amount_exceptTax,
//       },
//       tax_rates: ['txr_1PRHH7JbmmMSw0UfdNmtpHfO'], // 8%
//       quantity: item.amount,
//     };
//   });

//   const shippingInfo = body?.shippingInfo;
//   const shippingInvoiceInfo = body?.shippingInvoiceInfo;
//   const shippingInvoiceInfoString = JSON.stringify(shippingInvoiceInfo);

//   const shipping_rate =
//     body.itemsPrice >= 200
//       ? 'shr_1PRHMzJbmmMSw0UfWBcGzcEc' // ==> 0$ stripe da bu rakamlar tanımlı
//       : 'shr_1PRHPYJbmmMSw0UfsKoqlRvY'; // ==> 25$

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     success_url: `${process.env.FRONTEND_URL}/me/orders/stripe-success`,
//     cancel_url: `${process.env.FRONTEND_URL}`,
//     customer_email: req.user.email,
//     client_reference_id: req.user._id.toString(),
//     mode: 'payment',
//     metadata: {
//       ...shippingInfo,
//       itemsPrice: Number(body.itemsPrice / (1 + 8 / 100)).toFixed(2), // 8% kdv yi çıkalım (frontendden kdv li fiyat geliyor)
//       shippingInvoiceInfo: shippingInvoiceInfoString,
//     },
//     shipping_options: [
//       {
//         shipping_rate,
//       },
//     ],
//     line_items,
//   });

//   res.status(200).json({
//     url: session.url,
//   });
// });

// const getOrderItems = async (line_items) => {
//   return new Promise((resolve, reject) => {
//     let cartItems = [];

//     line_items.data.forEach(async (item) => {
//       const product = await stripe.products.retrieve(item.price.product);
//       const productId = product.metadata.productId;
//       const colors = JSON.parse(product.metadata.colors);

//       cartItems.push({
//         product: productId,
//         name: product.name,
//         price: item.price.unit_amount_decimal / 100,
//         amount: item.quantity,
//         image: product.images[0],
//         colors: colors,
//       });

//       if (cartItems.length === line_items.data.length) {
//         resolve(cartItems);
//       }
//     });
//   });
// };

// // Create new order after payment => /api/v1/payment/webhook
// export const stripeWebhook = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const signature = req.headers['stripe-signature'];

//     const event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;

//       const line_items = await stripe.checkout.sessions.listLineItems(session.id);

//       const orderItems = await getOrderItems(line_items);

//       const user = session.client_reference_id;

//       const totalAmount = session.amount_total / 100;
//       const taxAmount = session.total_details.amount_tax / 100;
//       const shippingAmount = session.total_details.amount_shipping / 100;
//       const itemsPrice = session.metadata.itemsPrice;

//       const shippingInfo = {
//         address: session.metadata.address,
//         city: session.metadata.city,
//         phoneNo: session.metadata.phoneNo,
//         zipCode: session.metadata.zipCode,
//         country: session.metadata.country,
//         userName: session.metadata.userName,
//       };

//       const parsedShippingInvoiceInfo = JSON.parse(session.metadata.shippingInvoiceInfo);

//       const shippingInvoiceInfo = {
//         address: parsedShippingInvoiceInfo.address,
//         city: parsedShippingInvoiceInfo.city,
//         phoneNo: parsedShippingInvoiceInfo.phoneNo,
//         zipCode: parsedShippingInvoiceInfo.zipCode,
//         country: parsedShippingInvoiceInfo.country,
//         userName: session.metadata.userName,
//       };

//       const paymentInfo = {
//         id: session.payment_intent,
//         status: session.payment_status,
//       };

//       const orderData = {
//         shippingInfo,
//         shippingInvoiceInfo,
//         orderItems,
//         itemsPrice,
//         taxAmount,
//         shippingAmount,
//         totalAmount,
//         paymentInfo,
//         paymentMethod: 'Card',
//         user,
//       };

//       const order = await Order.create(orderData);

//       // Sipariş oluşturulduktan sonra stok ve renk stok güncelleme işlemleri
//       for (const item of order.orderItems) {
//         const product = await Product.findById(item.product);

//         if (product) {
//           for (const colorItem of item.colors) {
//             const productColor = product.colors.find(
//               (color) => color.color === colorItem.color
//             );

//             if (productColor) {
//               productColor.colorStock -= item.amount;
//             }
//           }

//           product.stock -= item.amount;

//           await Product.findByIdAndUpdate(
//             item.product,
//             { $set: { stock: product.stock, colors: product.colors } },
//             { new: true, runValidators: true }
//           );
//         }
//       }

//       // SEND EMAIL TO USER

//       const orderProducts = order.orderItems;
//       const orderInfo = {
//         itemsPrice: order?.orderItems
//           ?.reduce((acc, item) => acc + item.price * item.amount, 0)
//           .toFixed(2),
//         taxAmount: order.taxAmount,
//         shippingAmount: order.shippingAmount,
//         totalAmount: order.totalAmount,
//         orderNumber: order._id,
//         paymentMethod: order.paymentMethod,
//       };

//       const userShippingInfo = order.shippingInfo;

//       const message = orderDetailTemplateForCustomer(
//         userShippingInfo,
//         orderInfo,
//         orderProducts
//       );

//       const userInfo = await User.findOne({ _id: user });

//       await brevoEmailSender({
//         email: userInfo.email,
//         subject: 'Beybuilmek Sipariş Verildi.',
//         message,
//         name: userInfo.name,
//       });

//       // SEND EMAIL TO SELLER

//       const sellerEmail = 'beybuilmek@gmail.com';
//       const sellerName = 'beybuilmek';

//       const messageForSeller = orderDetailTemplateForSeller(
//         userShippingInfo,
//         orderInfo,
//         orderProducts
//       );

//       await brevoEmailSender({
//         email: sellerEmail,
//         subject: 'Beybuilmek Sipariş Verildi.',
//         message: messageForSeller,
//         name: sellerName,
//       });

//       res.status(200).json({ success: true });
//     }
//   } catch (error) {
//     console.log('Error => ', error);
//     res.status(400).send(`Webhook Error: ${error.message}`);
//   }
// });
