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

  delete(key) {
    if (this.get(key) == undefined) 
      return false
      
    this.store[key] = undefined
    return true
  }

  checkAndSet() {}
}
