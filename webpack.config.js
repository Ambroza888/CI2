const CopyPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const path = require('path');
const packageJson = require('./package.json');
const glob = require('glob');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const isProduction = process.env.MY_PROD === 'production';
/**
 * Extend the default Webpack configuration from nx / ng.
 */
module.exports = (config, context) => {
     // Extract output path from context
  const {
    options: { outputPath, sourceRoot },
  } = context;

  // Install additional plugins
  config.plugins = config.plugins || [];
  config.plugins.push(...extractRelevantNodeModules(outputPath, sourceRoot));
  // console.log(isProduction)
  return config;
};

/**
 * This repository only contains one single package.json file that lists the dependencies
 * of all its frontend and backend applications. When a frontend application is built,
 * its external dependencies (aka Node modules) are bundled in the resulting artifact.
 * However, it is not the case for a backend application (for various valid reasons).
 * Installing all the production dependencies would dramatically increase the size of the
 * artifact. Instead, we need to extract the dependencies which are actually used by the
 * backend application. We have implemented this behavior by complementing the default
 * Webpack configuration with additional plugins.
 *
 * @param {String} outputPath The path to the bundle being built
 * @returns {Array} An array of Webpack plugins
 */
function extractRelevantNodeModules(outputPath, sourceRoot) {
  if (isProduction) {
    return [copyPackageLockFile(outputPath, sourceRoot),generatePackageJson(),minifiedBundle()];
  } else {
    return [copyPackageLockFile(outputPath, sourceRoot), generatePackageJson()];
  }
}

/**
 * Copy the NPM lock file to the bundle to make sure that the right dependencies are
 * installed when running `npm install`.
 *
 * @param {String} outputPath The path to the bundle being built
 * @returns {*} A Webpack plugin
 */
function copyPackageLockFile(outputPath, sourceRoot) {
    let paths = [{ from: 'package-lock.json', to: path.join(outputPath, 'package-lock.json') }];
    if (glob.sync(path.join(sourceRoot, '/app.yaml')).length > 0) {
        paths.push({ from: path.join(sourceRoot, '/app.yaml'), to: path.join(outputPath, 'app.yaml') });
    }
    return new CopyPlugin({patterns: paths});
}

/**
 * Generate a package.json file that contains only the dependencies which are actually
 * used in the code.
 *
 * @returns {*} A Webpack plugin
 */
function generatePackageJson() {
  let frontendDependencies = [
    'angular', 
    'ionic',
    '@ngrx',
    'ngx',
    'capacitor'
  ]
  let dependencies = {};
  for (const property in packageJson.dependencies) {
    if ( !frontendDependencies.some(frontendDependencies => property.includes(frontendDependencies))) {
      dependencies[property] = packageJson.dependencies[property];
    }
  }

  const scripts = {
      "start": "node main.js",
    }
  const basePackageJson = {
    scripts,
    dependencies,
  };
  const pathToPackageJson = path.join(__dirname, 'package.json');
  return new GeneratePackageJsonPlugin(basePackageJson, pathToPackageJson);
};

function minifiedBundle() {
  return new MinifyPlugin({},{
    comments: false,
    sourceMap: false,
  });
};