//Import the express module
const express = require("express");
//call the router method from the express to create the router
const router = express.Router();
//Import the middleware
const authMiddleware = require("../middlewares/auth.middleware");
//Import the controller
const orderController = require("../controllers/order.controller");

router.post(
  "/api/order",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.createOrder
);
router.get(
  "/api/orders",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.getAllOrders
);
router.get(
  "/api/order/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.getCustomerOrders
);
router.put(
  "/api/order/:id",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
  orderController.updateOrder
);
router.get(
  "/api/track-order/:id",  orderController.trackOrder
);


//Export the router

module.exports = router;
