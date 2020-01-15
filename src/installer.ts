import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as path from 'path'
import * as fs from 'fs'

const TOOL_NAME = 'ossutil'

/**
 * Get ossutil ready for use
 * @param version the version of ossutil
 */
export async function getOssutil(version: string): Promise<void> {
  let toolPath = tc.find(TOOL_NAME, version)
  if (!toolPath) {
    // download, extract, cache
    toolPath = await acquireOssutil(version)
  }

  core.debug(`ossutil is cached under ${toolPath}`)
  core.addPath(toolPath)
}

/**
 * Acquire ossutil and install it into the tool cache
 * @param version the version of ossutil to acquire
 * @returns the path to the tool directory
 */
async function acquireOssutil(version: string): Promise<string> {
  // download
  let downloadFile: string
  try {
    const downloadUrl = getDownloadUrl(version)
    core.info(`Downloading ossutil from: ${downloadUrl}`)
    downloadFile = await tc.downloadTool(downloadUrl)
  } catch (error) {
    core.error(error)
    throw new Error('Failed to download ossutil')
  }
  core.debug(`ossutil downloaded to: ${downloadFile}`)

  // extract (if needed)
  let toolFile = downloadFile
  if (process.platform === 'win32') {
    const extractFolder = await tc.extractZip(downloadFile)
    toolFile = path.join(extractFolder, 'ossutil64', 'ossutil64.exe')
    core.debug(`ossutil extracted to: ${toolFile}`)
  }
  fs.chmodSync(toolFile, 0o755)

  // cache
  const fileName = process.platform === 'win32' ? 'ossutil.exe' : 'ossutil'
  const toolPath = await tc.cacheFile(toolFile, fileName, TOOL_NAME, version)
  core.debug(`ossutil cached to: ${toolPath}`)
  return toolPath
}

/**
 * Get the URL of the specific version of ossutil
 * @param version the version of ossutil to download
 * @returns the URL
 */
function getDownloadUrl(version: string): string {
  let downloadUrl = `http://gosspublic.alicdn.com/ossutil/${version}/`

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
