const express = require('express');
const advisoryRoutes = require('./advisoryRoutes');
const communityRoutes = require('./communityRoutes');
const farmRoutes = require('./farmRoutes');
const externalRoutes = require('./externalRoutes');
const aiRoutes = require('./aiRoutes');

const router = express.Router();

router.use('/', advisoryRoutes);
router.use('/', communityRoutes);
router.use('/', farmRoutes);
router.use('/', externalRoutes);
router.use('/', aiRoutes);

module.exports = router;
