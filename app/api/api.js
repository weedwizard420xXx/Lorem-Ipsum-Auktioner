const db = require("../config/db.config"); //DB config file
const mailer = require('../config/mailer.config')
const bcrypt = require('bcrypt'); //Hashing
const jwt = require('jsonwebtoken'); //Encrypted tokens/signed token identifier
const multer = require("multer");
const fs = require('fs');


let globalUsername;
let globalRole;
let globalSecret;
let globalId;
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

      sqlQuery = db.format('SELECT id, name, description, auktions_id, picture, itemValue FROM varer WHERE auktions_id = ?', [id]);

      db.execute(sqlQuery, (err, result) => {
        
        if(err) throw err;
        
        if(!result.length) {
          
          res.status(404).send({
            message: 'Someting went wrong...',
            error: 'error message'
          });
          
        }
        else {
               
          socket.join(auctionName)
          io.to(auctionName).emit('auktjoined', {message: 'confirmed', items: result});
          io.to(auctionName).emit('joined', {message: 'confirmed', items: result, waiting: 'Afventer næste vare...'});
          console.log('EXECUTED: ' + sqlQuery);
    
        }

      });


    });

    socket.on('itemPicked', data => {

      auctionId = data.auctionId;
      itemId = data.itemId;
      auctionName = data.auctionName;
      startbud = data.startbud;
      resultVare = [];

      sqlQuery = db.format('SELECT id, name, description, auktions_id, picture, itemValue FROM varer WHERE auktions_id = ? AND id = ?', [auctionId, itemId]);

      db.execute(sqlQuery, (err, result) => {

        if(err) throw err;

        if(!result.length) {
          socket.emit('error', {message: 'something went wrong'});
        }
        else {
          console.log("hej")
          resultVare = result;
          console.log(resultVare)
          console.log('EXECUTED: ' + sqlQuery);
        }

      });

      sqlQuery = db.format('INSERT INTO bud (auktionId, vareId, username, bud) VALUES (?, ?, ?, ?) ', [auctionId, itemId, '', startbud]);

      db.execute(sqlQuery, (err, result) => {

        if(err) throw err;

        if(!result) {
          socket.emit('error', {message: 'something went wrong'});
        }
        else {

          io.to(auctionName).emit('joined', {message: 'confirmed', items: resultVare});
    
          sqlQuery = db.format('SELECT bud, username, created FROM bud WHERE (bud, auktionId, vareId) IN (SELECT MAX(bud), auktionId, vareId FROM bud WHERE auktionId = ? AND vareId = ?) LIMIT 1', [auctionId, itemId])
          
          db.execute(sqlQuery, (err, result) => {
            
            if(err) throw err;
            
            if(!result.length) {
              socket.emit('error', {message: 'something went wrong'});
            }
            else {

                io.to(auctionName).emit('bidUpdate', {message: 'accepted', items: result});
                console.log('EXECUTED: ' + sqlQuery);
    
              }
    
            });

        }

      });

    });

    socket.on('bid', data => {

      const user = data.user;
      const auctionName = data.name;
      const auctionId = data.auctionId;
      const itemId = data.itemId;
      bid = data.bid;
      bid += 100;

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

            if(!result.length) {
              socket.emit('error', {message: 'something went wrong'});
            }
            else {

              io.to(auctionName).emit('bidUpdate', {message: 'accepted', items: result});
              console.log('EXECUTED: ' + sqlQuery);

            }

          });

        }

      });

    });

  });

}

exports.soldItem = (req, res) => {

  try{

    const itemId = req.body.id;
    const user = req.body.user;
    const bid = req.body.bid;
    let sqlQuery;

    if(user === '') {
      return
    }
    else {

      sqlQuery = db.format('SELECT id FROM users WHERE username = ?', [user]);

      db.execute(sqlQuery, (err, result) => {

        if(err) throw err;

        if(!result) {

          res.status(500).send({
            message: 'Someting went wrong...',
            error: 'error message'
          });

        }
        else {

          console.log('EXECUTED: ' + sqlQuery);
          userId = result[0].id;

          sqlQuery = db.format('INSERT INTO sold (item, buyer, price) VALUES (?, ?, ?)', [itemId, userId, bid]);

          db.execute(sqlQuery, (err, result) => {

            if(err) throw err;
      
            if(!result) {
      
              res.status(500).send({
                message: 'Someting went wrong...',
                error: 'error message'
              });
      
            }
            else {
              console.log('EXECUTED: ' + sqlQuery);
            }

          });

        }

      });

    }

  }
  catch(error) {

    res.send(error);
    console.log(error);
    
  }

}

