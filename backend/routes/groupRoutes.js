const express = require('express');
const { 
  createGroup, 
  getGroups, 
  getGroup, 
  updateGroup, 
  deleteGroup,
  addMember,
  removeMember
} = require('../controllers/groupController');
const { getGroupBills } = require('../controllers/billController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Group routes
router.route('/')
  .post(createGroup)
  .get(getGroups);

router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

// Member management
router.route('/:id/members')
  .post(addMember);

router.route('/:id/members/:userId')
  .delete(removeMember);

// Group bills
router.route('/:groupId/bills')
  .get(getGroupBills);

module.exports = router;
