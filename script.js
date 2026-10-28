
document.addEventListener("DOMContentLoaded", () => {

    // 1. Mengambil elemen HTML
    const todoForm = document.querySelector("#todoForm");
    const taskInput = document.querySelector("#taskInput");
    const inputError = document.querySelector("#inputError");
    const todoList = document.querySelector("#todoList");
    const taskCounter = document.querySelector("#taskCounter");
    const clearCompletedBtn = document.querySelector("#clearCompletedBtn");

    // Elemen popup konfirmasi
    const deleteModal = document.querySelector("#deleteModal");
    const modalTitle = document.querySelector("#modalTitle");
    const modalMessage = document.querySelector("#modalMessage");
    const cancelDelete = document.querySelector("#cancelDelete");
    const confirmDelete = document.querySelector("#confirmDelete");

    let deleteIndex = null;
    let deleteMode = "single";

    // 2. Membaca dan menyimpan data LocalStorage
    const getTasks = () => {
        try {
            return JSON.parse(localStorage.getItem("todo_tasks")) || [];
        } catch (error) {
            return [];
        }
    };

    const saveTasks = (tasks) => {
        localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    };

    // 3. Fitur 1: Menghitung jumlah tugas
    const updateTaskCounter = (tasks) => {
        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
            task => task.completed === true
        ).length;

        const pendingTasks = totalTasks - completedTasks;

        taskCounter.textContent =
            `Total: ${totalTasks} Tugas | Selesai: ${completedTasks} | Belum Selesai: ${pendingTasks}`;

        clearCompletedBtn.disabled = completedTasks === 0;
    };

    // 4. Menampilkan daftar tugas
    const renderTasks = () => {
        const tasks = getTasks();

        todoList.innerHTML = "";

        updateTaskCounter(tasks);

        if (tasks.length === 0) {
            const emptyMessage = document.createElement("li");

            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "Belum ada tugas tersimpan.";

            todoList.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((task, index) => {
            const li = document.createElement("li");

            li.className = `todo-item ${
                task.completed ? "completed" : ""
            }`;

            const taskText = document.createElement("span");

            taskText.className = "todo-text";
            taskText.textContent = task.text;

            const actions = document.createElement("div");
            actions.className = "todo-actions";

            // Tombol Selesai
            const completeButton = document.createElement("button");

            completeButton.type = "button";
            completeButton.className = "action-btn complete-btn";
            completeButton.dataset.index = index;
            completeButton.textContent = task.completed
                ? "Batal"
                : "Selesai";

            // Tombol Hapus
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "action-btn delete-btn";
            deleteButton.dataset.index = index;
            deleteButton.textContent = "Hapus";

            actions.append(completeButton, deleteButton);
            li.append(taskText, actions);

            todoList.appendChild(li);
        });
    };

    // 5. Menambahkan tugas dengan validasi
    todoForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const taskText = taskInput.value.trim();

        if (taskText.length < 3) {
            taskInput.classList.add("error");
            inputError.style.display = "block";
            taskInput.focus();
            return;
        }

        taskInput.classList.remove("error");
        inputError.style.display = "none";

        const tasks = getTasks();

        tasks.push({
            text: taskText,
            completed: false
        });

        saveTasks(tasks);

        taskInput.value = "";

        renderTasks();
        taskInput.focus();
    });

    // Menghilangkan pesan error saat input diperbaiki
    taskInput.addEventListener("input", () => {
        if (taskInput.value.trim().length >= 3) {
            taskInput.classList.remove("error");
            inputError.style.display = "none";
        }
    });

    // 6. Menangani tombol Selesai dan Hapus
    todoList.addEventListener("click", (e) => {
        const button = e.target.closest("button[data-index]");

        if (!button) return;

        const index = Number(button.dataset.index);
        const tasks = getTasks();

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= tasks.length
        ) {
            return;
        }

        // Mengubah status tugas
        if (button.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;

            saveTasks(tasks);
            renderTasks();
        }

        // Popup konfirmasi hapus satu tugas
        else if (button.classList.contains("delete-btn")) {
            deleteIndex = index;
            deleteMode = "single";

            modalTitle.textContent = "Konfirmasi Hapus";
            modalMessage.textContent =
                "Apakah Anda yakin ingin menghapus tugas ini?";

            confirmDelete.textContent = "Ya, Hapus";
            deleteModal.classList.add("show");
        }
    });

    // 7. Fitur 2: Popup Bersihkan Tugas Selesai
    clearCompletedBtn.addEventListener("click", () => {
        const tasks = getTasks();

        const hasCompletedTasks = tasks.some(
            task => task.completed === true
        );

        if (!hasCompletedTasks) return;

        deleteMode = "completed";
        deleteIndex = null;

        modalTitle.textContent = "Konfirmasi Bersihkan Tugas";
        modalMessage.textContent =
            "Apakah kamu yakin menghapus semua tugas selesai?";

        confirmDelete.textContent = "Ya, Bersihkan";
        deleteModal.classList.add("show");
    });

    // 8. Tombol Batal pada popup
    cancelDelete.addEventListener("click", () => {
        deleteModal.classList.remove("show");
        deleteIndex = null;
    });

    // 9. Tombol konfirmasi popup
    confirmDelete.addEventListener("click", () => {
        const tasks = getTasks();

        if (deleteMode === "single" && deleteIndex !== null) {
            // Hapus satu tugas
            tasks.splice(deleteIndex, 1);
        } else if (deleteMode === "completed") {
            // Hanya hapus tugas yang sudah selesai
            const remainingTasks = tasks.filter(
                task => task.completed !== true
            );

            tasks.length = 0;
            tasks.push(...remainingTasks);
        }

        saveTasks(tasks);

        deleteModal.classList.remove("show");
        deleteIndex = null;

        renderTasks();
    });

    // 10. Menutup popup jika area luar diklik
    deleteModal.addEventListener("click", (e) => {
        if (e.target === deleteModal) {
            deleteModal.classList.remove("show");
            deleteIndex = null;
        }
    });

    // 11. Menampilkan data saat halaman dibuka
    renderTasks();

});
