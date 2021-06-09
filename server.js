// Imports
require('dotenv').config(); //Environment variable manager
const express = require('express'); //Express server
const app = express(); //Express instance
const router = require('./app/routes/routes.js');
const cors = require('cors'); //Cors libraby
const cookieParser = require('cookie-parser'); //Cookie library
const { socketConnection } = require('./app/api/api');


// Enables cors on domain
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  credentials: true
}
app.use(cors(corsOptions));

// Session setup
app.use(cookieParser());

// Recognises incoming requests as json objects
app.use(express.json());
app.use(express.static('resources'));
app.use('/', router);

// Basic check to see if our server is working
router.get('/', (req, res) => {
  res.json({ message: "is working" });
});

// Create server that listens to port 8080
const server = app.listen(process.env.PORT, "localhost", function () {
  
  const host = server.address().address;
  const port = server.address().port;
  
  console.log("App listening at http://%s:%s", host, port); 
});

socketConnection(server)

