const mongoose = require("mongoose");

const UlasanSchema = new mongoose.Schema(
{
    _id: String,
    id_barang: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    komentar: {
        type: String,
        default: ""
    },
    tanggal_ulasan: {
        type: Date,
        default: Date.now
    }
},
{
    collection: "ulasan",
    versionKey: false
}
);

module.exports = mongoose.model("Ulasan", UlasanSchema);

