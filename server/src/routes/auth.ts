import { Router } from "express";
import { authenticate } from "passport";
import "../middleware/passport";
import {
  getRefreshToken,
  login,
  register,
  resetPassword,
  roleAuthorization,
  verifyRequest
} from "../controllers/auth";
import {
  forgotPassword as validatePasswordRenewal,
  login as validateLogin,
  register as validateRegister,
  resetPassword as validatePaswordReset,
  verify as validateVerification
} from "../controllers/auth.validate";

const router = Router();
const requireAuth = authenticate("jwt", {
  session: false
});

router.post("/register", validateRegister, register);
router.post("/verify", validateVerification, verifyRequest);
router.post("/reset", validatePaswordReset, resetPassword);
router.get(
  "/token",
  requireAuth,
  roleAuthorization(["user", "admin"]),
  getRefreshToken
);
router.post("/login", validateLogin, login);

export default router;