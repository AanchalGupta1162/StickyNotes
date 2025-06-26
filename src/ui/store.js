const NOTES_KEY = "stickyNotes";

export function saveNotes(notes) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function loadNotes() {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function deleteNote(index) {
    const notes = loadNotes();
    notes.splice(index, 1);
    saveNotes(notes);
    return notes;
}
