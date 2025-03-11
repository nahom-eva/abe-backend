//Import the dotenv package
require("dotenv").config();
//Import the jsonwebtoken package
const jwt = require("jsonwebtoken");
//Import the employee service
const employeeService = require("../services/employee.service");
// A function to verify the token received from the frontend
const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  // console.log(token)
  if (!token) {
    return res.status(403).send({
      status: "fail",
      success: false,
      message: "No token provided.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        status: "fail",
        success: false,
        message: "Unauthorized access.",
      });
    }
    req.employee_email = decoded.employee_email;
    next();
  });
};

//A function to check if the user is an admin
const isAdmin = async (req, res, next) => {
    // console.log(req.employee_email);
  const employee_email = req.employee_email;
  const employee = await employeeService.getEmployeeByEmail(employee_email);
  if (employee[0].company_role_id === 3) {
    next();
  } else {
    return res.status(403).send({
      status: "fail",
      error: "Require Admin Role! ",
    });
  }
};

const authMiddleware = {
  verifyToken,
  isAdmin,
};
module.exports = authMiddleware;
