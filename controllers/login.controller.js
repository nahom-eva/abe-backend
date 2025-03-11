//Import the login service
const loginService = require("../services/login.service");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;

// Handle the employee login
async function logIn(req, res, next) {
  try {
    console.log(req.body);
    const employeeData = req.body;

    // Call the logIn method from the login service
    const employee = await loginService.logIn(employeeData);

    // If employee not found, return error and stop execution
    if (employee.status === "fail") {
      console.log(employee.message);
      return res.status(403).json({
        status: employee.status,
        message: employee.message,
      });
    }

    // If employee is inactive, return error
    if (employee.data?.active_employee !== 1) {
      return res.status(403).json({
        status: "fail",
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Create JWT payload safely
    const payload = {
      employee_id: employee.data?.employee_id || null,
      employee_email: employee.data?.employee_email || null,
      employee_role: employee.data?.company_role_id || null,
      employee_first_name: employee.data?.employee_first_name || "Unknown",
      active_employee: employee.data?.active_employee || 0,
    };

    // Generate token
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "24h" });

    // Send successful response
    res.status(200).json({
      status: "success",
      message: "Employee logged in successfully",
      data: { employee_token: token },
    });

  } catch (error) {
    console.error("Error in logIn controller:", error);

    // Handle unexpected errors
    res.status(500).json({
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    });
  }
}

// Export function
module.exports = { logIn };
