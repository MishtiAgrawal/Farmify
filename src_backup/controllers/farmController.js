const { UserFarm, Machinery, MachineryBooking, Ledger } = require('../models/Farm');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// --- FARM OVERVIEW ---
exports.getFarmOverview = asyncHandler(async (req, res, next) => {
  const farm = await UserFarm.findOne({ user: req.user.id });
  res.status(200).json(farm || { total_area: 'N/A', active_crops: 'None', soil_health: 'Pending', yield_est: '0' });
});

exports.updateFarmOverview = asyncHandler(async (req, res, next) => {
  let farm = await UserFarm.findOne({ user: req.user.id });
  if (farm) {
    farm = await UserFarm.findByIdAndUpdate(farm._id, req.body, { new: true });
  } else {
    req.body.user = req.user.id;
    farm = await UserFarm.create(req.body);
  }
  res.status(200).json({ success: true, data: farm });
});

// --- MACHINERY ---
exports.getMachinery = asyncHandler(async (req, res, next) => {
  const machines = await Machinery.find().populate('owner', 'name');
  res.status(200).json(machines);
});

exports.createMachinery = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user.id;
  const machine = await Machinery.create(req.body);
  res.status(201).json({ success: true, id: machine._id });
});

exports.bookMachinery = asyncHandler(async (req, res, next) => {
  const { machinery_id, booking_date, hours } = req.body;
  const booking = await MachineryBooking.create({
    machinery: machinery_id,
    user: req.user.id,
    booking_date,
    hours,
  });
  await Machinery.findByIdAndUpdate(machinery_id, { status: 'booked' });
  res.status(201).json({ success: true, booking_id: booking._id, message: 'Machinery booked!' });
});

exports.getMachineryBookings = asyncHandler(async (req, res, next) => {
  const bookings = await MachineryBooking.find({ user: req.user.id })
    .populate({
      path: 'machinery',
      populate: { path: 'owner', select: 'name' }
    })
    .sort('-timestamp');
  res.status(200).json(bookings);
});

// --- LEDGER ---
exports.getLedger = asyncHandler(async (req, res, next) => {
  const ledger = await Ledger.find({ user: req.user.id }).sort('-timestamp');
  res.status(200).json(ledger);
});

exports.createLedgerEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  await Ledger.create(req.body);
  res.status(201).json({ success: true });
});
