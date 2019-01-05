export class KeyValueStore {
  constructor() {
    this.store = {}
  }

  init() {}

  set(key, val) {
    this.store[key] = val
  }

  get(key) {
    return this.store[key]
  }

  exists(key) {
    return !(this.get(key) == undefined)
  }

  delete(key) {
    if (!this.exists(key)) return false
      
    this.store[key] = undefined
    return true
  }

  checkAndSet({ key, expectedValue, newValue }) {
    if (this.get(key) == expectedValue) {
      this.set(key, newValue)
      return true
    }
    return false
  }
}
