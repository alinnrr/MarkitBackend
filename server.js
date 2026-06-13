require("dotenv").config();
const express = require("express");

require("./config/mongodb");

const db = require("./config/mysql");

const memberRoutes = require("./routes/memberRoutes");

const barangRoutes = require("./routes/barangRoutes");

const kategoriRoutes = require("./routes/kategoriRoutes");

const supplierRoutes = require("./routes/supplierRoutes");

const barangSupplierRoutes = require("./routes/barangSupplierRoutes");

const barangDetailRoutes = require("./routes/barangDetailRoutes");

const voucherRoutes = require("./routes/voucherRoutes");

const ulasanRoutes = require("./routes/ulasanRoutes");

const transaksiRoutes = require("./routes/transaksiRoutes");

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("MarkIt API Running");
});


app.use("/api/member", memberRoutes);

app.use("/api/barang", barangRoutes);

app.use("/api/kategori", kategoriRoutes);

app.use("/api/barang-supplier", barangSupplierRoutes);

app.use("/api/supplier", supplierRoutes);

app.use("/api/barang-detail", barangDetailRoutes);

app.use("/api/voucher", voucherRoutes);

app.use("/api/ulasan", ulasanRoutes);

app.use("/api/transaksi", transaksiRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});


//alin ini ngapain 
//nggih