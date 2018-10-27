import Granular from '../src/Granular';

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
  const granular = new Granular();

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

    setTimeout(() => {
      granular.stopVoice(id);
    }, 1000);
  })
}

init();
