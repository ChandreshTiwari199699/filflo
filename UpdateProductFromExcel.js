const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Product = require("./models/product.model"); // Adjust path as needed
require("dotenv").config(); // Load environment variables

async function updateProductsFromExcel(filePath) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB.");
    }

    console.log("Starting product update...");

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const skuCode = row["SKU Code"]; // Adjust column name based on your Excel headers
      const hsnCode = row["HSN Code"] ? row["HSN Code"].toString().trim() : null;
      const taxSlab = row["Tax"] ? row["Tax"].toString().trim() : null;
      const ppu = row["MRP Price"] ? row["MRP Price"].toString().trim() : null;
      

      if (!skuCode) continue;
      console.log(`Processing SKU: ${skuCode}, HSN: ${hsnCode}, Tax: ${taxSlab}, PPU: ${ppu}`);

      try {
        await Product.findOneAndUpdate(
         
          { sku_code: skuCode },
  { hsn_code: hsnCode, tax_slab: taxSlab, ppu: ppu }, // ✅ Correct
  { new: true }
        );
        console.log(`Updated SKU: ${skuCode}`);
      } catch (error) {
        console.error(`Error updating SKU ${skuCode}:`, error);
      }
    }

    console.log("Database update complete.");
  } catch (error) {
    console.error("Error in update script:", error);
  } finally {
    // Close MongoDB connection after updates
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the update function
updateProductsFromExcel("./SleepyOwl_Manesar_WH.SKU Master_2025-03-11T21-42-27.xls");
