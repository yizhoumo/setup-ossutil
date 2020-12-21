import * as path from 'path'

const TOOL_DIR = path.join(__dirname, 'runner', 'tools')
const TEMP_DIR = path.join(__dirname, 'runner', 'temp')
process.env['RUNNER_TOOL_CACHE'] = TOOL_DIR
process.env['RUNNER_TEMP'] = TEMP_DIR

import * as core from '@actions/core'
import * as io from '@actions/io'
import * as fs from 'fs'
import * as installer from '../src/installer'

const FILE_NAME = process.platform === 'win32' ? 'ossutil.exe' : 'ossutil'

jest.setTimeout(60000)

describe('installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(TOOL_DIR)
    await io.rmRF(TEMP_DIR)
  })

  afterAll(async () => {
    await io.rmRF(TOOL_DIR)
    await io.rmRF(TEMP_DIR)
  })

  it('install ossutil 1.7.0', async () => {
    const version = '1.7.0'
    await installer.getOssutil(version)

    const ossutilDir = path.join(TOOL_DIR, 'ossutil', version, process.arch)
    expect(fs.existsSync(`${ossutilDir}.complete`)).toBe(true)

    const exist = fs.existsSync(path.join(ossutilDir, FILE_NAME))
    expect(exist).toBe(true)

    expect(await io.which('ossutil', true)).toBeTruthy()
  })

  it('throw if wrong version', async () => {
    let thrown = false
    try {
      await installer.getOssutil('1000.0.0')
    } catch (error) {
      core.error(error)
      thrown = true
    }
    expect(thrown).toBe(true)
  })
})
