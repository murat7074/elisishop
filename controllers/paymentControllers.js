import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import Order from '../models/order.js'
import Product from '../models/product.js'
import User from '../models/user.js'
import axios from 'axios'
import brevoEmailSender from '../emails/brevoEmailSender.js'
import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js'
import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js'

const SHOPIER_API_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php'
const SHOPIER_API_USER = process.env.SHOPIER_API_USER
const SHOPIER_API_PASSWORD = process.env.SHOPIER_API_PASSWORD

// Create Shopier checkout session => /api/v1/payment/checkout_session
export const shopierCheckoutSession = catchAsyncErrors(
  async (req, res, next) => {
    console.log('Request body:', req.body) // Log the incoming request

    const body = req.body
    const errors = []

    for (const item of body.orderItems) {
      const product = await Product.findOne({
        _id: item.product,
        'colors.productColorID': item.productColorID,
      })

      if (!product) {
        errors.push({
          msg: `Ürün bulunamadı: ${item.name}`,
          color: '',
          productColorID: item.productColorID,
        })

        continue // Bu ürün için işlemi atla ve bir sonraki ürüne geç
      }

      const color = product.colors.find(
        (color) => color.productColorID === item.productColorID
      )

      if (color.colorStock < item.amount) {
        errors.push({
          msg: `Stokta yeterli miktarda ürün yok: ${item.name}`,
          color: color.color,
          productColorID: item.productColorID,
        })
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors })
    }

    const totalAmount = body.orderItems.reduce(
      (acc, item) => acc + item.price * item.amount,
      0
    )

    const shippingInfo = body?.shippingInfo
    const shippingInvoiceInfo = body?.shippingInvoiceInfo
    const shippingInvoiceInfoString = JSON.stringify(shippingInvoiceInfo)

    const requestData = {
      API_key: SHOPIER_API_USER,
      API_secret: SHOPIER_API_PASSWORD,
      platform_order_id: req.user._id.toString(),
      total_amount: totalAmount,
      currency: 'TRY',
      customer_email: req.user.email,
      customer_first_name: 'Murat',
      customer_last_name: 'YÖNEV',
      customer_address: shippingInfo.address,
      customer_city: shippingInfo.city,
      customer_country: shippingInfo.country,
      customer_phone: shippingInfo.phoneNo,
      customer_zip_code: shippingInfo.zipCode,
      success_url: `${process.env.FRONTEND_URL}/me/orders/shopier-success`,
      fail_url: `${process.env.FRONTEND_URL}`,
    }

    try {
      const response = await axios.post(SHOPIER_API_URL, requestData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      console.log('Shopier response data:', response.data) // Log the Shopier response

      if (response.data) {
        res.status(200).send(response.data)
      } else {
        res.status(500).json({
          success: false,
          message: 'Shopier ödeme bağlantısı oluşturulamadı.',
        })
      }
    } catch (error) {
      console.error(
        'Shopier API Error: ',
        error.response ? error.response.data : error.message
      )
      res.status(500).json({ success: false, message: error.message })
    }
  }
)

