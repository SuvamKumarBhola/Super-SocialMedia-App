const mongoose = require('mongoose');
require('dotenv').config();
const SocialAccount = require('./models/SocialAccount');
const Organization = require('./models/Organization');
const User = require('./models/User');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- DATABASE CHECK ---');

        const users = await User.find();
        for (const user of users) {
             console.log(`User: ${user.email}, Id: ${user._id}, Orgs: ${user.organizations}`);
        }
        
        const orgs = await Organization.find();
        for (const org of orgs) {
            console.log(`Org: ${org.name}, Id: ${org._id}, Owner: ${org.owner}`);
        }

        const accounts = await SocialAccount.find();
        console.log(`SocialAccounts Total: ${accounts.length}`);
        for (const account of accounts) {
            console.log(`Account: ${account.platform}, User: ${account.profileData?.username}, OrgId: ${account.organizationId}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
