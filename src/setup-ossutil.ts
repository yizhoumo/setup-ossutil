import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'

async function run(): Promise<void> {
  try {
    // download
    const version = core.getInput('ossutil-version')
    await installer.getOssutil(version)

    // config
    const endpoint = core.getInput('endpoint')
    const accessKeyId = core.getInput('access-key-id')
    const accessKeySecret = core.getInput('access-key-secret')
    const stsToken = core.getInput('sts-token')
    const args = [
      '--endpoint',
      endpoint,
      '--access-key-id',
      accessKeyId,
      '--access-key-secret',
      accessKeySecret,
      '--sts-token',
      stsToken
    ]
    await exec.exec('ossutil', args)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