// Webhook for Shopier => /api/v1/payment/webhook
export const shopierWebhook = catchAsyncErrors(async (req, res, next) => {
  try {
    const { status, platform_order_id, payment_id, total_amount } = req.body

    if (status !== 'success') {
      return res
        .status(400)
        .json({ success: false, message: 'Payment not successful' })
    }

    const orderItems = JSON.parse(req.body.order_items)
    const user = platform_order_id

    const totalAmount = parseFloat(total_amount)
    const taxAmount = totalAmount * 0.08 // Assuming 8% tax
    const shippingAmount = req.body.shipping_amount || 0
    const itemsPrice = totalAmount - taxAmount - shippingAmount

    const shippingInfo = {
      address: req.body.customer_address,
      city: req.body.customer_city,
      phoneNo: req.body.customer_phone,
      zipCode: req.body.customer_zip_code,
      country: req.body.customer_country,
      userName:
        req.body.customer_first_name + ' ' + req.body.customer_last_name,
    }

    const paymentInfo = {
      id: payment_id,
      status: status,
    }

    const orderData = {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxAmount,
      shippingAmount,
      totalAmount,
      paymentInfo,
      paymentMethod: 'Card',
      user,
    }

    const order = await Order.create(orderData)

    // Sipariş oluşturulduktan sonra stok ve renk stok güncelleme işlemleri
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product)

      if (product) {
        for (const colorItem of item.colors) {
          const productColor = product.colors.find(
            (color) => color.color === colorItem.color
          )

          if (productColor) {
            productColor.colorStock -= item.amount
          }
        }

        product.stock -= item.amount

        await Product.findByIdAndUpdate(
          item.product,
          { $set: { stock: product.stock, colors: product.colors } },
          { new: true, runValidators: true }
        )
      }
    }

    // SEND EMAIL TO USER

    const orderProducts = order.orderItems
    const orderInfo = {
      itemsPrice: order?.orderItems
        ?.reduce((acc, item) => acc + item.price * item.amount, 0)
        .toFixed(2),
      taxAmount: order.taxAmount,
      shippingAmount: order.shippingAmount,
      totalAmount: order.totalAmount,
      orderNumber: order._id,
      paymentMethod: order.paymentMethod,
    }

    const userShippingInfo = order.shippingInfo

    const message = orderDetailTemplateForCustomer(
      userShippingInfo,
      orderInfo,
      orderProducts
    )

    const userInfo = await User.findOne({ _id: user })

    await brevoEmailSender({
      email: userInfo.email,
      subject: 'Beybuilmek Sipariş Verildi.',
      message,
      name: userInfo.name,
    })

    // SEND EMAIL TO SELLER

    const sellerEmail = 'beybuilmek@gmail.com'
    const sellerName = 'beybuilmek'

    const messageForSeller = orderDetailTemplateForSeller(
      userShippingInfo,
      orderInfo,
      orderProducts
    )

    await brevoEmailSender({
      email: sellerEmail,
      subject: 'Beybuilmek Sipariş Verildi.',
      message: messageForSeller,
      name: sellerName,
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.log('Error => ', error)
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
})

// import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
// import Order from '../models/order.js'
// import Product from '../models/product.js'
// import User from '../models/user.js'
// import axios from 'axios'
// import brevoEmailSender from '../emails/brevoEmailSender.js'
// import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js'
// import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js'

// const SHOPIER_API_URL = 'https://www.shopier.com/ShowProduct/api_pay4.php'
// const SHOPIER_API_USER = process.env.SHOPIER_API_USER
// const SHOPIER_API_PASSWORD = process.env.SHOPIER_API_PASSWORD

// // Create Shopier checkout session => /api/v1/payment/checkout_session
// export const shopierCheckoutSession = catchAsyncErrors(
//   async (req, res, next) => {
//     const body = req.body

//     const errors = []

//     // 2. Adım: Sipariş Edilen Ürünleri Kontrol Etme
//     for (const item of body.orderItems) {
//       const product = await Product.findOne({
//         _id: item.product,
//         'colors.productColorID': item.productColorID,
//       })

//       if (!product) {
//         errors.push({
//           msg: `Ürün bulunamadı: ${item.name}`,
//           color: '',
//           productColorID: item.productColorID,
//         })

//         continue // Bu ürün için işlemi atla ve bir sonraki ürüne geç
//       }

//       const color = product.colors.find(
//         (color) => color.productColorID === item.productColorID
//       )

//       if (color.colorStock < item.amount) {
//         errors.push({
//           msg: `Stokta yeterli miktarda ürün yok: ${item.name}`,
//           color: color.color,
//           productColorID: item.productColorID,
//         })
//       }
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({ success: false, errors })
//     }

//     const totalAmount = body.orderItems.reduce(
//       (acc, item) => acc + item.price * item.amount,
//       0
//     )

//     const shippingInfo = body?.shippingInfo
//     const shippingInvoiceInfo = body?.shippingInvoiceInfo
//     const shippingInvoiceInfoString = JSON.stringify(shippingInvoiceInfo)

//     const requestData = {
//       API_key: SHOPIER_API_USER,
//       API_secret: SHOPIER_API_PASSWORD,
//       platform_order_id: req.user._id.toString(),
//       total_amount: totalAmount,
//       currency: 'TRY',
//       customer_email: req.user.email,
//       customer_first_name: shippingInfo.userName,
//       customer_last_name: shippingInfo.userName,
//       customer_address: shippingInfo.address,
//       customer_city: shippingInfo.city,
//       customer_country: shippingInfo.country,
//       customer_phone: shippingInfo.phoneNo,
//       customer_zip_code: shippingInfo.zipCode,
//       success_url: `${process.env.FRONTEND_URL}/me/orders/shopier-success`,
//       fail_url: `${process.env.FRONTEND_URL}`,
//     }

//     try {
//       const response = await axios.post(SHOPIER_API_URL, requestData, {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       })

//       if (response.data) {
//         console.log('Shopier response data:', response.data) // Hata ayıklama için log ekleyin
//         res.status(200).send(response.data)
//       } else {
//         res.status(500).json({
//           success: false,
//           message: 'Shopier ödeme bağlantısı oluşturulamadı.',
//         })
//       }
//     } catch (error) {
//       console.error(
//         'Shopier API Error: ',
//         error.response ? error.response.data : error.message
//       ) // Hata ayıklama için logla
//       res.status(500).json({ success: false, message: error.message })
//     }
//   }
// )

// // Webhook for Shopier => /api/v1/payment/webhook
// export const shopierWebhook = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const { status, platform_order_id, payment_id, total_amount } = req.body

//     if (status !== 'success') {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Payment not successful' })
//     }

//     const orderItems = JSON.parse(req.body.order_items)
//     const user = platform_order_id

//     const totalAmount = parseFloat(total_amount)
//     const taxAmount = totalAmount * 0.08 // Assuming 8% tax
//     const shippingAmount = req.body.shipping_amount || 0
//     const itemsPrice = totalAmount - taxAmount - shippingAmount

//     const shippingInfo = {
//       address: req.body.customer_address,
//       city: req.body.customer_city,
//       phoneNo: req.body.customer_phone,
//       zipCode: req.body.customer_zip_code,
//       country: req.body.customer_country,
//       userName:
//         req.body.customer_first_name + ' ' + req.body.customer_last_name,
//     }

//     const paymentInfo = {
//       id: payment_id,
//       status: status,
//     }

//     const orderData = {
//       shippingInfo,
//       orderItems,
//       itemsPrice,
//       taxAmount,
//       shippingAmount,
//       totalAmount,
//       paymentInfo,
//       paymentMethod: 'Card',
//       user,
//     }

//     const order = await Order.create(orderData)

//     // Sipariş oluşturulduktan sonra stok ve renk stok güncelleme işlemleri
//     for (const item of order.orderItems) {
//       const product = await Product.findById(item.product)

//       if (product) {
//         for (const colorItem of item.colors) {
//           const productColor = product.colors.find(
//             (color) => color.color === colorItem.color
//           )

//           if (productColor) {
//             productColor.colorStock -= item.amount
//           }
//         }

//         product.stock -= item.amount

//         await Product.findByIdAndUpdate(
//           item.product,
//           { $set: { stock: product.stock, colors: product.colors } },
//           { new: true, runValidators: true }
//         )
//       }
//     }

//     // SEND EMAIL TO USER

//     const orderProducts = order.orderItems
//     const orderInfo = {
//       itemsPrice: order?.orderItems
//         ?.reduce((acc, item) => acc + item.price * item.amount, 0)
//         .toFixed(2),
//       taxAmount: order.taxAmount,
//       shippingAmount: order.shippingAmount,
//       totalAmount: order.totalAmount,
//       orderNumber: order._id,
//       paymentMethod: order.paymentMethod,
//     }

//     const userShippingInfo = order.shippingInfo

//     const message = orderDetailTemplateForCustomer(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     )

//     const userInfo = await User.findOne({ _id: user })

//     await brevoEmailSender({
//       email: userInfo.email,
//       subject: 'Beybuilmek Sipariş Verildi.',
//       message,
//       name: userInfo.name,
//     })

//     // SEND EMAIL TO SELLER

//     const sellerEmail = 'beybuilmek@gmail.com'
//     const sellerName = 'beybuilmek'

//     const messageForSeller = orderDetailTemplateForSeller(
//       userShippingInfo,
//       orderInfo,
//       orderProducts
//     )

//     await brevoEmailSender({
//       email: sellerEmail,
//       subject: 'Beybuilmek Sipariş Verildi.',
//       message: messageForSeller,
//       name: sellerName,
//     })

//     res.status(200).json({ success: true })
//   } catch (error) {
//     console.log('Error => ', error)
//     res.status(400).send(`Webhook Error: ${error.message}`)
//   }
// })

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
