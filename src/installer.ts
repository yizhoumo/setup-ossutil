import * as core from '@actions/core'
import * as io from '@actions/io'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs'
import * as path from 'path'

const ToolName = 'ossutil'
const DownloadEndpoint = 'https://gosspublic.alicdn.com/ossutil'
const IS_WINDOWS = process.platform === 'win32'

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
  const zipFileName = getZipFileName(version)
  let downloadedFile: string
  try {
    const downloadUrl = `${DownloadEndpoint}/${version}/${zipFileName}.zip`
    core.info(`Downloading ossutil from: ${downloadUrl}`)
    downloadedFile = await tc.downloadTool(downloadUrl)
  } catch (error) {
    core.error('Failed to download ossutil')
    throw error
  }
  core.info(`ossutil downloaded to: ${downloadedFile}`)

  // extract
  const zipFile = `${downloadedFile}.zip`
  await io.mv(downloadedFile, zipFile)
  const extractFolder = await tc.extractZip(zipFile)
  const toolFileName = getToolFileName()
  const toolFile = path.join(extractFolder, zipFileName, toolFileName)
  if (fs.existsSync(toolFile)) {
    core.info(`ossutil extracted to: ${toolFile}`)
  } else {
    throw new Error('Unrecognized zip file structure')
  }

  // change permission
  fs.chmodSync(toolFile, 0o755)

  // cache
  const cacheFileName = IS_WINDOWS ? `${ToolName}.exe` : ToolName
  const toolPath = await tc.cacheFile(
    toolFile,
    cacheFileName,
    ToolName,
    version
  )
  core.info(`ossutil installed to: ${toolPath}`)
  return toolPath
}

/**
 * Get the zip file name of the specific version of ossutil
 * @param version the version of ossutil to download
 * @returns the zip file name (e.g., ossutil-v1.7.19-linux-amd64)
 */
function getZipFileName(version: string): string {
  let platform = ''
  switch (process.platform) {
    case 'linux':
      platform = 'linux'
      break
    case 'win32':
      platform = 'windows'
      break
    case 'darwin':
      platform = 'mac'
      break
    default:
      throw new Error(`Unsupported platform ${process.platform}`)
  }

  let arch = ''
  switch (process.arch) {
    case 'arm64':
      arch = 'arm64'
      break
    case 'x64':
      arch = 'amd64'
      break
    default:
      throw new Error(`Unsupported arch ${process.arch}`)
  }

  return `ossutil-v${version}-${platform}-${arch}`
}

/**
 * Get the file name of ossutil
 * @returns the file name (e.g., ossutil64)
 */
function getToolFileName(): string {
  let filename = 'ossutil'
  switch (process.platform) {
    case 'linux':
      filename += '64'
      break
    case 'win32':
      filename += '64.exe'
      break
    case 'darwin':
      filename += 'mac64'
      break
    default:
      throw new Error(`Unsupported platform ${process.platform}`)
  }

  return filename
}

/**
 * Get the latest version of ossutil
 * @returns the latest version
 */
async function getLatestVersion(): Promise<string> {
  const token = core.getInput('github-token', { required: true })
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
