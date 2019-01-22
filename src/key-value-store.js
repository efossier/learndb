import shell from 'shelljs'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

export class KeyValueStore {
  constructor(conf = {}) {
    this.dbPath = path.join(conf.dbPath || tmp.dirSync().name, 'store.json')
  }

  init() {
    shell.mkdir('-p', path.dirname(this.dbPath))
    shell.touch(this.dbPath)
  }

  clear() {
    shell.rm('-rf', path.dirname(this.dbPath))
  }

  set(key, val) {
    let data = JSON.stringify({'key': key, 'val': val, 'isDeleted': false}) + '\n'
    fs.appendFileSync(this.dbPath, data)
  }

  get(key) {
    try {
      let content = fs.readFileSync(this.dbPath, 'utf-8').split('\n').reverse()
      for (var entry of content) {
        if (entry === "") continue 

        let data = JSON.parse(entry)
        if (data.key === key) {
          return data.isDeleted ? undefined : data.val
        }
      }
    } catch (e) {
      // File does not exist or malformed
      console.log(this.dbPath)
      console.log(e)
    }
    return undefined
  }

  exists(key) {
    return !!this.get(key)
  }

  delete(key) {
    if (!this.exists(key)) return false
      
    let data = JSON.stringify({'key': key, 'val': null, 'isDeleted': true}) + '\n'
    fs.appendFileSync(this.dbPath, data)
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
