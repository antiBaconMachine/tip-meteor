Package.describe({
  name: 'fixtures',
  version: '0.0.1',
  summary: 'Shared test fixtures',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('fixtures.js');
  api.export("Fixtures");
});
