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
    const noteColorInput = document.getElementById("noteColor");
    const noteWidthInput = document.getElementById("noteWidth");
    const noteHeightInput = document.getElementById("noteHeight");
    const noteTextInput = document.getElementById("noteText");
    const notePreview = document.getElementById("notePreview");

    // Live preview logic
    function renderPreview(text) {
        // Convert - to bullet, [ ] to checkbox, [x] to checked checkbox
        let html = text
            .replace(/\n/g, '<br>')
            .replace(/^- (.*)$/gm, '<span style="display:inline-block;width:1em;">•</span> $1')
            .replace(/\[ \] (.*)$/gm, '<input type="checkbox" disabled> $1')
            .replace(/\[x\] (.*)$/gim, '<input type="checkbox" checked disabled> $1');
        notePreview.innerHTML = html;
    }
    noteTextInput.addEventListener("input", e => renderPreview(noteTextInput.value));
    renderPreview(noteTextInput.value);

    createStickyNoteButton.addEventListener("click", async event => {
        // Get color, size, and text values
        const colorHex = noteColorInput.value;
        const width = parseInt(noteWidthInput.value, 10);
        const height = parseInt(noteHeightInput.value, 10);
        const text = noteTextInput.value;
        await sandboxProxy.createStickyNote({ colorHex, width, height, text });
    });
    createStickyNoteButton.disabled = false;
});
