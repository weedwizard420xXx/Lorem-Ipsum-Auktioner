const db = require("../config/db.config"); //DB config file
const bcrypt = require('bcrypt'); //Hashing
const jwt = require('jsonwebtoken'); //Encrypted tokens/signed token identifier

//exports er basically "public"
//req = requests fra headers
//res = result som du sender tilbage til headers
exports.example = (req, res) => {

  res.send({
    message: 'wtf det virker?',
    ip: req.ip,
    browser: req.headers['user-agent']
  });

}

//Prepared sql statement example
exports.sqlExample = (req, res) => {

  sqlQuery = db.format('SELECT * FROM table WHERE something = ?', [123]); //prepared statement, argument = ? - skal være array paramater

  //execute prepared statement
  db.execute(sqlQuery, (err, result) => {
    
    if(err) throw err

    if(!result) {

      //sender error message tilbage til client
      res.status(500).send({
        message: 'Could not fetch WHERE something = ' + [123],
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