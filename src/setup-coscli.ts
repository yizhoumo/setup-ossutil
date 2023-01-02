import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'

async function run(): Promise<void> {
  try {
    // download
    const version = core.getInput('coscli-version')
    await installer.installCosCli(version)
    core.info('coscli is successfully installed')

    // config
    const inputOptions: core.InputOptions = {required: true}
    const endpoint = core.getInput('endpoint', inputOptions)
    const accessKeyId = core.getInput('access-key-id', inputOptions)
    const accessKeySecret = core.getInput('access-key-secret', inputOptions)
    const stsToken = core.getInput('sts-token')
    const args = [
      'config',
      '--endpoint',
      endpoint,
      '--access-key-id',
      accessKeyId,
      '--access-key-secret',
      accessKeySecret
    ]
    if (stsToken) {
      args.push('--sts-token', stsToken)
    }
    const exitCode = await exec.exec('coscli', args)
    if (exitCode === 0) {
      core.info('coscli config is done')
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
