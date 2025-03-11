//Import the express module
const express = require("express");
//call the router method from express to create the router
const router = express.Router();
//Import the middleware
const authMiddleware = require("../middlewares/auth.middleware");
//Import the service controller
const serviceController = require("../controllers/service.controller");
//Create the route to handle the add service post
router.post(
  "/api/service",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.createService
);
router.get(
  "/api/service",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.getAllServices
);
router.put(
  "/api/service-edit",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.updateService
);
//Export the router
module.exports = router;
