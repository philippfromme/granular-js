export default class Ids {
  constructor(prefix = '') {
    this.id = 0;
    this.prefix = prefix;
  }

  next() {
    const id = `${ this.prefix }_${ this.id++ }`;
  }
}