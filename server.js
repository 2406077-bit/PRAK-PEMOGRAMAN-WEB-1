const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Koneksi MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_kampus'
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi database gagal:', err.message);
        return;
    }

    console.log('Terhubung ke database MySQL Laragon');
});

// ===============================
// GET - Tampilkan semua mahasiswa
// ===============================
app.get('/api/mahasiswa', (req, res) => {
    db.query(
        'SELECT * FROM mahasiswa ORDER BY id DESC',
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json(results);
        }
    );
});

// ===============================
// POST - Tambah mahasiswa
// ===============================
app.post('/api/mahasiswa', (req, res) => {
    const { nim, nama, jurusan, email } = req.body;

    // Validasi data kosong
    if (!nim || !nama || !jurusan || !email) {
        return res.status(400).json({
            success: false,
            message: 'Semua data wajib diisi!'
        });
    }

    // Cek NIM duplikat
    db.query(
        'SELECT * FROM mahasiswa WHERE nim = ?',
        [nim],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'NIM sudah terdaftar!'
                });
            }

            const sql = `
                INSERT INTO mahasiswa
                (nim, nama, jurusan, email)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [nim, nama, jurusan, email],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Data mahasiswa berhasil disimpan!'
                    });
                }
            );
        }
    );
});

// ===============================
// PUT - Edit mahasiswa
// ===============================
app.put('/api/mahasiswa/:id', (req, res) => {
    const { id } = req.params;
    const { nim, nama, jurusan, email } = req.body;

    if (!nim || !nama || !jurusan || !email) {
        return res.status(400).json({
            success: false,
            message: 'Semua data wajib diisi!'
        });
    }

    // Cek NIM dipakai mahasiswa lain
    db.query(
        'SELECT * FROM mahasiswa WHERE nim = ? AND id != ?',
        [nim, id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'NIM sudah digunakan mahasiswa lain!'
                });
            }

            const sql = `
                UPDATE mahasiswa
                SET nim = ?, nama = ?, jurusan = ?, email = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [nim, nama, jurusan, email, id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: err.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Data mahasiswa berhasil diperbarui!'
                    });
                }
            );
        }
    );
});

// ===============================
// DELETE - Hapus mahasiswa
// ===============================
app.delete('/api/mahasiswa/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM mahasiswa WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: 'Data mahasiswa berhasil dihapus!'
            });
        }
    );
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server CRUD aktif di http://localhost:${PORT}`);
});