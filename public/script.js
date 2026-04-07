  const contactForm = document.getElementById("contactForm");
  const contactId = document.getElementById("contactId");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const cancelBtn = document.getElementById("cancelBtn");

  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const limitSelect = document.getElementById("limitSelect");

  const contactTableBody = document.getElementById("contactTableBody");
  const alertBox = document.getElementById("alertBox");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");

  let currentPage = 1;
  let totalPages = 1;

  function showAlert(message, type = "success") {
    alertBox.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadContacts() {
    contactTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center">Loading...</td>
      </tr>
    `;

    try {
      const search = encodeURIComponent(searchInput.value.trim());
      const sort = sortSelect.value;
      const limit = limitSelect.value;

      const res = await fetch(
        `/api/contacts?search=${search}&sort=${sort}&page=${currentPage}&limit=${limit}`
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load contacts.");
      }

      const contacts = result.data || [];
      totalPages = result.pagination?.totalPages || 1;
      currentPage = result.pagination?.page || 1;

      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;

      if (contacts.length === 0) {
        contactTableBody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No contacts found.</td>
          </tr>
        `;
        return;
      }

      contactTableBody.innerHTML = contacts.map(contact => `
        <tr>
          <td>${escapeHtml(contact.name)}</td>
          <td>${escapeHtml(contact.phone)}</td>
          <td>${escapeHtml(contact.email)}</td>
          <td>
            <button
              class="btn btn-sm btn-success me-2 edit-btn"
              data-id="${contact.id}"
              data-name="${escapeHtml(contact.name)}"
              data-phone="${escapeHtml(contact.phone)}"
              data-email="${escapeHtml(contact.email)}"
            >
              Edit
            </button>
            <button
              class="btn btn-sm btn-danger delete-btn"
              data-id="${contact.id}"
            >
              Delete
            </button>
          </td>
        </tr>
      `).join("");
    } catch (error) {
      contactTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">Failed to load contacts.</td>
        </tr>
      `;
      showAlert(error.message, "danger");
    }
  }

  function startEdit(id, name, phone, email) {
    contactId.value = id;
    nameInput.value = name;
    phoneInput.value = phone;
    emailInput.value = email;
    cancelBtn.classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    contactForm.reset();
    contactId.value = "";
    cancelBtn.classList.add("d-none");
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim()
      };

      const isEditing = !!contactId.value;
      const url = isEditing ? `/api/contacts/${contactId.value}` : "/api/contacts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed.");
      }

      showAlert(data.message, "success");
      resetForm();
      currentPage = 1;
      await loadContacts();
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });

  cancelBtn.addEventListener("click", resetForm);

  contactTableBody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      startEdit(
        editBtn.dataset.id,
        editBtn.dataset.name,
        editBtn.dataset.phone,
        editBtn.dataset.email
      );
      return;
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const ok = confirm("Are you sure you want to delete this contact?");
      if (!ok) return;

      try {
        const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Delete failed.");
        }

        showAlert(data.message, "success");
        await loadContacts();
      } catch (error) {
        showAlert(error.message, "danger");
      }
    }
  });

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    loadContacts();
  });

  sortSelect.addEventListener("change", () => {
    currentPage = 1;
    loadContacts();
  });

  limitSelect.addEventListener("change", () => {
    currentPage = 1;
    loadContacts();
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadContacts();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadContacts();
    }
  });

  loadContacts();