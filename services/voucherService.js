const validasiVoucher = async ({
    db,
    Voucher,
    id_member,
    id_voucher,
    total_before_voucher
}) => {

    if (!id_voucher) {
        return {
            voucher: null,
            diskon: 0,
            total_after_voucher: total_before_voucher,
            keterangan: "Tidak menggunakan voucher"
        };
    }

    if (!id_member) {
        throw new Error(
            "Voucher hanya boleh digunakan oleh member"
        );
    }

    const voucher = await Voucher.findOne({
        ID_Voucher: id_voucher
    });

    if (!voucher) {
        throw new Error(
            "Voucher tidak ditemukan"
        );
    }

    if (voucher.status_voucher !== "Aktif") {
        throw new Error(
            "Voucher tidak aktif"
        );
    }

    const today = new Date();

    const mulai =
        new Date(voucher.tanggal_mulai);

    const berakhir =
        new Date(voucher.tanggal_berakhir);

    if (today < mulai) {
        throw new Error(
            "Voucher belum bisa digunakan"
        );
    }

    if (today > berakhir) {
        throw new Error(
            "Voucher sudah kadaluarsa"
        );
    }

    const [memberRows] =
    await db.promise().query(
        `
        SELECT *
        FROM member
        WHERE ID_Member = ?
        `,
        [id_member]
    );

    if (memberRows.length === 0) {
        throw new Error(
            "Member tidak ditemukan"
        );
    }

    const member = memberRows[0];

    if (voucher.kode_voucher === "NEW50") {

        if (voucher.nilai_diskon !== 50) {
            throw new Error(
                "Konfigurasi voucher welcome harus 50 persen"
            );
        }

        if (voucher.minimal_belanja !== 0) {
            throw new Error(
                "Voucher welcome tidak boleh memiliki minimal pembelian"
            );
        }

    }


    const [claimRows] =
    await db.promise().query(
        `
        SELECT *
        FROM voucher_claim
        WHERE ID_Member = ?
        AND ID_Voucher = ?
        `,
        [
            id_member,
            id_voucher
        ]
    );

    if (claimRows.length > 0) {
        throw new Error(
            "Voucher sudah pernah digunakan oleh member ini"
        );
    }

    if (
        total_before_voucher <
        voucher.minimal_belanja
    ) {
        throw new Error(
            "Minimal belanja belum terpenuhi"
        );
    }

    if (
        voucher.syarat_level !==
            "Semua Member" &&

        voucher.syarat_level !==
            "Member Baru" &&

        voucher.syarat_level !==
            member.level_member
    ) {

        throw new Error(
            "Level member tidak memenuhi syarat voucher"
        );
    }

    if (
        voucher.kode_voucher ===
        "BDAY20"
    ) {

        const lahir =
        new Date(
            member.tanggal_lahir
        );

        const isBirthday =
            lahir.getDate() ===
            today.getDate() &&

            lahir.getMonth() ===
            today.getMonth();

        if (!isBirthday) {

            throw new Error(
                "Voucher ulang tahun hanya bisa dipakai saat hari ulang tahun member"
            );

        }
    }

    const diskon =
    Math.floor(
        total_before_voucher *
        voucher.nilai_diskon /
        100
    );

    const total_after_voucher =
        total_before_voucher -
        diskon;

    return {

        voucher,

        diskon,

        total_after_voucher,

        keterangan:
            "Voucher valid"

    };
};

module.exports =
validasiVoucher;