const { SupportMail } = require('../models/supportMail');
const { HttpError, ctrlWrapper, sendSupportMail } = require("../helpers");

const addSupportMail = async (req, res) => {
    const { email, message } = req.body;
    const supportLetter = {
        to: "oleksa_programmer@ukr.net",
        subject: "Support letter",
        text: `Email: ${email}\nПовідомлення: ${message}`
    }

    await sendSupportMail(supportLetter);

    // const { _id: owner } = req.user; 
    const result = await SupportMail.create({ ...req.body });
    res.status(201).json(result);

    res.status(201).json({
        "user": {
            "email": email,
            "message": message,
        }
    })
};

module.exports = {
    addSupportMail: ctrlWrapper(addSupportMail),
}

