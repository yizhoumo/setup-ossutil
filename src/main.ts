import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    await install()
    await config()
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function install(): Promise<void> {
  const version = core.getInput('ossutil-version', { required: true })
  await installer.installOssutil(version)
  core.info('ossutil is successfully installed')
}

async function config(): Promise<void> {
  const endpoint = core.getInput('endpoint')
  if (endpoint.length === 0) {
    core.info('ossutil config is skipped')
    return
  }

  const accessKeyId = core.getInput('access-key-id', { required: true })
  const accessKeySecret = core.getInput('access-key-secret', { required: true })
  const args = [
    'config',
    '--endpoint',
    endpoint,
    '--access-key-id',
    accessKeyId,
    '--access-key-secret',
    accessKeySecret
  ]
  const stsToken = core.getInput('sts-token')
  if (stsToken) {
    args.push('--sts-token', stsToken)
  }

  const exitCode = await exec.exec('ossutil', args)
  if (exitCode === 0) {
    core.info('ossutil config is done')
  } else {
    core.error(`ossutil config is failed with exit code: ${exitCode}`)
  }
}
