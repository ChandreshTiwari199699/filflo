const mongoose = require("mongoose");
const fs = require("fs");
const csvParser = require("csv-parser");
const Supplier = require("./models/supplier.model");
require("dotenv").config();

async function importSuppliersFromCSV(filePath) {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Connected to MongoDB.");
    }

    const suppliers = [];

    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase(), // normalize headers
        })
      )
      .on("data", (row) => {
        const supplierId = row["id"];
        const name = row["name"];
        const gstNumber = row["gst_number"] || row["tin_number"];


        if (!supplierId || !name || !gstNumber) {
          console.warn("⛔ Skipping invalid row:", row);
          return;
        }

        const supplier = {
          supplierId,
          name,
          address: row["address"],
          phone: row["phone_number"]?.toString(),
          gstNumber,
          bankDetails: {
            accountHolderName: row["account_holder_name"],
            accountNumber: row["account_number"]?.toString(),
            ifscCode: row["ifsc_code"],
            bankName: row["bank_name"],
            branch: row["branch_name"],
          },
          remarks: row["remarks"] || "",
        };

        suppliers.push(supplier);
      })
      .on("end", async () => {
        try {
          console.log(`📦 Total suppliers ready to import: ${suppliers.length}`);
          const result = await Supplier.insertMany(suppliers, { ordered: false });
          console.log(`✅ Successfully imported ${result.length} suppliers.`);
        } catch (insertError) {
          console.error("❌ Error inserting suppliers:", insertError);
        } finally {
          mongoose.connection.close();
          console.log("🔌 MongoDB connection closed.");
        }
      });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    mongoose.connection.close();
  }
}

importSuppliersFromCSV("./Supplier.csv");
