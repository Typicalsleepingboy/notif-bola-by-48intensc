const axios = require('axios');
const moment = require('moment');
const { parse } = require('node-html-parser');

async function scrapeJadwal() {
    try {
        const url = 'https://www.goal.com/id/berita/jadwal-siaran-langsung-sepakbola/1qomojcjyge9n1nr2voxutdc1n';
        const { data } = await axios.get(url);
        const root = parse(data);

        const tanggalElements = root.querySelectorAll('h3 strong');
        const rows = root.querySelectorAll('table tbody tr');

        let jadwal = [];
        let tanggalTerdekat = null;
        let tanggalTerdekatDiff = Infinity;

        // Temukan tanggal terdekat
        tanggalElements.forEach((element) => {
            const tanggal = element.text.trim();
            const tanggalMoment = moment(tanggal, 'DD MMMM YYYY');

            const tanggalDiff = Math.abs(tanggalMoment.diff(moment(), 'days'));

            if (tanggalDiff < tanggalTerdekatDiff) {
                tanggalTerdekat = tanggalMoment;
                tanggalTerdekatDiff = tanggalDiff;
            }
        });

        // Filter jadwal berdasarkan tanggal terdekat
        rows.forEach((element) => {
            const cells = element.querySelectorAll('td');
            if (cells.length >= 4) {
                const time = cells[0].text.trim();
                const match = cells[1].text.trim();
                const competition = cells[2].text.trim();
                const tvStation = cells[3].text.trim();

                // Cek apakah pertandingan terjadi pada tanggal terdekat
                const matchDate = moment(tanggalTerdekat).format('DD MMMM YYYY');

                if (tanggalTerdekat && matchDate === tanggalTerdekat.format('DD MMMM YYYY')) {
                    jadwal.push({
                        time,
                        match,
                        competition,
                        tvStation
                    });
                }
            }
        });

        // Urutkan jadwal berdasarkan waktu
        jadwal.sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')));

        return {
            status: 200,
            message: 'Berhasil mengambil jadwal',
            data: {
                date: tanggalTerdekat.format('DD MMMM YYYY'),
                schedule: jadwal
            }
        };
    } catch (error) {
        console.error('Error fetching schedule:', error.message);
        return {
            status: 500,
            message: 'Gagal mengambil jadwal',
            error: error.message
        };
    }
}

module.exports = {
    scrapeJadwal
};
