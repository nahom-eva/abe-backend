// Import the employee service
const employeeService = require("../services/employee.service");
// Create the add employee controller
async function createEmployee(req, res, next) {
  //Check if employee email already exists in the database
  const employeeExists = await employeeService.checkIfEmployeeExists(
    req.body.employee_email
  );
  //If employee exists, send a response to the client
  if (employeeExists) {
    res.status(400).json({
      error: "This email address is already associated with another employee",
    });
  } else {
    try {
      const employeeData = req.body;
      //Create the employee
      const employee = await employeeService.createEmployee(employeeData);
      if (!employee) {
        return res.status(404).json({
          error: "Failed to add the employee!",
        });
      } else {
        return res.status(200).json({
          status: "true",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error: "Something went wrong",
      });
    }
  }
}
//Write a function and to get all employees

async function getAllEmployees(req, res, next) {
  try {
    const employees = await employeeService.getAllEmployees();
    if (!employees) {
      return res.status(404).json({
        error: "Failed to get all employees!",
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: employees,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Something went wrong",
    });
  }
}

//Write a function to edit the employee

async function editEmployee(req, res, next) {
  try {
    const employeeId = req.params.id;
    const employeeData = req.body;
    //call the service
    const result = await employeeService.editEmployee(employeeId, employeeData);

    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    //Log and handle error
    console.error("Error updating employee", error.message);
    return res.status(500).json({
      success: false,
      message: "Error updating employee",
    });
  }
}
//Write a function to delete an employee

async function deleteEmployee(req, res, next) {
  try {
    const employeeId = req.params.id;
    //call the service
    const result = await employeeService.deleteEmployee(employeeId);

    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    //Log and handle error
    console.error("Error deleting employee", error.message);
    return res.status(500).json({
      success: false,
      message: "Error deleting employee",
    });
  }
}
//Export the createEmployee controller
module.exports = {
  createEmployee,
  getAllEmployees,
  editEmployee,
  deleteEmployee
};
