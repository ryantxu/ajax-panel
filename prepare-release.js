const fs = require('fs');
const versionDev = require('./package.json').version;
if (!versionDev.endsWith('-dev')) {
  console.warn('This script only works with a -dev version.  Not: ' + versionDev);
  process.exit(1);
}

// Check if the local branch has any changes not commited to git
const version = versionDev.substring(0, versionDev.lastIndexOf('-'));
const {execSync} = require('child_process');

let output = execSync('git status --untracked-files=no --porcelain');
if (false && output.length > 0) {
  console.warn('Make sure to commit all files before running this script:\n' + output);
  process.exit(1);
}

console.log('Checkout and publish release branch');
execSync('git checkout -b release-' + version);

function searchReplaceFile(regexpFind, replace, theFileName) {
  var file = fs.createReadStream(theFileName, 'utf8');
  var newText = '';

  file.on('data', function(chunk) {
    newText += chunk.toString().replace(regexpFind, replace);
  });

  file.on('end', function() {
    fs.writeFile(theFileName, newText, function(err) {
      if (err) {
        return console.warn(err);
      }
    });
  });
}

console.log('Replace in files');
searchReplaceFile(versionDev, version, 'package.json');
searchReplaceFile('dist/', '', '.gitignore');

// console.log('Test');
// execSync('yarn test');

console.log('Building...');
execSync('yarn build');

console.log('Save the artifacts in git');
execSync('git add --all');
//execSync(`git commit -m 'adding release artifacts: ${version}'`);

console.log('TODO.. release: ', version);
