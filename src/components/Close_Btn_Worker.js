self.onmessage = function (e) {
    
    const SendImageForView = JSON.parse(e.data.SendImageForView);
    const SendVideoForView = JSON.parse(e.data.SendVideoForView);
    const SendAudioForView = JSON.parse(e.data.SendAudioForView);
    const SendDocumentForView = JSON.parse(e.data.SendDocumentForView);
    const media = JSON.parse(e.data.media);


    // Revoke all object URLs for media previews
    SendImageForView.forEach((img) => URL.revokeObjectURL(img.Data));
    SendVideoForView.forEach((vid) => URL.revokeObjectURL(vid.Data));
    SendAudioForView.forEach((audio) => URL.revokeObjectURL(audio.Data));
    SendDocumentForView.forEach((doc) => URL.revokeObjectURL(doc.Data));

    if (media.value) {
        media.value.forEach((x) => {
          if (!x.paused) {
            x.pause();
            x.currentTime = 0;
          }
        });
      }

    // Clear arrays
/*     SendImageForView.length = 0;
    SendVideoForView.length = 0;
    SendAudioForView.length = 0;
    SendDocumentForView.length = 0; */

    self.postMessage("done");
  };