// Import the express module
const express = require("express");
// Call the router  method from express to create the router
const router = express.Router();
//Import the install router
const installRouter = require("./install.routes");
//Import the employee routes
const employeeRouter = require('./employee.routes')
//Import the login routes
const loginRoutes = require("./login.routes");
//Import the customer routes
const customerRoutes = require('./customer.routes')
//Import the vehicle routes
const vehicleRoutes = require('./vehicle.routes')
//Import the service routes
const serviceRoutes = require('./service.routes')
//Import teh order routes
const orderRoutes = require('./order.routes')
//Add the install router to the main router
router.use(installRouter);
//Add the employee routes to the main router
router.use(employeeRouter);
//Add the login routes to the main router
router.use(loginRoutes); 
//Add the customer routes to the main router
router.use(customerRoutes);
//Add the vehicle routes to the main router
router.use(vehicleRoutes);
//Add the service routes to the main router
router.use(serviceRoutes);
//Add the order routes to the main router
router.use(orderRoutes);
//Export the router 
module.exports = router; 

