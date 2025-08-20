const mongoose = require("mongoose");
const fs = require("fs");
const csvParser = require("csv-parser");
const B2BCustomer = require("./models/b2bCustomer.model"); 
const DelLocationToB2BCustomer = require("./models/delLocationToB2BCustomer.model"); 
require("dotenv").config(); // Load environment variables

async function updateDelLocationMapping(filePath) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB.");
    }

    console.log("Starting DelLocation to B2B Customer mapping update...");

    let missingCustomers = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const delLocation = row["Delivery Location"]; 
        const customerName = row["Name"]; 
        const customerId = row["Customer Code"]

        if (!delLocation || !customerName) {
          console.warn(`Missing data - Facility: ${delLocation}, Name: ${customerName}`);
          return;
        }

        try {
          // Find B2B customer by name
          const customer = await B2BCustomer.findOne({ customerId: customerId });

          if (!customer) {
            console.warn(`No B2B customer found for: ${customerId}`);
            missingCustomers.push(customerName);
            return;
          }

               // Check if the mapping already exists
          const existingMapping = await DelLocationToB2BCustomer.findOne({
            del_location: delLocation,
            b2b_customer: customer._id,
          });

          if (existingMapping) {
            console.log(`Mapping already exists: ${delLocation} -> ${customer.name}`);
            return;
          }

            // Create a new mapping (without checking for existing ones)
            await DelLocationToB2BCustomer.create({
                del_location: delLocation,
                b2b_customer: customer._id,
                b2b_customer_name: customer.name, // Storing name directly for quick access
              });

          console.log(`Mapped ${delLocation} to B2B Customer: ${customer.name}`);
        } catch (error) {
          console.error(`Error processing ${customerName}:`, error);
        }
      })

  } catch (error) {
    console.error("Error in update script:", error);
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the update function
updateDelLocationMapping("./B2BCustomerData.csv");
