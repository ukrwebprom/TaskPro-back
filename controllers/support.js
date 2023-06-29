const { SupportMail } = require('../models/support');
const { ctrlWrapper, sendSupportMail } = require("../helpers/");

const addSupportMail = async (req, res) => {
    const {email, message } = req.body;
    
    const supportLetter = {
        to: "oleksa_programmer@ukr.net",
        subject: "Support letter",
        text: `Email: ${email}\nПовідомлення: ${message}`
    }

    

    const result = await SupportMail.create({...req.body});
   
    await sendSupportMail(supportLetter);
    res.status(201).json({
        message: "Message sent",
    })
};

module.exports = {
    addSupportMail: ctrlWrapper(addSupportMail),
}

// taskpro.project@gmail.com
// const { email } = res.user;
 // res.status(201).json(result);