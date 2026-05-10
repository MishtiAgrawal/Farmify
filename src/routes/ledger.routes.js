const router = require('express').Router();
const controller = require('../controllers/ledger.controller');
const auth = require('../middleware/auth.middleware');

router.get('/', auth, controller.getLedger);
router.post('/', auth, controller.createLedgerEntry);
router.delete('/:id', auth, controller.deleteLedgerEntry);

module.exports = router;
