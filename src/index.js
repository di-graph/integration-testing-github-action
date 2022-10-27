const core = require('@actions/core');

const tc = require('@actions/tool-cache');

function getDownloadObject() {
    const url = `https://github.com/di-graph/integration-testing-cli/archive/refs/tags/v0.0.tar.gz`;
    return url
  }
  
async function setup() {
    try {
        // Download the specific version of the tool, e.g. as a tarball/zipball
        const download = getDownloadObject();
        const pathToTarball = await tc.downloadTool(download);

        // Extract the tarball onto host runner
        const pathToCLI = await tc.extractTar(pathToTarball);
        
        // Expose the tool by adding it to the PATH
        core.addPath(pathToCLI);

        core.info(`Setup Integration Testing CLI`);



    } catch (e) {
        core.setFailed(e);
      }
}

void setup();