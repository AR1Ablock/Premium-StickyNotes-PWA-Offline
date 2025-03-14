// Import pako (must be included in your build or as a CDN in the worker)
import pako from 'pako';

// Handle messages from the main thread
self.onmessage = function (event) { // self is the root like windows.xxx of main thread (App.vue) and "onmessage, post message" are methods of web worker.
  try {


    if (event.data.command === 'SUICIDE') {
      console.log('Compression Suciding');
      self.postMessage({ status: 'SUICIDE_CONFIRMED' });
      self.close();
      return;
    }

    
    let { noteString } = event.data;
    
    if (!noteString || noteString.length === 0) {
      throw new Error("Received invalid or empty noteString");
    }
    console.log("worker received raw for process ",noteString);
    
    // Compress the note
    let compressedNote = pako.gzip(noteString);
    console.log("[Worker] Compression successful.");

    // Send the compressed note back to the main thread
    self.postMessage({ compressedNote });

    noteString = null;
    compressedNote = null;
    self.close()
  } catch (error) {
    console.error("[Worker] Compression failed:", error.message);
    // Send the error back to the main thread
    self.postMessage({ error: error.message });
    self.close()
  }
};
