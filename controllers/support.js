const { SupportMail } = require('../models/support');
const { ctrlWrapper, sendSupportMail } = require("../helpers/");

const addSupportMail = async (req, res) => {
    const {email, message } = req.body;
    
    const supportLetter = {
        to: "taskpro.project@gmail.com",
        subject: "Support letter",
        text: `Email: ${email}\nПовідомлення: ${message}`
    }

    

    await SupportMail.create({...req.body});
   
    await sendSupportMail(supportLetter);
    res.status(201).json({
        message: "Message sent",
    })
};

module.exports = {
    addSupportMail: ctrlWrapper(addSupportMail),
}

