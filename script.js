
const projectForm = document.getElementById("projectForm");
const projectTitle = document.getElementById("projectTitle");
const projectCategory = document.getElementById("projectCategory");
const projectBudget = document.getElementById("projectBudget");
const projectCompleted = document.getElementById("projectCompleted");
const searchInput = document.getElementById("searchInput");
const projectList = document.getElementById("projectList");
const emptyMessage = document.getElementById("emptyMessage");

// Data awal untuk contoh proyek
let projects = [
  {
    id: 1,
    title: "Website Portfolio",
    category: "Web App",
    budget: 1500000,
    completed: true
  },
  {
    id: 2,
    title: "Aplikasi Kasir",
    category: "Desktop App",
    budget: 2500000,
    completed: false
  },
  {
    id: 3,
    title: "Desain Aplikasi Mobile",
    category: "UI/UX Design",
    budget: 1000000,
    completed: false
  }
];

// Format angka menjadi Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

// Mencegah teks judul ditafsirkan sebagai HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// Memperbarui kartu statistik
function updateStatistics() {
  const total = projects.length;

  const completed = projects.filter(function (project) {
    return project.completed;
  }).length;

  const ongoing = projects.filter(function (project) {
    return !project.completed;
  }).length;

  const totalBudget = projects.reduce(function (sum, project) {
    return sum + project.budget;
  }, 0);

  document.getElementById("totalProjects").textContent = total;
  document.getElementById("completedProjects").textContent = completed;
  document.getElementById("ongoingProjects").textContent = ongoing;
  document.getElementById("totalBudget").textContent =
    formatRupiah(totalBudget);
}

// Menampilkan kartu proyek
function renderProjects() {
  const keyword = searchInput.value.trim().toLowerCase();

  // Pencarian berdasarkan nama proyek
  const filteredProjects = projects.filter(function (project) {
    return project.title.toLowerCase().includes(keyword);
  });

  projectList.innerHTML = filteredProjects.map(function (project) {
    const statusText = project.completed
      ? "Selesai"
      : "Dalam Pengerjaan";

    const statusClass = project.completed
      ? "status-done"
      : "status-progress";

    const buttonText = project.completed
      ? "Ubah ke Pengerjaan"
      : "Ubah Status";

    return `
      <article class="project-card">
        <div class="card-top">
          <div>
            <h3>${escapeHTML(project.title)}</h3>
            <span class="category">
              ${escapeHTML(project.category)}
            </span>
          </div>

          <span class="status ${statusClass}">
            ${statusText}
          </span>
        </div>

        <div class="budget">
          Estimasi Anggaran
          <strong>${formatRupiah(project.budget)}</strong>
        </div>

        <div class="card-actions">
          <button
            type="button"
            class="btn btn-status"
            data-action="toggle"
            data-id="${project.id}"
          >
            ${buttonText}
          </button>

          <button
            type="button"
            class="btn btn-delete"
            data-action="delete"
            data-id="${project.id}"
          >
            Hapus Proyek
          </button>
        </div>
      </article>
    `;
  }).join("");

  // Pesan jika hasil pencarian kosong
  emptyMessage.hidden = filteredProjects.length > 0;

  if (filteredProjects.length === 0) {
    emptyMessage.textContent = keyword
      ? "Proyek tidak ditemukan."
      : "Belum ada proyek. Silakan tambahkan proyek baru.";
  }

  document.getElementById("projectCount").textContent =
    `${filteredProjects.length} proyek`;

  updateStatistics();
}

// Fitur 1: Menambah proyek melalui form
projectForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = projectTitle.value.trim();
  const category = projectCategory.value;
  const budget = Number(projectBudget.value);
  const completed = projectCompleted.checked;

  // Validasi judul
  if (!title) {
    alert("Judul proyek tidak boleh kosong!");
    projectTitle.focus();
    return;
  }

  // Validasi anggaran
  if (
    projectBudget.value.trim() === "" ||
    !Number.isFinite(budget) ||
    budget <= 0
  ) {
    alert("Anggaran harus berupa angka lebih besar dari 0!");
    projectBudget.focus();
    return;
  }

  // Membuat objek proyek baru dengan ID unik
  const newProject = {
    id: Date.now(),
    title: title,
    category: category,
    budget: budget,
    completed: completed
  };

  // Menambahkan proyek ke dalam array
  projects = [...projects, newProject];

  // Reset form dan perbarui tampilan
  projectForm.reset();
  renderProjects();
});

// Fitur 2: Pencarian real-time
searchInput.addEventListener("input", function () {
  renderProjects();
});

// Fitur 3: Tombol ubah status dan hapus proyek
projectList.addEventListener("click", function (e) {
  const button = e.target.closest("button[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle") {
    projects = projects.map(function (project) {
      if (project.id === id) {
        return {
          ...project,
          completed: !project.completed
        };
      }

      return project;
    });
  }

  if (action === "delete") {
    const confirmed = confirm("Yakin ingin menghapus proyek ini?");

    if (!confirmed) return;

    projects = projects.filter(function (project) {
      return project.id !== id;
    });
  }

  // Render ulang kartu dan statistik
  renderProjects();
});

// Menampilkan data awal
renderProjects();
