import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {};

    // Create a sticky note
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
        
        // Group rectangle and text if possible
        const group = editor.createGroup();
        group.translation = { x: 10, y: 10 }; // Align group to the same position as the rectangle
        group.children.append(rect);

        // Create the text object for the sticky note
        const text = editor.createText(textContent);
        group.children.append(text);

        // Apply auto-height layout
        text.layout = {
            type: 2, // Set layout type to autoHeight
            width: width - 20 // Specify a width for the text node
        };

        text.setPositionInParent(
            { x: 20, y: 20 },
            { x: 0, y: 0 } // Use a consistent reference point
        );
        text.textAlignment = 1; // Center alignment
        console.log(text.layout);
        // Font customization
        const fontSize = options.fontSize || 20; // Increased default font size from 12 to 16
        const fontColor = options.fontColor ? hexToRgbA(options.fontColor) : { red: 0, green: 0, blue: 0, alpha: 1 };
        text.fullContent.applyCharacterStyles({
            color: fontColor,
            fontSize: fontSize
        });
        
        // text.resizeToFitWithin(width, height);
        editor.context.insertionParent.children.append(group);
        
        // Store reference to the current note
        const noteId = rect.id.toString();
        const meta = {
            id: noteId,
            color: colorHex,
            width,
            height,
            text: options.text,
            fontSize,
            fontColor: options.fontColor
        };
        group.addOnData.setItem("noteId", noteId);
        group.addOnData.setItem("meta", JSON.stringify(meta));
        
    };
    
    // Get all notes (groups with noteId in addOnData)
    sandboxApi.getAllNotes = function() {
        const notes = [];
        const allNodes = editor.context.insertionParent.children;
        for (const node of allNodes) {
            if (node.addOnData && node.addOnData.getItem("noteId")) {
                const meta = JSON.parse(node.addOnData.getItem("meta") || "{}");
                notes.push({
                    id: node.addOnData.getItem("noteId"),
                    meta: meta,
                    isHidden: node.opacity !== 1
                    // Do NOT return node: node here! Only serializable data.
                });
            }
        }
        return notes;
    };

    // Select a note by ID
    sandboxApi.selectNoteById = function(noteId) {
        const allNodes = editor.context.insertionParent.children;
        for (const node of allNodes) {
            if (node.addOnData && node.addOnData.getItem("noteId") === noteId) {
                editor.context.selection = [node];
                return true;
            }
        }
        return false;
    };

    // Toggle note visibility by ID
    sandboxApi.toggleNoteVisibilityById = function(noteId) {
        const allNodes = editor.context.insertionParent.children;
        for (const node of allNodes) {
            if (node.addOnData && node.addOnData.getItem("noteId") === noteId) {
                node.opacity = node.opacity === 1 ? 0.01 : 1;
                return node.opacity;
            }
        }
        return null;
    };

    // Delete note by ID
    sandboxApi.deleteNoteById = function(noteId) {
        const allNodes = editor.context.insertionParent.children;
        for (const node of allNodes) {
            if (node.addOnData && node.addOnData.getItem("noteId") === noteId) {
                node.removeFromParent();
                return true;
            }
        }
        return false;
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi, "documentSandbox");
}

start();