exports.endAuction = (req, res) => {

  try {

    id = req.body.id;

    sqlQuery = db.format('UPDATE auktioner SET active = "inactive" WHERE id = ?', [id])

    db.execute(sqlQuery, (err, result) => {

      if(err) throw err;

      if(!result) {

        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });

      }
      else {

        
        // SELECT sold.item, varer.name, sold.price, users.firstName, users.lastName, users.email, auktioner.name FROM sold 
        // INNER JOIN users ON sold.buyer = users.id
        // INNER JOIN varer ON sold.item = varer.id
        // INNER JOIN auktioner ON varer.auktions_id = auktioner.id
        // WHERE auktions_id = 2
        
        sqlQuery = db.format('SELECT DISTINCT users.username, users.email FROM sold INNER JOIN users ON sold.buyer = users.id INNER JOIN varer ON sold.item = varer.id INNER JOIN auktioner ON varer.auktions_id = auktioner.id WHERE auktions_id = ? AND betalt = "nej"', [id]);
        
        db.execute(sqlQuery, (err, result) => {
          
          if(err) throw err;
          
          if(!result) {
            
            res.status(500).send({
              message: 'Someting went wrong...',
              error: 'error message'
            });
            
          }
          else {
            
            db.execute(db.format('SELECT id, name FROM auktioner WHERE active = "active"'), (err, result) => {
              res.send(result);
              io.to('joined').emit()
            });
            console.log('EXECUTED: ' + sqlQuery);
            
            for(let i = 0; i < result.length; i++) {
              
              const username = result[i].username;
              const email = result[i].email;
              const token = jwt.sign({email: email}, username + email);

              db.execute(db.format('UPDATE users SET token = ? WHERE username = ?', [token, username]));
              mailer.sendPaymentInfo(username, email, token);
              
            }
            
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

exports.getOrders = (req, res) => {

  try {

    id = req.body.id

    sqlQuery = db.format('SELECT sold.item, varer.name AS vareName, sold.price, users.username, auktioner.name AS auktionName FROM sold INNER JOIN users ON sold.buyer = users.id INNER JOIN varer ON sold.item = varer.id INNER JOIN auktioner ON varer.auktions_id = auktioner.id WHERE users.id = ? AND betalt = "nej"', [id]);
 
    db.execute(sqlQuery, (err, result) => {
 
     if(err) throw err;
     
     if(!result.length) {
 
       res.status(404).send({
         message: 'Someting went wrong...',
         error: 'error message'
       });
 
     }
     else {
 
       res.send(result);
       console.log('EXECUTED: ' + sqlQuery);
 
     }
 
    });
 
   }
   catch(error) {
 
     res.send(error);
     console.log(error);
 
   }

}

exports.getAuctions = (req, res) => {

  try {

   sqlQuery = db.format('SELECT id, name FROM auktioner WHERE active = "active"');

   db.execute(sqlQuery, (err, result) => {

    if(err) throw err;
    
    if(!result.length) {

      res.status(404).send({
        message: 'Someting went wrong...',
        error: 'error message'
      });

    }
    else {

      res.send(result);
      console.log('EXECUTED: ' + sqlQuery);

    }

   });

  }
  catch(error) {

    res.send(error);
    console.log(error);

  }

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

			if(verify) {
        
				res.send({
				  cookie: 'Success', 
				  role: globalRole,
				  username: globalUsername
				});

			}

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
            const token = jwt.sign({role: role},username+ip+headers);

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

    const sqlQuery = db.format('SELECT id, token FROM users WHERE token = ?', [params]);

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

exports.hentAuk = (req, res) => {
  console.log('start')
  try{
    sqlQuery = db.format(`SELECT id, name FROM auktioner WHERE 1`);
    console.log(sqlQuery)
    db.execute(sqlQuery,(err,result)=>{
      if(err) throw err;
      if(!result)
      {
        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });
      }
      else
      {
        console.log(result)
        res.send({ 
          message: 'Successful',
          data: result
        });
      }
    })
  }
  catch{
    res.send(error);
    console.log(error);
  }
}

exports.registerAuk = (req, res) => {
  const aukName = req.body.aukName

  sqlQuery = db.format('SELECT * FROM auktioner WHERE name = ? LIMIT 1', [aukName]);

  db.execute(sqlQuery, (err, result) => {

    if (err) throw err;

    if (result.length) {

      res.send({ message: 'User already exists' });
      console.log('User already exists');

    }
    else {
      sqlQuery = db.format('INSERT INTO auktioner (name) VALUES (?)', [aukName]);

      db.execute(sqlQuery, (err, result) => {

        if (err) throw err;

        if (!result) {
          res.status(500).send({
            message: 'Someting went wrong...',
            error: 'error message'
          });
        }
        else {
          console.log(result)
          res.send({
            message: 'Successful'
          });
        }

      });

    }

  });
 
}

exports.confirmPayment = (req, res) => {

  userid = req.body.userId;

  const sqlQuery = db.format('UPDATE users SET token = null WHERE id = ?', [userid]);

  db.execute(sqlQuery, (err, result) => {

    if(err) throw err;

    if(!result) {
      res.send({error: err, message: 'Noget gik galt'});
    }
    else {

      db.execute('UPDATE sold SET betalt = "ja" WHERE buyer = ?', [userid], (err, result) => {

        if(err) throw err;

        if(!result) {
          res.send({error: err, message: 'Noget gik galt'});
        }
        else{
          res.send({message: 'success'})
        }

      });

    }

  });

}

exports.aukInfo = (req, res) => {
  const id = req.body.aukId;
  console.log(id);
  try {
    sqlQuery = db.format(`SELECT id, name FROM auktioner WHERE id = ${id}`);
    console.log(sqlQuery)
    db.execute(sqlQuery, (err, result) => {
      if (err) throw err;
      if (!result) {
        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });
      }
      else {
        console.log(result)
        res.send({
          message: 'Successful',
          data: result
        });
      }
    })
  }
  catch {
    res.send(error);
    console.log(error);
  }
}

exports.getAllItems = (req, res) => {
  console.log('start')
  try{
    sqlQuery = db.format(`SELECT id, name, category, auktions_id FROM varer WHERE 1`);
    console.log(sqlQuery)
    db.execute(sqlQuery,(err,result)=>{
      if(err) throw err;
      if(!result)
      {
        console.log('something went wrong');
        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });
      }
      else
      {
        console.log('success')
        console.log(result)
        res.send({ 
          message: 'Successful',
          data: result
        });
      }
    })
  }
  catch{
    res.send(error);
    console.log(error);
  }
}

exports.addOrRemoveFromAuk = (req,res) => {
  const id = req.body.vareId;
  const aukId = req.body.aukId;
  const mode = req.body.mode;
  console.log(id);
  try {
    switch(mode){
      case 1:
        sqlQuery = db.format(`UPDATE testauk.varer SET auktions_id=null WHERE id = ${id} `);
        break;
      case 2:
        sqlQuery = db.format(`UPDATE testauk.varer SET auktions_id=${aukId} WHERE id = ${id} `);
        break;      
    }
    console.log(sqlQuery)
    db.execute(sqlQuery, (err, result) => {
      if (err) throw err;
      if (!result) {
        res.status(500).send({
          message: 'Someting went wrong...',
          error: 'error message'
        });
      }
      else {
        console.log(result)
        res.send({
          message: 'Successful'
        });
      }
    })
  }
  catch {
    res.send(error);
    console.log(error);
  }
}
