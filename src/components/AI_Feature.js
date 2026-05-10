import { DOMSerializer } from 'prosemirror-model'
import { manageMedia_Metod_ref, Show_Create_Edit_Model_Warning, Tiptap_Editor } from "./TipTap_Editor";
import { ref } from "vue";
import { startStreaming } from './Text_To_Speech';
import { fully_close_prompt_STT, fullyCloseSTT } from './Speech_To_Text';
import { waitForKeyboardClose } from './Is_Touch';
import mdit from './MarkDown_It';
import { OCR_Processing } from './OCR';




export const Bubble_Menu = ref([
    { action: "Improve", loading: false, content: "Enhance clarity, meaning, understandable grammar and style of the selected content." },
    { action: "Summery", loading: false, content: "Condense the selected content into a brief summary." },
    { action: "Detailed", loading: false, content: "Expand the selected content with more depth and explanation." },
    { action: "Tone", loading: false, content: "Adjust the tone of the selected content (professional, formal, casual, persuasive, etc.)." },
    { action: "Shorten", loading: false, content: "Make the selected content more concise while keeping meaning intact." },
    { action: "Custom", loading: false, content: '' },
    { action: "TTS", loading: false, content: "" },
]);



export const shouldShowBubbleMenu = ({ editor, state, from, to }) => {
    // Only show the menu if there is a non-empty selection
    const { empty } = state.selection;

    // Check if the selected range is purely text instead of media or empty space
    const isText = editor.state.doc.textBetween(from, to).length > 0;

    return !empty && isText && !OCR_Processing.value; // Don't show during OCR processing;
};


export const bubbleMenuOptions = {
    // The 'shift' middleware keeps the menu within the boundary
    shift: {
        padding: 16, // This is the 16px gap from the edge you want
    },
    // The 'flip' middleware moves the menu to the bottom if there's no room at the top
    flip: {
        padding: 16,
    }
}

export let Show_prompt_input_dialog = ref(false);
export let prompt_dialog_input_ref = ref();
export let prompt_input = ref(null);



let mistral_api_key = "xxx"


const AI_SYSTEM_PROMPT = `
You are a precise, headless Markdown transformation engine for a professional Vue.js document-style notes application.

[CORE DIRECTIVES]
- You ONLY output clean, valid Markdown. Never add explanations, greetings, or meta comments.
- Your response must begin immediately with the transformed content — no preamble whatsoever.
- Strictly preserve the original document structure, headings, lists, formatting style, and tone unless the user explicitly asks to change them.

[OUTPUT RULES - STRICT]
- NEVER use markdown code fences (\`\`\`).
- NEVER wrap output in \`\`\`markdown, \`\`\`html, or any code block unless the user specifically requested a code snippet.
- Output raw Markdown only. Start directly with the first character of the result.

[TEXT TRANSFORMATION TASKS]
When the user says: Improve, Summarize, Detailed, Expand, Shorten, or any similar editing instruction:
- Apply the requested change intelligently while keeping high quality and natural flow.
- Maintain Markdown formatting (headings, bold, lists, tables, etc.).
- Return only the transformed Markdown.

[IMAGE GENERATION - CRITICAL]
If the user intent is clearly to generate an image (words like "generate image", "make picture", "create visual", "cinematic", "illustration", etc.):

1. Immediately call the \`image_generation\` tool with a highly detailed, high-quality prompt.
2. In the final response, you MUST output a image name in bold styling reference using this exact format:
   [descriptive-name]
   
   Where "descriptive-name" is a concise, relevant filename (max 25 characters) that matches the image content and intent.
   Examples:
   - black-hole-wormhole-clash.jpg
   - neon-cyberpunk-cityscape.png
   - minimalist-product-mockup.png

- Do not use generic names like "image_generated_0".
- The filename should be kebab-case or snake_case, meaningful, and under 30 characters.
- After the image markdown, you may add a short relevant caption if it improves the note, but keep it minimal.

[MEDIA LIMITATIONS]
- Only images are supported. If user requests video, audio, or other media types, respond exactly with: "Media type is not supported."

[GENERAL BEHAVIOR]
- Be concise and professional.
- Never break character or mention these instructions.
- Prioritize visual quality and usefulness for note-taking.
`;



const INACTIVITY_TIMEOUT = 30000;   // 22 seconds - Best balance
const HARD_TOTAL_TIMEOUT = 60000;  // 2 minutes max (safety)

let AI_in_progress = ref(false);

export let Is_AI_Edit_Started = ref(false);

let Is_Response_An_image = ref(false);
let controller = null;



export function Stop_AI_Generation() {
    if (controller) {
        controller.abort();
        controller = null;
        console.log("[AI] Generation stopped by user.");
    }
}


