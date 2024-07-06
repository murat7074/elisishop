import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  addressID: {
    type: String,
    default: false,
  },
})

// User message schema with timestamps
const userMessageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    orderID: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
    },
 
     systemMessages: {
      type: Boolean,
     default:false
    },
     reMessage: {
      type: Boolean,
     default:false
    },
 
  },
  { timestamps: true }
)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      maxLength: [50, 'Your name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minLength: [6, 'Your password must be longer than 6 characters'],
      select: false, 
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: 'user',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    address: {
      invoice_address: {
        type: [addressSchema],
        default: [],
      },
      delivery_address: {
        type: [addressSchema],
        default: [],
      },
    },

    userMessages: {
      type: [userMessageSchema],
      default: [],
    },

    verified: Date,

    verificationToken: String,
    verificationTokenExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  { timestamps: true }
)

// Encrypting password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  this.password = await bcrypt.hash(this.password, 10)
})

// Return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  })
}

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Generate verify token
userSchema.methods.getVerifyToken = function () {
  // Gernerate token
  const verifyToken = crypto.randomBytes(20).toString('hex')

  // Hash and set to resetPasswordToken field
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex')

  // Set token expire time
  this.verificationTokenExpire = Date.now() + 30 * 60 * 1000 // 30 dakika

  return verifyToken
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Gernerate token
  const resetToken = crypto.randomBytes(20).toString('hex')

  // Hash and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000 // 30 dakika

  return resetToken
}

export default mongoose.model('User', userSchema)
