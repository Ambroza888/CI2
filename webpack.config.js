const CopyPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");

const path = require('path');
const packageJson = require('./package.json');
const glob = require('glob');
const nodeExternals = require('webpack-node-externals');
/**
 * Extend the default Webpack configuration from nx / ng.
 */
module.exports = (config, context) => {
  // Extract output path from context
  const {
    options: {
      outputPath,
      sourceRoot
    },
  } = context;
  // Install additional plugins
  config.plugins = config.plugins || [];
  config.plugins.push(...extractRelevantNodeModules(outputPath, sourceRoot));
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
  return [copyPackageLockFile(outputPath, sourceRoot), generatePackageJson(),tt()];
}

/**
 * Copy the NPM lock file to the bundle to make sure that the right dependencies are
 * installed when running `npm install`.
 *
 * @param {String} outputPath The path to the bundle being built
 * @returns {*} A Webpack plugin
 */
function copyPackageLockFile(outputPath, sourceRoot) {
  let paths = [{
    from: 'package-lock.json',
    to: path.join(outputPath, 'package-lock.json')
  }];
  if (glob.sync(path.join(sourceRoot, '/app.yaml')).length > 0) {
    paths.push({
      from: path.join(sourceRoot, '/app.yaml'),
      to: path.join(outputPath, 'app.yaml')
    });
  }
  return new CopyPlugin({
    patterns: paths
  });
}

/**
 * Generate a package.json file that contains only the dependencies which are actually
 * used in the code.
 *
 * @returns {*} A Webpack plugin
 */
function generatePackageJson() {
  // const implicitDeps = [
  //   'class-transformer',
  //   'class-validator',
  //   '@nestjs/platform-express',
  //   'reflect-metadata',
  //   'source-map-support'
  // ];
  // const dependencies = implicitDeps.reduce((acc, dep) => {
  //   acc[dep] = packageJson.dependencies[dep];
  //   return acc;
  // }, {});
  const dependencies = packageJson.dependencies;
  const scripts = {
    start: " node main.js",
  }
  const basePackageJson = {
    scripts,
    dependencies,
  };
  const pathToPackageJson = path.join(__dirname, 'package.json');
  return new GeneratePackageJsonPlugin(basePackageJson, pathToPackageJson);
}

function tt() {
  return new MinifyPlugin({},{
    comments: false,
    target: 'node',
        node: {
      fs: 'empty'
    },
    externals: [nodeExternals()],
    resolve: {
        extensions: ['.js','.ts']
      },
  });
};
  // {
  //   target: 'node',
  //   entry: './apps/express-app-5/src/main.ts',
  //   node: {
  //     fs: 'empty'
  //   },
  //   externals: [nodeExternals()], // // IT IS BEST PRACTICE TO EXLUDE NODE_MODULES WHEN BUNDLING FOR A BACKEND APP
  //   resolve: {
  //     extensions: ['.js','.ts']
  //   },
  //   output: {
  //     filename: 'bundle.js',
  //     path: path.resolve(__dirname, 'build')
  //   },
  //   plugins: [
  //     new MinifyPlugin({}, {
  //       comments:false
  //     })
  //   ]
  // }
  // return {
  //   target: 'node',
  //   entry: './dist/dope-cloud-webhook/app.js',
  //   node: {
  //     fs: 'empty'
  //   },
  //   externals: [nodeExternals()], // // IT IS BEST PRACTICE TO EXLUDE NODE_MODULES WHEN BUNDLING FOR A BACKEND APP
  //   resolve: {
  //     extensions: ['.js']
  //   },
  //   output: {
  //     filename: 'bundle.js',
  //     path: path.resolve(__dirname, 'build')
  //   }
  // }
