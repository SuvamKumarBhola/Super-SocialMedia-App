const Organization = require('../models/Organization');
const User = require('../models/User');

const getOrgs = async (req, res) => {
  try {
    const orgs = await Organization.find({
      'members.user': req.user.id
    });
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrg = async (req, res) => {
  try {
    const { name } = req.body;
    
    const org = await Organization.create({
      name,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    const user = await User.findById(req.user.id);
    user.organizations.push(org._id);
    await user.save();

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite a user to the organization (by email)
const inviteMember = async (req, res) => {
  try {
    const { orgId, email, role } = req.body;
    
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    
    // Check if the current user is owner or admin of this org
    const currentMember = org.members.find(m => m.user.toString() === req.user.id);
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to invite members' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: 'User not found in the system' });

    // Check if already a member
    const alreadyMember = org.members.find(m => m.user.toString() === userToInvite.id);
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    org.members.push({ user: userToInvite._id, role: role || 'member' });
    await org.save();

    userToInvite.organizations.push(org._id);
    await userToInvite.save();

    res.status(200).json({ message: 'Member added successfully', org });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrgs,
  createOrg,
  inviteMember
};
