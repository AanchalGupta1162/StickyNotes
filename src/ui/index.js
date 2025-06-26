import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import { saveNotes, loadNotes, deleteNote } from "./store.js";

addOnUISdk.ready.then(async () => {
    console.log("addOnUISdk is ready for use.");

    // Get the UI runtime.
    const { runtime } = addOnUISdk.instance;

    // Get the proxy object, which is required
    // to call the APIs defined in the Document Sandbox runtime
    // i.e., in the `code.js` file of this add-on.
    const sandboxProxy = await runtime.apiProxy("documentSandbox");

    const createStickyNoteButton = document.getElementById("createStickyNote");
    const hideShowNoteButton = document.getElementById("hideShowNote");
    const deleteNoteButton = document.getElementById("deleteNote");
    const noteColorInput = document.getElementById("noteColor");
    const noteWidthInput = document.getElementById("noteWidth");
    const noteHeightInput = document.getElementById("noteHeight");
    const noteTextInput = document.getElementById("noteText");
    const fontSizeInput = document.getElementById("fontSize");
    const fontColorInput = document.getElementById("fontColor");
    const fontFamilyInput = document.getElementById("fontFamily");

    // Tab switching logic and notes storage
    const tabViewBtn = document.getElementById("tab-view");
    const tabCreateBtn = document.getElementById("tab-create");
    const tabContentView = document.getElementById("tab-content-view");
    const tabContentCreate = document.getElementById("tab-content-create");
    const notesList = document.getElementById("notesList");

    let notes = loadNotes();

    function switchTab(tab) {
        if (tab === "view") {
            tabViewBtn.classList.add("active");
            tabCreateBtn.classList.remove("active");
            tabContentView.style.display = "block";
            tabContentCreate.style.display = "none";
        } else {
            tabViewBtn.classList.remove("active");
            tabCreateBtn.classList.add("active");
            tabContentView.style.display = "none";
            tabContentCreate.style.display = "block";
        }
    }

    tabViewBtn.addEventListener("click", () => switchTab("view"));
    tabCreateBtn.addEventListener("click", () => switchTab("create"));

    function renderNotesList() {
        if (notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div>No notes created yet.</div>
                    <div style="font-size: 12px; margin-top: 8px;">Create your first sticky note!</div>
                </div>
            `;
            return;
        }
        notesList.innerHTML = notes.map((note, idx) => `
            <div class="note-card" style="background:${note.colorHex};" data-idx="${idx}">
                <div class="note-content">${note.textHtml}</div>
                <div class="note-metadata">
                    <span>${note.width}×${note.height}px</span>
                </div>
                <button data-idx="${idx}" class="delete-note-btn">&times;</button>
            </div>
        `).join("");
        // Add delete handlers
        Array.from(notesList.querySelectorAll('.delete-note-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                notes = deleteNote(idx);
                renderNotesList();
            });
        });
        // Add click handler to note cards
        Array.from(notesList.querySelectorAll('.note-card')).forEach(card => {
            card.addEventListener('click', async e => {
                const idx = parseInt(card.getAttribute('data-idx'), 10);
                const note = notes[idx];
                if (note) {
                    await sandboxProxy.createStickyNote({
                        colorHex: note.colorHex,
                        width: note.width,
                        height: note.height,
                        text: note.textHtml.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '')
                    });
                }
            });
        });
    }

    createStickyNoteButton.addEventListener("click", async event => {
        // Get color, size, text, and font options
        const colorHex = noteColorInput.value;
        const width = parseInt(noteWidthInput.value, 10);
        const height = parseInt(noteHeightInput.value, 10);
        const text = noteTextInput.value;
        const fontSize = parseInt(fontSizeInput.value, 10);
        const fontColor = fontColorInput.value;
        const fontFamily = fontFamilyInput.value;
        await sandboxProxy.createStickyNote({ colorHex, width, height, text, fontSize, fontColor, fontFamily });
        // Add to notes list and switch to view tab
        notes.push({
            colorHex,
            width,
            height,
            textHtml: text
                .replace(/\n/g, '<br>')
                .replace(/^- (.*)$/gm, '<span style="display:inline-block;width:1em;">•</span> $1')
        });
        saveNotes(notes);
        renderNotesList();
        switchTab("view");
    });
    createStickyNoteButton.disabled = false;
    
    // Hide/Show note functionality
    hideShowNoteButton.addEventListener("click", async event => {
        await sandboxProxy.toggleNoteVisibility();
    });
    hideShowNoteButton.disabled = false;
    
    // Delete note functionality
    deleteNoteButton.addEventListener("click", async event => {
        await sandboxProxy.deleteSelectedNote();
    });
    deleteNoteButton.disabled = false;
    
    renderNotesList();
});
