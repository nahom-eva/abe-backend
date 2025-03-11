// Import the query function from the db.config.js file
const conn = require("../config/db.config.js");
// Import the bcrypt module
const bcrypt = require("bcrypt");
// A function to check if employee exists in the database
async function checkIfEmployeeExists(email) {
  const query = "SELECT * FROM employee WHERE employee_email = ?";
  const rows = await conn.query(query, [email]);
  console.log(rows);

  if (rows.length > 0) {
    return true;
  }
  return false;
}

//A function to create a new employee

async function createEmployee(employee) {
  let createdEmployee = {};
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(employee.employee_password, salt);
    // Insert the email in the employee table
    const query =
      "INSERT INTO employee (employee_email,active_employee) VALUES (?,?)";
    const rows = await conn.query(query, [
      employee.employee_email,
      employee.active_employee,
    ]);
    console.log(rows);
    if (rows.affectedRows !== 1) {
      return false;
    }
    //Get the employee id from the insert
    const employee_id = rows.insertId;
    // Insert the remaining data in to the employee_info, employee_pass, and employee_role tables
    const query2 =
      "INSERT INTO employee_info (employee_id, employee_first_name, employee_last_name, employee_phone) VALUES (?,?,?,?)";
    const rows2 = await conn.query(query2, [
      employee_id,
      employee.employee_first_name,
      employee.employee_last_name,
      employee.employee_phone,
    ]);
    const query3 =
      "INSERT INTO employee_pass (employee_id, employee_password_hashed) VALUES (?,?)";
    const rows3 = await conn.query(query3, [employee_id, hashedPassword]);
    const query4 =
      "INSERT INTO employee_role (employee_id,company_role_id) VALUES (?,?)";
    const rows4 = await conn.query(query4, [
      employee_id,
      employee.company_role_id,
    ]);
    // construct to the employee object to return
    createdEmployee = {
      employee_id: employee_id,
    };
  } catch (err) {
    console.log(err);
  }
  //return the created employee object
  return createdEmployee;
}
// A function to get employee by email
async function getEmployeeByEmail(employee_email) {
  const query =
    "SELECT * FROM employee INNER JOIN employee_info ON employee.employee_id = employee_info.employee_id INNER JOIN employee_pass ON employee.employee_id = employee_pass.employee_id INNER JOIN employee_role ON employee.employee_id = employee_role.employee_id WHERE employee.employee_email = ?";
  const rows = await conn.query(query, [employee_email]);
  return rows;
}

// A function to get all employees

async function getAllEmployees() {
  const query =
    "SELECT * FROM employee INNER JOIN employee_info ON employee.employee_id = employee_info.employee_id INNER JOIN employee_role ON employee.employee_id = employee_role.employee_id INNER JOIN company_roles ON employee_role.company_role_id = company_roles.company_role_id ORDER BY employee.employee_id DESC";
  const rows = await conn.query(query);
  return rows;
}


//A function to edit an employee
async function editEmployee(employee_id, employeeData) {
  console.log(employeeData);
  try {
    //Destructure the fields from the employeeData object
    const {
      employee_email,
      employee_first_name,
      employee_last_name,
      employee_phone,
      active_employee,
      company_role_id,
    } = employeeData;
    //SQL query to update the employee information
    const query =
      "UPDATE employee_info INNER JOIN employee ON employee.employee_id= employee_info.employee_id INNER JOIN employee_role ON employee.employee_id = employee_role.employee_id SET employee_info.employee_first_name=?, employee_info.employee_last_name=?,employee_info.employee_phone=?, employee.active_employee=? ,employee_role.company_role_id = ? WHERE employee.employee_id=? AND employee.employee_email = ?";
    //Execute the query with the provided data
    const rows = await conn.query(query, [
      employee_first_name,
      employee_last_name,
      employee_phone,
      active_employee,
      company_role_id,
      employee_id,
      employee_email,
    ]);
    console.log(rows);

    // Check if the update was successful
    if (rows.affectedRows === 0) {
      return {
        success: false,
        message: "No matching employee found or no changes were made.",
      };
    }
    //Return the update result
    return { success: true, message: "Employee updated successfully" };
  } catch (error) {
    console.error("Error editing employee:", error.message);
    throw new Error("Database query failed");
  }
}

//A function to delete an employee

async function deleteEmployee(employee_id) {
  try {
    // Delete from child tables first to satisfy foreign key constraints
    await conn.query("DELETE FROM employee_info WHERE employee_id = ?", [
      employee_id,
    ]);
    await conn.query("DELETE FROM employee_role WHERE employee_id = ?", [
      employee_id,
    ]);
    await conn.query("DELETE FROM employee_pass WHERE employee_id = ?", [
      employee_id,
    ]);

    // Delete from the main employee table
    const result = await conn.query(
      "DELETE FROM employee WHERE employee_id = ?",
      [employee_id]
    );

    // Check if the deletion was successful
    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "No matching employee found.",
      };
    }

    return { success: true, message: "Employee deleted successfully" };
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

// Export the functions for use in the controller
module.exports = {
  checkIfEmployeeExists,
  createEmployee,
  getEmployeeByEmail,
  getAllEmployees,
  editEmployee,
  deleteEmployee,
};
