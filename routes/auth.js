import express from "express";
import {
  allUsers,
  deleteUser,
  forgotPassword,
  getUserDetails,
  getUserProfile,
  loginUser,
  logout,
  registerUser,
  verifyUser,
  resetPassword,
  updatePassword,
  updateProfile,
  updateUser,
  uploadAvatar,
  addDeliveryAddressUser,
  addInvoiceAddressUser,
  deleteDeliveryAddressUser,
  deleteInvoiceAddressUser,
  getUserMessage,
  getAdminUserMessage,
  reMessageAdmin,
} from "../controllers/authControllers.js";
const router = express.Router();

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

router.route("/register").post(registerUser);
router.route("/verify").post(verifyUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/me/messages").get(isAuthenticatedUser, getUserMessage);

router.route("/me/add_delivery_address").post(isAuthenticatedUser, addDeliveryAddressUser);
router.route("/me/delete_delivery_address").delete(isAuthenticatedUser, deleteDeliveryAddressUser);
router.route("/me/add_invoice_address").post(isAuthenticatedUser, addInvoiceAddressUser);
router.route("/me/delete_invoice_address").delete(isAuthenticatedUser, deleteInvoiceAddressUser);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router
  .route("/admin/messages")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminUserMessage);
router
  .route("/admin/messages/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), reMessageAdmin);

router
  .route("/admin/users/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

export default router;
