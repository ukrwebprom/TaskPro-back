const sgMail = require("@sendgrid/mail");

require('dotenv').config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendSupportMail = async (data) => {
    const email = { ...data, from: "100ckiyaleksey@gmail.com" };
    await sgMail.send(email);
    return true;
}

module.exports = sendSupportMail;
// taskpro.project@gmail.com