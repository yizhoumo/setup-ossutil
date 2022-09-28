import * as core from '@actions/core'
import * as io from '@actions/io'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs'
import * as path from 'path'

const ToolName = 'ossutil'
const DownloadEndpoint = 'https://gosspublic.alicdn.com/ossutil'

/**
 * Install ossutil to PATH
 * @param version the version of ossutil
 */
export async function installOssutil(version: string): Promise<void> {
  if (version.toLowerCase() === 'latest') {
    version = await getLatestVersion()
    core.info(`Using the latest version of ossutil: ${version}`)
  }

  let toolPath = tc.find(ToolName, version)
  if (!toolPath) {
    toolPath = await downloadOssutil(version)
  }

  core.addPath(toolPath)
}

/**
 * Download ossutil and install it into the tool cache
 * @param version the version of ossutil to download
 * @returns the path to the tool directory
 */
async function downloadOssutil(version: string): Promise<string> {
  // download
  let toolFile: string
  try {
    const downloadUrl = getDownloadUrl(version)
    core.info(`Downloading ossutil from: ${downloadUrl}`)
    toolFile = await tc.downloadTool(downloadUrl)
  } catch (error) {
    core.error('Failed to download ossutil')
    throw error
  }
  core.debug(`ossutil downloaded to: ${toolFile}`)

  // extract (if needed)
  if (process.platform === 'win32') {
    const zipFile = `${toolFile}.zip`
    await io.mv(toolFile, zipFile)
    const extractFolder = await tc.extractZip(zipFile)
    toolFile = path.join(extractFolder, 'ossutil64', 'ossutil64.exe')
    core.debug(`ossutil extracted to: ${toolFile}`)
  }

  // change permission
  fs.chmodSync(toolFile, 0o755)

  // cache
  const fileName = process.platform === 'win32' ? `${ToolName}.exe` : ToolName
  const toolPath = await tc.cacheFile(toolFile, fileName, ToolName, version)
  core.debug(`ossutil cached to: ${toolPath}`)
  return toolPath
}

/**
 * Get the URL of the specific version of ossutil
 * @param version the version of ossutil to download
 * @returns the URL
 */
function getDownloadUrl(version: string): string {
  let downloadUrl = `${DownloadEndpoint}/${version}/`
  switch (process.platform) {
    case 'linux':
      downloadUrl += 'ossutil64'
      break
    case 'win32':
      downloadUrl += 'ossutil64.zip'
      break
    case 'darwin':
      downloadUrl += 'ossutilmac64'
      break
    default:
      throw new Error(`Unknown platform ${process.platform}`)
  }

  return downloadUrl
}

/**
 * Get the latest version of ossutil
 * @returns the latest version
 */
async function getLatestVersion(): Promise<string> {
  const token = core.getInput('github-token', {required: true})
  const octokit = github.getOctokit(token)
  const response = await octokit.rest.repos.getLatestRelease({
    owner: 'aliyun',
    repo: 'ossutil'
  })

  const tag = response.data.tag_name.trim()
  if (tag[0].toLowerCase() === 'v') {
    return tag.substring(1)
  } else {
    return tag
  }
}
