
import express from 'express';
import { isAuthenticatedUser } from '../middlewares/auth.js';
import { paytrCheckoutSession, paytrWebhook } from '../controllers/paymentControllers.js';

const router = express.Router();

// PayTR için ödeme oturumu oluşturma rotası
router.route('/payment/checkout_session').post(isAuthenticatedUser, paytrCheckoutSession);

// PayTR webhook rotası
router.route('/payment/webhook').post(paytrWebhook);

export default router;











// import express from 'express';
// const router = express.Router();

// import { isAuthenticatedUser } from '../middlewares/auth.js';
// import { stripeCheckoutSession, stripeWebhook } from '../controllers/paymentControllers.js';

// router.route('/payment/checkout_session').post(isAuthenticatedUser, stripeCheckoutSession);
// router.route('/payment/webhook').post(stripeWebhook);

// export default router;
