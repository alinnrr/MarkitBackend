const mongoose = require("mongoose");

const TransaksiSchema = new mongoose.Schema(
{
    _id: String,
    id_member: {
        type: String,
        default: null
    },
    id_voucher: {
        type: String,
        default: null
    },
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
},
{
    collection: "transaksi",
    versionKey: false
}
);

module.exports = mongoose.model("Transaksi", TransaksiSchema);