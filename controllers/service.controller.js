//Import teh service service
const serviceService = require("../services/service.service");
//Create the add service controller
async function createService(req, res, next) {
  try {
    const serviceInfo = req.body;
    console.log(serviceInfo.service_name);
    // Create the service
    const createdService = await serviceService.createService(serviceInfo);
    // Handle service creation result
    if (!createdService.success) {
      return res.status(500).json({
        success: false,
        message: createdService.message || "Failed to create service",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error("Error in createService controller:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

//Write a function to get a service
async function getAllServices(req, res, next) {
  try {
    const services = await serviceService.getAllServices();
    // console.log(services)
    if (!services) {
      return res.status(404).json({
        error: "Failed to get services!",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: services,
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
}
//Export the functions

async function updateService(req, res, next) {
  try {
    // Get the serviceId from the request body
    const serviceInfo = req.body;
    // console.log( serviceId)
    // Call the serviceService to update the service with the provided details
    const updatedService = await serviceService.updateService(serviceInfo);

    // If the service is not updated, return a failure message
    if (!updatedService) {
      return res.status(404).json({
        message: "Service is not updated",
      });
    }

    // Return success response with the updated service details
    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to the global error handler
  }
}

module.exports = {
  createService,
  getAllServices,
  updateService,
};
