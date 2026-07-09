// ==========================================
// NOTES INTERFACE SECTION
// This file controls the dashboard, editor,
// CRUD actions and PDF export for Noty.
// ==========================================

const notesList = document.querySelector("#notesList");
const noteTitle = document.querySelector("#noteTitle");
const noteEditor = document.querySelector("#noteEditor");
const messageElement = document.querySelector("#message");
const newNoteButton = document.querySelector("#newNoteButton");
const saveNoteButton = document.querySelector("#saveNoteButton");
const deleteNoteButton = document.querySelector("#deleteNoteButton");
const exportPdfButton = document.querySelector("#exportPdfButton");
const logoutButton = document.querySelector("#logoutButton");
const toolbar = document.querySelector(".toolbar");
const searchNotesInput = document.querySelector("#searchNotes");

let notes = [];
let selectedNoteId = null;
let searchTerm = "";

const FAVORITES_KEY = "noty_favorite_notes";

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function isFavorite(noteId) {
  return getFavoriteIds().includes(noteId);
}

function toggleFavorite(noteId) {
  const favorites = getFavoriteIds();
  const index = favorites.indexOf(noteId);

  if (index === -1) {
    favorites.push(noteId);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderNotesList();
}

function getNotePreview(content) {
  const container = document.createElement("div");
  container.innerHTML = content || "";
  const text = container.textContent || container.innerText || "";
  const trimmed = text.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90)}...` : trimmed;
}

function getVisibleNotes() {
  const favorites = getFavoriteIds();
  const term = searchTerm.trim().toLowerCase();

  const filtered = term
    ? notes.filter((note) => note.title.toLowerCase().includes(term)
        || getNotePreview(note.content).toLowerCase().includes(term))
    : notes;

  return [...filtered].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    return bFav - aFav;
  });
}

window.NotyNotes = {
  saveNote: () => saveNote(),
  deleteNote: () => deleteNote(),
  exportNoteToPdf: () => exportNoteToPdf()
};

function showMessage(text, type = "info") {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}

function protectDashboard() {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function setEditor(note) {
  selectedNoteId = note ? note.id : null;
  noteTitle.value = note ? note.title : "";
  noteEditor.innerHTML = note ? note.content : "<p>Escribe tu nota aqui...</p>";
  renderNotesList();
}

function renderNotesList() {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    notesList.innerHTML = '<p class="empty-state">No hay notas todavia.</p>';
    return;
  }

  const visibleNotes = getVisibleNotes();

  if (visibleNotes.length === 0) {
    notesList.innerHTML = '<p class="empty-state">No se encontraron notas.</p>';
    return;
  }

  visibleNotes.forEach((note) => {
    const button = document.createElement("button");
    button.className = note.id === selectedNoteId ? "note-item active" : "note-item";
    button.type = "button";

    const header = document.createElement("div");
    header.className = "note-item-header";

    const title = document.createElement("strong");
    title.textContent = note.title;

    const favoriteButton = document.createElement("span");
    favoriteButton.className = isFavorite(note.id) ? "favorite-star active" : "favorite-star";
    favoriteButton.textContent = "⭐";
    favoriteButton.title = "Marcar como favorita";
    favoriteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavorite(note.id);
    });

    header.append(title, favoriteButton);

    const preview = document.createElement("p");
    preview.className = "note-preview";
    preview.textContent = getNotePreview(note.content) || "Sin contenido todavia.";

    const date = document.createElement("span");
    date.className = "note-date";
    date.textContent = new Date(note.updated_at).toLocaleString();

    button.append(header, preview, date);
    button.addEventListener("click", () => setEditor(note));
    notesList.appendChild(button);
  });
}

async function loadNotes() {
  try {
    notes = await apiRequest("/notes");
    setEditor(notes[0] || null);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function saveNote() {
  showMessage("Guardando nota...");

  const title = noteTitle.value.trim();
  const content = noteEditor.innerHTML.trim();

  if (!title || !content) {
    showMessage("El titulo y el contenido son obligatorios.", "error");
    return;
  }

  try {
    if (selectedNoteId) {
      await apiRequest(`/notes/${selectedNoteId}`, {
        method: "PUT",
        body: JSON.stringify({ title, content })
      });
      showMessage("Nota actualizada correctamente.", "success");
    } else {
      const data = await apiRequest("/notes", {
        method: "POST",
        body: JSON.stringify({ title, content })
      });
      selectedNoteId = data.note.id;
      showMessage("Nota creada correctamente.", "success");
    }

    await loadNotes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteNote() {
  if (!selectedNoteId) {
    showMessage("Selecciona una nota antes de eliminar.", "error");
    return;
  }

  const confirmed = window.confirm("Quieres eliminar esta nota?");

  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/notes/${selectedNoteId}`, {
      method: "DELETE"
    });
    showMessage("Nota eliminada correctamente.", "success");
    await loadNotes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function applyFormat(command, value = null) {
  document.execCommand(command, false, value);
  noteEditor.focus();
}

// ==========================================
// PDF EXPORT SECTION
// This function converts the selected note
// into a downloadable PDF file.
// ==========================================

function exportNoteToPdf() {
  if (!noteTitle.value.trim()) {
    showMessage("Escribe un titulo antes de exportar.", "error");
    return;
  }

  const pdfContent = document.createElement("article");
  pdfContent.className = "pdf-note";

  const title = document.createElement("h1");
  title.textContent = noteTitle.value;

  const content = document.createElement("div");
  content.innerHTML = noteEditor.innerHTML;

  pdfContent.append(title, content);

  if (typeof html2pdf !== "function") {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showMessage("El navegador bloqueo la ventana de impresion.", "error");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${noteTitle.value}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 32px; }
        </style>
      </head>
      <body>${pdfContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showMessage("Usa Guardar como PDF en la ventana de impresion.", "success");
    return;
  }

  html2pdf()
    .set({
      margin: 12,
      filename: `${noteTitle.value.trim() || "noty-note"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    })
    .from(pdfContent)
    .save()
    .then(() => showMessage("PDF exportado correctamente.", "success"))
    .catch(() => showMessage("No se pudo exportar el PDF.", "error"));
}

toolbar.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  applyFormat(button.dataset.command, button.dataset.value || null);
});

searchNotesInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderNotesList();
});

newNoteButton.addEventListener("click", () => setEditor(null));

logoutButton.addEventListener("click", () => {
  removeToken();
  window.location.href = "login.html";
});

if (protectDashboard()) {
  showMessage("Editor listo.", "success");
  loadNotes();
}
