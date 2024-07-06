import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import Product from '../models/product.js'
import Order from '../models/order.js'
import ErrorHandler from '../utils/errorHandler.js'
import User from '../models/user.js'

import brevoEmailSender from '../emails/brevoEmailSender.js'
import { orderDetailTemplateForCustomer } from '../emails/emailTemplates/orderDetailTemplateForCustomer.js'
import { orderDetailTemplateForSeller } from '../emails/emailTemplates/orderDetailTemplateForSeller.js'
import { orderShippedTemplate } from '../emails/emailTemplates/orderShippedTemplate.js'
import { orderDeliveredTemplateForCustomer } from '../emails/emailTemplates/orderDeliveredTemplateForCustomer.js'
import { orderDeliveredTemplateForSeller } from '../emails/emailTemplates/orderDeliveredTemplateForSeller.js'
import { orderReturnRequestTemplateForSeller } from '../emails/emailTemplates/orderReturnRequestTemplateForSeller.js'
import { orderReturnRequestTemplateForCustomer } from '../emails/emailTemplates/orderReturnRequestTemplateForCustomer.js'
import { orderDeleteTemplate } from '../emails/emailTemplates/orderDeleteTemplate.js'

// Create new Order  =>  /api/v1/orders/new

export const newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    shippingInvoiceInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
  } = req.body

 
  const errors = []

  // 2. Adım: Sipariş Edilen Ürünleri Kontrol Etme
  for (const item of orderItems) {
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

  // SİPARİŞİ KAYDETMEDEN ÖNCE BAZI HESAPLAMARI DEĞİŞTİRİCEZ
  // frontendden fiyat kdv dahil geliyordu.

  // KDV siz fiyat hesaplama
  const orderItemsExceptTax = orderItems?.map((item) => {
    const price = item.price // KDV dahil fiyat (örneğin, $1.08)
    const tax_rate = 8 // KDV oranı %8

    // KDV'siz fiyatı hesapla
    const base_price = price / (1 + tax_rate / 100)

    const newPrice = Number(base_price.toFixed(2))

    //  console.log(newPrice);

    return { ...item, price: newPrice }
  })

  const tax_rate = 8 // %8 KDV oranı

  const calculateTotalTax = orderItemsExceptTax
    ?.reduce((acc, item) => {
      const base_price = item.price // Vergisiz fiyat
      const tax_amount = base_price * (tax_rate / 100) // KDV miktarını hesapla
      return acc + tax_amount * item.amount // Toplam KDV miktarını ekle
    }, 0)
    .toFixed(2)

  // TOPLAM ürün fiyatları

  const newItemsPrice = orderItemsExceptTax
    ?.reduce((acc, item) => {
      const price = item.price // Vergisiz fiyat
      return acc + price * item.amount // Toplam fiyatı ekle
    }, 0)
    .toFixed(2)

  // ödenecek toplam fiyat

  const total = (
    parseFloat(calculateTotalTax) +
    parseFloat(newItemsPrice) +
    parseFloat(shippingAmount)
  ).toFixed(2)



  //Sipariş kaydetme ve diğer işlemler buraya gelecek

  // Create a new order
  const order = await Order.create({
    orderItems: orderItemsExceptTax,
    shippingInfo,
    shippingInvoiceInfo,
    itemsPrice: parseFloat(newItemsPrice),
    taxAmount: parseFloat(calculateTotalTax),
    shippingAmount: parseFloat(shippingAmount),
    totalAmount: parseFloat(total),
    paymentMethod,
    paymentInfo,
    user: req.user._id,
  })

  // Update stock and color stock after creating an order
  for (const item of order.orderItems) {
    // Find the corresponding product
    const product = await Product.findById(item.product)

    if (product) {
      // Update stock and color stock
      for (const colorItem of item.colors) {
        const productColor = product.colors.find(
          (color) => color.color === colorItem.color
        )

        if (productColor) {
          productColor.colorStock -= item.amount
        }
      }

      // Decrement the total product stock
      product.stock -= item.amount

      // Save the updated product to the database
      await Product.findByIdAndUpdate(
        item.product,
        { $set: { stock: product.stock, colors: product.colors } },
        { new: true, runValidators: true }
      )
    }
  }

  /// SEND EMAIL TO USER

  const orderProducts = order.orderItems

  const orderInfo = {
    // itemsPrice: order.itemsPrice,
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

  await brevoEmailSender({
    email: req.user.email,
    subject: 'Beybuilmek Sİpariş Verildi.',
    message,
    name: req.user.name,
  })

  /// SEND EMAIL TO SELLER
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

  // Örnek yanıt
  res
    .status(200)
    .json({ success: true, message: 'Sipariş başarıyla oluşturuldu.', order })
})

