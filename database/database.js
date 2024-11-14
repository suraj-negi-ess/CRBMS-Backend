import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Disable logging
  }
);

// A function to connect and execute queries
const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connected to PostgreSQL`);
  } catch (err) {
    // console.error("Error connecting to PostgreSQL:", err);
  }
};

export { sequelize, dbConnection };
