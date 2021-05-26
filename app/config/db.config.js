const mysql = require('mysql2'); //Mysql2 library


const db = mysql.createPool({
  
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

});
 
module.exports = db;