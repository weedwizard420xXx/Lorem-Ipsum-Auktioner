const nodemailer = require("nodemailer");

const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

exports.sendPasswordActivation = (name, email, token) => {

  transport.sendMail({

    from: user,
    to: email,
    subject: 'Lav et password',
    html: `<h1>Venligst lav et password</h1>
          <h2>Hej ${name}</h2>
          <p>For at kunne bruge din konti, skal du have oprettet et password. Brug venligst linket nedenfor.</p>
          <a href=http://localhost:3000/setPassword/${token}>Opret password</a>
          </div>`

  }).catch(err => console.log(err));

}

exports.sendPaymentInfo = (username, email, token) => {
  
  transport.sendMail({
    
    from: user,
    to: email,
    subject: 'Betalingsinformation fra Auktion',
    html: `<h1>Betalingsinformation</h1>
    <h2>Hej ${username}</h2>
    <p>Du har vundet ting på Auktionen. Brug venligst linket nedenunder for at betale.</p>
    <a href=http://localhost:3000/betaling/${token}>Betal her</a>
    </div>`
    
  }).catch(err => console.log(err));

}