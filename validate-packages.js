/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Follow instruction here https://docs.npmjs.com/verifying-the-pgp-signature-for-a-package-from-the-npm-public-registry

Install Keybase from https://keybase.io/download
Create a Keybase account on https://keybase.io
Follow "npmregistry" on Keybase (why? you may ask - see next line)
Easiest way to get NPM registry key into keybase: keybase pgp pull npmregistry
Install 'json' tool from https://www.npmjs.com/package/json. Use manually method
 cd ~/bin
 curl -L https://github.com/trentm/json/raw/master/lib/json.js > json
 chmod 755 json
Keybase doc https://book.keybase.io/docs/cli
 */
const { exec } = require('child_process');
const chalk = require('chalk');
const packageJson = require('./package');

let packages;

if (process.argv.slice(2).length === 0) {
  packages = packageJson.dependencies;
} else {
  console.log('Running validation against', process.argv.slice(2));
  packages = packageJson[process.argv.slice(2)[0]];
}

for (const package of Object.keys(packages)) {
  if (package.startsWith('@resideo')) {
    continue;
  }
  const version = packages[package].replace(/^[~^]/, '');
  const signName = package.replace(/[@/]/g, '-');

  const signatureLine = `this.data.dist.integrity='${package}@${version}:' + this.data.dist.integrity`;
  const signatureCommand = `yarn info ${package}@${version} -s --json \
  | json "data.dist.npm-signature" > signature-${signName}`;
  const integrityCommand = `yarn info ${package}@${version} -s --json \
  | json -e "${signatureLine}" \
  | json "data.dist.integrity"`;

  exec(signatureCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(chalk.red(`signature error: ${error.message}`));
      return;
    }
    if (stderr) {
      console.log(chalk.red(`signature stderr: ${stderr}`));
      return;
    }
    exec(integrityCommand, { shell: '/bin/bash' }, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red(`integrity error: ${error.message}`));
        return;
      }
      if (stderr) {
        console.log(chalk.red(`integrity stderr: ${stderr}`));
        return;
      }
      const integrity = stdout;
      const verify = `keybase pgp verify --signed-by npmregistry -d signature-${signName} -m ${integrity}`;
      exec(verify, (error, stdout, stderr) => {
        if (error) {
          console.log(
            chalk.bold.bgRed(`Signature Error for ${package}@${version}`)
          );
          console.log(error.message);
        }
        if (stderr) {
          // somehow the keybase output is in stderr
          console.log(chalk.green('Result'), stderr);
        }
        exec(`rm signature-${signName}`);
      });
    });
  });
}
