import * as path from 'path'
import * as io from '@actions/io'
import * as installer from '../src/installer'

const TOOL_DIR = path.join(__dirname, 'runner', 'tools')
const TEMP_DIR = path.join(__dirname, 'runner', 'temp')
process.env['RUNNER_TOOL_CACHE'] = TOOL_DIR
process.env['RUNNER_TEMP'] = TEMP_DIR

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

  const versions = ['1.7.15', 'latest']

  it.each(versions)('install ossutil %s', async version => {
    await installer.installOssutil(version)

    expect(await io.which('ossutil', true)).toBeTruthy()
  })
})
