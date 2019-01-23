import chai, { assert } from 'chai'
import chaiString from 'chai-string'

import { KeyValueStore } from '../src/key-value-store'

import shell from 'shelljs'
import path from 'path'

chai.use(chaiString)

describe('KeyValueStore', () => {
  const testDBDir = path.resolve(__dirname, '../testDB')
  // Test keys and values we'll use in the new tests
  const testKey1 = 'test-key-1'
  const testKey2 = 'test-key-2'
  const testValue1 = 'test-value-1'
  const testValue2 = 'test-value-2'

  // Contains a fresh instance of the key-value store for each test.
  let keyValueStore = null

  function newKVStore({ dbPath }) {
    let kv = new KeyValueStore({dbPath: dbPath})

    // This won't do anything for now, but will be helpful soon when we have
    // to initialize resources such as database files.
    kv.init()

    return kv
  }

  beforeEach(() => {
    // Before each test, create a new instance of the key-value store.
    keyValueStore = newKVStore({dbPath: testDBDir})
  })

  afterEach(() => {
    // Clear the KV Store after every test
    keyValueStore.clear()
  })

  it('get() returns value that was set()', () => {
    keyValueStore.set(testKey1, testValue1)
    assert.equal(keyValueStore.get(testKey1), testValue1)
  })
  
  it('get() returns last value that was set()', () => {
    keyValueStore.set(testKey1, testValue1)
    keyValueStore.set(testKey1, testValue2)
    assert.equal(keyValueStore.get(testKey1), testValue2)
  })
  
  it('get() for non-existent key returns undefined', () => {
    assert.equal(keyValueStore.get(testKey1), undefined)
  })

  it('set() and get() support null value', () => {
    keyValueStore.set(testKey1, null)
    assert.equal(keyValueStore.get(testKey1), null)
  })
  
  it('delete() for key causes get() to return undefined', () => {
    keyValueStore.set(testKey1, testValue1)
    keyValueStore.delete(testKey1)
    assert.equal(keyValueStore.get(testKey1), undefined)
  })

  it('delete() returns true if key existed', () => {
    keyValueStore.set("abc", "def")
    assert.equal(keyValueStore.delete("abc"), true)
  })

  it('delete() returns false if key did not exist', () => {
    assert.equal(keyValueStore.delete("abc"), false)
  })

  it('delete() does not impact other keys', () => {
    keyValueStore.set(testKey1, testValue1)
    keyValueStore.delete(testKey1)
    keyValueStore.set(testKey2, testValue2)
    assert.equal(keyValueStore.get(testKey2), testValue2)
  })

  it('persists data', () => {
    keyValueStore.set("evan", "rocks")
    assert.equal(keyValueStore.get("evan"), "rocks")
    keyValueStore.flush()

    let otherKVStore = newKVStore({ dbPath: testDBDir })
    assert.equal(otherKVStore.get("evan"), "rocks")

    otherKVStore.set("evan", "dope")
    otherKVStore.flush()

    assert.equal(keyValueStore.get("evan"), "dope")
  })

  it('buffers correctly', () => {
    keyValueStore.clear()
    keyValueStore = new KeyValueStore({dbPath: testDBDir, maxBufferLength: 2})
    keyValueStore.init()

    keyValueStore.set("evan", "dope")
    keyValueStore.set("nave", "epod")
    keyValueStore.set("nave1", "epod1")
    keyValueStore.set("evan", "sick")

    assert.equal(keyValueStore.get("evan"), "sick")
    assert.equal(keyValueStore.get("nave"), "epod")
    assert.equal(keyValueStore.get("nave1"), "epod1")
  })
})
