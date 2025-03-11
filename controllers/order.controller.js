//Import the order service
const orderService = require("../services/order.service");
//Create the add order controller
async function createOrder(req, res, next) {
  try {
    //Get the order data from the request body
    const orderData = req.body;
    console.log(orderData);
    //Call the create order service to create the order
    const createdOrder = await orderService.createOrder(orderData);
    //Send the created order back as a response

    if (!createdOrder.success) {
      return res.status(404).json({
        success: false,
        message: "Failed to create an order",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "order created successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    if (!orders) {
      return res.status(404).json({
        error: "Failed to get orders!",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {}
}

async function getCustomerOrders(req, res, next) {
  try {
    const customerId = req.params.id;
    const order = await orderService.getCustomerOrders(customerId);
    if (!order) {
      return res.status(404).json({
        error: "Failed to get order!",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: order,
      });
    }
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
}

async function updateOrder(req, res, next) {
  try {
    const orderId = req.params.id;
    const updatedOrderData = req.body;

    const updatedOrder = await orderService.updateOrder(
      orderId,
      updatedOrderData
    );

    if (updatedOrder.success) {
      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        error: updatedOrder.error || "Failed to update order!",
      });
    }
  } catch (error) {
    console.error("Error updating order:", error.message);

    return res.status(500).json({
      success: false,
      error: "Internal Server Error. Please try again later.",
    });
  }
}

// Controller to track order
async function trackOrder(req, res, next) {
  try {
    const orderHash  = req.params.id;
    console.log(orderHash)
    if (!orderHash) {
      return res.status(400).json({
        success: false,
        message: "Order hash is required",
      });
    }

    console.log("Tracking order with hash:", orderHash);
    const response = await orderService.trackOrder(orderHash);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "No Order found",
      });
    }

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error in trackOrder controller:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error. Please try again later.",
    });
  }
}

module.exports = { trackOrder };


module.exports = {
  createOrder,
  getAllOrders,
  getCustomerOrders,
  updateOrder,
  trackOrder,
};
