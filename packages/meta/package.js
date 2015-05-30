Package.describe({
  name: 'abm:meta',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use("udondan:yml");
  api.addFiles('changelog.yaml', ['server', 'client'], {isAsset: true});
  api.addFiles('meta.js', 'server');
  api.addFiles('client.js', 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('abm:meta');
  api.addFiles('meta-tests.js');
});
