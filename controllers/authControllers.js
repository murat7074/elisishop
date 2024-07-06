import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import User from '../models/user.js'
import Order from '../models/order.js'
import ErrorHandler from '../utils/errorHandler.js'
import sendToken from '../utils/sendToken.js'
import crypto from 'crypto'
import { delete_file, upload_file } from '../utils/cloudinary.js'

import brevoEmailSender from '../emails/brevoEmailSender.js'
import { registerVerifyTemplate } from '../emails/emailTemplates/registerVerifyTemplate.js'
import { forgotPasswordTemplate } from '../emails/emailTemplates/forgotPasswordTemplate.js'
import { orderReturnReMessageTemplate } from '../emails/emailTemplates/orderReturnReMessageTemplate.js'

// Register user   =>  /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body

  const user = await User.create({
    name,
    email,
    password,
  })

  const verificationToken = await user.getVerifyToken()

  await user.save()

  // Create verify url
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?verificationToken=${verificationToken}&email=${email}`

  const message = registerVerifyTemplate({ verifyUrl, userName: user?.name })

  try {
    await brevoEmailSender({
      email: user.email,
      message,
      subject: 'Hesap Doğrulama',
    })

    res.status(200).json({
      message: `Email Gönderildi: ${user.email}`,
    })
  } catch (error) {
    user.verificationToken = undefined
    user.verificationTokenExpire = undefined

    await user.save()
    return next(new ErrorHandler(error?.message, 500))
  }
})

// Verify user   =>  /api/v1/verify

export const verifyUser = catchAsyncErrors(async (req, res, next) => {
  const { verificationToken, email } = req.body

  // Hash the URL Token
  const verifyToken = crypto
    .createHash('sha256')
    .update(verificationToken) // 1. frontend den gelicek
    .digest('hex')

  const user = await User.findOne({
    // 2. database de kıyaslayacağız
    email,
    verificationToken: verifyToken,
    verificationTokenExpire: { $gt: Date.now() }, // zamanı dolmamışsa
  })

  if (!user) {
    return next(new ErrorHandler('Onaylama Başarısız', 401))
  }

  user.isVerified = true
  user.verified = Date.now()

  user.verificationToken = undefined
  user.verificationTokenExpire = undefined

  await user.save()

  res.status(200).json({ message: 'Email Onaylandı' })
})

// Login user   =>  /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  // console.log('hello login')
  const { email, password } = req.body

  // console.log('req.body', email, password)

  if (!email || !password) {
    return next(new ErrorHandler('Lütfen email ve  parola giriniz', 400))
  }

  // Find user in the database
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorHandler('Geçersiz parola veya email', 401))
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password)

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Geçersiz parola veya email', 401))
  }

  sendToken(user, 200, res)
})

// Logout user => /api/v1/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie('token', '', {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'PRODUCTION', // production'da secure flag'ini ekleyin
    sameSite: 'None',
  })

  res.status(200).json({
    message: 'Çıkış Yapıldı.',
  })
})

// Upload user avatar   =>  /api/v1/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  // upload avatar to cloudinary
  const avatarResponse = await upload_file(
    req.body.avatar,
    'beybuilmek/avatars'
  )

  // Remove previous avatar from cloudinary
  if (req?.user?.avatar?.url) {
    await delete_file(req?.user?.avatar?.public_id)
  }
  // add new  avatar "url" and "id" to mongodb
  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  })

  res.status(200).json({
    user,
  })
})

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // Find user in the database
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorHandler('Bu email de kullanıcı bulunamadı', 404))
  }

  // Check if the user already requested a password reset in the last 30 minutes
  const currentTime = Date.now()
  if (user.resetPasswordExpire && user.resetPasswordExpire > currentTime) {
    return next(
      new ErrorHandler(
        '30 dakika içinde sadece  bir istekte bulunabilirsiniz.',
        400
      )
    )
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken()

  await user.save()

  // Create reset password url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

  const message = forgotPasswordTemplate({
    verifyUrl: resetUrl,
    userName: user.name,
  })

  try {
    await brevoEmailSender({
      email: user.email,
      message,
      subject: 'Parola Yenileme',
    })

    res.status(200).json({
      message: `Email gönderildi: ${user.email}`,
    })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    return next(new ErrorHandler(error.message, 500))
  }
})

// Reset password   =>  /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the URL Token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token) // 1. frontend den gelicek
    .digest('hex')

  const user = await User.findOne({
    // 2. database de kıyaslayacağız
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // zamanı dolmamışsa
  })

  if (!user) {
    return next(
      new ErrorHandler('Parola yenileme linki geçersiz veya süresi doldu.', 400)
    )
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Parolalar Uyuşmuyor.', 400))
  }

  // Set the new password
  user.password = req.body.password

  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()

  sendToken(user, 200, res)
})

// Get current user profile  =>  /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id)

  res.status(200).json({
    user,
  })
})

export const getUserMessage = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id)
  const orders = await Order.find({ user: req?.user?._id })

  // Kullanıcının siparişleri ve mesajlarını içeren yeni bir array oluştur
  const userRtnMsg = orders.flatMap((order) => {
    const messages = user.userMessages.filter(
      (message) => message.orderID.toString() === order._id.toString()
    )
    return messages.map((message) => ({
      order,
      messages: [message], // Mesajları dizi içinde tek bir obje olarak döndür
    }))
  })

  res.status(200).json({
    userRtnMsg,
  })
})

// Get AdminUser Messages  =>  /api/v1/admin/messages

export const getAdminUserMessage = catchAsyncErrors(async (req, res, next) => {
  // userMessages içeren tüm kullanıcıları bul ve userMessages dizisi boş olmayanları filtrele
  const usersWithMessages = await User.find({
    userMessages: { $exists: true, $ne: [] },
  })

  if (usersWithMessages.length === 0) {
    return res.status(404).json({ message: 'Kullanıcı mesajı bulunamadı.' })
  }

  // Tüm userMessages içindeki orderID'leri toplayarak benzersiz hale getirin
  const orderIDs = [
    ...new Set(
      usersWithMessages.flatMap((user) =>
        user.userMessages.map((message) => message.orderID)
      )
    ),
  ]

  // Bu orderID'lere sahip tüm siparişleri bulun
  const orders = await Order.find({ _id: { $in: orderIDs } })

  // console.log('orders', orders);

  // Kullanıcıların mesajları ve ilgili siparişleri içeren yeni bir dizi oluştur
  let result = []

  usersWithMessages.forEach((user) => {
    user.userMessages.forEach((message) => {
      const order = orders.find(
        (order) => order._id.toString() === message.orderID.toString()
      )
      if (order) {
        result.push({
          order,
          messages: [message],
        })
      }
    })
  })

  // console.log(result);

  // Yanıtı gönder
  res.status(200).json({ result })
})

export const reMessageAdmin = catchAsyncErrors(async (req, res, next) => {
  const { message, title, userID, messageID } = req?.body
  // console.log(message, title, userID, messageID)

  const user = await User.findById(userID)
  // console.log(user)
  if (!user) {
    return next(new ErrorHandler('Kullanıcı bulunamdı.', 404))
  }

  const order = await Order.findById(req?.params?.id)

  if (!order) {
    return next(new ErrorHandler('Sipariş Bulunamdı.', 404))
  }

  // set Admin message  to the user's messages
  const userMessageFromAdmin = {
    title,
    message,
    orderID: req?.params?.id,
    userID,
    systemMessages: true,
  }
  user.userMessages.push(userMessageFromAdmin)

  await user.save()

  // update user Message

  // Belirli mesaj kimliğine sahip kullanıcıları bul
  const userWithMessages = await User.find({
    'userMessages._id': messageID,
  })

  // Her kullanıcı belgesini güncelle
  for (const user of userWithMessages) {
    // userMessages dizisinde eşleşen mesajı bul ve güncelle
    const message = user.userMessages.id(messageID)
    if (message) {
      message.reMessage = true
    }

    // Belgeyi kaydet
    await user.save()
  }
  // update order

  order.orderStatus = 'Return-Processing'
  await order.save()

  // SEND EMAIL TO USER

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

  // send email to customer

  const messageForCustomer = orderReturnReMessageTemplate(
    userShippingInfo,
    orderInfo,
    orderProducts,
    message,
    title
  )

  await brevoEmailSender({
    email: user?.email,
    subject: 'Beybuilmek Ürün İadesi Mesaj Yanıtı.',
    message: messageForCustomer,
    name: user?.name,
  })

  // Yanıtı gönder
  res.status(200).json({ success: true, message: 'Admin mesajı dönderildi.' })
})

// Update Password  =>  /api/v1/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select('+password') //  '+password'  da seçeceğiz ki userın "oldPassword" ile kıyaslayalım

  // Check the previous user password
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Eski parola yanlış.', 400))
  }

  user.password = req.body.password
  user.save()

  res.status(200).json({
    success: true,
  })
})

// Update User Profile  =>  /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
  })

  res.status(200).json({
    user,
  })
})

// Add or Update User Address =>  /api/v1/me/add_delivery_address
export const addDeliveryAddressUser = catchAsyncErrors(
  async (req, res, next) => {
    const userAddress = {
      title: req.body.title,
      userName: req.body.userName,
      address: req.body.address,
      city: req.body.city,
      zipCode: req.body.zipCode,
      phoneNo: req.body.phoneNo,
      country: req.body.country,
      addressID: req.body.addressID || crypto.randomBytes(20).toString('hex'),
    }

    const user = await User.findById(req?.user?._id)

    if (!user) {
      return next(new ErrorHandler('Kullanıcı Bulunamdı', 404))
    }

    // Mevcut adres kontrolü
    const existingAddress = user.address.delivery_address.find(
      (address) => address.addressID === userAddress.addressID
    )

    if (existingAddress) {
      // Mevcut adresi güncelleme
      existingAddress.title = userAddress.title
      existingAddress.userName = userAddress.userName
      existingAddress.address = userAddress.address
      existingAddress.city = userAddress.city
      existingAddress.zipCode = userAddress.zipCode
      existingAddress.phoneNo = userAddress.phoneNo
      existingAddress.country = userAddress.country

      await user.save()

      res.status(200).json({
        message: 'Sipariş adresi güncellendi.',
        success: true,
      })
    } else {
      // Yeni adres ekleme
      user.address.delivery_address.push(userAddress)

      await user.save()

      res.status(200).json({
        message: 'Sipariş adresi eklendi.',
        success: true,
      })
    }
  }
)

// Add or Update User Invoice Address =>  /api/v1/me/add_invoice_address
export const addInvoiceAddressUser = catchAsyncErrors(
  async (req, res, next) => {
    const userAddress = {
      title: req.body.title,
      userName: req.body.userName,
      address: req.body.address,
      city: req.body.city,
      zipCode: req.body.zipCode,
      phoneNo: req.body.phoneNo,
      country: req.body.country,
      addressID: req.body.addressID || crypto.randomBytes(20).toString('hex'),
    }

    // console.log(userAddress);

    const user = await User.findById(req?.user?._id)

    if (!user) {
      return next(new ErrorHandler('Kullanıcı Bulunamdı.', 404))
    }

    // Mevcut adres kontrolü
    const existingAddress = user.address.invoice_address.find(
      (address) => address.addressID === userAddress.addressID
    )

    if (existingAddress) {
      // Mevcut adresi güncelleme
      existingAddress.title = userAddress.title
      existingAddress.userName = userAddress.userName
      existingAddress.address = userAddress.address
      existingAddress.city = userAddress.city
      existingAddress.zipCode = userAddress.zipCode
      existingAddress.phoneNo = userAddress.phoneNo
      existingAddress.country = userAddress.country

      await user.save()

      res.status(200).json({
        message: 'Fatura adresi güncellendi.',
        success: true,
      })
    } else {
      // Yeni adres ekleme
      user.address.invoice_address.push(userAddress)

      await user.save()

      res.status(200).json({
        message: 'Fatura adresi eklendi.',
        success: true,
      })
    }
  }
)

// Delete User Delivery Address =>  /api/v1/me/delete_delivery_address
export const deleteDeliveryAddressUser = catchAsyncErrors(
  async (req, res, next) => {
    // console.log('hello Delivery',req.body)

    const { addressID } = req.body

    //  console.log(addressID);

    const user = await User.findById(req?.user?._id)

    if (!user) {
      return next(new ErrorHandler('Kullanıcı Bulunamdı.', 404))
    }

    // Kullanıcının teslimat adreslerini filtrele ve belirtilen addressID'ye sahip olmayan adresleri sakla
    const newDeliveryAddress = user.address.delivery_address.filter(
      (address) => address.addressID !== addressID
    )

    // Eğer teslimat adreslerinde bir değişiklik olduysa
    if (newDeliveryAddress.length !== user.address.delivery_address.length) {
      user.address.delivery_address = newDeliveryAddress
      await user.save()

      res.status(200).json({
        success: true,
        message: 'Sipariş adresi silindi.',
      })
    } else {
      // Belirtilen addressID'ye sahip adres bulunamazsa hata döndür
      return next(new ErrorHandler('Adres Bulunamdı.', 404))
    }
  }
)

// Delete User Invoice Address =>  /api/v1/me/delete_invoice_address
export const deleteInvoiceAddressUser = catchAsyncErrors(
  async (req, res, next) => {
    // console.log("hello Invoice");

    const { addressID } = req.body

    const user = await User.findById(req?.user?._id)

    if (!user) {
      return next(new ErrorHandler('Kullanıcı Bulunamdı.', 404))
    }

    // Kullanıcının fatura adreslerini filtrele ve belirtilen addressID'ye sahip olmayan adresleri sakla
    const newInvoiceAddress = user.address.invoice_address.filter(
      (address) => address.addressID !== addressID
    )

    // Eğer fatura adreslerinde bir değişiklik olduysa
    if (newInvoiceAddress.length !== user.address.invoice_address.length) {
      user.address.invoice_address = newInvoiceAddress
      await user.save()

      res.status(200).json({
        success: true,
        message: 'Fatura adresi silindi.',
      })
    } else {
      // Belirtilen addressID'ye sahip adres bulunamazsa hata döndür
      return next(new ErrorHandler('Adres Bulunamdı.', 404))
    }
  }
)

// Get all Users - ADMIN  =>  /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    users,
  })
})

// Get User Details - ADMIN  =>  /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorHandler(` ${req.params.id} id ile kullanıcı bulunamdı.`, 404)
    )
  }

  res.status(200).json({
    user,
  })
})

// Update User Details - ADMIN  =>  /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    isVerified: req.body.isVerified,
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  })

  res.status(200).json({
    user,
  })
})

// Delete User - ADMIN  =>  /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(
      new ErrorHandler(` ${req.params.id} id ile kullanıcı bulunamdı.`, 404)
    )
  }

  // Remove user avatar from cloudinary
  if (user?.avatar?.public_id) {
    await delete_file(user?.avatar?.public_id)
  }

  await user.deleteOne()

  res.status(200).json({
    success: true,
  })
})
