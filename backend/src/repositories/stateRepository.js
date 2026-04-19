const { readJson, writeJson } = require("../lib/fileStore");
const defaultState = require("../data/defaultState");

class StateRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = readJson(this.filePath, defaultState);
  }

  getState() {
    return this.state;
  }

  save() {
    writeJson(this.filePath, this.state);
  }

  nextId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

module.exports = {
  StateRepository
};
