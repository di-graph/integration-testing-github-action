import core from '@actions/core';
import fs from 'fs';
import github from '@actions/github';
import io from '@actions/io';
import os from 'os';
import path from 'path';
import semver from 'semver';
import tc from '@actions/tool-cache';

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    x64: 'amd64',
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings = {
    win32: 'windows',
  };
  return mappings[os] || os;
}

function getDownloadObject(version){
  const platform = os.platform();
  const filename = `integration-testing-cli-${mapOS(platform)}-${mapArch(os.arch())}`;
  const binaryName = platform === 'win32' ? 'integration-testing-cli.exe' : filename;
  const url = `https://github.com/di-graph/integration-testing-cli/archive/refs/tags/v${version}.tar.gz`;
  return {
    url,
    binaryName,
  };
}

// Rename integration-testing-cli-<platform>-<arch> to integration-testing-cli
async function renameBinary(
  pathToCLI,
  binaryName
){
  if (!binaryName.endsWith('.exe')) {
    const source = path.join(pathToCLI, binaryName);
    const target = path.join(pathToCLI, 'integration-testing-cli');
    core.debug(`Moving ${source} to ${target}.`);
    try {
      await io.mv(source, target);
    } catch (e) {
      core.error(`Unable to move ${source} to ${target}.`);
      throw e;
    }
  }
}

async function getVersion() {
  const version = core.getInput('version');
  return version
}

async function setup() {
    try {
        const platform = os.platform();
        const arch = os.arch();
        core.info(`platform is ${platform}`)
        core.info(`arch is ${arch}`)
        // Download the specific version of the tool, e.g. as a tarball/zipball
        const version = await getVersion();

        const download = getDownloadObject(version);
        core.info(`url is ${download.url}`)
    
        const pathToTarball = await tc.downloadTool(download.url);
        core.info(`path to tarball is ${pathToTarball}`)

        // Extract the tarball onto host runner
        let pathToCLI = await tc.extractTar(pathToTarball);
        core.info(`extracted pathToCLI is ${pathToCLI}`)

        pathToCLI = path.join(pathToCLI, `integration-testing-cli-${version}`);
        
        await renameBinary(pathToCLI, download.binaryName);
        
        fs.readdir(pathToCLI, function (err, files) {
          //handling error
          if (err) {
              return core.setFailed('Unable to scan directory: ' + err);
          } 
          //listing all files using forEach
          files.forEach(function (file) {
              // Do whatever you want to do with the file
              core.info(file); 
          });
          // Expose the tool by adding it to the PATH
          core.addPath(pathToCLI);

          core.info(`pathToCLI is ${pathToCLI}`)

          core.info(`Setup Integration Testing CLI`);


      });
    } catch (e) {
        core.setFailed(e);
      }
}

void setup();