// Get current user orders  =>  /api/v1/me/orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })

  res.status(200).json({
    orders,
  })
})

// Get order details  =>  /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user', // user modelde
    'name email' // name ve email
  )


  if (!order) {
    return next(new ErrorHandler('Sipariş Bulunamdı.', 404))
  }

  res.status(200).json({
    order,
  })
})

// Get all orders - ADMIN  =>  /api/v1/admin/orders
export const allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()

  res.status(200).json({
    orders,
  })
})

// Update Order - ADMIN  =>  /api/v1/admin/orders/:id
export const updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new ErrorHandler('Sipariş Bulunamdı.', 404))
  }

 
  let productNotFound = false

  if (productNotFound) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  order.orderStatus = req.body.status
  order.deliveredAt = Date.now()

  await order.save()

  // SEND EMAIL

  if (order.orderStatus === 'Shipped') {
    order.shippedNo = req?.body?.shippedNo
    order.shippedFirm = req?.body?.shippedFirm
    await order.save()

    // SEND EMAIL TO CUSTOMER
    const orderProducts = order?.orderItems
    const orderTotals = {
      // itemsPrice: order.itemsPrice,
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
    const shippedNoForEmail = order?.shippedNo
    const shippedFirmForEmail = order?.shippedFirm

  

    const message = orderShippedTemplate(
      userShippingInfo,
      orderTotals,
      orderProducts,
      shippedNoForEmail,
      shippedFirmForEmail,
    )

    const userInfo = await User.findOne({ _id: order.user })

    await brevoEmailSender({
      email: userInfo.email,
      subject: 'Beybuilmek Sipariş Kargoya Verildi.',
      message,
      name: userInfo.name,
    })
  }

  if (order.orderStatus === 'Delivered') {
    // console.log('here delivered')

    const orderProducts = order.orderItems
    const orderTotals = {
      // itemsPrice: order.itemsPrice,
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

    

    const message = orderDeliveredTemplateForCustomer(
      userShippingInfo,
      orderTotals,
      orderProducts
    )

    const userInfo = await User.findOne({ _id: order.user })

    await brevoEmailSender({
      email: userInfo.email,
      subject: 'Beybuilmek Sipariş Teslim Edildi.',
      message,
      name: userInfo.name,
    })

    /// SEND EMAIL TO SELLER

    const sellerEmail = 'beybuilmek@gmail.com'
    const sellerName = 'beybuilmek'

    const messageForSeller = orderDeliveredTemplateForSeller(
      userShippingInfo,
      orderTotals,
      orderProducts
    )

    await brevoEmailSender({
      email: sellerEmail,
      subject: 'Beybuilmek Sipariş Teslim Edildi.',
      message: messageForSeller,
      name: sellerName,
    })
  }

  res.status(200).json({
    success: true,
  })
})

// Delete order  =>  /api/v1/admin/orders/:id
export const deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const { title, message } = req?.body

  const order = await Order.findById(req?.params?.id)

  if (!order) {
    return next(new ErrorHandler('Sipariş Bulunamdı.', 404))
  }

  const user = await User.findById(order?.user)

  if (!user) {
    return next(new ErrorHandler('Kullanıcı Bulunamdı.', 404))
  }

  // set Admin message  to the user's messages
  const userMessageFromAdmin = {
    title,
    message,
    orderID: req?.params?.id,
    userID: order?.user,
    systemMessages: true,
  }
  user.userMessages.push(userMessageFromAdmin)

  await user.save()

  //SEND EMAIL

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

  // send email to customer

  const messageForCustomer = orderDeleteTemplate(
    userShippingInfo,
    orderInfo,
    orderProducts,
    message,
    title
  )

  await brevoEmailSender({
    email: user?.email,
    subject: 'Beybuilmek Sipariş İptali.',
    message: messageForCustomer,
    name: user?.name,
  })

  order.orderStatus = 'Deleted'
  await order.save()

  res.status(200).json({
    success: true,
  })
})

