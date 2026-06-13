const express = require("express");
const router = express.Router();
const db = require("../config/mysql");

router.get("/", (req, res) => {

    const sql = `
        SELECT
            b.ID_Barang,
            b.nama_barang,
            b.harga_barang,
            b.stok,
            k.nama_kategori,
            a.username
        FROM barang b
        JOIN kategori k
            ON b.ID_Kategori = k.ID_Kategori
        JOIN admin a
            ON b.ID_Admin = a.ID_Admin
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

module.exports = router;