import core from '@actions/core';
import fs from 'fs';
import io from '@actions/io';
import os from 'os';
import path from 'path';
import tc from '@actions/tool-cache';

function mapArch(arch) {
  const mappings = {
    x64: 'amd64',
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux, win32...] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [darwin, linux, windows]
function mapOS(os) {
  const mappings= {
    win32: 'windows',
  };
  return mappings[os] || os;
}

// Rename integration-testing-cli-<platform>-<arch> to integration-testing-cli
// async function renameBinary(
//   pathToCLI
// ){
//     const source = path.join(pathToCLI, "integration-testing-cli");
//     const target = path.join(pathToCLI, 'integration-testing-cli');
//     core.debug(`Moving ${source} to ${target}.`);
//     try {
//       await io.mv(source, target);
//     } catch (e) {
//       core.error(`Unable to move ${source} to ${target}.`);
//       throw e;
//     }
// }

function getDownloadObject() {
    const platform = os.platform();
    const filename = `integration-testing-cli.exe`;
    const path = `releases/latest/download`;
    const url = `https://github.com/di-graph/integration-testing-cli/${path}/${filename}.tar.gz`;
    core.info(`url is ${url}`)
    const binaryName = platform === 'win32' ? 'integration-testing-cli.exe' : filename;
    return {url: "https://github.com/di-graph/integration-testing-cli/archive/refs/tags/v0.1.tar.gz", binaryName: binaryName}
  }
  
async function setup() {
    try {
        // Download the specific version of the tool, e.g. as a tarball/zipball
        const download = getDownloadObject();
        core.info(`url is ${download.url}`)
    
        const pathToTarball = await tc.downloadTool(download.url);
        core.info(`path to tarball is ${pathToTarball}`)

        // Extract the tarball onto host runner
        let pathToCLI = await tc.extractTar(pathToTarball);
        core.info(`extracted pathToCLI is ${pathToCLI}`)
        // await renameBinary(pathToCLI);
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

          pathToCLI = path.join(pathToCLI, 'integration-testing-cli');
      });

        // Expose the tool by adding it to the PATH
        core.addPath(pathToCLI);

        core.info(`pathToCLI is ${pathToCLI}`)

        core.info(`Setup Integration Testing CLI`);



    } catch (e) {
        core.setFailed(e);
      }
}

void setup();