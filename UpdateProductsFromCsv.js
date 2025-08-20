const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Product = require("./models/product.model"); // Adjust path as needed
const fs = require("fs");
const csvParser = require("csv-parser");
require("dotenv").config(); // Load environment variables

async function updateBlinkitSKUsFromCSV(filePath) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB.");
    }

    console.log("Starting Blinkit SKU update...");

    let missingSKUs = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const itemId = row["Secondary Sku Code"]; // Adjust based on your CSV header
        const skuCode = row["SKUID"]; // Adjust column name

        if (!itemId || !skuCode) {
          missingSKUs.push(skuCode || "Unknown Item ID");
          return;
        }

        try {
          const updatedProduct = await Product.findOneAndUpdate(
            { sku_code: skuCode },
            { zepto_sku_code: itemId },
            { new: true }
          );

          if (updatedProduct) {
            console.log(`Updated Item ID: ${itemId} with SKU: ${skuCode}`)
          } else {
            console.warn(`No product found for Item ID: ${skuCode}`);
            missingSKUs.push(itemId);
          }
        } catch (error) {
          console.error(`Error updating Item ID ${itemId}:`, error);
        }
      })
      
  } catch (error) {
    console.error("Error in update script:", error);
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the update function
updateBlinkitSKUsFromCSV("./Blinkit.csv");
