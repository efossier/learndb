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
  const testValue1 = 'test-value-1'
  const testValue2 = 'test-value-2'

  // Contains a fresh instance of the key-value store for each test.
  let keyValueStore = null

  beforeEach(() => {
    // Before each test, create a new instance of the key-value store.
    keyValueStore = new KeyValueStore({dbPath: testDBDir})

    // This won't do anything for now, but will be helpful soon when we have
    // to initialize resources such as database files.
    keyValueStore.init()
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
})