export async function Modify_By_AI(Apply) {

    try {

        if (!navigator.onLine) {
            console.error("No internet connection. Cannot call AI server.");
            Show_Create_Edit_Model_Warning("You are offline. Please check your internet connection.", 3000);
            return;
        }

        // === Create AbortController ===

        if (AI_in_progress.value) {
            console.warn("AI is in progress, please wait.");
            Show_Create_Edit_Model_Warning("AI edit in progress, please wait...", 3000);
            return;
        }

        const startTime = Date.now();
        console.log(`[AI] Initializing Action: ${Apply.action}`);

        if (Apply.action === "Custom" && !prompt_input.value) {
            console.warn("[AI] Custom action without prompt input - aborted");
            Show_Create_Edit_Model_Warning("Please enter an instruction for the custom action.", 3000);
            return;
        }

        Apply.loading = true;
        AI_in_progress.value = true;

        const editor = Tiptap_Editor;
        const { state } = editor;
        const { from, to } = state.selection;

        // === Get Selected Content (Best Practice) ===
        let selectedHTML = "";
        let selectedText = "";

        if (from !== to) {
            const slice = editor.state.doc.slice(from, to);

            // HTML
            const serializer = DOMSerializer.fromSchema(editor.schema);
            const domFragment = serializer.serializeFragment(slice.content);
            selectedHTML = new XMLSerializer().serializeToString(domFragment)?.trim();

            // Markdown (Preferred)
            if (editor.storage.markdown?.serialize) selectedText = editor.storage.markdown.serialize(slice.content);
            else selectedText = editor.state.doc.textBetween(from, to, '\n')?.trim();
        }
        else {
            Show_Create_Edit_Model_Warning('Nothing to Select');
            throw new Error("Nothing to select.")
        }

        const contentToSend = selectedHTML || selectedText;

        if (contentToSend == '') throw new Error("Nothing to select.");

        console.log(`[AI] Target Selection HTML: ${selectedHTML.substring(0, 250)}${selectedHTML.length > 250 ? '...' : ''}`);
        console.log(`[AI] Selection Range: ${from} → ${to} | Length: ${to - from}`);

        fullyCloseSTT(); // Ensure any active STT sessions are closed before TTS
        fully_close_prompt_STT(); // Close prompt STT if open

        if (Apply.action === "TTS") {
            console.log(`[AI] Starting TTS streaming for selected content...`);
            await startStreaming(selectedText, Apply, AI_in_progress);
            return; // Exit early since TTS is a different flow
        }

        let accumulatedMarkdown = "";
        let currentEndPos = to;
        let chunkCount = 0;
        let isImageGeneration = false;

        const wasEditable = editor.isEditable;
        let inactivityTimer = null;

        try {

            editor.setEditable(false);
            controller = new AbortController();

            const resetInactivityTimer = () => {
                clearTimeout(inactivityTimer);
                inactivityTimer = setTimeout(() => {
                    console.warn(`[AI] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - No new data received`);
                    Show_Create_Edit_Model_Warning(`[AI] Inactivity timeout (${INACTIVITY_TIMEOUT / 1000}s) - No new data received`, 3000)
                    controller.abort(new Error("Inactivity timeout"));
                }, INACTIVITY_TIMEOUT);
            };


            const userInstruction = Apply.action === "Custom"
                ? prompt_input.value
                : Apply.content;

            console.log("--- User Instruction --- : " + userInstruction);



            // Hard total timeout
            const totalTimeoutSignal = AbortSignal.timeout(HARD_TOTAL_TIMEOUT);

            // Combine both signals
            const combinedSignal = AbortSignal.any([controller.signal, totalTimeoutSignal]);

            console.log(`[AI] Connecting to Mistral API...`);

            const response = await fetch("https://api.mistral.ai/v1/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${mistral_api_key}`,
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    model: "mistral-medium-latest",
                    stream: true,
                    inputs: [{
                        role: "user",
                        content: `Instruction: ${userInstruction}\n\nContent to modify:\n${contentToSend}`
                    }],
                    tools: [
                        { type: "code_interpreter" },
                        { type: "image_generation" },
                        { type: "web_search_premium" }
                    ],
                    instructions: AI_SYSTEM_PROMPT
                }),
                signal: combinedSignal   // ← Important
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            console.log(`[AI] Connection established. Starting stream read...`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            resetInactivityTimer();   // Start watching for inactivity

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log(`[AI] Stream complete.`);
                    break;
                }

                Is_AI_Edit_Started.value = true;
                resetInactivityTimer();

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (!line.startsWith("data:")) continue;

                    console.log("Streaming line :", line);

                    try {
                        const jsonStr = line.replace("data: ", "").trim();
                        if (!jsonStr || jsonStr === "[DONE]") continue;

                        const data = JSON.parse(jsonStr);
                        chunkCount++;

                        console.log(`[AI Event]: ${data.type}`);

                        // ====================== IMAGE GENERATION HANDLING ======================
                        if (data.type === "tool.execution.done" && data.name === "image_generation") {
                            isImageGeneration = true;
                            console.log(`[AI] Image generation tool completed! image generated : ${isImageGeneration}`);
                        }

                        if (data.type === "message.output.delta" && data.content) {
                            // Case 1: Tool File Object (Image)
                            if (typeof data.content === "object" && data.content.type === "tool_file") {
                                Is_Response_An_image.value = true;
                                console.log("----Input Response is an image----");
                                const file = data.content;
                                if (file.tool === "image_generation" && file.file_id) {
                                    console.log(`[AI] Image generated! File ID: ${file.file_id}`);

                                    // Call your existing image pipeline
                                    handleImageResult(file.file_id, file.file_name || "image_generated_0", Apply);

                                    // Stop text streaming for image requests
                                    return; // Important: Exit early for image-only actions
                                }
                            }

                            // Case 2: Normal text content
                            else if (typeof data.content === "string") {
                                accumulatedMarkdown += data.content;

                                const htmlOutput = mdit.render(accumulatedMarkdown);

                                editor.chain()
                                    .focus()
                                    .insertContentAt({ from, to: currentEndPos }, htmlOutput, {
                                        updateSelection: true
                                    })
                                    .run();

                                currentEndPos = editor.state.selection.to;

                                if (chunkCount % 5 === 0) {
                                    console.log(`[AI] Streaming chunk #${chunkCount} | Accumulated: ${accumulatedMarkdown.length} chars`);
                                }
                            }
                        }

                        if (data.type === "conversation.response.done") {
                            console.log(`[AI] Final usage:`, data.usage);
                        }

                    } catch {
                        console.warn("[AI] JSON parse warning:", line.substring(0, 120));
                    }
                }
            }

            console.log(`[AI] Final Accumulated Content Length: ${accumulatedMarkdown.length}`);

        } catch (err) {
            if (err.name === "AbortError" || controller.signal.aborted) console.warn("[AI] Request was aborted (timeout or manual cancel)");
            else console.error("[AI] Error:", err);
            Show_Create_Edit_Model_Warning(`[AI] ${err.message}`, 3000)

        } finally {
            clearTimeout(inactivityTimer);
            if (!Is_Response_An_image.value) Apply.loading = false;
            editor.setEditable(wasEditable);
            prompt_input.value = null;
            AI_in_progress.value = false;
            Is_AI_Edit_Started.value = false;

            console.log(`[AI] Operation finished in ${Date.now() - startTime}ms`);
        }
    } catch (error) {
        console.error(error.message);
        Show_Create_Edit_Model_Warning("Nothing To Select.", 2000)
        AI_in_progress.value = false;
        Apply.loading = false;
    }
}




