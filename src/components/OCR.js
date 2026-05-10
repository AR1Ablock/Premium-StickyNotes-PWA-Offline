import { ref } from 'vue';
import { Show_Create_Edit_Model_Warning, Tiptap_Editor } from './TipTap_Editor';
import mdit from './MarkDown_It';
import { fully_close_prompt_STT, fullyCloseSTT } from './Speech_To_Text';
import { Stop_AI_Generation } from './AI_Feature';

// State management for global access
let currentOcrController = null;
let inactivityTimer = null;

const INACTIVITY_TIMEOUT = 50000; // 50s (If server stops talking)
const HARD_TOTAL_TIMEOUT = 600000; // 10m (Safety net)

export const OCR_Processing = ref(false);
export const OCR_Status = ref("Ready for OCR");


const API_KEY = 'llx-';
const commonHeaders = { 'Authorization': `Bearer ${API_KEY.trim()}` };

let fileId = null;
let jobId = null;

const proxy_1 = "https://corsproxy.io/?";
// const proxy_2 = "https://corsproxy.io/?";

let AI_Custom_Prompt = `You are an expert academic document intelligence specialist and master Markdown formatter. Your task is to convert complex handwritten notes, scanned documents, textbooks, research papers, and study materials into clean, beautiful, professional, and highly readable Markdown.

**Core Rules (Never Break These):**
- Extract **every single piece of information** without any loss of content, context, meaning, or visual elements.
- Preserve the original logical flow, hierarchy, and intent of the document as faithfully as possible.
- Prioritize clarity, readability, and aesthetic beauty while maintaining academic accuracy.
- Never hallucinate or invent information. If something is unclear, describe it honestly.

**Detailed Processing Instructions:**

1. **Text & Document Structure**
   - Use proper Markdown heading hierarchy (# H1, ## H2, ### H3, etc.) based on visual and semantic importance.
   - Preserve and clean bullet points, numbered lists, indentation, and emphasis (**bold**, *italic*, \`inline code\`).
   - Fix obvious OCR/handwriting errors intelligently while preserving original meaning.
   - Maintain section flow and group related content logically.

2. **Tables (Critical - Handle All Messy Cases)**
   - Convert **all tables** into clean, well-formatted Markdown tables.
   - Remove or intelligently handle empty rows and empty columns.
   - Merge or clean duplicate/sparse rows and columns when they add no value.
   - Use proper column alignment (\`:---\`, \`---:\`, \`:---:\`).
   - If a table is too large or complex, still represent it fully and accurately. Split only if it improves readability dramatically.
   - Preserve table captions and notes.

3. **Images, Pictures & Screenshots**
   - For every image, figure, diagram, chart, or screenshot:
     - Create a descriptive heading: **Figure X: Clear and concise description**
     - Provide a detailed, meaningful alt text description of what the image contains.
     - If the image contains text, extract and include that text properly.
     - If the image is a diagram, flowchart, or chart → convert to **Mermaid syntax** (prefer \`graph TD\`, \`graph LR\`, \`flowchart\`, \`sequenceDiagram\`, \`classDiagram\`, \`gantt\`, etc.).
     - If conversion to Mermaid is not possible, provide rich ASCII art + detailed textual explanation.

4. **Diagrams, Charts & Visual Explanations**
   - Prioritize accurate conversion to Mermaid whenever feasible.
   - Fall back to detailed description + ASCII art only when necessary.
   - Preserve relationships, labels, arrows, and flow.

5. **Mathematics & Formulas**
   - Convert all math into proper LaTeX: Use \`$...\` for inline and \`$$...$$\` for display math.

6. **Code Blocks & Programming Content**
   - Detect and wrap code in proper fenced blocks with correct language tag when identifiable.

7. **Handwritten & Noisy Content**
   - Pay extra attention to handwritten text — improve legibility while staying faithful.
   - Reconstruct unclear sections using surrounding context intelligently.

8. **Edge Cases & Cleanup**
   - Remove clutter: empty rows/columns, redundant whitespace, and noise.
   - Handle overlapping text, poor scan quality, annotations, and marginal notes intelligently.
   - Preserve important footnotes, side notes, and callouts.
   - Add logical section breaks (\`---\`) only when they genuinely improve readability.

**Final Output Requirements:**
- Return **ONLY pure, valid Markdown**. No explanations, no comments, no "Here is the result", nothing else.
- Make the output beautiful, well-organized, professional, and student-friendly.
- Use consistent spacing and visual hierarchy.
- Ensure the Markdown is easy to read and renders perfectly.`;

/**
 * STOP OCR: Call this from your UI "Cancel" button
 */
export function Stop_OCR() {
    if (currentOcrController) {
        console.log("[OCR] Manual stop triggered by user.");
        currentOcrController.abort(new Error("User cancelled operation"));
        currentOcrController = null;
    }
    clearTimeout(inactivityTimer);
}

/**
 * HANDLE OCR: The 3-stage intelligence pipeline
 */
