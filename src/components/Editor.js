import { ref } from "vue";

    export let editor = ref(null);

    // Sticky style state
    let currentTextColor = null;
    let currentHighlightColor = null;

    let getSelectedNode = ()=> null;
    let updateActiveStates = ()=>{};

    export function fill_both(selected_node, get_updateActiveStates) {
      getSelectedNode = selected_node;
      updateActiveStates = get_updateActiveStates;
    }

    function execCmd(cmd, val = null) {
      document.execCommand(cmd, false, val);
      updateActiveStates();
      editor.value.focus();
    }
    
    export let isCheckboxSticky = ref(false); // Track sticky checkbox mode

    export function Checkbox() {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
    
      const range = sel.getRangeAt(0);
      const isTextSelected = !range.collapsed; // Check if text is selected
    
      if (isTextSelected) {
        // Text is selected: Insert checkbox at line start, no sticky mode
        moveCaretToLineStart(range);
        const node = document.createElement("input");
        node.type = "checkbox";
        node.style.marginRight = "5px";
        insertNodeAtCaret(node);
        placeCaretAfter(node);
        isCheckboxSticky.value = false; // Ensure sticky mode is off
      } else {
        // No text selected: Toggle sticky mode
        if (!isCheckboxSticky.value) {
          // If turning on sticky mode: Move to start of line, insert checkbox
          moveCaretToLineStart(range);
          const node = document.createElement("input");
          node.type = "checkbox";
          node.style.marginRight = "5px";
          insertNodeAtCaret(node);
          placeCaretAfter(node);
        }
        isCheckboxSticky.value = !isCheckboxSticky.value; // Toggle the state
      }
      updateActiveStates();
      editor.value.focus();
    }
    
    // Handle Enter key in sticky mode
    export function handleEnterKey(event) {
      if (isCheckboxSticky.value && event.key === "Enter") {
        event.preventDefault();
        // Insert a new line (div for proper line break)
        const newLine = document.createElement("div");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.style.marginRight = "5px";
        newLine.appendChild(checkbox);
        insertNodeAtCaret(newLine);
        placeCaretAfter(checkbox); // Place cursor after new checkbox
        updateActiveStates();
        return true; // Indicate event was handled
      }
      return false;
    }
    
    // Move caret to the start of the current line based on the range
    function moveCaretToLineStart(range) {
      let node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      
      // Find the parent block (div, p, or contenteditable root)
      let block = node;
      while (block && block !== editor.value && !isBlockElement(block)) {
        block = block.parentNode;
      }
      if (!block || block === editor.value) {
        block = editor.value;
        range.setStart(block, 0);
      } else {
        range.setStartBefore(block.firstChild || block);
      }
      range.collapse(true);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    
    // Check if node is a block element
    function isBlockElement(node) {
      const blockTags = ['DIV', 'P', 'LI', 'BLOCKQUOTE'];
      return blockTags.includes(node.nodeName);
    }
    

    
    // Insert a node at the caret
    function insertNodeAtCaret(node) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(node);
    }

    // Place caret inside an element
    function placeCaretInside(el) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    }

    // Place caret after a node
    function placeCaretAfter(node) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      editor.value.focus();
    }

    // Unwrap a span (remove it but keep children)
    function unwrapSpan(span) {
      const parent = span.parentNode;
      const next = span.nextSibling;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
      placeCaretAfter(next || parent);
    }

    // Toggle active class
    function toggleButtonActive(id, on) {
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle('active', on);
    }

    // === Separated Command Functions ===
    export function bold() { execCmd('bold'); }
    export function italic() { execCmd('italic'); }
    export function underline() { execCmd('underline'); }
    export function striker() { execCmd('strikeThrough'); }
    export function orderedList() { execCmd('insertOrderedList'); }
    export function unorderedList() { execCmd('insertUnorderedList'); }

    export function blockquote() {
      const node = getSelectedNode();
      if (node?.closest('blockquote')) {
        // Already in a quote → remove the blockquote using outdent
        document.execCommand('outdent', false, null);
        // Optionally, ensure the content is wrapped in a <p> tag
        document.execCommand('formatBlock', false, 'P');
      } else {
        // Not in a quote → make it a blockquote
        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
      }
    }

    export function heading() {
      const node = getSelectedNode();
      if (node?.closest('h1,h2,h3,h4,h5,h6')) {
        execCmd('formatBlock', 'p');
      } else {
        const lvl = prompt('Heading level (1-6):', '1');
        if (lvl >= 1 && lvl <= 6) execCmd('formatBlock', 'H' + lvl);
      }
    };

    export function code() {
      const node = getSelectedNode();
      if (node?.closest('pre')) {
        const pre = node.closest('pre');
        const p = document.createElement('p');
        p.innerHTML = pre.innerHTML;
        pre.replaceWith(p);
      } else {
        const txt = window.getSelection().toString() || 'Write code here...';
        execCmd('insertHTML', `<pre class="code-block"><code>${txt}</code></pre>`);
      }
      updateActiveStates();
    };

    export function link() {
      const sel = window.getSelection();
      if (sel.isCollapsed) {
        // No text selected → insert a full custom <a>
        const text = prompt('Link text:', 'My Link'); 
        if (!text) return;
        const url = prompt('URL:', 'http://'); 
        if (!url) return;
        execCmd('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
      } else {
        // Text selected → create link, then add target manually
        const url = prompt('URL:', 'http://');
        if (url) {
          execCmd('createLink', url);
    
          // Patch created <a> with target="_blank"
          const anchorNodes = Array.from(document.querySelectorAll('a[href="' + url + '"]'));
          anchorNodes.forEach(a => {
            // Confirm it's in selection range
            if (window.getSelection().containsNode(a, true)) {
              a.setAttribute('target', '_blank');
              a.setAttribute('rel', 'noopener noreferrer'); // security best practice
            }
          });
        }
      }
      updateActiveStates();
    }


    export function textColor() {
      const sel = window.getSelection();
      // Apply to selected text
      if (sel.rangeCount && !sel.isCollapsed) {
        const color = prompt('Enter text color (name or hex):', currentTextColor || 'red'); if (!color) return;
        document.execCommand('styleWithCSS', false, null);
        execCmd('foreColor', color);
        return;
      }
      // Toggle sticky mode
      if (!currentTextColor) {
        const color = prompt('Enter text color (name or hex):', 'red'); if (!color) return;
        currentTextColor = color;
        document.execCommand('styleWithCSS', false, null);
        const span = document.createElement('span');
        span.style.color = color;
        span.textContent = '\u200b';
        insertNodeAtCaret(span);
        placeCaretInside(span);
        toggleButtonActive('textColorBtn', true);
      } else {
        // Turn off sticky
        currentTextColor = null;
        const node = getSelectedNode();
        const span = node.closest('span');
        if (span && span.style.color) unwrapSpan(span);
        toggleButtonActive('textColorBtn', false);
      }
    };

    // Highlight: selection & sticky toggle

    export function highlight() {
      const sel = window.getSelection();
      if (sel.rangeCount && !sel.isCollapsed) {
        const color = prompt('Enter highlight color (name or hex):', currentHighlightColor || 'yellow'); if (!color) return;
        document.execCommand('styleWithCSS', false, null);
        execCmd('hiliteColor', color) || execCmd('backColor', color);
        return;
      }
      if (!currentHighlightColor) {
        const color = prompt('Enter highlight color (name or hex):', 'yellow'); if (!color) return;
        currentHighlightColor = color;
        document.execCommand('styleWithCSS', false, null);
        const span = document.createElement('span');
        span.style.backgroundColor = color;
        span.textContent = '\u200b';
        insertNodeAtCaret(span);
        placeCaretInside(span);
        toggleButtonActive('highlightBtn', true);
      } else {
        currentHighlightColor = null;
        const node = getSelectedNode();
        const span = node.closest('span');
        if (span && span.style.backgroundColor) unwrapSpan(span);
        toggleButtonActive('highlightBtn', false);
      }
    };

    export function undoAction() {
      document.execCommand('undo');
    }

    export function redoAction() {
      document.execCommand('redo');
    }


    export async function copySmartContent() {
      const html = editor.value.innerHTML;
      const text = editor.value.innerText;
      const markdown = text;

      // Prepare blobs
      const blobsWithMD = {
        "text/html": new Blob([html], { type: "text/html" }),
        "text/markdown": new Blob([markdown], { type: "text/markdown" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      };
      const blobsNoMD = {
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" })
      };

      try {
        // First attempt: HTML + MD + plain
        await navigator.clipboard.write([new ClipboardItem(blobsWithMD)]);
        alert("✅ Copied HTML, Markdown & Plain‑Text!");
      }
      catch (err) {
        console.warn("📋 Markdown MIME-type not supported, retrying without it…", err);
        try {
          // Retry without markdown
          await navigator.clipboard.write([new ClipboardItem(blobsNoMD)]);
          alert("✅ Copied HTML & Plain‑Text!");
        }
        catch (err2) {
          console.error("❌ Clipboard write failed completely:", err2);
          alert("❌ Copy failed. See console for details.");
        }
      }
    }

    /**
     * Paste handler that picks HTML first, then Markdown, then Plain‑Text.
     */
    export function paste(e) {
      // eslint-disable-next-line no-debugger
      debugger
      e.preventDefault();
      const cd = e.clipboardData || window.clipboardData;
      const html = cd.getData("text/html");
      const md = cd.getData("text/markdown");
      const text = cd.getData("text/plain");
    
      let toInsert = "";
    
      if (html) {
        // Clean and fix pasted HTML
        const temp = document.createElement("div");
        temp.innerHTML = html;
    
        // Fix all links
        temp.querySelectorAll("a").forEach(a => {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        });

        temp.querySelectorAll("table").forEach(table => {
          const wrapper = document.createElement("div");
          wrapper.className = "table-container";
          table.replaceWith(wrapper);
          wrapper.appendChild(table);
        });

        temp.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
          checkbox.removeAttribute("disabled");
        });
    
        // Remove problematic styles that could cause overflow
        temp.querySelectorAll("*").forEach(el => {
          const style = el.style;
          style.width = ""; // Remove fixed widths
          style.maxWidth = "100%"; // Ensure elements fit container
          style.whiteSpace = ""; // Remove custom white-space settings
          style.overflow = ""; // Remove overflow settings
          if (el.tagName === "PRE" || el.tagName === "CODE") {
            // Ensure code blocks wrap
            el.style.whiteSpace = "pre-wrap";
            el.style.wordWrap = "break-word";
          }
        });
    
        toInsert = updatePreview(temp.innerHTML);
      } else if (md) {
        // Convert markdown to HTML and insert
        toInsert = updatePreview(md);
      } else {
        // Convert plain text to safe HTML, breaking long lines
        const maxLineLength = 80; // Adjust as needed
        const lines = text.split("\n").map(line => {
          if (line.length > maxLineLength) {
            // Insert soft breaks for long lines
            let wrapped = "";
            for (let i = 0; i < line.length; i += maxLineLength) {
              wrapped += line.slice(i, i + maxLineLength) + "\u200B"; // Zero-width space for soft break
            }
            return wrapped;
          }
          return line;
        });
        toInsert = updatePreview(lines.join("\n"));
      }
    
      // Insert processed HTML
      document.execCommand("insertHTML", false, toInsert);
    }

    /* ------------------ Markdown Parser ------------------ */
    export function updatePreview(Read_Mode_Text) {
      try {
        let text = null;
        if (Read_Mode_Text) {
          text = Read_Mode_Text;
        } else {
          text = editor.value.innerHTML;
        }
        if (!text) return;
        if (!(typeof text == "string")) return;
        text = text.replace(/((?:^\|.*\|\s*\n)+)/gm, (block) => parseMDTable(block));

        text = text
          .replace(/^\s*---\s*$/gm, "<hr>")
          .replace(/^\s*\*\*\*\s*$/gm, "<hr>")
          .replace(/^\s*___\s*$/gm, "<hr>");

        // Process headings.
        text = text
          .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
          .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
          .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
          .replace(/^### (.*)$/gm, "<h3>$1</h3>")
          .replace(/^## (.*)$/gm, "<h2>$1</h2>")
          .replace(/^# (.*)$/gm, "<h1>$1</h1>");

        // Process inline formatting.
        text = text
          .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
          .replace(/_(.*?)_/g, "<i>$1</i>")
          // Single asterisk italic (ensure not to conflict with bold):
          .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "<i>$1</i>")
          .replace(/~~(.*?)~~/g, "<del>$1</del>");

        text = text.replace(/```([\w-+]+)?\s*\n([\s\S]*?)```/g, (match, lang, code) => {
          // Escape special HTML characters in the code block:
          const escapedCode = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");

          // Return the code wrapped in <pre><code> with a language class for styling.
          return `<pre class="code-block"><code class="language-${lang || "none"
            }">${escapedCode}</code></pre>`;
        });

        // Process robust Markdown links.
        // Matches [link text](url) with optional whitespace and angle brackets around the URL,
        // while ignoring image syntax that starts with "!".
        text = text.replace(
          /(?<!!)\[([^\]]+)\]\(\s*(?:<)?(.+?)(?:>)?\s*\)/g,
          '<a href="$2" target="_blank">$1</a>'
        );

        text = text.replace(/^>\s?(.*)$/gm, '<div class="blockquote">$1</div>');

        // Process color and background.
        text = text
          .replace(/\[color=(.*?)\](.*?)\[\/color\]/g, '<span style="color:$1;">$2</span>')
          .replace(
            /\[bg=(.*?)\](.*?)\[\/bg\]/g,
            '<span style="background:$1; padding:2px;">$2</span>'
          );

        // Process ordered lists.
        text = text.replace(/((?:^1\. .+(?:\n|$))+)/gm, (match) => {
          let items = match.split("\n").filter((line) => line.trim());
          let li = items.map((item) => item.replace(/^\d+\.\s(.*)$/, "<li>$1</li>")).join("");
          return "<ol>" + li + "</ol>";
        });

        // Process unordered lists with asterisks.
        text = text.replace(/((?:^\* .+(?:\n|$))+)/gm, (match) => {
          let items = match.split("\n").filter((line) => line.trim());
          let li = items.map((item) => item.replace(/^\* (.*)$/, "<li>$1</li>")).join("");
          return "<ul>" + li + "</ul>";
        });

        text = text.replace(/((?:^[ \t]*-\s.*\n?)+)/gm, (match) => parseNestedDashes(match));

        console.log("text area--> ", text);


        return text;

      } catch (error) {
        console.log(error.message);
      }
    }

    function parseMDTable(block) {
      try {
        // Split into lines, trim trailing blank lines
        const lines = block.trim().split("\n");
        if (lines.length < 2) {
          // Not enough lines for a valid table (need header + alignment at least)
          return block;
        }

        // 1) The first line is the header row
        const headerLine = lines[0];

        // 2) The second line is the alignment row
        const alignLine = lines[1];

        // 3) The remaining lines are data rows
        const dataLines = lines.slice(2);

        // Quick check that the second line looks like an alignment row
        // e.g., "|:---|:---:|---:|"
        const alignTest = alignLine
          .replace(/^ *\| *| *\| *$/g, "")
          .split("|")
          .map((a) => a.trim());
        if (!alignTest.every((a) => /^:?-+:?$/.test(a))) {
          // If any alignment cell is not matching `:---`, `---:`, `:---:`, or `---`
          // we assume this isn't a valid table block
          return block;
        }

        // Parse header cells
        const headers = headerLine
          .replace(/^ *\| *| *\| *$/g, "")
          .split("|")
          .map((h) => h.trim());

        // Parse alignment for each column
        const aligns = alignLine
          .replace(/^ *\| *| *\| *$/g, "")
          .split("|")
          .map((a) => a.trim());
        const colAligns = aligns.map((a) => {
          if (/^:-+:$/.test(a)) return "center";
          if (/^:-+$/.test(a)) return "left";
          if (/^-+:$/.test(a)) return "right";
          return null; // no special alignment
        });

        // Parse data lines into rows
        const rows = dataLines
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed) return null; // skip empty lines
            const cells = trimmed.replace(/^ *\| *| *\| *$/g, "").split("|");
            return cells.map((c) => c.trim());
          })
          .filter(Boolean);

        // Build thead
        const thead =
          `<thead><tr>` +
          headers
            .map((h, i) => {
              const style = colAligns[i] ? ` style="text-align:${colAligns[i]};"` : "";
              return `<th${style}>${h}</th>`;
            })
            .join("") +
          `</tr></thead>`;

        // Build tbody
        let tbody = "";
        rows.forEach((row) => {
          // For short rows, fill missing cells with empty string
          while (row.length < headers.length) {
            row.push("");
          }
          // For extra cells, ignore or slice
          const tds = row
            .slice(0, headers.length)
            .map((cell, i) => {
              const style = colAligns[i] ? ` style="text-align:${colAligns[i]};"` : "";
              return `<td${style}>${cell}</td>`;
            })
            .join("");
          tbody += `<tr>${tds}</tr>`;
        });
        tbody = `<tbody>${tbody}</tbody>`;

        // Return the final table HTML
        return `<div class="table-container"><table>\n${thead}\n${tbody}\n</table></div>\n`;
      } catch (error) {
        console.log(error.message);
      }
    }

    function parseNestedDashes(textBlock) {
      try {
        // Split on new lines.
        const lines = textBlock.split("\n").filter((line) => line.trim() !== "");
        let result = "";
        let stack = []; // stores indentation levels

        lines.forEach((line) => {
          // Regex: capture leading spaces (indent), then dash+space, then the rest.
          // e.g., "   - Apple" => indent="   ", content="Apple"
          const match = line.match(/^(\s*)-\s+(.*)$/);
          if (!match) {
            // If a line doesn't match, just append it raw (or ignore).
            result += line;
            return;
          }
          const indent = match[1].length; // number of leading spaces
          const content = match[2];

          // While current indent is less than the top of the stack, close previous lists.
          while (stack.length && stack[stack.length - 1] > indent) {
            result += "</li></ul>";
            stack.pop();
          }

          // If deeper indent, open a new nested <ul>.
          if (!stack.length || indent > stack[stack.length - 1]) {
            // If this isn't the very first line, close the previous <li> before opening a new <ul>.
            if (stack.length) {
              result += "<ul>";
            } else {
              // If it's the first line at top level, open a <ul>.
              result += "<ul>";
            }
            stack.push(indent);
          } else {
            // Same level or shallower: close the previous <li>.
            result += "</li>";
          }

          // Now output the <li> with content (don't close it yet if there might be children).
          result += `<li>${content}`;
        });

        // Close all open lists.
        while (stack.length) {
          result += "</li></ul>";
          stack.pop();
        }
        stack = [];
        return result;
      } catch (error) {
        console.log(error.message);
      }
    }