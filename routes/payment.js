import express from 'express'
const router = express.Router()

import { isAuthenticatedUser } from '../middlewares/auth.js'
import {
  shopierCheckoutSession,
  shopierWebhook,
} from '../controllers/paymentControllers.js'

// Shopier checkout session endpoint
router
  .route('/payment/checkout_session')
  .post(isAuthenticatedUser, shopierCheckoutSession)

// Shopier webhook endpoint
router.route('/payment/webhook').post(shopierWebhook)

export default router





// import express from 'express';
// const router = express.Router();

// import { isAuthenticatedUser } from '../middlewares/auth.js';
// import { stripeCheckoutSession, stripeWebhook } from '../controllers/paymentControllers.js';

// router.route('/payment/checkout_session').post(isAuthenticatedUser, stripeCheckoutSession);
// router.route('/payment/webhook').post(stripeWebhook);

// export default router;
