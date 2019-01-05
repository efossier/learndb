import shell from 'shelljs'
import fs from 'fs'
import path from 'path'
import md5 from 'md5'
import tmp from 'tmp'

export class KeyValueStore {
  constructor(conf = {}) {
    this.dbPath = conf.dbPath || tmp.dirSync().name
  }

  init() {
    shell.mkdir('-p', this.dbPath)
  }

  set(key, val) {
    let filePath = this._getFilePath(key)
    let data = JSON.stringify({'key': key, 'val': val})
    fs.writeFileSync(filePath, data)
  }

  get(key) {
    let filePath = this._getFilePath(key)
    try {
      let content = fs.readFileSync(filePath)
      let data = JSON.parse(content)
      if (data.key != key) {
        return undefined
      }
      return data.val
    } catch (e) {
      // File does not exist or malformed
      return undefined
    }
  }

  exists(key) {
    let filePath = this._getFilePath(key)
    return fs.existsSync(filePath)
  }

  delete(key) {
    if (!this.exists(key)) return false
      
    let filePath = this._getFilePath(key)
    fs.unlinkSync(filePath)
    return true
  }

  checkAndSet({ key, expectedValue, newValue }) {
    if (this.get(key) == expectedValue) {
      this.set(key, newValue)
      return true
    }
    return false
  }

  clear() {
    shell.rm('-rf', this.dbPath)
  }

  _getFilePath(key) {
    return path.join(this.dbPath, `${md5(key)}.json`)
  }
}
