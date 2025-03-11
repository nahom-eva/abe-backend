// Import the query function from the db.config file
const conn = require("../config/db.config");

// Import bcrypt for password hashing
const bcrypt = require("bcrypt");

// A function to check if a customer exists in the database by their email
async function checkIfCustomerExists(email) {
  const query = "SELECT * FROM customer_identifier WHERE customer_email = ?";

  // Execute the query to check if the customer exists
  const rows = await conn.query(query, [email]);
  return rows.length > 0;
}

// A function to create a new customer in the database
async function createCustomer(customer) {
  let createdCustomer = {};
  console.log(customer);
  try {
    // Generate a salt and hash the customer's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(customer.customer_password, salt);

    console.log("rows");
    // Insert the email, phone number, and hashed password into the customer_identifier table
    const query =
      "INSERT INTO customer_identifier (customer_email, customer_phone_number, customer_hash) VALUES (?,?,?)";
    const rows = await conn.query(query, [
      customer.customer_email,
      customer.customer_phone,
      hashedPassword, // Save the hashed password
    ]);

    // Check if the insertion was successful
    if (rows.affectedRows !== 1) {
      return {
        success: false,
        message: "Failed to insert customer identifier.",
      };
    }

    // Get the customer ID from the successful insert
    const customer_id = rows.insertId;

    // Insert additional customer information into the customer_info table
    const query2 =
      "INSERT INTO customer_info (customer_id, customer_first_name, customer_last_name, active_customer_status	) VALUES (?,?,?,?)";
    const rows2 = await conn.query(query2, [
      customer_id,
      customer.customer_first_name,
      customer.customer_last_name,
      customer.active_customer,
    ]);

    // Check if the customer information insertion was successful
    if (rows2.affectedRows !== 1) {
      return {
        success: false,
        message: "Failed to insert customer information.",
      };
    }

    // Construct the customer object to return
    createdCustomer = {
      customer_id,
      customer_email: customer.customer_email,
      customer_first_name: customer.customer_first_name,
      customer_last_name: customer.customer_last_name,
    };

    return {
      success: true,
      createdCustomer,
      message: "Customer created successfully.",
    };
  } catch (error) {
    console.error("Error creating customer:", error.message);
    return { success: false, message: "Database query failed." };
  }
}
async function getAllCustomers() {
  const query =
    "SELECT customer_info.*,customer_identifier.customer_email,customer_identifier.customer_added_date,customer_identifier.customer_added_date,customer_identifier.customer_phone_number FROM customer_info INNER JOIN customer_identifier ON customer_info.customer_id = customer_identifier.customer_id ORDER BY customer_identifier.customer_id DESC ";
  const rows = await conn.query(query);
  return rows;
}
//Create a  function to handle the customerEdit
async function editCustomer(customer_id, customerData) {
  try {
    //Destructure the fields from the customerData object
    const {
      customer_email,
      customer_first_name,
      customer_last_name,
      customer_phone,
      active_customer,
    } = customerData;
    //SQL query to update the employee information
    const query =
      "UPDATE customer_identifier INNER JOIN customer_info ON customer_identifier.customer_id = customer_info.customer_id SET customer_info.customer_first_name = ?,customer_info.customer_last_name = ?,  customer_info.active_customer_status = ?, customer_identifier.customer_phone_number = ? WHERE customer_identifier.customer_id = ? AND customer_identifier.customer_email=? ";
    const rows = await conn.query(query, [
      customer_first_name,
      customer_last_name,
      active_customer,
      customer_phone,
      customer_id,
      customer_email,
    ]);
    // Check if the update was successful
    if (rows.affectedRows === 0) {
      return {
        success: false,
        message: "No matching customer found or no changes were made.",
      };
    }
    //Return the update result
    return { success: true, message: "Customer updated successfully" };
  } catch (error) {
    console.error("Error editing customer:", error.message);
    throw new Error("Database query failed");
  }
}
//Create the searchCustomers function to get the customer from teh database
async function searchCustomers(searchQuery) {
  try {
    const searchTerm = `%${searchQuery}%`;
    const query = `
      SELECT 
        customer_info.*,
        customer_identifier.customer_email,
        customer_identifier.customer_phone_number
      FROM customer_info
      INNER JOIN customer_identifier 
        ON customer_info.customer_id = customer_identifier.customer_id
      WHERE 
        customer_identifier.customer_email LIKE ? OR
        customer_identifier.customer_phone_number LIKE ? OR
        customer_info.customer_first_name LIKE ? OR
        customer_info.customer_last_name LIKE ?
      ORDER BY customer_identifier.customer_id DESC
      LIMIT 10
    `;

    const rows = await conn.query(query, [
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    ]);

    return rows;
  } catch (error) {
    console.error("Database search error:", error.message);
    throw new Error("Failed to execute customer search");
  }
}
module.exports = {
  checkIfCustomerExists,
  createCustomer,
  getAllCustomers,
  editCustomer,
  searchCustomers,
};
