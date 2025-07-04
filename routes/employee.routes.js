//Import the express module
const express = require("express");
// call the router method from express to create the router
const router = express.Router();
//Import the employee controller
const employeeController = require("../controllers/employee.controller");
//Import the middleware
const authMiddleware = require("../middlewares/auth.middleware");

//Create a route to handle the add employee request on post
router.post(
  "/api/employee",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.createEmployee
);
//Create a route to handle the get all employees request on get
router.get(
  "/api/employees",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.getAllEmployees
);
router.put(
  "/api/employee/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.editEmployee
);
router.delete(
  "/api/employee/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  employeeController.deleteEmployee
)
//Export the router
module.exports = router;


