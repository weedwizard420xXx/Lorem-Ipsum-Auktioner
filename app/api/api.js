const db = require("../config/db.config"); //DB config file
const bcrypt = require('bcrypt'); //Hashing
const jwt = require('jsonwebtoken'); //Encrypted tokens/signed token identifier

//exports er basically "public"
//req = requests fra headers
//res = result som du sender tilbage til headers
exports.example = (req, res) => {

  // res.send({
  //   message: 'wtf det virker?',
  //   ip: req.ip,
  //   browser: req.headers['user-agent']
  // });
  const ip = req.ip
  const headers = req.headers
  
  const token = jwt.sign('hans', 'hans' + ip + headers)

  res.status(200).cookie('hans', token, { 
    sameSite: 'lax', 
    httpOnly: true,
    path: '/',
    // secure: true
  }).send({message: "Success"})
  console.log("ok?")

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

	if(typeof req.cookies.token !== "undefined") {
		
		try {

			const ip = req.ip;
			const headers = req.headers;

			const token = req.cookies.token;
			const verify = jwt.verify(token, globalUsername + ip + headers);
			res.send({cookie: verify});

		}
		catch(error) {
			res.status(400).send({cookie: 'Invalid token!'});
		}

	}
	else {
		res.send({cookie: false});
	}

}

exports.register = (req, res) => {

  try {

    const name = req.body.name;
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
    
        sqlQuery = db.format('INSERT INTO users (name, username, password, email, rolle) VALUES (?, ?, ?, ?, ?)', [name, username, hash, email, "normal bruger"]);

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
    const password = req.body.password

    console.log(username);
    //klargør sql til at hente data fra databasen.
    sqlQuery = db.format('SELECT name, password, username, rolle FROM users WHERE username = ?', [username])

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
        // sætter variabler fra databasen
        console.log('EXECUTED: ' + sqlQuery);
        const hashed = result[0].password;
        const role = result[0].rolle;
        const ip = req.ip;
			  const headers = req.headers;
        console.log(role);

        //bruger bcrypt til at checke om brugerens indtastede password er det samme som den i databasen.
        bcrypt.compare(password, hashed, function(err,result){
          if(result)
          {
            //Sender småkage tilbage til client til senere auth på andre sider.
            const token = jwt.sign(role,username+ip+headers)
            console.log(token);
            res.status(200).cookie(role,token,{
              sameSite: 'lax', 
              httpOnly: true,
              path: '/',
              secure: false
            }).send({message:'Success'});
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