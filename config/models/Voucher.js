const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema(
{
    ID_Voucher: String,
    ID_Admin: String,
    kode_voucher: String,
    nama_voucher: String,
    jenis_voucher: String,
    nilai_diskon: String,
    minimal_belanja: Number,
    tanggal_mulai: Date,
    tanggal_berakhir: Date,
    syarat_level: String,
    status_voucher: String
},
{
    collection: "voucher"
}
);

module.exports =
    mongoose.models.Voucher ||
    mongoose.model(
        "Voucher",
        VoucherSchema
    );