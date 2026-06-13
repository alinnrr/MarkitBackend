const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const ulasanSchema = new mongoose.Schema({
    _id: String,
    id_barang: String,
    rating: Number,
    komentar: String,
    tanggal_ulasan: Date
}, {
    collection: "ulasan",
    versionKey: false
});

const Ulasan = mongoose.model("Ulasan", ulasanSchema);

router.get("/", async (req, res) => {
    try {
        const ulasan = await Ulasan.find();

        let rows = ulasan.map((u, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${u._id}</td>
                <td>${u.id_barang}</td>
                <td>${u.rating}</td>
                <td>${u.komentar}</td>
                <td>${u.tanggal_ulasan ? u.tanggal_ulasan.toISOString().split("T")[0] : "-"}</td>
            </tr>
        `).join("");

        res.send(`
            <html>
            <head>
                <title>Data Ulasan</title>
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
                    <h1>Data Ulasan MarkIT</h1>
                    <p>Total ulasan: ${ulasan.length}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>ID Ulasan</th>
                                <th>ID Barang</th>
                                <th>Rating</th>
                                <th>Komentar</th>
                                <th>Tanggal</th>
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
            message: "Gagal mengambil data ulasan",
            error: err.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { _id, id_barang, rating, komentar } = req.body;

        if (!id_barang || !rating) {
            return res.status(400).json({
                message: "id_barang dan rating wajib diisi"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating harus berada di antara 1 sampai 5"
            });
        }

        const ulasan = await Ulasan.create({
            _id,
            id_barang,
            rating,
            komentar: komentar || "",
            tanggal_ulasan: new Date()
        });

        res.status(201).json({
            message: "Ulasan berhasil ditambahkan",
            data: ulasan
        });
    } catch (err) {
        res.status(500).json({
            message: "Gagal menambahkan ulasan",
            error: err.message
        });
    }
});

module.exports = router;