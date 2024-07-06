import Product from '../models/product.js'
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../utils/errorHandler.js'
import controllerFunction from '../middlewares/catchAsyncErrors.js'
import APIFilters from '../utils/apiFilters.js'
import Order from '../models/order.js'
import { delete_file, upload_file } from '../utils/cloudinary.js'

// Get All products  =>  /api/v1/products
export const getProductsFiltered = controllerFunction(async (req, res) => {
 
  const resPerPage = 9

  //  /api/v1/products?keyword=Nikon
  const apiFilters = new APIFilters(Product, req.query).search().filters()
  let products = await apiFilters.query
  let filteredProductsCount = products.length
  apiFilters.pagination(resPerPage)
  products = await apiFilters.query.clone()

 

  res.status(200).json({
    resPerPage,
    filteredProductsCount,
    products,
  })
})

// Create new Product   =>  /api/v1/admin/products
export const newProduct = controllerFunction(async (req, res) => {
  req.body.user = req.user._id // sadece admin product ekleyebilir.

  // Yeni ürün oluşturulurken, renklerin stok miktarlarının toplamı hesaplanır
  const totalStock = req.body.colors.reduce(
    (total, color) => total + color.colorStock,
    0
  )
  // Toplam stok miktarı gerçek stok alanına atanır
  req.body.stock = totalStock // ==> stock a renlerin toplam stoğunu ekliyelim.

  const product = await Product.create(req.body)

  // Her bir productColorID'ye color + product._id ekleyelim
  product.colors.forEach((color) => {
    color.productColorID = `${color.color}_${product._id}`
  })

  // Güncellenmiş ürünü kaydedelim
  await product.save()

  res.status(200).json({
    product,
  })
})

// Get products - ADMIN   =>  /api/v1/products-all
export const getProductsAll = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({
    products,
  })
})

// Get products - ADMIN   =>  /api/v1/admin/products
export const getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({
    products,
  })
})
// Get products - ADMIN   =>  /api/v1/products-featured
export const getProductsFeatured = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find()

  const featuredProducts = products.filter((item) => item.featured !== false)

  res.status(200).json({
    featuredProducts,
  })
})

// Get single product   =>  /api/v1/products/id
export const getProductDetails = controllerFunction(async (req, res, next) => {

  const product = await Product.findById(req?.params?.id).populate(
    'reviews.user'
  )

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  res.status(200).json({
    product,
  })
})

//  update Product   =>  /api/v1/products/id
export const updateProduct = controllerFunction(async (req, res) => {

  let product = await Product.findById(req?.params?.id)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }


  // Yeni ürün oluşturulurken, renklerin stok miktarlarının toplamı hesaplanır
  const totalStock = req.body.colors.reduce(
    (total, color) => total + color.colorStock,
    0
  )

  // Toplam stok miktarı gerçek stok alanına atanır
  req.body.stock = totalStock // ==> stock a renlerin toplam stoğunu ekliyelim.

  req.body.colors.forEach((color) => {
    // yeni eklenen color product için "productColorID" oluşturalım
    if (!color.productColorID) {
      color.productColorID = `${color.color}_${product._id}`
    }
  })

  product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  })

  res.status(200).json({
    product,
  })
})

// Upload product images   =>  /api/v1/admin/products/:id/upload_images
export const uploadProductImages = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req?.params?.id)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  const uploader = async (image) =>
    upload_file(image, 'beybuilmek/products')

  const urls = await Promise.all((req?.body?.images).map(uploader))

  product?.images?.push(...urls)
  await product?.save()

  res.status(200).json({
    product,
  })
})

// Delete product image   =>  /api/v1/admin/products/:id/delete_image
export const deleteProductImage = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req?.params?.id)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  // cloudinary den silelim
  const isDeleted = await delete_file(req.body.imgId)

  // Mongodb den silelim
  if (isDeleted) {
    product.images = product?.images?.filter(
      (img) => img.public_id !== req.body.imgId
    )

    await product?.save()
  }

  res.status(200).json({
    product,
  })
})

//  update Delete   =>  /api/v1/products/id
// Delete product   =>  /api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req?.params?.id)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  // Deleting image associated with product from cloudinary
  for (let i = 0; i < product?.images?.length; i++) {
    await delete_file(product?.images[i].public_id)
  }

  await product.deleteOne()

  res.status(200).json({
    message: 'Ürün Silindi.',
  })
})


export const createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
    featured: false,
    createdAt: new Date(),
  }

  const product = await Product.findById(productId)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  // userı yorumu varmı
  const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
  )

  // userın yorumu varsa ==> update
  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment
        review.rating = rating
        review.featured = false
        review.createdAt = new Date()
      }
    })
  } else {
    // userın yorumu yoksa ==> yeni yorum ekle
    product.reviews.push(review)
  }

  // Featured olan yorumlar için numOfReviews ve ratings hesaplanacak
  const featuredReviews = product.reviews.filter((r) => r.featured)
  product.numOfReviews = featuredReviews.length
  product.ratings =
    featuredReviews.reduce((acc, item) => item.rating + acc, 0) /
    (featuredReviews.length || 1) 

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
  })
})

// Get product reviews   =>  /api/v1/reviews
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate('reviews.user')

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  res.status(200).json({
    reviews: product.reviews,
    image: product.images?.[0]?.url,
  })
})

// Delete product review   =>  /api/v1/admin/reviews
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.query.productId)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  // yorumu silicez
  const reviews = product?.reviews?.filter(
    (review) => review._id.toString() !== req?.query?.id.toString()
  )

  // tekrar hesaplanacak
  const numOfReviews = reviews.length

  // tekrar hesaplanacak
  const ratings =
    numOfReviews === 0
      ? 0
      : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        numOfReviews 

  product = await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numOfReviews, ratings },
    { new: true }
  )

  res.status(200).json({
    success: true,
    product,
  })
})



export const updateFeatured = catchAsyncErrors(async (req, res, next) => {
  const featured = req.body.featured

  let product = await Product.findById(req.query.productId)

  if (!product) {
    return next(new ErrorHandler('Ürün Bulunamdı.', 404))
  }

  const review = product.reviews.find(
    (item) => item._id.toString() === req.query.id
  )

  if (!review) {
    return next(new ErrorHandler('Yorum Bulunamdı.', 404))
  }

  review.featured = featured

  await product.save()

  // Total reviews and rating calculation
  const featuredReviews = product.reviews.filter((r) => r.featured)
  product.numOfReviews = featuredReviews.length
  product.ratings =
    featuredReviews.reduce((acc, item) => item.rating + acc, 0) /
    (featuredReviews.length || 1)

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    message: 'Yorum durumu güncellendi.',
    product,
  })
})

// eğer user ürünü satın aldıysa yorum yapabilecek

// Can user review   =>  /api/v1/can_review
export const canUserReview = catchAsyncErrors(async (req, res) => {
  // Kullanıcının siparişlerini kontrol et
  const orders = await Order.find({
    user: req.user._id,
    'orderItems.product': req.query.productId,
  })

  

  // Kullanıcının ürünü satın alıp almadığını kontrol et
  if (orders.length === 0) {
    return res.status(200).json({ canReview: false })
  }

  // Siparişlerin durumunu kontrol et
  // Siparişlerin arasında `orderStatus` alanı 'Delivered' olduğunda, `canReview: true` döndürün
  const orderDelivered = orders.some(
    (order) => order.orderStatus === 'Delivered'
  )
  if (orderDelivered) {
    return res.status(200).json({
      canReview: true,
    })
  }

  // Eğer siparişlerde 'Delivered' durumu yoksa
  res.status(200).json({
    canReview: false,
  })
})


