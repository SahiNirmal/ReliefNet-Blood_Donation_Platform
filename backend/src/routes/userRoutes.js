const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  listDonors,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("role").isIn(["donor", "requester"]).withMessage("Role must be donor or requester."),
    body("bloodGroup")
      .if(body("role").equals("donor"))
      .notEmpty()
      .withMessage("Blood group is required for donors."),
  ],
  validate,
  registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  loginUser
);

router.get("/donors", listDonors);
router.get("/:id", getUser);
router.patch("/:id", protect, updateUser);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("A valid email is required.")],
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required."),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  ],
  validate,
  resetPassword
);

module.exports = router;