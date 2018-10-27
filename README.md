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

const granular = new Granular();

granular.on('settingBuffer', () => {
  // ...
});

granular.on('bufferSet', () => {
  // ...
});

granular.on('grainCreated', ({ gain, position }) => {
  // ...
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