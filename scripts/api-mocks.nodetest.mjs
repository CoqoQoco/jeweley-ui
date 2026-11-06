import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveDevOrigin, isDevOrigin, devProxyKey } from '../e2e/support/api-mocks.js'

test('resolveDevOrigin: opts > baseURL > default', () => {
  assert.equal(resolveDevOrigin('https://localhost:3000/x', 'http://a:1'), 'https://localhost:3000')
  assert.equal(resolveDevOrigin(undefined, 'https://localhost:2002/'), 'https://localhost:2002')
  assert.equal(resolveDevOrigin(), 'http://localhost:2002')
})

test('isDevOrigin: ไม่สน protocol, loopback เท่ากัน, port ต่างไม่ใช่', () => {
  const dev = 'https://localhost:2002'
  assert.ok(isDevOrigin(new URL('https://localhost:2002/src/main.js'), dev))
  assert.ok(isDevOrigin(new URL('http://127.0.0.1:2002/a'), dev))
  assert.ok(isDevOrigin(new URL('wss://localhost:2002/'), dev))
  assert.ok(!isDevOrigin(new URL('http://localhost:2001/Invoice/Get'), dev))
  assert.ok(!isDevOrigin(new URL('https://example.com:2002/'), dev))
})

test('devProxyKey: เฉพาะ /jwapi/', () => {
  assert.equal(devProxyKey('/jwapi/Invoice/Get'), 'invoice/get')
  assert.equal(devProxyKey('/JWAPI/Invoice/Get/'), 'invoice/get')
  assert.equal(devProxyKey('/src/main.js'), null)
  assert.equal(devProxyKey('/jwapi'), null)
})