async function getSalesData(startDate, endDate) {
  const salesData = await Order.aggregate([
    {
      // Stage 1 - Filter results
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      // Stage 2 - Group Data
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
        totalSales: { $sum: '$totalAmount' },
        numOrders: { $sum: 1 }, // count the number of orders
      },
    },
  ])

  // Create a Map to store sales data and num of order by data
  const salesMap = new Map()
  let totalSales = 0
  let totalNumOrders = 0

  salesData.forEach((entry) => {
    const date = entry?._id.date
    const sales = entry?.totalSales
    const numOrders = entry?.numOrders

    salesMap.set(date, { sales, numOrders })
    totalSales += sales
    totalNumOrders += numOrders
  })

  // Generate an array of dates between start & end Date
  const datesBetween = getDatesBetween(startDate, endDate)

  // Create final sales data array with 0 for dates without sales
  const finalSalesData = datesBetween.map((date) => ({
    date,
    sales: (salesMap.get(date) || { sales: 0 }).sales,
    numOrders: (salesMap.get(date) || { numOrders: 0 }).numOrders,
  }))

  // console.log(finalSalesData);

  return { salesData: finalSalesData, totalSales, totalNumOrders }
}

function getDatesBetween(startDate, endDate) {
  const dates = []
  let currentDate = new Date(startDate)

  while (currentDate <= new Date(endDate)) {
    const formattedDate = currentDate.toISOString().split('T')[0]
    dates.push(formattedDate)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

// Get Sales Data  =>  /api/v1/admin/get_sales
export const getSales = catchAsyncErrors(async (req, res, next) => {
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(req.query.endDate)

  startDate.setUTCHours(0, 0, 0, 0)
  endDate.setUTCHours(23, 59, 59, 999)

  const { salesData, totalSales, totalNumOrders } = await getSalesData(
    startDate,
    endDate
  )

  res.status(200).json({
    totalSales,
    totalNumOrders,
    sales: salesData,
  })
})

export const returnRequestOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params
  const { message, title } = req.body

  // Check if required fields are present
  if (!id || !message || !title) {
    return next(new ErrorHandler('İd, mesaj, ve başlık girilmeli.', 400))
  }

  const user = await User.findById(req?.user?._id)

  if (!user) {
    return next(new ErrorHandler('Kullanıcı Bulunamadı.', 404))
  }

  const order = await Order.findById(id)

  if (!order) {
    return next(new ErrorHandler('Sipariş Bulunamdı.', 404))
  }

  order.returnRequest = true
  await order.save()

  const userMessage = {
    title,
    message,
    orderID: id,
    userID: req?.user?._id,
  }

  // Add the message to the user's messages
  user.userMessages.push(userMessage)
  await user.save()


  //SEND EMAIL

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

  // send email to customer

  const messageForCustomer = orderReturnRequestTemplateForCustomer(
    userShippingInfo,
    orderInfo,
    orderProducts,
    message,
    title
  )



  await brevoEmailSender({
    email: user?.email,
    subject: 'Beybuilmek Ürün İadesi.',
    message: messageForCustomer,
    name: user?.name,
  })

  // send email to seller

  const sellerEmail = 'beybuilmek@gmail.com'
  const sellerName = 'beybuilmek'

  const messageForSeller = orderReturnRequestTemplateForSeller(
    userShippingInfo,
    orderInfo,
    orderProducts,
    message,
    title
  )

  await brevoEmailSender({
    email: sellerEmail,
    subject: 'Beybuilmek Ürün İadesi.',
    message: messageForSeller,
    name: sellerName,
  })

  res.status(200).json({
    success: true,
    message: 'İade mesajı oluşturuldu.',
  })
})
