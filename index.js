const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");

// importing routes
const warehouseRoutes = require("./routes/warehouse.routes");
const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const categoryRoutes = require("./routes/category.routes");
const rawMaterialRoutes = require("./routes/rawMaterial.routes");
const rawMaterialPORoutes = require("./routes/rawMaterial_PO.routes");
const rawMaterialPOBatchRoutes = require("./routes/rawMaterialPOBatch.routes");
const productRoutes = require("./routes/product.routes");
const assemblyPORoutes = require("./routes/assemblyPo.routes");
const generateQrRoutes = require("./routes/generateQr.routes");
const inventoryPORoutes = require("./routes/inventoryPo.routes");
const orderRoutes = require("./routes/order.routes");
const pickListRoutes = require("./routes/pickList.routes");
const reportRoutes = require("./routes/reports.routes");
const recordRoutes = require("./routes/records.routes");
const qrCodeRecordsRoutes = require("./routes/qrCodeRecord.routes");
const bulkRawMaterialPORoutes = require("./routes/bulkRawMaterialPO.routes");
const orderDetailsRoutes = require('./routes/orderDetails.routes');
const rtoOrderRoutes = require('./routes/rtoOrder.routes');
const productMappingRoutes = require('./routes/productMapping.routes');
const outwardedProductsRoutes = require('./routes/outwardedProducts.routes');
const amazonOrderRoutes = require('./routes/amazonOrder.routes');
const engravingOrderRoutes = require("./routes/engravingOrder.routes");
const b2bCustomerRoutes = require("./routes/b2bCustomer.routes");
const b2bOrderRoutes = require("./routes/b2bOrder.routes");
const b2bInventoryPORoutes = require("./routes/b2bInventoryPo.routes");
const skuRoutes = require("./routes/sku.routes");
const productionPORoutes = require("./routes/productionPO.routes");
const productActivityLoggerRoutes = require('./routes/productActivityLogger.routes');
const pricingStrategyRoutes = require('./routes/pricingStratergy.routes')
const supplierRoutes = require ('./routes/supplier.routes')
const procurementPORoutes = require ('./routes/procurementPO.routes')
const creditNoteRoutes = require('./routes/creditNote.routes');

app.use(bodyParser.json());
app.use(cors());

// calling routes here
warehouseRoutes(app);
authRoutes(app);
vendorRoutes(app);
categoryRoutes(app);
rawMaterialRoutes(app);
rawMaterialPORoutes(app);
rawMaterialPOBatchRoutes(app);
productRoutes(app);
assemblyPORoutes(app);
generateQrRoutes(app);
inventoryPORoutes(app);
orderRoutes(app);
pickListRoutes(app);
reportRoutes(app);
recordRoutes(app);
qrCodeRecordsRoutes(app);
bulkRawMaterialPORoutes(app);
orderDetailsRoutes(app);
rtoOrderRoutes(app);
productMappingRoutes(app);
outwardedProductsRoutes(app);
amazonOrderRoutes(app);
engravingOrderRoutes(app);
b2bCustomerRoutes(app);
b2bOrderRoutes(app);
b2bInventoryPORoutes(app);
skuRoutes(app);
productionPORoutes(app);
productActivityLoggerRoutes(app);
pricingStrategyRoutes(app);
supplierRoutes (app);
procurementPORoutes (app);
creditNoteRoutes(app);

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  mongoose.connect(process.env.MONGO_URL).then(
    () => {
      console.log("Mongodb connected...");
      // cronJob.start();
    },

    (err) => {
      console.log("Error occurred:", err);
    }
  );
});
