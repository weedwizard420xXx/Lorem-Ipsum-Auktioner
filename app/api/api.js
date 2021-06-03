const db = require("../config/db.config"); //DB config file
const mailer = require('../config/mailer.config')
const bcrypt = require('bcrypt'); //Hashing
const jwt = require('jsonwebtoken'); //Encrypted tokens/signed token identifier
const multer = require("multer");
const { parse } = require("dotenv");
const fs = require('fs');


let globalUsername;
let globalRole;
let globalSecret;
let globalId;

//exports er basically "public"
//req = requests fra headers
//res = result som du sender tilbage til headers
exports.example = (req, res) => {

  res.send({
    message: globalUsername
  });

}

//Prepared sql statement example
exports.sqlExample = (req, res) => {

  const username = req.body.username;

  sqlQuery = db.format('SELECT * FROM table WHERE something = ?', [username]); //prepared statement, argument = ? - skal være array paramater

  //execute prepared statement
  db.execute(sqlQuery, (err, result) => {
    
    if(err) throw err

    if(!result) {

      //sender error message tilbage til client
      res.status(500).send({
        message: 'Could not fetch WHERE something = ' + [username],
        error: 'error message'
      });

    }
    else {

      res.send(result); //sender result til client
      console.log('EXECUTED: ' + sqlQuery);

    }


  });

  db.unprepare(sqlQuery); //unprepare / close connection

}

//Hvordan jeg har handlet session id med trash node
//På login sætter den en cookie med username, ip og headers som er encrypted via const token = jwt.sign('token', username + ip + headers)
//Kalder den pt på hver side, hvor den sender request ind og handler verify. Ved ikke om det er det smarteste, kan nok gøres bedre
exports.auth = (req, res) => {

	if(typeof req.cookies[globalRole] !== "undefined") {
		
		try {

			const ip = req.ip;
			const headers = req.headers;

			const token = req.cookies[globalRole]
			const verify = jwt.verify(token, globalUsername + ip + headers);
			res.send({
        cookie: 'Success', 
        role: globalRole,
        username: globalUsername
      });

		}
		catch(error) {
			res.status(400).send({cookie: 'Invalid token!'});
		}

	}
	else {
		res.send({cookie: false, message: 'Not logged in'});
	}

}

