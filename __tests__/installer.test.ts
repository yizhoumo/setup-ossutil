import * as path from 'path'

const TOOL_DIR = path.join(__dirname, 'runner', 'tools')
const TEMP_DIR = path.join(__dirname, 'runner', 'temp')
process.env['RUNNER_TOOL_CACHE'] = TOOL_DIR
process.env['RUNNER_TEMP'] = TEMP_DIR

import * as io from '@actions/io'
import * as installer from '../src/installer'

jest.setTimeout(60000)

describe('installer tests', () => {
  beforeEach(async () => {
    await io.rmRF(TOOL_DIR)
    await io.rmRF(TEMP_DIR)
  })

  afterEach(async () => {
    await io.rmRF(TOOL_DIR)
    await io.rmRF(TEMP_DIR)
  })

  const versions = ['v0.12.0-beta', 'latest']

  it.each(versions)('install coscli %s', async version => {
    await installer.installCosCli(version)

    expect(await io.which('coscli', true)).toBeTruthy()
  })
})
