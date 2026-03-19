const express = require('express');
const router = express.Router();
const { getOrgs, createOrg, inviteMember } = require('../controllers/orgController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrgs)
  .post(protect, createOrg);

router.post('/invite', protect, inviteMember);

module.exports = router;
