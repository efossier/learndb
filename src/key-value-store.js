import shell from 'shelljs'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

const SST_FILE_NAME_REGEXP = /^sorted_string_table_(\d+)[.]json$/

export class KeyValueStore {
  constructor(conf = {}) {
    this.dbPath = conf.dbPath || tmp.dirSync().name
    this.maxBufferLength = conf.maxBufferLength || 100
    this.buffer = []
  }

  init() {
    shell.mkdir('-p', this.dbPath)
  }

  clear() {
    shell.rm('-rf', this.dbPath)
  }

  set(key, val) {
    this.buffer.push({key: key, val: val, isDeleted: false})
    if (this.buffer.length >= this.maxBufferLength) {
      this.flush()
    }
  }

  get(key) {
    var bufferEntry = this._getFromBuffer(key)
    if (bufferEntry !== undefined) {
      return bufferEntry.isDeleted ? undefined : bufferEntry.val
    }

    var sstFiles = this._getSstFileNames().reverse()
    for (var file of sstFiles) {
      var sstEntry = this._getFromSst(file, key)
      if (sstEntry !== undefined) {
        return sstEntry.isDeleted ? undefined : sstEntry.val
      }
    }
    return undefined
  }

  exists(key) {
    return !!this.get(key)
  }

  delete(key) {
    if (!this.exists(key)) return false

    this.buffer.push({key: key, val: undefined, isDeleted: true})

    if (this.buffer.length >= this.maxBufferLength) {
      this.flush()
    }
    return true
  }

  checkAndSet({ key, expectedValue, newValue }) {
    if (this.get(key) == expectedValue) {
      this.set(key, newValue)
      return true
    }
    return false
  }

  flush() {
    if (this.buffer.length == 0) return

    const deduped = {}
    for (var entry of this.buffer) {
      deduped[entry.key] = entry
    }

    const sstFileName = this._generateNextSstFileName()
    const sorted = Object.keys(deduped)
                         .map(k => JSON.stringify(deduped[k]))
                         .sort()
                         .join('\n') + '\n'
    
    fs.writeFileSync(path.join(this.dbPath, sstFileName), sorted, 'utf-8')
    this.buffer = []
  }

  _generateNextSstFileName() {
    const existingSstFileNames = this._getSstFileNames()

    if (existingSstFileNames.length === 0) {
      return 'sorted_string_table_0001.json'
    }

    let lastIdx = parseInt(SST_FILE_NAME_REGEXP.exec(existingSstFileNames.pop())[1])
    let nextIdx = (lastIdx + 1).toString().padStart(4, '0')

    return `sorted_string_table_${nextIdx}.json`
  }

  _getSstFileNames() {
    return shell.ls(this.dbPath)
                .filter(fileName => SST_FILE_NAME_REGEXP.test(fileName))
                .sort()
  }

  _getFromBuffer(key) {
    // Search in reverse order
    for (var i = this.buffer.length - 1; i >= 0; i--) {
      var entry = this.buffer[i]
      if (entry.key === key) {
        return entry
      }
    }
    return undefined
  }

  _getFromSst(file, key) {
    try {
      let filePath = path.join(this.dbPath, file)
      let content = fs.readFileSync(filePath, 'utf-8').split('\n')
      for (var entry of content) {
        if (entry === "") continue 

        let data = JSON.parse(entry)
        if (data.key === key) {
          return data
        }
      }
    } catch (e) {
      // File does not exist or malformed
      console.log(`Error reading file ${file}: ${e}`)
    }
    return undefined
  }
}
