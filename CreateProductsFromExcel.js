const xlsx = require("xlsx");
const mongoose = require("mongoose");
const Product = require("./models/product.model"); // Adjust path as needed
require("dotenv").config(); // Load environment variables

const pic_missed_skus = [
  "⁠PMC-FVA-05P-SAC-C30"   
];

async function createMissingProducts(filePath) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB.");
    }

    console.log("Checking for missing products...");

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(sheet);

    for (const row of data) {
      const skuCode = row["SKU Code"];
      const productName = row["SKU Description"];
      const hsnCode = row["HSN Code"] ? row["HSN Code"].toString().trim() : null;
      const taxSlab = row["Tax"] ? row["Tax"].toString().trim() : null;
      const ppu = row["MRP Price"] ? row["MRP Price"].toString().trim() : null;

      if (!skuCode || !pic_missed_skus.includes(skuCode)) continue;

      try {
        const existingProduct = await Product.findOne({ sku_code: skuCode });

        if (!existingProduct) {
          // Create new product
          const newProduct = new Product({
            product_name: productName,
            product_description: productName,
            product_category_id: "67f0ec1d5849b03030f4181c",
            unit_of_measure: "units",
            current_stock: 0,
            current_count: 0,
            sku_code: skuCode,
            hsn_code: hsnCode, 
            tax_slab: taxSlab, 
            ppu: ppu || 0,
            case_size: 30,
          });

          await newProduct.save();
          console.log(`Created new product: ${skuCode}`);
        }
      } catch (error) {
        console.error(`Error processing SKU ${skuCode}:`, error);
      }
    }

    console.log("Product creation process complete.");
  } catch (error) {
    console.error("Error in script:", error);
  } finally {
    // Close MongoDB connection after updates
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Run the function
createMissingProducts("latestmaster.xls");
