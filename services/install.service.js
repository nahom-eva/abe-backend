//Import the db function from the db.config.js file
const conn = require("../config/db.config.js");
//Import the fs module to read our sql file
const fs = require("fs");
//Write a function to create the database tables
async function install() {
  // Create a variable to hold the path to the sql file
  const queryFile = __dirname + "/sql/initial-queries.sql";
//   console.log(queryFile);
  //Temporary variable, used to store all queries, the return message

  let queries = [];
  let finalMessage = {};
  let tempLine = "";
  //Read the sql file
  const lines = fs.readFileSync(queryFile, "utf-8").split("\n");
  // Create a promise to handle the asynchronous reading of the file and ... of the queries in the variables

  const executed = await new Promise((resolve, reject) => {
    // Iterate over all lines
    lines.forEach((line) => {
      if (line.trim().startsWith("--") || line.trim() === "") {
        // skip if it's a comment or empty line
        return;
      }
      tempLine += line;
      if (line.trim().endsWith(";")) {
        //If it has a semicolon at the end, it's the end of the query string
        //Prepare the individual query
        const sqlQuery = tempLine.trim();
        //Add the query to the list of queries
        queries.push(sqlQuery);
        tempLine = "";
      }
    });
    resolve("Queries are added to the list");
  });
  // Loop through the queries and execute them one by one asynchronously

  for (let i = 0; i < queries.length; i++) {
    try {
      const result = await conn.query(queries[i]);
      console.log(`Query ${i + 1} executed successfully`);
    } catch (error) {
      console.error(`Error with Query ${i + 1}:`, queries[i]);
      console.error("Error Message:", error.message);
      finalMessage.message = "Not all tables were created";
    }
  }
  
  //Prepare the final message to return to the controller
  if (!finalMessage.message) {
    finalMessage.message = "All tables were created successfully";
    finalMessage.status = 200;
  } else {
    finalMessage.status = 500;
  }
  // Return the final message
  return finalMessage;
}
//Export the install function for use in the controller
module.exports = { install };
