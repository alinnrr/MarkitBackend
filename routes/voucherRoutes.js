const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const voucherSchema = new mongoose.Schema({
    ID_Voucher: String,
    ID_Admin: String,
    kode_voucher: String,
    nama_voucher: String,
    jenis_voucher: String,
    nilai_diskon: Number,
    minimal_belanja: Number,
    tanggal_mulai: String,
    tanggal_berakhir: String,
    syarat_level: String,
    status_voucher: String
}, {
    collection: "voucher",
    versionKey: false
});

const Voucher = mongoose.model("Voucher", voucherSchema);

router.get("/", async (req, res) => {
    try {
        const vouchers = await Voucher.find();

        let rows = vouchers.map((v, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${v.ID_Voucher}</td>
                <td>${v.kode_voucher}</td>
                <td>${v.nama_voucher}</td>
                <td>${v.jenis_voucher}</td>
                <td>${v.nilai_diskon}%</td>
                <td>Rp ${Number(v.minimal_belanja || 0).toLocaleString("id-ID")}</td>
                <td>${v.syarat_level}</td>
                <td>${v.status_voucher}</td>
            </tr>
        `).join("");

        res.send(`
            <html>
            <head>
                <title>Data Voucher</title>
                <style>
                    body { font-family: Arial; background: #f4f6f8; padding: 30px; }
                    .container { background: white; padding: 24px; border-radius: 12px; max-width: 1200px; margin: auto; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
                    table { width: 100%; border-collapse: collapse; font-size: 14px; }
                    th { background: #1f2937; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
                    tr:hover { background: #f9fafb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Data Voucher MarkIT</h1>
                    <p>Total voucher: ${vouchers.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>ID Voucher</th>
                                <th>Kode</th>
                                <th>Nama Voucher</th>
                                <th>Jenis</th>
                                <th>Diskon</th>
                                <th>Minimal Belanja</th>
                                <th>Syarat Level</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).json({
            message: "Gagal mengambil data voucher",
            error: err.message
        });
    }
});


module.exports = router;