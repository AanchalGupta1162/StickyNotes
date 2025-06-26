import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {};
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
        // Font size: about 15% of note height, clamped between 8 and 24
        text.fullContent.applyCharacterStyles(
            {
                color: { red: 0, green: 0.4, blue: 0.8, alpha: 1 },
                fontSize: 12,
                letterSpacing: 10,
                underline: true,
            }
            );
        // Padding: 10px from left/top
        text.translation = { x: rect.translation.x + 20, y: rect.translation.y + 30 }; // Position text inside the rectangle

        // Group rectangle and text if possible
        const group = editor.createGroup();
        group.translation = { x: 10, y: 10 }; // Align group to the same position as the rectangle
        group.children.append(rect,text);
        editor.context.insertionParent.children.append(group);
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

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi, "documentSandbox");
}

start();
