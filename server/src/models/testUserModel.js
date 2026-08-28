require("dotenv").config({ path: "./.env" });

const {
  getAllUsers,
  getUserById,
} = require("./user.model");

const testUserModel = async () => {
  try {
    console.log("========================================");
    console.log("       USER MODEL TEST");
    console.log("========================================");

    const users = await getAllUsers();

    console.log("Total users:", users.length);
    console.log("Users:", users);

    if (users.length > 0) {
      const user = await getUserById(users[0].id);
      console.log("First user by ID:", user);
    } else {
      console.log("No users found in database yet.");
    }

    console.log("========================================");
    console.log("       USER MODEL TEST SUCCESS");
    console.log("========================================");
  } catch (error) {
    console.error("USER MODEL TEST FAILED:", error.message);
    process.exit(1);
  }
};

testUserModel();