exports.register = (req, res) => {

  try {

    const name = req.body.name;
    const efternavn = req.body.lastname;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    
    sqlQuery = db.format('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);

    db.execute(sqlQuery, (err, result) => {

      if(err) throw err;

      if(result.length) {

        res.send({message: 'User already exists'});
        console.log('User already exists');

      }
      else {

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
    
        sqlQuery = db.format('INSERT INTO users (firstName, lastName, username, password, email, role) VALUES (?, ?, ?, ?, ?, ?)', [name, efternavn, username, hash, email, "normal bruger"]);

        db.execute(sqlQuery, (err, result) => {

          if(err) throw err;

          if(!result) {

            res.status(500).send({
              message: 'Someting went wrong...',
              error: 'error message'
            });

          }
          else {

            res.send({message: 'Successful'});
            console.log('EXECUTED: ' + sqlQuery);

          }

        });
      }

    });
  }
  catch(error) {

    res.send(error);
    console.log(error);

  }

}

exports.login = (req, res) => {
  try{
    //Sæter variabler fra sendt fra client.
    const username = req.body.username;
    const password = req.body.password;

    //klargør sql til at hente data fra databasen.
    sqlQuery = db.format('SELECT id, firstName, password, username, role FROM users WHERE username = ?', [username])

    db.execute(sqlQuery, (err, result) => {
    
      if(err) throw err;
  
      if(!result) {
  
        //sender error message tilbage til client
        res.status(500).send({
          message: 'Could not fetch WHERE something = ' + [username],
          error: 'error message'
        });
  
      }
      else {
        // sætter variabler fra databasen
        console.log('EXECUTED: ' + sqlQuery);
        const hashed = result[0].password;
        const id = result[0].id;
        const role = result[0].role;
        const username = result[0].username;
        const ip = req.ip;
			  const headers = req.headers;

        //bruger bcrypt til at checke om brugerens indtastede password er det samme som den i databasen.
        bcrypt.compare(password, hashed, function(err,result){
          if(result)
          {

            globalUsername = username;
            globalRole = role;
            globalId = id;

            //Sender småkage tilbage til client til senere auth på andre sider.
            const token = jwt.sign(role,username+ip+headers);

            res.status(200).cookie(role,token,{
              sameSite: 'lax', 
              httpOnly: true,
              path: '/',
              secure: true
            }).send({
              message:'Successful',
              role: role});
            console.log('Success')
          }
          else
          {
            res.send({message:'Ikke korrekt'})
          }
        })
      }
  
  
    });
  }
  catch(error)
  {
    res.send(error);
    console.log(error);
  }
}

exports.logout = (req, res) => {

  res.status(200).clearCookie(globalRole).send({message: 'Logged out'});

}

exports.registerAukt = (req, res) => {

  try {

    const name = req.body.name;
    const lastname = req.body.lastname;
    const username = req.body.username;
    const email = req.body.email;
    
    sqlQuery = db.format('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);

    db.execute(sqlQuery, (err, result) => {

      if(err) throw err;

      if(result.length) {

        res.send({message: 'User already exists'});
        console.log('User already exists');

      }
      else {

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync("auktionarius1234", salt);
        globalSecret = username + req.ip;
        const token = jwt.sign({email: email}, globalSecret);
    
        sqlQuery = db.format('INSERT INTO users (name, efternavn, username, password, email, rolle, token) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, lastname, username, hash, email, "auktionarius", token]);

        db.execute(sqlQuery, (err, result) => {

          if(err) throw err;

          if(!result) {

            res.status(500).send({
              message: 'Someting went wrong...',
              error: 'error message'
            });

          }
          else {

            console.log(token)
            mailer.sendPasswordActivation(name, email, token);

            res.send({message: 'Successful'});
            console.log('EXECUTED: ' + sqlQuery);

          }

        });
        
      }

    });
  }
  catch(error) {

    res.send(error);
    console.log(error);

  }

}

exports.confirmToken = (req, res) => {

  try {

    params = req.params.token;

    const sqlQuery = db.format('SELECT token FROM users WHERE token = ?', [params]);

    db.execute(sqlQuery, (err, result) => {

      if(err) throw err;

      if(result) {

        res.send(result);
        console.log('EXECUTED: ' + sqlQuery);

      }
      else {
        res.send({message: 'Link has expired'})
      }

    });
  }
  catch(error) {

    res.send(error);
    console.log(error);

  }
  
}

exports.setPassword = (req, res) => {

  try {
    
    const bodyPassword = req.body.password;
    const urlToken = req.body.token;
    const token = null;
    
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(bodyPassword, salt);

    const values = {
      password,
      token
    }

    sqlQuery = db.format('UPDATE users SET ? WHERE token = ?', [values, urlToken]);

    db.execute(sqlQuery, (err, result) => {
      console.log(sqlQuery)
      if(err) throw err;

      if(result) {

        res.send({message: 'Success'});
        console.log('EXECUTED: ' + sqlQuery);

      }
      else {
        res.send({message: err})
      }

    });

  }
  catch(error) {

    res.send(error);
    console.log(error);

  }

}

//Udnytter multer som ofte bruges til form data og sætter destination for billeder
var storage = multer.diskStorage({
  destination: function(req,file,cb){
    const path = `./React frontend/app/Pics/${globalUsername}`
    fs.mkdirSync(path, { recursive: true })
    cb(null, path)
    console.log('saved')
  },
  filename: function(req,file,cb){
    cb(null,globalUsername+'-'+file.originalname)
  }

})
var upload = multer({storage:storage}).array('file',5)


//upload funktion der skal kunne gemme billeder i mappe med hjælp fra multer.
exports.uploadPics = (req,res) => {
  
  upload(req, res, function (err) {
    console.log(req.body.files)
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }
    return res.status(200).send({
      message:'Succesful',
      data: req.files})
  })
}

exports.sendVurdering = (req, res) => {
  try
  {
    //Sætter variabler fra clienten
    const navn = req.body.name;
    const kategori = req.body.category;
    const beskrivelse = req.body.description;
    const indsendtAf = req.body.username;
    sqlQuery = db.format('INSERT INTO varer (name, category, description, sendBy) VALUES (?, ?, ?, ?)', [navn, kategori, beskrivelse, indsendtAf]);
    console.log(sqlQuery)
    db.execute(sqlQuery, (err, result) => {

      if(err) throw err;

      if(!result) {

        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });

      }
      else {

        res.send({message: 'Successful'});
        console.log('EXECUTED: ' + sqlQuery);

      }

    });

  }
  catch
  {

  }
}
console.log(globalUsername);