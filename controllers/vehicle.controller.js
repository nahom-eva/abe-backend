//Import the vehicle service
const vehicleService = require("../services/vehicle.service");
//Create the add vehicle controller
async function createVehicle(req, res, next) {
  try {
    const vehicleInfo = req.body;
    
    //create the vehicle
    const createdVehicle = await vehicleService.createVehicle(vehicleInfo);
    //send the created vehicle back to the client
    // console.log(createdVehicle);
    if (!createdVehicle.success) {
      return res.status(404).json({
        success: false,
        message: "Failed to add the vehicle",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({ error: "Something went wrong" });
  }
}

async function getVehicle(req, res, next) {
  try {
    const customer_id = req.query.customer_id;
    const result = await vehicleService.getVehicle(customer_id);

    // Always return 200 with consistent structure
    console.log(result.success)
    res.status(200).json({
      success: result.success,
      message: result.message || "Vehicles retrieved successfully",
      data: result.data // Always array
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [] // Ensure array even on error
    });
  }
}

module.exports = {
  createVehicle,
  getVehicle,
};
