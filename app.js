// Import the express module
const express = require("express");
//Import the dotenv module and call he config method to load the environment variables
require("dotenv").config();
// Import the express module
const sanitize = require("sanitize");
//Import the CORS module
const cors = require("cors");
//Set up the CORS options to allow requests from our frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionSuccessStatus: 200,
};
//Create a variable to hold our port number
const port = process.env.PORT;
// Import the router
const router = require("./routes");
//Create the webserver
const app = express();
//Add the CORS middleware
app.use(cors(corsOptions));
// Add the express.json middleware to the application
app.use(express.json());
//Add the sanitizer to the express middleware
app.use(sanitize.middleware);
//Add the routes to the application as middleware
app.use(router);
//Start the webserver
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
