const db = require("../config/db.config"); //DB config file
const mailer = require('../config/mailer.config')
const bcrypt = require('bcrypt'); //Hashing
const jwt = require('jsonwebtoken'); //Encrypted tokens/signed token identifier
const multer = require('multer')


let globalUsername;
let globalRole;
let globalSecret;
let io;

//socket connection
exports.socketConnection = (server) => {

  io = require('socket.io')(server);
  io.on('connection', (socket) => {

    let bid;
    console.log(`Client connected [id=${socket.id}]`);

    socket.on('disconnect', () => {
      socket.removeAllListeners();
      console.log(`Client disconnected [id=${socket.id}]`);
    });

    socket.on('join', data => {

      const user = data.username;
      const auctionName = data.name;
      const id = data.auctionId;
      console.log(id)

      //fetch vare where auctionname = auctionname and vareid = vareid
      //send KUN et result til user som er den nuværende vare
      result = 
      [
        {
          "id": 1,
          "vareName": "Citroën BX",
          "info": "Årgang 84",
        },
        {
          "id": 2,
          "vareName": "Lada 1200",
          "info": "Årgang 73",
        }
      ]
      console.log(result[id-1])

      socket.join(auctionName)
      
      io.to(auctionName).emit('joined', {message: 'confirmed', items: result[id-1]});
      sqlQuery = db.format('SELECT bud, username, created FROM bud WHERE (bud, auktionId, vareId) IN (SELECT MAX(bud), auktionId, vareId FROM bud WHERE auktionId = ? AND vareId = ?) LIMIT 1', [id, 1])
      
      db.execute(sqlQuery, (err, result) => {
        
        if(err) throw err;
        
        if(!result) {
          socket.emit('error', {message: 'something went wrong'});
        }
        else {

            console.log(io.sockets.adapter.rooms)
            io.to(auctionName).emit('bidUpdate', {message: 'accepted', ...result});
            console.log('EXECUTED: ' + sqlQuery);

          }

        });

      // console.log(io.sockets.adapter.rooms)
    })

    socket.on('bid', data => {

      const user = data.user;
      const auctionName = data.name;
      const auctionId = data.auctionId;
      const itemId = data.itemId;
      bid = data.bid;
      bid += 100;
      console.log(auctionId)

      sqlQuery = db.format('INSERT INTO bud (auktionId, vareId, username, bud) VALUES (?, ?, ?, ?) ', [auctionId, itemId, user, bid]);

      db.execute(sqlQuery, (err, result) => {

        if(err) throw err;

        if(!result) {
          socket.emit('error', {message: 'something went wrong'});
        }
        else {

          console.log('EXECUTED: ' + sqlQuery);

          sqlQuery = db.format('SELECT bud, username, created FROM bud WHERE (bud, auktionId, vareId) IN (SELECT MAX(bud), auktionId, vareId FROM bud WHERE auktionId = ? AND vareId = ?) LIMIT 1', [auctionId, itemId])

          db.execute(sqlQuery, (err, result) => {

            if(err) throw err;

            if(!result) {
              socket.emit('error', {message: 'something went wrong'});
            }
            else {

              console.log(io.sockets.adapter.rooms)
              io.to(auctionName).emit('bidUpdate', {message: 'accepted', ...result});
              console.log('EXECUTED: ' + sqlQuery);

            }

          });

        }

      });


      //insert into table id på auktion, id på nuværende vare, hvilken user, værdi budt, tid
      // -->
      //SELECT MAX(bud), username FROM table WHERE auktion id = ? AND WHERE nuværende vare id = ? order by timestamp LIMIT 1
      //send det første højeste bud tilbage via io.to(room)

    });


  });

}

