const { UserFarm, Machinery, MachineryBooking, Ledger } = require('../models/Farm');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

exports.getFarmOverview = asyncHandler(async (req, res) => {
  const farm = await UserFarm.findOne({ user: req.user.id });
  res.status(200).json({ success: true, data: farm || { total_area: 'N/A', active_crops: 'None', soil_health: 'Pending', yield_est: '0' } });
});

exports.updateFarmOverview = asyncHandler(async (req, res) => {
  let farm = await UserFarm.findOne({ user: req.user.id });
  if (farm) {
    farm = await UserFarm.findByIdAndUpdate(farm._id, req.body, { new: true, runValidators: true });
  } else {
    farm = await UserFarm.create({ ...req.body, user: req.user.id });
  }

  res.status(200).json({ success: true, data: farm });
});

exports.getMachinery = asyncHandler(async (req, res) => {
  const machines = await Machinery.find().populate('owner', 'name');
  res.status(200).json({ success: true, data: machines });
});

exports.createMachinery = asyncHandler(async (req, res) => {
  const machine = await Machinery.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, data: machine });
});

exports.bookMachinery = asyncHandler(async (req, res, next) => {
  const { machinery_id, booking_date, hours } = req.body;
  const machine = await Machinery.findById(machinery_id);
  if (!machine) {
    return next(new ErrorResponse('Machinery not found', 404));
  }

  const booking = await MachineryBooking.create({
    machinery: machinery_id,
    user: req.user.id,
    booking_date,
    hours,
  });

  machine.status = 'booked';
  await machine.save();

  res.status(201).json({ success: true, data: booking });
});

exports.getMachineryBookings = asyncHandler(async (req, res) => {
  const bookings = await MachineryBooking.find({ user: req.user.id })
    .populate({
      path: 'machinery',
      populate: { path: 'owner', select: 'name' },
    })
    .sort('-timestamp');

  res.status(200).json({ success: true, data: bookings });
});

exports.getLedger = asyncHandler(async (req, res) => {
  const ledger = await Ledger.find({ user: req.user.id }).sort('-timestamp');
  res.status(200).json({ success: true, data: ledger });
});

exports.createLedgerEntry = asyncHandler(async (req, res) => {
  const entry = await Ledger.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: entry });
});
