require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/configs/db.config");
const { initializePostgres } = require("./src/configs/postgres.config");


connectDB();
initializePostgres();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
