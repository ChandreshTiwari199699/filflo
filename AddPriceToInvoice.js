const mongoose = require("mongoose");
const B2BOrder = require("./models/b2bOrder.model"); // Adjust the path as needed
const Product = require("./models/product.model"); // Adjust the path as needed
require("dotenv").config();

async function addPrdMrpToOrders(orderIds) {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB.");
    }

    // Fetch the B2B orders based on the provided orderId field
    const orders = await B2BOrder.find({ orderId: { $in: orderIds } });

    for (const order of orders) {
      if (order.irnDetails?.irnRequestBody?.ItemList) {
        let updated = false;

        for (const item of order.irnDetails.irnRequestBody.ItemList) {
          const product = await Product.findOne({ sku_code: item.PrdDesc });

          if (product) {
            item.PrdMrp = product.ppu; 
            item.PrdName= product.product_name// Add the PrdMrp field
            updated = true;
          }
        }

        if (updated) {
          order.markModified("irnDetails.irnRequestBody.ItemList"); // Ensure changes are detected
          await order.save();
          console.log(`Updated order: ${order.orderId}`);
        } else {
          console.log(`No changes for order: ${order.orderId}`);
        }
      }
    }

    console.log("All applicable orders updated successfully.");
  } catch (error) {
    console.error("Error updating orders:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
}

// Example usage
const orderIds = ["2866810033476","GGNPO137010","FC5PO131996","CHCPO138811"]; // Replace with actual order IDs
addPrdMrpToOrders(orderIds);
