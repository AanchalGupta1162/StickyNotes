import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {};
    
    // Helper to generate a unique ID
    function generateNoteId() {
        return typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "note-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
    }

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
        // Add rounded corners to the rectangle
        rect.cornerRadii = { topLeft: 12, topRight: 12, bottomLeft: 12, bottomRight: 12 };

        // Create the text object for the sticky note
        const text = editor.createText(textContent);
        text.setPositionInParent(
            { x: 10, y:10  },
            { x: 10, y: 10 }
        );
        text.textAlignment=1; // Align text to the left
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
        const noteId = rect.id.toString();
        const meta = {
            id: noteId,
            color: colorHex,
            width,
            height,
            text: options.text,
            fontSize,
            fontColor: options.fontColor,
            fontFamily: options.fontFamily
        };
        group.addOnData.setItem("noteId", noteId);
        group.addOnData.setItem("meta", JSON.stringify(meta));
        
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
                node.opacity = node.opacity === 1 ? 0.2 : 1;
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
