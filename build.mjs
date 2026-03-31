import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/*! ${pkg.name} - v${pkg.version} - ${new Date().toISOString().slice(0, 10)} */`;

// Plugin to replace `require('leaflet')` with the global `L`
const leafletGlobalPlugin = {
  name: 'leaflet-global',
  setup(build) {
    build.onResolve({ filter: /^leaflet$/ }, () => ({
      path: 'leaflet',
      namespace: 'leaflet-global',
    }));
    build.onLoad({ filter: /.*/, namespace: 'leaflet-global' }, () => ({
      contents: 'module.exports = L;',
      loader: 'js',
    }));
  },
};

const sharedOptions = {
  entryPoints: ['src/TileLayer.PtvDeveloper.js'],
  bundle: true,
  format: 'iife',
  globalName: 'leafletPtvDeveloper',
  plugins: [leafletGlobalPlugin],
  banner: { js: banner },
};

// Unminified bundle
await esbuild.build({
  ...sharedOptions,
  outfile: 'dist/leaflet-ptv-developer-src.js',
});

// Minified bundle with source map
await esbuild.build({
  ...sharedOptions,
  outfile: 'dist/leaflet-ptv-developer.js',
  minify: true,
  sourcemap: true,
});

console.log('Build complete.');
