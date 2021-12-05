// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

exports.handler = async () => {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(`${SENDGRID_API_KEY}`)
    const msg = {
        to: 'rickyrivas918@gmail.com', // Change to your recipient
        from: 'rickyrivas918@gmail.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
    return {
        statusCode: 200,
        body: JSON.stringify(msg)
    }
}