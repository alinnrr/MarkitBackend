const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const transaksiSchema = new mongoose.Schema({
    _id: String,
    id_member: String,
    id_voucher: String,
    id_admin: String,
    tanggal_transaksi: Date,
    total_harga_before_voucher: Number,
    total_harga_after_voucher: Number,
    daftar_barang: [
        {
            id_barang: String,
            jumlah: Number
        }
    ],
    metode_pembayaran: String
}, {
    collection: "transaksi",
    versionKey: false
});

const Transaksi = mongoose.model("Transaksi", transaksiSchema);

const db = require("../config/mysql");

const Voucher =
require("../config/models/Voucher");

const validasiVoucher =
require("../services/voucherService");

router.post("/", async (req, res) => {

    try {

        const {
            id_member,
            id_voucher,
            id_admin,
            daftar_barang,
            metode_pembayaran
        } = req.body;

        if (
            !Array.isArray(daftar_barang) ||
            daftar_barang.length === 0
        ) {

            return res.status(400).json({
                message:
                "Daftar barang tidak boleh kosong"
            });

        }

        const idBarangList =
        daftar_barang.map(
            item => item.id_barang
        );

        const placeholders =
        idBarangList.map(
            () => "?"
        ).join(",");

        const [barangRows] =
        await db.promise().query(
            `
            SELECT
                ID_Barang,
                nama_barang,
                harga_barang,
                stok
            FROM barang
            WHERE ID_Barang IN (${placeholders})
            `,
            idBarangList
        );

        let total_before_voucher = 0;

        for (const item of daftar_barang) {

            const barang =
            barangRows.find(
                b =>
                b.ID_Barang ===
                item.id_barang
            );

            if (!barang) {

                return res.status(400).json({
                    message:
                    `Barang ${item.id_barang} tidak ditemukan`
                });

            }

            total_before_voucher +=
                barang.harga_barang *
                item.jumlah;

        }

        let warningExpired = [];

        for (const item of daftar_barang) {

            const [warning] =
            await db.promise().query(
                "CALL sp_cek_warning_expired(?)",
                [item.id_barang]
            );

            if (
                warning[0] &&
                warning[0].length > 0
            ) {
                warningExpired.push(
                    warning[0][0]
                );
            }
        }

        const hasilVoucher =
        await validasiVoucher({

            db,

            Voucher,

            id_member,

            id_voucher,

            total_before_voucher

        });

        const diskon =
        hasilVoucher.diskon;

        const total_after_voucher =
        hasilVoucher.total_after_voucher;

        const jumlahTransaksi =
        await Transaksi.countDocuments();

        const invoice =
        "INV-" +
        String(
            jumlahTransaksi + 1
        ).padStart(4, "0");

        const transaksi =
        await Transaksi.create({

            _id: invoice,

            id_member,

            id_voucher,

            id_admin,

            tanggal_transaksi:
            new Date(),

            total_harga_before_voucher:
            total_before_voucher,

            total_harga_after_voucher:
            total_after_voucher,

            daftar_barang,

            metode_pembayaran

        });

        await db.promise().query(
            `
            CALL sp_proses_transaksi_mysql(
                ?,
                ?,
                ?,
                ?,
                ?
            )
            `,
            [
                invoice,
                id_member,
                id_voucher,
                total_after_voucher,
                JSON.stringify(daftar_barang)
            ]
        );

        res.status(201).json({

            message:
            "Transaksi berhasil",

            transaksi,

            diskon,

            warning_expired:
                warningExpired


        });

    }

    catch (err) {

        res.status(500).json({

            message:
            "Gagal membuat transaksi",

            error:
            err.message

        });

    }

});

router.get("/", async (req, res) => {
    try {
        const transaksi = await Transaksi.find();

        let rows = transaksi.map((t, index) => {
            const barangList = t.daftar_barang.map(b => {
                return `${b.id_barang} (${b.jumlah})`;
            }).join("<br>");

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${t._id}</td>
                    <td>${t.id_member || "-"}</td>
                    <td>${t.id_voucher || "-"}</td>
                    <td>${t.id_admin}</td>
                    <td>${t.tanggal_transaksi ? t.tanggal_transaksi.toISOString().split("T")[0] : "-"}</td>
                    <td>Rp ${Number(t.total_harga_before_voucher || 0).toLocaleString("id-ID")}</td>
                    <td>Rp ${Number(t.total_harga_after_voucher || 0).toLocaleString("id-ID")}</td>
                    <td>${barangList}</td>
                    <td>${t.metode_pembayaran}</td>
                </tr>
            `;
        }).join("");

        res.send(`
            <html>
            <head>
                <title>Data Transaksi</title>
                <style>
                    body { font-family: Arial; background: #f4f6f8; padding: 30px; }
                    .container { background: white; padding: 24px; border-radius: 12px; max-width: 1400px; margin: auto; box-shadow: 0 4px 14px rgba(0,0,0,.08); overflow-x: auto; }
                    table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 1200px; }
                    th { background: #1f2937; color: white; padding: 12px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
                    tr:hover { background: #f9fafb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Data Transaksi MarkIT</h1>
                    <p>Total transaksi: ${transaksi.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>ID Invoice</th>
                                <th>ID Member</th>
                                <th>ID Voucher</th>
                                <th>ID Admin</th>
                                <th>Tanggal</th>
                                <th>Total Sebelum Voucher</th>
                                <th>Total Setelah Voucher</th>
                                <th>Daftar Barang</th>
                                <th>Metode Bayar</th>
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
            message: "Gagal mengambil data transaksi",
            error: err.message
        });
    }
});

module.exports = router;