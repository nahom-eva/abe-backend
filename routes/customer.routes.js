//Import the express module
const express = require("express");
// call the router method from express to create the router
const router = express.Router();
//Import the middleware
const authMiddleware = require("../middlewares/auth.middleware");
//Import the customer controller
const customerController = require("../controllers/customer.controller");

//create the route to handle the add customer request post
router.post(
  "/api/customer",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  customerController.createCustomer
);
//Create the route to handle the get all customers request
router.get(
  "/api/customers",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  customerController.getAllCustomers
);
router.put(
  "/api/customer/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  customerController.editCustomer
);
router.get(
  "/api/customers/search",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  customerController.searchCustomers
);

//Export the router
module.exports = router;
