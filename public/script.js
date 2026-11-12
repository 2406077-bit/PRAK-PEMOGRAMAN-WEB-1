document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // ELEMENT DOM
    // ===============================

    const mhsForm = document.getElementById('mhsForm');
    const mhsIdInput = document.getElementById('mhsId');

    const nimInput = document.getElementById('nim');
    const namaInput = document.getElementById('nama');
    const jurusanInput = document.getElementById('jurusan');
    const emailInput = document.getElementById('email');

    const btnSubmit = document.getElementById('btnSubmit');
    const btnCancel = document.getElementById('btnCancel');

    const formTitle = document.getElementById('formTitle');

    const mhsTableBody = document.getElementById('mhsTableBody');

    const alertMessage = document.getElementById('alertMessage');

    const searchInput = document.getElementById('searchInput');

    const totalMahasiswa =
        document.getElementById('totalMahasiswa');


    // ===============================
    // ARRAY DATA
    // ===============================

    let listMahasiswa = [];


    // ===============================
    // ALERT
    // ===============================

    function showAlert(message, type = 'success') {

        alertMessage.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;

        setTimeout(() => {
            alertMessage.innerHTML = '';
        }, 3000);
    }


    // ===============================
    // LOAD DATA
    // ===============================

    async function loadMahasiswa() {

        try {

            const response =
                await fetch('/api/mahasiswa');

            const data = await response.json();

            listMahasiswa = data;

            renderTable();

        } catch (error) {

            console.error(error);

            showAlert(
                'Gagal mengambil data mahasiswa!',
                'error'
            );

        }
    }


    // ===============================
    // RENDER TABLE
    // ===============================

    function renderTable(data = listMahasiswa) {

        mhsTableBody.innerHTML = '';

        // Total seluruh mahasiswa
        totalMahasiswa.textContent =
            listMahasiswa.length;


        if (data.length === 0) {

            mhsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Data mahasiswa tidak ditemukan
                    </td>
                </tr>
            `;

            return;
        }


        data.forEach((mhs, index) => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>${mhs.nim}</td>

                <td>${mhs.nama}</td>

                <td>${mhs.jurusan}</td>

                <td>${mhs.email}</td>

                <td>

                    <button
                        class="btn-action btn-edit"
                        data-id="${mhs.id}">
                        Edit
                    </button>

                    <button
                        class="btn-action btn-delete"
                        data-id="${mhs.id}">
                        Hapus
                    </button>

                </td>
            `;

            mhsTableBody.appendChild(row);

        });

    }


    // ===============================
    // SEARCH REALTIME
    // ===============================

    searchInput.addEventListener(
        'input',
        function () {

            const keyword =
                this.value.toLowerCase().trim();


            const hasilPencarian =
                listMahasiswa.filter(mhs => {

                    const nim =
                        mhs.nim.toLowerCase();

                    const nama =
                        mhs.nama.toLowerCase();

                    return (
                        nim.includes(keyword) ||
                        nama.includes(keyword)
                    );

                });


            renderTable(hasilPencarian);

        }
    );


    // ===============================
    // SUBMIT FORM
    // ===============================

    mhsForm.addEventListener(
        'submit',
        async function (e) {

            e.preventDefault();


            const id =
                mhsIdInput.value;

            const nim =
                nimInput.value.trim();

            const nama =
                namaInput.value.trim();

            const jurusan =
                jurusanInput.value;

            const email =
                emailInput.value.trim();


            // Validasi
            if (
                !nim ||
                !nama ||
                !jurusan ||
                !email
            ) {

                showAlert(
                    'Semua data wajib diisi!',
                    'error'
                );

                return;
            }


            // ===============================
            // CEK NIM DUPLIKAT
            // ===============================

            const nimDuplikat =
                listMahasiswa.some(mhs => {

                    return (
                        mhs.nim === nim &&
                        String(mhs.id) !== String(id)
                    );

                });


            if (nimDuplikat) {

                showAlert(
                    'NIM sudah terdaftar!',
                    'error'
                );

                return;
            }


            const data = {
                nim,
                nama,
                jurusan,
                email
            };


            try {

                let response;


                // ===============================
                // EDIT
                // ===============================

                if (id) {

                    response =
                        await fetch(
                            `/api/mahasiswa/${id}`,
                            {
                                method: 'PUT',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );

                }

                // ===============================
                // TAMBAH
                // ===============================

                else {

                    response =
                        await fetch(
                            '/api/mahasiswa',
                            {
                                method: 'POST',

                                headers: {
                                    'Content-Type':
                                        'application/json'
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );

                }


                const result =
                    await response.json();


                if (!response.ok) {

                    showAlert(
                        result.message ||
                        'Terjadi kesalahan!',
                        'error'
                    );

                    return;
                }


                showAlert(
                    result.message,
                    'success'
                );


                resetForm();

                await loadMahasiswa();

            } catch (error) {

                console.error(error);

                showAlert(
                    'Server tidak dapat dihubungi!',
                    'error'
                );

            }

        }
    );


    // ===============================
    // EDIT & DELETE
    // ===============================

    mhsTableBody.addEventListener(
        'click',
        async function (e) {

            const id =
                e.target.dataset.id;


            // ===============================
            // EDIT
            // ===============================

            if (
                e.target.classList.contains(
                    'btn-edit'
                )
            ) {

                const mahasiswa =
                    listMahasiswa.find(
                        mhs =>
                            String(mhs.id) ===
                            String(id)
                    );


                if (!mahasiswa) {
                    return;
                }


                mhsIdInput.value =
                    mahasiswa.id;

                nimInput.value =
                    mahasiswa.nim;

                namaInput.value =
                    mahasiswa.nama;

                jurusanInput.value =
                    mahasiswa.jurusan;

                emailInput.value =
                    mahasiswa.email;


                formTitle.textContent =
                    'Edit Data Mahasiswa';

                btnSubmit.textContent =
                    'Update Data';

                btnCancel.style.display =
                    'inline-block';


                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

            }


            // ===============================
            // DELETE
            // ===============================

            if (
                e.target.classList.contains(
                    'btn-delete'
                )
            ) {

                const yakin =
                    confirm(
                        'Apakah Anda yakin ingin menghapus data mahasiswa ini?'
                    );


                if (!yakin) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `/api/mahasiswa/${id}`,
                            {
                                method: 'DELETE'
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        showAlert(
                            result.message ||
                            'Gagal menghapus data!',
                            'error'
                        );

                        return;
                    }


                    showAlert(
                        result.message,
                        'success'
                    );


                    await loadMahasiswa();

                } catch (error) {

                    console.error(error);

                    showAlert(
                        'Server tidak dapat dihubungi!',
                        'error'
                    );

                }

            }

        }
    );


    // ===============================
    // BATAL EDIT
    // ===============================

    btnCancel.addEventListener(
        'click',
        resetForm
    );


    // ===============================
    // RESET FORM
    // ===============================

    function resetForm() {

        mhsForm.reset();

        mhsIdInput.value = '';

        formTitle.textContent =
            'Tambah Data Mahasiswa';

        btnSubmit.textContent =
            'Simpan Data';

        btnCancel.style.display =
            'none';

    }


    // ===============================
    // LOAD AWAL
    // ===============================

    loadMahasiswa();

});