const Bill = require('../models/Bill');
const Group = require('../models/Group');
const Expense = require('../models/Expense');

// @desc    Create a new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res) => {
  try {
    // Add paidBy id to request body if not provided
    if (!req.body.paidBy) {
      req.body.paidBy = req.user.id;
    }

    // Verify the group exists and user is a member
    const group = await Group.findById(req.body.group);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Make sure user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create bills for this group'
      });
    }

    // Calculate shares based on splitType
    const { amount, splitType, shares } = req.body;

    // If splitType is equal, calculate equal shares for all members
    if (splitType === 'equal' || !splitType) {
      const memberCount = group.members.length;
      const equalShare = amount / memberCount;

      req.body.shares = group.members.map(memberId => ({
        user: memberId,
        amount: parseFloat(equalShare.toFixed(2)),
        paid: memberId.toString() === req.body.paidBy.toString()
      }));
    } else if (splitType === 'custom' && shares && shares.length > 0) {
      // Validate custom shares
      const totalShares = shares.reduce((sum, share) => sum + share.amount, 0);

      if (Math.abs(totalShares - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Sum of shares must equal the total bill amount'
        });
      }

      // Mark the paidBy user's share as paid
      req.body.shares = shares.map(share => ({
        ...share,
        paid: share.user.toString() === req.body.paidBy.toString()
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid split configuration'
      });
    }

    // Create the bill
    const bill = await Bill.create(req.body);

    // Create expense entries for each user's share
    const expensePromises = bill.shares.map(share => {
      // Skip creating expense for the user who paid (they'll have a separate expense for the full amount)
      // if (share.user.toString() === bill.paidBy.toString()) {
      //   return Promise.resolve();
      // }

      return Expense.create({
        user: share.user,
        amount: share.amount,
        category: bill.category,
        expense_date: bill.date,
        mode_of_payment: 'Group Bill',
        description: `Your share of "${bill.title}" in group "${group.name}"`
      });
    });

    // Create an expense for the person who paid the bill
    // expensePromises.push(
    //   Expense.create({
    //     user: bill.paidBy,
    //     amount: bill.amount,
    //     category: bill.category,
    //     expense_date: bill.date,
    //     mode_of_payment: 'Group Bill',
    //     description: `You paid for "${bill.title}" in group "${group.name}"`
    //   })
    // );

    await Promise.all(expensePromises);

    // Return the created bill with populated fields
    const populatedBill = await Bill.findById(bill._id)
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email');

    res.status(201).json({
      success: true,
      data: populatedBill
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bills for a user's groups
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res) => {
  try {
    // Get groups the user is a member of
    const groups = await Group.find({ members: req.user.id });
    const groupIds = groups.map(group => group._id);

    // Parse query parameters for filtering
    const { groupId, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { group: { $in: groupIds } };

    // Add specific group filter if provided
    if (groupId) {
      query.group = groupId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination
    const bills = await Bill.find(query)
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Bill.countDocuments(query);

    res.status(200).json({
      success: true,
      count: total,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + bills.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bills for a specific group
// @route   GET /api/groups/:groupId/bills
// @access  Private
exports.getGroupBills = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify the group exists and user is a member
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Make sure user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view bills for this group'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get bills for the group
    const bills = await Bill.find({ group: groupId })
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Bill.countDocuments({ group: groupId });

    res.status(200).json({
      success: true,
      count: total,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + bills.length < total
      }
    });
  } catch (error) {
    console.error('Error fetching group bills:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single bill
// @route   GET /api/bills/:id
// @access  Private
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Verify the group exists and user is a member
    const group = await Group.findById(bill.group._id);

    // Make sure user is a member of the group
    if (!group.members.includes(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this bill'
      });
    }

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a bill
// @route   PUT /api/bills/:id
// @access  Private
exports.updateBill = async (req, res) => {
  try {
    let bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Make sure user is the one who paid the bill
    if (bill.paidBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this bill'
      });
    }

    // Update bill
    bill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email');

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Private
exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Make sure user is the one who paid the bill
    if (bill.paidBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this bill'
      });
    }

    await bill.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark a share as paid
// @route   PUT /api/bills/:id/shares/:shareId
// @access  Private
exports.markShareAsPaid = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Find the share
    const share = bill.shares.id(req.params.shareId);

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    // Make sure user is the one who paid the bill
    if (bill.paidBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this bill'
      });
    }

    // Update the share
    share.paid = true;
    await bill.save();

    const updatedBill = await Bill.findById(req.params.id)
      .populate('paidBy', 'first_name last_name email')
      .populate('group', 'name')
      .populate('shares.user', 'first_name last_name email');

    res.status(200).json({
      success: true,
      data: updatedBill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
