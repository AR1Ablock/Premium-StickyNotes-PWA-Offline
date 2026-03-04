/**
 * Robust document detector (strictly non-text-based)
 * Supports PDF, Word, Excel, PowerPoint, RTF, OpenDocument, EPUB
 */
export async function isDocumentFile(drop_file) {
    let blob;
    let ab;
    let view;

    try {
        const file = drop_file;
        if (!file) return false;

        // ---------- 1) Known MIME types ----------
        const DOCUMENT_MIMES = new Set([
            "application/pdf",

            // Microsoft Office
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            "application/vnd.ms-excel", // .xls
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-powerpoint", // .ppt
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
            "application/rtf", // .rtf

            // OpenDocument
            "application/vnd.oasis.opendocument.text", // .odt
            "application/vnd.oasis.opendocument.spreadsheet", // .ods
            "application/vnd.oasis.opendocument.presentation", // .odp

            // EPUB
            "application/epub+zip",

            // Apple office files
            "application/vnd.apple.pages", // .pages
            "application/vnd.apple.numbers", // .numbers
            "application/vnd.apple.keynote", // .key / .keynote
        ]);

        if (file.type && DOCUMENT_MIMES.has(file.type)) return true;

        // ---------- 2) Extension-based check ----------
        const DOCUMENT_EXTENSIONS = new Set([
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf",
            "odt", "ods", "odp",
            "epub",
            "pages", "numbers", "key"
        ]);

        const name = (file.name || "").toLowerCase();
        const extMatch = name.match(/\.([^.]+)$/);
        if (extMatch && DOCUMENT_EXTENSIONS.has(extMatch[1])) return true;

        // Special filenames without extension (rare)
        const SPECIAL_NAMES = new Set([
            "license", "readme"
        ]);
        const basename = name.split("/").pop();
        if (SPECIAL_NAMES.has(basename)) return true;

        // ---------- 3) Optional content-based signature check ----------
        // Only for PDF: check first 4 bytes "%PDF"
        if (file.type === "" || file.type === "application/octet-stream") {
            blob = file.slice(0, 4);
            ab = await blob.arrayBuffer();
            view = new Uint8Array(ab);
            if (view.length === 4 && view[0] === 0x25 && view[1] === 0x50 && view[2] === 0x44 && view[3] === 0x46) {
                return true; // "%PDF"
            }
        }

        return false;
    } catch (error) {
        console.log("Error in isDocumentFile:", error);
    }
    finally {
        blob = null;
        ab = null;
        view = null;
    }
}