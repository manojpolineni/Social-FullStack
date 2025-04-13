export const playSound = (type) => {
      let soundFile = '';
      if (type === 'send') {
            soundFile = "/assets/sent.mp3";
            console.log("mp3", soundFile);
      } else if (type === 'receive') {
            soundFile = '/assets/receive.mp3';
      }

      if (soundFile) {
        const audio = new Audio(soundFile);
        audio
          .play()
          .catch((error) => console.error("Audio play failed:", error));
      }
}