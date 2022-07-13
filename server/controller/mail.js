const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API);

async function sendEmail(data) {
  let is_true = false;
  const msg = {
    to: data.receiver,
    from: data.sender,
    templateId: process.env.templateId,
    dynamic_template_data: {
      user_name: data.user_name,
      verify_account: data.verify_account,
    },
  };
  await sgMail.send(msg, (error, result) => {
    if (error) {
      return error;
    } else {
      is_true = true;
    }
  });
  return is_true;
}

module.exports = sendEmail;
