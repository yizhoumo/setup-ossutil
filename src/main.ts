import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // download
    const version = core.getInput('ossutil-version')
    await installer.installOssutil(version)
    core.info('ossutil is successfully installed')

    // config
    const inputOptions: core.InputOptions = { required: true }
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
    const exitCode = await exec.exec('ossutil', args)
    if (exitCode === 0) {
      core.info('ossutil config is done')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
