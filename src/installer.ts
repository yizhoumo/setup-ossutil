import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as fs from 'fs'
import {HttpClient} from '@actions/http-client'

const ToolName = 'ossutil'
const UpdateUrl =
  'https://ossutil-version-update.oss-cn-hangzhou.aliyuncs.com/ossutilversion'
const DownloadEndpoint = 'https://gosspublic.alicdn.com/ossutil'

/**
 * Get ossutil ready for use
 * @param version the version of ossutil
 */
export async function getOssutil(version: string): Promise<void> {
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
      downloadUrl += 'ossutil64.exe'
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
  const http = new HttpClient('setup-ossutil', [], {
    allowRetries: true,
    maxRetries: 5
  })
  const response = await http.get(UpdateUrl)
  const content = await response.readBody()
  return content.trim()
}
