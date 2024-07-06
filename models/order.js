import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    shippingInvoiceInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
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
      },
    ],
    paymentMethod: {
      type: String,
      required: [true, 'Please select payment method'],
      enum: {
        values: ['COD', 'Card'],
        message: 'Please select: COD or Card',
      },
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      required: true,
    },
    shippingAmount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippedNo: {
      type: String,
      default: false,
    },
    shippedFirm: {
      type: String,
      default: false,
    },
    orderStatus: {
      type: String,
      enum: {
        values: [
          'Processing',
          'Shipped',
          'Delivered',
          'Returned',
          'Return-Processing',
          'Deleted',
        ],
        message: 'Please select correct order status',
      },
      default: 'Processing',
    },

    returnRequest: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,
  },
  { timestamps: true }
)

export default mongoose.model('Order', orderSchema)
