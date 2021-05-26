const nodemailer = require("nodemailer");

const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;

const transport = nodemailer.createTransport({
  service: "Hotmail",
  auth: {
    user: user,
    pass: pass,
  },
});

exports.sendPasswordActivation = (name, email, token) => {

  transport.sendMail({

    from: user,
    to: email,
    subject: 'Create your password',
    html: `<h1>Please create your password</h1>
          <h2>Hej ${name}</h2>
          <p>For at kunne bruge din konti, skal du have oprettet et password. Brug venligst linket nedenfor.</p>
          <a href=http://localhost:3000/setPassword/${token}>Opret password</a>
          </div>`
  }).catch(err => console.log(err));

}