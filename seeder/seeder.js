import mongoose from 'mongoose'
import products from './data.js'
import Product from '../models/product.js'
import dotenv from 'dotenv'

if (process.env.NODE_ENV !== 'PRODUCTION') {
  dotenv.config({ path: 'config/config.env' })
}

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.DB_URI)

    await Product.deleteMany()
    console.log('Products are deleted')

    await Product.insertMany(products)
    console.log('Products are added')

    process.exit()
  } catch (error) {
    console.log(error.message)
    process.exit()
  }
}

seedProducts()
