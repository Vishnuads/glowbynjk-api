const ejs = require('ejs')
const nodemailer = require('nodemailer')
const fileURLToPath = require('url')
const dirname = require('path')

const currentFilePath = import.meta.url
const currentDirectory = dirname(fileURLToPath(currentFilePath))

const mail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordRestLink = async (email,token,name) => {

}

export {sendPasswordRestLink}