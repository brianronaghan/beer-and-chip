var nodemailer = require('nodemailer');

exports.transporter = nodemailer.createTransport({
    host: '162.243.218.81',
    service: 'Gmail',
    auth: {
      user: 'beerandchip@gmail.com',
      pass: 'zygote123'
    }
  });
  // get account with real domain

exports.createMailOptions = function(fromDisplay, subjectLine, eventReceivers, emailBody) {
  return {
    from: fromDisplay, // sender address
    to: eventReceivers, // list of receivers
    subject: subjectLine, // Subject line
    html: emailBody
  };
};
