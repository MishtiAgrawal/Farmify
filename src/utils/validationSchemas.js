const { body, query, param } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.updateProfileValidation = [
  body('email').optional().isEmail().withMessage('A valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Product category is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
];

exports.createOrderValidation = [
  body('product_id').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  body('payment_method').trim().notEmpty().withMessage('Payment method is required'),
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
];

exports.cancelOrderValidation = [
  body('order_id').notEmpty().withMessage('Order ID is required'),
];

exports.updateOrderStatusValidation = [
  body('order_id').notEmpty().withMessage('Order ID is required'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

exports.processPaymentValidation = [
  body('order_ids')
    .isArray({ min: 1 })
    .withMessage('Order IDs must be provided as a non-empty array'),
  body('payment_method').trim().notEmpty().withMessage('Payment method is required'),
];

exports.addToCartValidation = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ gt: 0 }).withMessage('Quantity must be greater than 0'),
];

exports.updateCartItemValidation = [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
  param('productId').notEmpty().withMessage('Product ID is required'),
];

exports.createCommunityPostValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('location').optional().trim(),
];

exports.updateFarmOverviewValidation = [
  body('total_area').optional().trim(),
  body('active_crops').optional().trim(),
  body('soil_health').optional().trim(),
  body('yield_est').optional().trim(),
];

exports.createMachineryValidation = [
  body('name').trim().notEmpty().withMessage('Machinery name is required'),
  body('type').trim().notEmpty().withMessage('Machinery type is required'),
  body('price_per_hour').isFloat({ gt: 0 }).withMessage('Price per hour must be a positive number'),
];

exports.bookMachineryValidation = [
  body('machinery_id').notEmpty().withMessage('Machinery ID is required'),
  body('booking_date').trim().notEmpty().withMessage('Booking date is required'),
  body('hours').isInt({ gt: 0 }).withMessage('Hours must be greater than 0'),
];

exports.createLedgerEntryValidation = [
  body('type').trim().notEmpty().withMessage('Ledger type is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];

exports.bookSoilTestValidation = [
  body('lab_id').notEmpty().withMessage('Lab ID is required'),
  body('test_date').trim().notEmpty().withMessage('Test date is required'),
  body('sample_type').trim().notEmpty().withMessage('Sample type is required'),
  body('field_size').isFloat({ gt: 0 }).withMessage('Field size must be a positive number'),
  body('crop_type').trim().notEmpty().withMessage('Crop type is required'),
];

exports.applyForSubsidyValidation = [
  body('subsidy_id').notEmpty().withMessage('Subsidy ID is required'),
  body('application_details').trim().notEmpty().withMessage('Application details are required'),
];

exports.chatValidation = [
  body('message').trim().notEmpty().withMessage('Message is required'),
];

exports.fertilizerGuideValidation = [
  body('crop').trim().notEmpty().withMessage('Crop is required'),
  body('season').trim().notEmpty().withMessage('Season is required'),
];

exports.submitHelpValidation = [
  body('issue').trim().notEmpty().withMessage('Issue text is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

exports.createAdvisoryValidation = [
  body('title_en').trim().notEmpty().withMessage('English title is required'),
  body('desc_en').trim().notEmpty().withMessage('English description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
];
