import Granular from '../src/Granular';

function createCompressor(context, options = {}) {
  const {
    threshold,
    knee,
    ratio,
    attack,
    release
  } = options;

  const compressor = context.createDynamicsCompressor();

  compressor.threshold.value = threshold || -24;
  compressor.knee.value = knee || 6;
  compressor.ratio.value = ratio || 10;
  compressor.attack.value = attack || 0.005;
  compressor.release.value = release || 0.05;

  return compressor;
}

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
  const audioContext = new AudioContext();
  
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

  const compressor = createCompressor(audioContext);

  granular.connect(compressor);

  compressor.connect(audioContext.destination);

  granular.on('settingBuffer', () => console.log('setting buffer'));
  granular.on('bufferSet', () => console.log('buffer set'));
  granular.on('grainCreated', () => console.log('grain created'));

  const data = await getData('example.wav');

  await granular.setBuffer(data);

  const resume = document.getElementById('resume');

  resume.addEventListener('click', () => {
    granular.resume();
    
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
    }, 2000);
  })
}

init();
