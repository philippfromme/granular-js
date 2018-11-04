# granular-js

A simple granular synthesis library.

* built with Web Audio API
* no dependencies

## How to use

Install via npm:

```sh
npm i granular-js
```

Use:

```javascript
import Granular from 'granular-js';

// create instance with optional configuration
const granular = new Granular({
  envelope: {
    attack: 0,
    decay: 0.5
  },
  density: 0.9,
  spread: 0.1,
  pitch: 1
});

// listen for events
granular.on('settingBuffer', () => {
  // ...
});

granular.on('bufferSet', () => {
  // ...
});

granular.on('grainCreated', ({ gain, position }) => {
  // ...
});

// set parameters
granular.set({
  pitch: {
    0.5
  }
});

const data = await getData('example.wav');

await granular.setBuffer(data);

// start voice
const id = granular.startVoice({
  position: 10,
  volume: 0.5
});

// update voice
granular.updateVoice({
  id,
  position: 20
});

// stop voice
granular.stopVoice(id);
```

See [example](/example).

## License

MIT