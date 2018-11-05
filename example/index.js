import Granular from '../src/Granular';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

async function getData(url) {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    request.onload = function() {
      const audioData = request.response;

      resolve(audioData);
    }

    request.send();
  });
}

async function init() {
  const audioContext = p5.prototype.getAudioContext();
  
  const granular = new Granular({
    audioContext,
    envelope: {
      attack: 0,
      decay: 0.5
    },
    density: 0.9,
    spread: 0.1,
    pitch: 1
  });

  const delay = new p5.Delay();

  delay.process(granular, 0.5, 0.5, 3000); // source, delayTime, feedback, filter frequency

  const reverb = new p5.Reverb();

  // due to a bug setting parameters will throw error
  // https://github.com/processing/p5.js/issues/3090
  reverb.process(delay); // source, reverbTime, decayRate in %, reverse

  reverb.amp(3);

  const compressor = new p5.Compressor();

  compressor.process(reverb, 0.005, 6, 10, -24, 0.05); // [attack], [knee], [ratio], [threshold], [release]

  granular.on('settingBuffer', () => console.log('setting buffer'));
  granular.on('bufferSet', () => console.log('buffer set'));
  granular.on('grainCreated', () => console.log('grain created'));

  const data = await getData('example.wav');

  await granular.setBuffer(data);

  const resume = document.getElementById('resume');

  resume.addEventListener('click', () => {
    const id = granular.startVoice({
      position: 0.1,
      gain: 0.5
    });

    let pitch = 1;

    const interval = setInterval(() => {
      pitch -= 0.05;

      granular.set({
        pitch
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);

      granular.stopVoice(id);

      granular.set({
        pitch: 1
      });
    }, 2000);
  })
}

init();
