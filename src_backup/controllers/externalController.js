const { MandiPrice, StoreItem, SoilLab, SoilTestBooking, Subsidy, SubsidyApplication } = require('../models/External');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// --- WEATHER ---
exports.getWeather = asyncHandler(async (req, res, next) => {
  const hour = new Date().getHours();
  const baseTemp = 28 + Math.sin((hour * Math.PI) / 12) * 8;
  const weather = {
    condition: hour < 6 ? 'Clear Night' : hour < 10 ? 'Morning Haze' : hour < 16 ? 'Partly Cloudy' : hour < 19 ? 'Warm Evening' : 'Clear Night',
    temp: Math.round(baseTemp * 10) / 10,
    feels_like: Math.round((baseTemp + 2.5) * 10) / 10,
    location: 'Bhopal, India',
    pressure: 1012 + Math.floor(Math.random() * 6),
    humidity: 55 + Math.floor(Math.random() * 20),
    wind_speed: Math.round((8 + Math.random() * 10) * 10) / 10,
    wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    overview: 'Good farming conditions. Soil moisture adequate for current crops.',
    forecast: [
      { day: 'Mon', temp_high: 34, temp_low: 22, cond: 'Sunny' },
      { day: 'Tue', temp_high: 33, temp_low: 21, cond: 'Partly Cloudy' },
      { day: 'Wed', temp_high: 31, temp_low: 23, cond: 'Cloudy' },
    ],
  };
  res.status(200).json(weather);
});

// --- MANDI ---
exports.getMandiPrices = asyncHandler(async (req, res, next) => {
  const prices = await MandiPrice.find().sort('crop');
  res.status(200).json(prices);
});

// --- STORE ---
exports.getStoreItems = asyncHandler(async (req, res, next) => {
  const items = await StoreItem.find();
  res.status(200).json(items);
});

// --- SOIL LABS ---
exports.getSoilLabs = asyncHandler(async (req, res, next) => {
  const labs = await SoilLab.find().sort('name');
  res.status(200).json(labs);
});

exports.bookSoilTest = asyncHandler(async (req, res, next) => {
  const { lab_id, test_date, sample_type, field_size, crop_type } = req.body;
  const lab = await SoilLab.findById(lab_id);
  if (!lab) return next(new ErrorResponse('Lab not found', 404));

  const booking = await SoilTestBooking.create({
    user: req.user.id,
    lab: lab_id,
    test_date,
    sample_type,
    field_size,
    crop_type,
    cost: lab.testing_price,
  });

  res.status(201).json({ success: true, id: booking._id, cost: lab.testing_price });
});

exports.getSoilTestBookings = asyncHandler(async (req, res, next) => {
  const bookings = await SoilTestBooking.find({ user: req.user.id }).populate('lab').sort('-booking_date');
  res.status(200).json(bookings);
});

// --- SUBSIDIES ---
exports.getSubsidies = asyncHandler(async (req, res, next) => {
  const subsidies = await Subsidy.find().sort('-id');
  res.status(200).json(subsidies);
});

exports.applyForSubsidy = asyncHandler(async (req, res, next) => {
  const { subsidy_id, application_details, documents } = req.body;
  const application = await SubsidyApplication.create({
    user: req.user.id,
    subsidy: subsidy_id,
    application_details,
    documents_uploaded: documents,
  });
  res.status(201).json({ success: true, id: application._id });
});

exports.getSubsidyApplications = asyncHandler(async (req, res, next) => {
  const applications = await SubsidyApplication.find({ user: req.user.id }).populate('subsidy').sort('-application_date');
  res.status(200).json(applications);
});
