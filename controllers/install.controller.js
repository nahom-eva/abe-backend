//Import the install service to handle communication with the database
const installService = require("../services/install.service");

//Create a function to handle the install request
async function install(req, res, next) {
  const installMessage = await installService.install();
  //Check if the install was successful or not and send the appropriate message to the client
  if (installMessage.status === 200) {
    res.status(200).json({
      message: installMessage,
    });
  } else {
    res.status(500).json({
      message: installMessage,
    });
  }
}
//Export the install function

module.exports = {
  install,
};
