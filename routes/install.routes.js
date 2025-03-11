//Import the express module
const express = require('express');
// Call the router method from express to create the router
const router = express.Router();
// Import the install controller
const installController = require('../controllers/install.controller');
// Define the routes for the install controller
router.get('/install', installController.install);
// Export the router for use in the main application
module.exports = router;