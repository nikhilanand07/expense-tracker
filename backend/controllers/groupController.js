const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    console.log('Creating group with user:', req.user);
    
    // Add creator id to request body
    req.body.creator = req.user._id;
    
    // Add creator to members array if not already included
    if (!req.body.members) {
      req.body.members = [];
    }
    
    if (!req.body.members.includes(req.user._id)) {
      req.body.members.push(req.user._id);
    }
    
    console.log('Group data before creation:', req.body);
    const group = await Group.create(req.body);
    console.log('Group created:', group);
    
    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all groups for a user
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id
    }).populate('members', 'first_name last_name email');
    
    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get a single group
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'first_name last_name email');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Make sure user is a member of the group
    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this group'
      });
    }
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a group
// @route   PUT /api/groups/:id
// @access  Private
exports.updateGroup = async (req, res) => {
  try {
    let group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Make sure user is the creator of the group
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this group'
      });
    }
    
    // Update group
    group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members', 'first_name last_name email');
    
    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Make sure user is the creator of the group
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this group'
      });
    }
    
    await group.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a member to a group
// @route   POST /api/groups/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Make sure the requester is a member of the group
    if (!group.members.includes(req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to add members to this group'
      });
    }
    
    // Check if user is already a member
    if (group.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this group'
      });
    }
    
    // Add user to members array
    group.members.push(user._id);
    await group.save();
    
    const updatedGroup = await Group.findById(req.params.id)
      .populate('members', 'first_name last_name email');
    
    res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Make sure the requester is the creator of the group
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to remove members from this group'
      });
    }
    
    // Cannot remove the creator
    if (req.params.userId === group.creator.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the creator from the group'
      });
    }
    
    // Check if user is a member
    if (!group.members.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this group'
      });
    }
    
    // Remove user from members array
    group.members = group.members.filter(
      member => member.toString() !== req.params.userId
    );
    
    await group.save();
    
    const updatedGroup = await Group.findById(req.params.id)
      .populate('members', 'first_name last_name email');
    
    res.status(200).json({
      success: true,
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
