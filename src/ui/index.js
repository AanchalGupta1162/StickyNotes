import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

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

    // Tab switching logic
    const tabViewBtn = document.getElementById("tab-view");
    const tabCreateBtn = document.getElementById("tab-create");
    const tabContentView = document.getElementById("tab-content-view");
    const tabContentCreate = document.getElementById("tab-content-create");
    const notesList = document.getElementById("notesList");

    let selectedNoteId = null;

    async function switchTab(tab) {
        if (tab === "view") {
            tabViewBtn.classList.add("active");
            tabCreateBtn.classList.remove("active");
            tabContentView.style.display = "block";
            tabContentCreate.style.display = "none";
            await renderNotesList(); // Refresh notes list when switching to view tab
        } else {
            tabViewBtn.classList.remove("active");
            tabCreateBtn.classList.add("active");
            tabContentView.style.display = "none";
            tabContentCreate.style.display = "block";
        }
    }

    tabViewBtn.addEventListener("click", () => switchTab("view"));
    tabCreateBtn.addEventListener("click", () => switchTab("create"));

    // Instead of local notes, always fetch from backend
    async function renderNotesList() {
        const notes = await sandboxProxy.getAllNotes();
        // If selectedNoteId is no longer present, clear selection
        if (!notes.some(note => note.id === selectedNoteId)) {
            selectedNoteId = null;
        }
        if (!notes || notes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div>No notes created yet.</div>
                    <div style="font-size: 12px; margin-top: 8px;">Create your first sticky note!</div>
                </div>
            `;
            updateControlButtons();
            return;
        }
        notesList.innerHTML = notes.map((note, idx) => `
            <div class="note-card${note.id === selectedNoteId ? ' selected' : ''}" style="background:${note.meta.color};" data-id="${note.id}">
                <div class="note-content">${note.meta.text.replace(/\n/g, '<br>')}</div>
                <div class="note-metadata">
                    <span>${note.meta.width}×${note.meta.height}px</span>
                    <div class="note-actions">
                        <button data-id="${note.id}" class="hide-note-btn${note.isHidden ? ' hidden' : ''}" title="${note.isHidden ? 'Show' : 'Hide'}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                                ${note.isHidden ? '<line x1="1" y1="1" x2="23" y2="23"></line>' : ''}
                            </svg>
                        </button>
                        <button data-id="${note.id}" class="delete-note-btn" title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
        // Add per-note hide/show handlers
        Array.from(notesList.querySelectorAll('.hide-note-btn')).forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const noteId = btn.getAttribute('data-id');
                await sandboxProxy.toggleNoteVisibilityById(noteId);
                await renderNotesList();
            });
        });
        // Add per-note delete handlers
        Array.from(notesList.querySelectorAll('.delete-note-btn')).forEach(btn => {
            btn.addEventListener('click', async e => {
                e.stopPropagation();
                const noteId = btn.getAttribute('data-id');
                await sandboxProxy.deleteNoteById(noteId);
                if (selectedNoteId === noteId) selectedNoteId = null;
                await renderNotesList();
            });
        });
        // Add click handler to note cards for selection
        Array.from(notesList.querySelectorAll('.note-card')).forEach(card => {
            card.addEventListener('click', async e => {
                const noteId = card.getAttribute('data-id');
                selectedNoteId = noteId;
                await sandboxProxy.selectNoteById(noteId);
                updateControlButtons();
                await renderNotesList();
            });
        });
        updateControlButtons();
    }

    function updateControlButtons() {
        const hasSelection = !!selectedNoteId;
        hideShowNoteButton.disabled = !hasSelection;
        deleteNoteButton.disabled = !hasSelection;
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
        selectedNoteId = null;
        renderNotesList();
        switchTab("view");
    });
    createStickyNoteButton.disabled = false;
    
    // Hide/Show note functionality
    hideShowNoteButton.addEventListener("click", async event => {
        if (selectedNoteId) {
            await sandboxProxy.toggleNoteVisibilityById(selectedNoteId);
            // After toggling, check if note still exists and update selection
            const notes = await sandboxProxy.getAllNotes();
            if (!notes.some(note => note.id === selectedNoteId)) {
                selectedNoteId = null;
            }
            await renderNotesList();
        }
    });
    hideShowNoteButton.disabled = false;
    
    // Delete note functionality
    deleteNoteButton.addEventListener("click", async event => {
        if (selectedNoteId) {
            await sandboxProxy.deleteNoteById(selectedNoteId);
            selectedNoteId = null;
            await renderNotesList();
        }
    });
    deleteNoteButton.disabled = false;
    
    // Initial render and default tab
    switchTab("create");
    renderNotesList();
});
