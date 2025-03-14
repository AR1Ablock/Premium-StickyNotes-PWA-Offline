import pako from 'pako';

// worker.js

  self.onmessage = function (e) {
    try {
     

      if (e.data.command === 'SUICIDE') {
        console.log('Compression Suciding');
        self.postMessage({ status: 'SUICIDE_CONFIRMED' });
        self.close();
        return;
      }


    let {compressedNote } = e.data;

    console.log("worker received note--> ", compressedNote);

    
      // Decompress and parse the file
      let decompressed = pako.inflate(compressedNote, { to: 'string' });

      console.log("worker decompressed note--> ", decompressed);
      
      let decompressednote = JSON.parse(decompressed);

      console.log("worker decompressed parsed note--> ", decompressednote);

      // Send the note back to the main thread
      self.postMessage({note : decompressednote});

      compressedNote = null;
      decompressed = null;
      decompressednote = null;
      self.close();
    } catch (error) {
      console.log(error);
      self.postMessage({error : error});
      self.close()
    }
  };