export async function Handle_OCR(input) {
    if(!navigator.onLine) {
        const msg = "You are currently offline. Please connect to the internet to use the OCR feature.";
        Show_Create_Edit_Model_Warning(msg, 5000);
        console.warn("[OCR] Attempted to start OCR while offline.");
        return null;
    }
    // 1. Initialize Abort Logic
    currentOcrController = new AbortController();
    const hardTimeoutSignal = AbortSignal.timeout(HARD_TOTAL_TIMEOUT);

    // Combine Manual Abort + Hard Timeout
    const combinedSignal = AbortSignal.any([currentOcrController.signal, hardTimeoutSignal]);

    // 2. Inactivity Timer Logic
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            const msg = `[OCR] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - Server not responding`;
            console.warn(msg);
            Show_Create_Edit_Model_Warning(msg, 4000);
            if (currentOcrController) currentOcrController.abort(new Error("Inactivity timeout"));
        }, INACTIVITY_TIMEOUT);
    };


    try {

        fullyCloseSTT();
        fully_close_prompt_STT();
        Stop_AI_Generation();

        const wasEditable = Tiptap_Editor.isEditable;
        Tiptap_Editor.setEditable(false); // Make editor read-only during OCR to prevent conflicts

        OCR_Processing.value = true;

        // --- STAGE 1: UPLOAD ---
        // Note: We don't apply inactivity timer during binary upload 
        // because network speeds vary wildly for large files.
        if (input instanceof File) {

            OCR_Status.value = 'Uploading file...';
            const formData = new FormData();
            formData.append('upload_file', input);
            formData.append('purpose', "parse");

            const uploadRes = await fetch(`${proxy_1}https://api.cloud.llamaindex.ai/api/v1/files`, {
                method: 'POST',
                headers: commonHeaders,
                body: formData,
                signal: combinedSignal
            });

            if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);
            const uploadData = await uploadRes.json();
            fileId = uploadData.id;
            if (!fileId) throw new Error("No file ID returned from server after upload");
        }

        // --- STAGE 2: TRIGGER PARSE ---
        OCR_Status.value = 'Starting AI parsing...';
        resetInactivityTimer(); // Start monitoring server response here

        const parsePayload = {
            tier: 'agentic',
            version: 'latest',
            agentic_options: { custom_prompt: AI_Custom_Prompt },
            output_options: {
                markdown: {
                    annotate_links: true,
                    inline_images: true,
                    tables: {
                        output_tables_as_markdown: true,
                        compact_markdown_tables: true,
                        markdown_table_multiline_separator: "<br />"
                    }
                },
                images_to_save: ["embedded"]   // Save both types
            }
        };
        if (fileId) parsePayload.file_id = fileId;

        const parseRes = await fetch(`${proxy_1}https://api.cloud.llamaindex.ai/api/v2/parse`, {
            method: 'POST',
            headers: { ...commonHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(parsePayload),
            signal: combinedSignal
        });

        if (!parseRes.ok) throw new Error(`Trigger failed: ${parseRes.statusText}`);
        let json = await parseRes.json();
        jobId = json.id;
        if (!jobId) throw new Error("No job ID returned from server");

        resetInactivityTimer(); // Reset: Server successfully acknowledged the job

        // --- STAGE 3: POLLING ---
        let attempts = 0;
        while (attempts < 100) {
            attempts++;
            OCR_Status.value = `AI is reading... (${attempts * 2}s)`;

            await new Promise(resolve => setTimeout(resolve, 2000));

            const pollRes = await fetch(`${proxy_1}https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}?expand=markdown_full`, {
                headers: commonHeaders,
                signal: combinedSignal
            });

            const pollData = await pollRes.json();

            // CRITICAL: Every time the server sends a valid response (even if PENDING),
            // we reset the inactivity timer. This proves the "heartbeat" is alive.
            resetInactivityTimer();

            if (pollData.job?.status === 'COMPLETED') {
                clearTimeout(inactivityTimer);
                let markdown_full = pollData.markdown_full;
                if (!markdown_full || markdown_full.trim() === "") {
                    throw new Error("OCR completed but no content was extracted");
                }
                let our_html = mdit.render(markdown_full);
                // lets put to tiptap editor current select or cursor location
                Tiptap_Editor.chain().focus().insertContent(our_html).run();
                OCR_Status.value = 'OCR Completed!';
                return; // Exit after successful completion
            }

            if (pollData.job?.status === 'FAILED') {
                throw new Error(pollData.job.error_message || "OCR failed on server");
            }
        }

    } catch (error) {
        // Clean up
        clearTimeout(inactivityTimer);

        if (error.name === 'AbortError') {
            // Signal was aborted (either by user, inactivity, or hard timeout)
            console.log("[OCR] Process terminated safely.");
            return null; // Return null so the UI knows nothing was extracted
        }

        // Real Error Handling
        const errorMsg = `[OCR Error]: ${error.message}`;
        Show_Create_Edit_Model_Warning(errorMsg, 5000);
        throw error;

    } finally {
        currentOcrController = null;
        OCR_Processing.value = false;
        clearTimeout(inactivityTimer);
        await cleanupLlamaResources(fileId, jobId);
        fileId = null;
        jobId = null;
        Tiptap_Editor.setEditable(true); // Restore editor state after OCR process
    }
}



/**
 * Cleanup: Delete file and cancel job (if needed)
 */
async function cleanupLlamaResources(fileId, jobId) {

    try {

        // 1. Delete File (Most Important)
        if (fileId) {
            await fetch(`${proxy_1}https://api.cloud.llamaindex.ai/api/v1/beta/files/${fileId}`, {
                method: 'DELETE',
                headers: commonHeaders
            });
            console.log(`[Cleanup] File deleted: ${fileId}`);
        }

        // 2. Cancel Job (if it exists and might still be running)
        if (jobId) {
            await fetch(`${proxy_1}https://api.cloud.llamaindex.ai/api/v2/parse/${jobId}/cancel`, {
                method: 'POST',
                headers: { ...commonHeaders, 'Content-Type': 'application/json' }
            });
            console.log(`[Cleanup] Job cancelled: ${jobId}`);
        }
    } catch (err) {
        console.warn("[Cleanup] Failed to delete resources:", err.message);
        // Don't throw — we don't want cleanup to break the main flow
    }
}
