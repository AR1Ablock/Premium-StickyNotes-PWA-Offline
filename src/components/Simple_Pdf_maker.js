import { debugError } from "./Global_Error_Handler";

export async function exportNoteAsPdf() {
    try {
        // 1. Select the content
        const original = document.querySelector(".notepag_con");
        if (!original) {
            console.error("notepag_con not found!");
            return;
        }

        // 2. Clone and Clean
        const clone = original.cloneNode(true);

        // Remove UI garbage that shouldn't print
        clone.querySelectorAll(
            ".Notepage_View_Full_Screen_And_Change_Color_Container, " +
            ".audio, .video, .document, .note_view_ui_close_btn, " +
            ".delete-modal, .loading, .notes-actions," +
            ".close_note_create_edit_btn"
        ).forEach(el => el.remove());

        // Center the title if it exists
        const titleEl = clone.querySelector('.View_Text_In_UI.View_Text_In_UI_Title');
        if (titleEl) titleEl.style.textAlign = 'center';

        // 3. Image Compression (Your original logic)
        async function compressImg(img, maxWidth = 1024) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const scale = Math.min(1, maxWidth / img.naturalWidth);
            canvas.width = img.naturalWidth * scale;
            canvas.height = img.naturalHeight * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    const newImg = new Image();
                    newImg.src = URL.createObjectURL(blob);
                    newImg.onload = () => resolve(newImg);
                }, "image/jpeg", 0.7);
            });
        }

        const imgs = Array.from(clone.querySelectorAll("img"));
        for (let img of imgs) {
            // Force print styling on images immediately
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.pageBreakInside = "avoid";

            if (img.src.startsWith('https')) continue;
            try {
                const newImg = await compressImg(img);
                img.replaceWith(newImg);
            } catch (err) {
                console.warn("Image compress failed", err);
            }
        }

        // 4. Create Hidden Iframe
        const iframe = document.createElement("iframe");
        Object.assign(iframe.style, {
            position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
            border: "none", visibility: "hidden", zIndex: "-1000"
        });
        document.body.appendChild(iframe);

        const idoc = iframe.contentDocument || iframe.contentWindow.document;
        idoc.open();

        // 5. Gather ALL Styles (Links + Inline Style Tags)
        // We use Array.from to get current DOM state styles
        let stylesHtml = "";

        // A. Copy External CSS Links (<link rel="stylesheet">)
        document.querySelectorAll("link[rel='stylesheet']").forEach(link => {
            stylesHtml += `<link rel="stylesheet" href="${link.href}" />`;
        });

        // B. Copy Inline Styles (Vue Scoped Styles, etc.)
        document.querySelectorAll("style").forEach(style => {
            stylesHtml += `<style>${style.innerHTML}</style>`;
        });

        // 6. Write the Content
        idoc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Note</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    
                    ${stylesHtml}

                    <style>
                        @media print {
                            /* RESET THE BODY CONTAINER */
                            html, body {
                                height: auto !important;
                                min-height: 0 !important;
                                overflow: visible !important;
                                display: block !important; /* Overrides your flex */
                                margin: 0 !important;
                                padding: 1rem !important;
                                background: #2F2F2F !important;
                            }

                            /* UNCHAIN THE NOTE CONTAINER */
                            /* This fixes the "One Page" and "Overlap" issues */
                            .notepag_con {
                                position: static !important;
                                display: block !important; /* CRITICAL: No Flexbox here */
                                height: auto !important;
                                max-height: none !important; /* Removes the 75vh limit */
                                overflow: visible !important; /* Allow scrolling/pagination */
                                width: 100% !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                background: #2F2F2F !important;
                            }

                            /* ENSURE TEXT WRAPS */
                            .View_Text_In_UI {
                                width: 100% !important;
                                max-width: 100% !important;
                                white-space: normal !important;
                                background: #2F2F2F !important;
                            }

                            /* CLEANUP COLORS FOR PRINT */
                            body {
                            -webkit-print-color-adjust: exact;
                            }

                            
                            /* PREVENT CUT-OFF ELEMENTS */
                            p, h1, h2, h3, li, img, table, tr {
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }



  /* Tables */
  .table-container {
    overflow: visible !important;   /* show full table */
    max-height: none !important;    /* remove scroll limit */
    page-break-inside: avoid;       /* don’t split across pages */
  }
  .table-container table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
  }
  .table-container tr {
    page-break-inside: avoid !important;
  }

  /* Code blocks */
  .code-block,
  pre {
    overflow: visible !important;   /* expand fully */
    max-height: none !important;
    white-space: pre-wrap !important; /* allow wrapping if needed */
    page-break-inside: avoid;       /* keep block together */
    background: #1a1a1a !important;
    color: #d7d7d7 !important;
  }
  code {
    background: #1c1c1c !important;
    color: #47d3ff !important;
  }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-wrapper"></div>
                </body>
            </html>
        `);
        idoc.close();

        // 7. Insert Content safely
        const printWrapper = idoc.getElementById("print-wrapper");
        if (printWrapper) printWrapper.appendChild(clone);

        // 8. Wait for Links to Load (Essential for "Ugly Defaults" fix)
        // We look for all link tags inside the iframe and wait for them
        const loadPromises = Array.from(idoc.querySelectorAll("link")).map(link => {
            if (link.sheet) return Promise.resolve(); // Already loaded
            return new Promise(resolve => {
                link.onload = resolve;
                link.onerror = resolve; // Continue even if one fails
                // Timeout fallback in case network hangs
                setTimeout(resolve, 500);
            });
        });

        await Promise.all(loadPromises);

        // 9. Print
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            // Cleanup (longer delay for mobile)
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        }, 500);

    } catch (e) {
        debugError(e, 'Simple_Pdf_Method');
    }
}