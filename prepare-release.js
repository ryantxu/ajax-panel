const fs = require('fs');
const versionDev = require('./package.json').version;
if (!versionDev.endsWith('-dev')) {
  console.warn('This script only works with a -dev version.  Not: ' + versionDev);
  process.exit(1);
}

// Check if the local branch has any changes not commited to git
const version = versionDev.substring(0, versionDev.lastIndexOf('-'));
const {execSync} = require('child_process');

const gitStatus = execSync('git status --untracked-files=no --porcelain');
if (gitStatus.length > 0) {
  console.warn('Make sure to commit all files before running this script:\n' + gitStatus);
  process.exit(1);
}

// exec('git ', function(err, stdout, stderr) {
//   if (err) {
//     console.warn('Error running git status: ', err);
//     process.exit(1);
//   }
//   console.log('[STATUS]', stdout);
// });

// // Make a branch with the current release name
// exec('git checkout -b release-' + version, function(err, stdout, stderr) {
//   if (err) {
//     console.warn('Error running git checkout: ', err);
//     process.exit(1);
//   }
//   console.log('[BRANCH]', stdout);
// });

console.log('prepare release: ', version);
