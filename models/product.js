import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      maxLength: [200, 'Product name cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxLength: [9, 'Product price cannot exceed 9 digits'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    features: {
      type: String,
      required: [true, 'Please enter product features'], 
      default:false,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please enter product category'],
      enum: {
        values: [
          'Bayan Çanta',
          'Bayan Kıyafet',
          'Çocuk Kıyafet',
          'Çocuk Çanta',
          'Bebek Kıyafet',
        ],
        message: 'Please select correct category',
      },
    },
    seller: {
      type: String,
      required: [true, 'Please enter product seller'],
    },

    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      required: true,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    colors: [
      {
        color: {
          type: String,
          required: true,
          default: '#222',
        },
        colorStock: {
          type: Number,
          required: true,
          default: 1,
        },
        productColorID: {
          type: String,
          default: '',
        },
      },
    ],
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        featured: {
          type: Boolean,
          default: false,
        },
        createdAt: Date,
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// stock  hesaplama
// Belge kaydedilmeden önce çalışacak ön işlem (pre-hook)
productSchema.pre('save', function (next) {
  // colors dizisindeki her bir renk için stok miktarını topla
  const totalStock = this.colors.reduce(
    (total, color) => total + color.colorStock,
    0
  )
  // Toplam stok miktarını gerçek stok alanına atayarak kaydet
  this.stock = totalStock
  next() 
})

// productColorID oluşturma
productSchema.pre('save', function (next) {
  // colors dizisindeki her bir renk için productColorID'yi oluştur
  this.colors.forEach((color) => {
    color.productColorID = `${color.color}_${this._id}`
  })

 
  next()
})

export default mongoose.model('Product', productSchema)
