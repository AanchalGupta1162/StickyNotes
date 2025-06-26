import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {};
    
    // Store references to created notes for hide/show/delete functionality
    let currentNote = null;
    let isNoteHidden = false;
    sandboxApi.createStickyNote = function(options) {
        console.log("[Sandbox] createStickyNote called", options);
        options = options || {};
        const colorHex = options.colorHex || "#fff99a";
        const width = options.width || 240;
        const height = options.height || 180;

        // Parse text for checkboxes and bullets
        function parseNoteText(raw) {
            return raw
                .split('\n')
                .map(line => {
                    if (/^-\s?/.test(line)) return '\u2022 ' + line.replace(/^-\s?/, ''); // •
                    return line;
                })
                .join('\n');
        }
        const textContent = parseNoteText(options.text || "Edit me!");
        // Convert hex color to {red, green, blue, alpha}
        function hexToRgbA(hex) {
            let c = hex.substring(1);
            if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            const num = parseInt(c, 16);
            return {
                red: ((num >> 16) & 255) / 255,
                green: ((num >> 8) & 255) / 255,
                blue: (num & 255) / 255,
                alpha: 1
            };
        }
        const color = hexToRgbA(colorHex);

        // Create the rectangle background for the sticky note
        const rect = editor.createRectangle();
        rect.width = width;
        rect.height = height;
        rect.translation = { x: 10, y: 10 };
        const rectFill = editor.makeColorFill(color);
        rect.fill = rectFill;

        // Create the text object for the sticky note
        const text = editor.createText(textContent);
        // Font customization
        const fontSize = options.fontSize || 12;
        // Convert hex color to {red, green, blue, alpha}
        function hexToRgbA(hex) {
            let c = hex.substring(1);
            if (c.length === 3) c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
            const num = parseInt(c, 16);
            return {
                red: ((num >> 16) & 255) / 255,
                green: ((num >> 8) & 255) / 255,
                blue: (num & 255) / 255,
                alpha: 1
            };
        }
        const fontColor = options.fontColor ? hexToRgbA(options.fontColor) : { red: 0, green: 0, blue: 0, alpha: 1 };
        const fontFamily = options.fontFamily || "Arial";
        text.fullContent.applyCharacterStyles({
            color: fontColor,
            fontSize: fontSize,
            fontFamily: fontFamily
        });
        
        // Set text bounds to fit within the rectangle with padding
        const padding = 15;
        text.areaBox = {
            width: width - (padding * 2),
            height: height - (padding * 2)
        };
        
        // Position text inside the rectangle with padding
        text.translation = { x: rect.translation.x + padding, y: rect.translation.y + padding };

        // Group rectangle and text if possible
        const group = editor.createGroup();
        group.translation = { x: 10, y: 10 }; // Align group to the same position as the rectangle
        group.children.append(rect,text);
        editor.context.insertionParent.children.append(group);
        
        // Store reference to the current note
        currentNote = group;
        isNoteHidden = false;
        // Add to the document
        // const insertionParent = editor.context.insertionParent;
        // if (group) {
        //     insertionParent.children.append(group);
        // } else {
        //     insertionParent.children.append(rect);
        //     insertionParent.children.append(text);
        // }
        // Add to the document
        // const insertionParent = editor.context.insertionParent;
        // insertionParent.children.append(rect);
        // insertionParent.children.append(text);
    };
    
    // Toggle note visibility using opacity
    sandboxApi.toggleNoteVisibility = function() {
        console.log("[Sandbox] toggleNoteVisibility called");
        if (!currentNote) {
            console.log("No note to hide/show");
            return;
        }
        
        if (isNoteHidden) {
            // Show the note
            currentNote.opacity = 1;
            isNoteHidden = false;
            console.log("Note shown");
        } else {
            // Hide the note
            currentNote.opacity = 0.5; // Very transparent but still selectable
            isNoteHidden = true;
            console.log("Note hidden");
        }
    };
    
    // Delete the selected note
    sandboxApi.deleteSelectedNote = function() {
        console.log("[Sandbox] deleteSelectedNote called");
        if (!currentNote) {
            console.log("No note to delete");
            return;
        }
        
        try {
            // Remove the note from the document
            currentNote.removeFromParent();
            currentNote = null;
            isNoteHidden = false;
            console.log("Note deleted");
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi, "documentSandbox");
}

start();
