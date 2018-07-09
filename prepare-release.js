var fs = require('fs');
var versionDev = require('./package.json').version;
if (!versionDev.endsWith('-dev')) {
  console.warn('This script only works with a -dev version.  Not: ' + versionDev);
  process.exit(1);
}
var version = versionDev.substring(0, versionDev.lastIndexOf('-'));
exec('git checkout -b release-' + version, function(err, stdout, stderr) {
  if (err) {
    console.warn('Error running git checkout: ', err);
    process.exit(1);
  }
  console.log(stdout);
});

console.log('prepare release: ', version);
