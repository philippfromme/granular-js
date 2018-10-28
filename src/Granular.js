import {
  find,
  merge
} from 'lodash';

import Events from './Events';
import Ids from './Ids';

const ids = new Ids();

export default class Granular {
  constructor(options = {}) {
    this.events = new Events();

    const initialState = {
      envelope: {
        attack: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
        release: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1
      },
      density: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
      spread: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
      pitch: 1
    };

    this.state = {
      isBufferSet: false,
      envelope: {
        attack: (options.envelope && options.envelope.attack) ||
          initialState.envelope.attack,
        release: (options.envelope && options.envelope.release) ||
          initialState.envelope.release
      },
      density: options.density || initialState.density,
      spread: options.spread || initialState.spread,
      pitch: options.pitch || initialState.pitch,
      voices: []
    };

    // audio
    this.context = options.audioContext || new AudioContext();

    this.gain = this.context.createGain();
    this.gain.gain.value = 1;

    this.gain.connect(this.context.destination);
  }

  resume() {
    this.context.resume();
  }

  on(events, listener) {
    this.events.on(events, listener);
  }

  off(events, listener) {
    this.events.off(events, listener);
  }

  set(property, value) {
    // TODO: implement
  }

  _setState(state) {
    this.state = merge(this.state, state);
  }

  setBuffer(data) {
    this._setState({ isBufferSet: false });

    this.events.fire('settingBuffer', {
      buffer: data
    });

    return new Promise(resolve => {
      this.context.decodeAudioData(data, buffer => {
        this.buffer = buffer;
  
        this._setState({ isBufferSet: true });
  
        this.events.fire('bufferSet', {
          buffer
        });

        resolve();
      });
    });
  }

  getVoice(id) {
    return find(this.state.voices, voice => voice.id === id);
  }

  /**
   * 
   * @param {Object} options - Options.
   * @param {Object} [options.id] - Optional ID.
   * @param {Object} [options.volume] - Optional volume (0.0 - 1.0).
   * @param {Object} [options.position] - Optional position (0.0 - 1-0).
   */
  startVoice(options = {}) {
    if (!this.state.isBufferSet) {
      return;
    }

    // keep reference
    const self = this;

    class Voice {
      constructor(position, volume) {
        this.position = position;
        this.volume = volume;

        this.grains = [];
        this.grainsCount = 0;

        this.timeout = null;
      }

      update(options = {}) {
        if (options.position) {
          this.position = options.position;
        }
        
        if (options.volume) {
          this.volume = options.volume;
        }
      }

      play() {
        const _innerPlay = () => {
          const grain = self.createGrain(this.position, this.volume);

          this.grains[ this.grainsCount ] = grain;
          this.grainsCount++;

          if (this.grainsCount > 20) {
            this.grainsCount = 0;
          }

          // next interval
          const density = map(self.state.density, 1, 0, 0, 1);
          const interval = (density * 500) + 70;

          this.timeout = setTimeout(_innerPlay, interval);
        }

        _innerPlay();
      }

      stop() {
        clearTimeout(this.timeout);
      }
    }

    let {
      position,
      volume,
      id
    } = options;

    if (!position) {
      position = 0;
    }

    if (!volume) {
      volume = 1;
    }

    if (!id) {
      id = ids.next()
    }

    const voice = new Voice(position, volume);

    voice.play();

    this.state.voices = [
      ...this.state.voices,
      {
        voice,
        position,
        volume,
        id
      }
    ];

    return id;
  }

  updateVoice(id, options) {
    this.state.voices.forEach(voice => {
      if (voice.id === id) {
        voice.voice.update(options);
      }
    });
  }

  stopVoice(id) {
    this.state.voices.forEach(voice => {
      if (voice.id === id) {
        voice.voice.stop();
      }
    });

    const voices = this.state.voices.filter(v => v.id !== id);

    this._setState({
      voices
    });
  }

  createGrain(position, volume) {
    const now = this.context.currentTime;

    // source
    const source = this.context.createBufferSource();
    source.playbackRate.value = source.playbackRate.value * this.state.pitch;
    source.buffer = this.buffer;

    // gain
    const gain = this.context.createGain();
    source.connect(gain);
    gain.connect(this.gain);

    // update position and calcuate offset
    const offset = map(position, 0, 1, 0, this.buffer.duration);

    // volume
    volume = clamp(volume, 0, 1);

    // parameters
    const attack = this.state.envelope.attack * 0.4;
    let release = this.state.envelope.release * 1.5;

    if (release < 0) {
      release = 0.1;
    }

    const randomoffset = (Math.random() * this.state.spread) - (this.state.spread / 2);

    // envelope
    source.start(now, Math.max(0, offset + randomoffset), attack + release);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + (attack + release));

    // garbage collection
    source.stop(now + attack + release + 0.1);

    const disconnectTime = (attack + release) * 1000;

    setTimeout(() => {
      gain.disconnect();
    }, disconnectTime + 200);

    this.events.fire('grainCreated', {
      position,
      volume
    });
  }
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}