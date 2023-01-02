import * as core from '@actions/core'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs'

const ToolName = 'coscli'
const DownloadEndpoint = 'https://github.com/tencentyun/coscli/releases/download/'

/**
 * Install coscli to PATH
 * @param version the version of coscli
 */
export async function installCosCli(version: string): Promise<void> {
  if (version.toLowerCase() === 'latest') {
    version = await getLatestVersion()
    core.info(`Using the latest version of coscli: ${version}`)
  }

  let toolPath = tc.find(ToolName, version)
  if (!toolPath) {
    toolPath = await downloadCosCli(version)
  }

  core.addPath(toolPath)
}

/**
 * Download coscli and install it into the tool cache
 * @param version the version of coscli to download
 * @returns the path to the tool directory
 */
async function downloadCosCli(version: string): Promise<string> {
  // download
  let toolFile: string
  try {
    const downloadUrl = getDownloadUrl(version)
    core.info(`Downloading coscli from: ${downloadUrl}`)
    toolFile = await tc.downloadTool(downloadUrl)
  } catch (error) {
    core.error('Failed to download coscli')
    throw error
  }
  core.debug(`coscli downloaded to: ${toolFile}`)

  // change permission
  fs.chmodSync(toolFile, 0o755)

  // cache
  const toolPath = await tc.cacheFile(toolFile, ToolName, ToolName, version)
  core.debug(`coscli cached to: ${toolPath}`)
  return toolPath
}

/**
 * Get the URL of the specific version of coscli
 * @param version the version of coscli to download
 * @returns the URL
 */
function getDownloadUrl(version: string): string {
  let downloadUrl = `${DownloadEndpoint}/${version}/`
  switch (process.platform) {
    case 'linux':
      downloadUrl += 'coscli-linux'
      break
    case 'win32':
      downloadUrl += 'coscli-windows.exe'
      break
    case 'darwin':
      downloadUrl += 'coscli-mac'
      break
    default:
      throw new Error(`Unknown platform ${process.platform}`)
  }

  return downloadUrl
}

/**
 * Get the latest version of coscli
 * @returns the latest version
 */
async function getLatestVersion(): Promise<string> {
  const token = core.getInput('github-token', {required: true})
  const octokit = github.getOctokit(token)
  const response = await octokit.rest.repos.getLatestRelease({
    owner: 'tencentyun',
    repo: 'coscli'
  })

  const tag = response.data.tag_name.trim()
  return tag
}