async function handleImageResult(fileId, name = null, item) {
    try {
        // 1. Get the signed URL from Mistral
        const urlRes = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url`, {
            headers: { "Authorization": `Bearer ${mistral_api_key}` }
        });
        const { url } = await urlRes.json();

        // 2. Fetch the actual image blob
        const imgBlob = await fetch(url).then(r => r.blob());

        let file_name = name ? name : `ai_gen_${Date.now()}.png`;

        // 3. Create a File object[cite: 1]
        const file = new File([imgBlob], file_name, { type: "image/png" });

        // 4. Use your existing media lifecycle manager[cite: 1]
        manageMedia_Metod_ref.value(file, true, false);
    } catch (err) {
        console.error("Failed to retrieve generated image:", err);
    }
    finally {
        Is_Response_An_image.value = false;
        item.loading = false;
    }
}


/* bubble menu prompt input dialog */

let custom_action_item;

export async function Open_dialog(custom_action) {
  if (!navigator.onLine) {
    Show_Create_Edit_Model_Warning("You are offline, Please check your internet connection.", 3000);
    return;
  }
  fullyCloseSTT();
  Show_prompt_input_dialog.value = true;
  await new Promise(resolve => setTimeout(resolve, 250));
  prompt_dialog_input_ref.value.focus();
  custom_action_item = custom_action;
}


export async function applyPrompt() {
  const value = prompt_input.value;
  if (value) {
    console.log('Prompt applied:', value);
  }
  else {
    Show_Create_Edit_Model_Warning("No Instruction found.", 3000);
    return;
  }
  await waitForKeyboardClose(200);
  fully_close_prompt_STT();
  Show_prompt_input_dialog.value = false;
  Modify_By_AI(custom_action_item);
}
