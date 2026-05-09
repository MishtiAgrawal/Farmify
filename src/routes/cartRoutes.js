const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { addToCartValidation, updateCartItemValidation } = require('../utils/validationSchemas');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCartValidation, validateRequest, addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItemValidation, validateRequest, updateCartItem)
  .delete(removeFromCart);

module.exports = router;
