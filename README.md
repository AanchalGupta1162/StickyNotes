## About

Stickly is an Adobe Express Add-on that brings sticky notes directly into your design workflow. Inspired by the need for a seamless space to brainstorm, plan, and collaborate without leaving Adobe Express, Stickly lets you create, customize, and manage sticky notes right inside your projects.

## Inspiration ✨
Design isn't just execution—it's also thinking, refining, and collaborating. While working on Express projects, we felt the absence of an integrated space to brainstorm or jot down quick thoughts. We constantly switched to external note apps or used comment features, which often broke the creative flow.

That’s when we thought—why not bring sticky notes *into* Adobe Express itself?

## What It Does 🗒️
Stickly lets users create and customize sticky notes inside their Adobe Express designs. Users can:
- Choose sticky note colors via a hex selector 🎨
- Resize and place them visually on their design 🧩
- Select their choice of font ✒️
- Share and view teammates' feedback, opinions, and ideas 🤝
- Edit the text content even after adding the note ✍️
- Hide and unhide the notes to continue their design-thinking ✨
- Delete notes once they have executed their workflow 🗑️
- View all the created notes by using Add-on Data 🔍

These notes help designers brainstorm, plan, or give feedback—right where it matters.

## How We Built It 🔧
We used:
- Adobe Express Add-ons SDK
- The official sandbox template for document add-ons
- HTML, CSS, JavaScript for building the UI
- Adobe’s Document API to manipulate design elements
- Client storage API for storing notes metadata and retrieving them

The add-on works via a side panel from which users can create their sticky note, adjust it, and insert it directly into the canvas.

## Challenges We Faced ⚠️
- One limitation was the inability to add notes in the “gray space” around a design (the margins). Having free-floating sticky notes would have opened up exciting use cases like project mood boards or UI wireframes.
- Managing dynamic positioning of visual elements while ensuring a consistent UX across screen sizes was another complexity.
- Building seamless communication between the sidebar iframe and document canvas using the API also required detailed debugging.
- Figuring out how to store the created notes without leveraging a backend service, but then we used the client storage API and the unique IDs for each child node.
- Aligning the text within the note component was a big challenge.

## What We Learned 📚
- Explored the Adobe Express Add-on SDK in depth, especially its messaging and sandboxing features
- Gained hands-on experience with the Document API and the nuances of working within the Adobe Add-on ecosystem
- Learned how to design modular, extensible features that fit naturally into a creative workflow
- Discovered how even simple tools—like sticky notes—can have a big impact on collaboration and ideation

## Setup

1. Install dependencies: `npm install`
2. Build the add-on: `npm run build`
3. Start the development server: `npm run start`
