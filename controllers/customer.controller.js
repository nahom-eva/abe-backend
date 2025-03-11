//import the customer service'
const customerService = require("../services/customer.service");
//Create the add customer controller
async function createCustomer(req, res, next) {
  // console.log("test")
  const customerExists = await customerService.checkIfCustomerExists(
    req.body.customer_email
  );

  // If the customer already exists in the database, return a 400 Bad Request response with an appropriate error message
  if (customerExists) {
    res
      .status(400)
      .json({ error: "This customer already exists in the system." });
  } else {
    try {
      const customerData = req.body;
      // console.log(customerData)
      //create the employee
      const customer = await customerService.createCustomer(customerData);
      console.log(customer);
      if (!customer.success) {
        return res.status(404).json({
          success: false,
          message: "Failed to add the customer",
        });
      } else {
        return res.status(200).json({
          success: true,
        });
      }
    } catch (error) {
      return res.status(400).json({
        error: "Something went wrong",
      });
    }
  }
}
//Create the get customers controller
async function getAllCustomers(req, res, next) {
  try {
    const customers = await customerService.getAllCustomers();
    if (!customers) {
      return res.status(404).json({
        error: "Failed to get customers!",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: customers,
      });
    }
  } catch (error) {
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
}
//Create the put customer controller function
async function editCustomer(req, res, next) {
  try {
    const customerId = req.params.id;
    const customerData = req.body;
    const result = await customerService.editCustomer(customerId, customerData);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    //Log and handle error
    console.error("Error updating customer", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating customer",
    });
  }
}
//Create the searchCustomers controller here
async function searchCustomers(req, res, next) {
  try {
    const searchQuery = req.query.query;

    if (!searchQuery || searchQuery.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await customerService.searchCustomers(searchQuery);
    // console.log(results)
    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error searching customers",
      error: error.message,
    });
  }
}
module.exports = {
  createCustomer,
  getAllCustomers,
  editCustomer,
  searchCustomers,
};