//exports er basically "public"
//req = requests fra headers
//res = result som du sender tilbage til headers
exports.example = (req, res) => {

  // res.send({
  //   message: 'wtf det virker?',
  //   ip: req.ip,
  //   browser: req.headers['user-agent']
  // });


  let date = new Date();
  const datestring = date.getUTCDay() + '/' + date.getUTCDate + '/' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds();
  const datething = new Date(Date.UTC(datestring))
  console.log(datething.toUTCString())
  const datetime = new Date(datething.getUTCTime() + 30*60000)
  console.log(datetime.toUTCString())


  const ip = req.ip
  const headers = req.headers
  
  const token = jwt.sign(globalRole, globalUsername + ip + headers)

  res.status(200).cookie(globalRole, token, { 
    sameSite: 'lax', 
    httpOnly: true,
    path: '/',
    secure: true
  }).send({message: "Success", role: globalRole, username: globalUsername});

}

//På login sætter den en cookie med username, ip og headers som er encrypted via const token = jwt.sign('token', username + ip + headers)
//Kalder den pt på hver side, hvor den sender request ind og handler verify. Ved ikke om det er det smarteste, kan nok gøres bedre
exports.auth = (req, res) => {

	if(typeof req.cookies[globalRole] !== "undefined") {
		
		try {

			const ip = req.ip;
			const headers = req.headers;

			const token = req.cookies[globalRole]
			const verify = jwt.verify(token, globalUsername + ip + headers);
			res.send({cookie: 'Success', role: globalRole, username: globalUsername});

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
    const lastname = req.body.lastname;
    const username = req.body.username;
    const password = req.body.password;
    const phone = req.body.phoneNumber
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
    
        sqlQuery = db.format('INSERT INTO users (firstName, lastName, username, password, email, phoneNumber, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, lastname, username, hash, email, phone, "byder"]);

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
    sqlQuery = db.format('SELECT firstName, password, username, role FROM users WHERE username = ?', [username])

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

            //Sender småkage tilbage til client til senere auth på andre sider.
            const token = jwt.sign(role,username+ip+headers);

            res.status(200).cookie(role,token,{
              sameSite: 'lax', 
              httpOnly: true,
              path: '/',
              secure: true
            }).send({message:'Success', role: role});
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

exports.sendVurdering = (req, res) => {
  try
  {
    //Sætter variabler fra clienten
    const navn = req.body.navn;
    const kategori = req.body.kategori;
    const beskrivelse = req.body.beskrivelse;
    //const billede = req.body.billede;
    const indsendtAf = req.body.indsendtAf;

    console.log(navn);
    console.log(kategori);
    console.log(beskrivelse);
    console.log(indsendtAf);
    sqlQuery = db.format('INSERT INTO varer (Navn, Kategori, Beskrivelse, indsendtAf) VALUES (?, ?, ?, ?)', [navn, kategori, beskrivelse, indsendtAf]);

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
    
        sqlQuery = db.format('INSERT INTO users (firstName, lastName, username, password, email, role, token) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, lastname, username, hash, email, "auktionarius", token]);

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
    cb(null,'C:/Users/anza.skp/Desktop/H5git/Lorem-Ipsum-Auktioner/Pics/{}'.format(globalUsername))
  },
  filename: function(req,file,cb){
    cb(null,Date.now()+'-'+file.originalname)
  }

})
var upload = multer({storage:storage}).array('file')



exports.sendVurdering = (req, res) => {
  try
  {
    //Sætter variabler fra clienten
    const navn = req.body.name;
    const kategori = req.body.category;
    const beskrivelse = req.body.description;
    const billede = req.body.data;
    const indsendtAf = req.body.username;

    upload(req,res,function(err){
      console.log(req.data)
      if(err instanceof multer.MulterError){
        return res.status(500).json(err)
        console.log('test')
      }
      else if (err) {
        return res.status(500).json(err)
        console.log('test')
      }
      return res.status(200).send(req.file)
      console.log('test')
    })
    console.log(upload)
    sqlQuery = db.format('INSERT INTO varer (name, category, description, sendBy) VALUES (?, ?, ?, ?)', [navn, kategori, beskrivelse, indsendtAf]);

  }
  catch(error) {
    res.send(error);
    console.log(error);
  }

}