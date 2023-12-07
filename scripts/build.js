const path = require('node:path')
const fs = require('node:fs')

const webpack = require('webpack')
const fsx = require('fs-extra')
const c = require('ansi-colors')
const archiver = require('archiver')

const config = require('../webpack.config')

let mode = 'production'

if (process.argv.includes('--dev')) {
  mode = 'development'
}

function compileCode() {
  return new Promise((res) => {
    webpack({
      mode,
      devtool: false,
      ...config,
    }, (err, stats) => {
      if (err) {
        console.log(c.red('ERROR'))
        console.log(c.red(err.message))
        process.exit(0)
      }
      console.log(stats.toString())
      res()
    })
  })
}

function archiveBuild(fileName, dirName) {
  return new Promise((res, rej) => {
    const output = fs.createWriteStream(path.resolve(__dirname, `../dist/${fileName}`))
    const archive = archiver('zip', {
      zlib: { level: 9 },
    })
    output.on('close', () => {
      res()
    })
    
    archive.on('error', function(err) {
      console.log(err)
      rej()
    })

    archive.pipe(output)
    archive.directory(
      path.resolve(__dirname, `../dist/${dirName}`),
      false,
    )
    archive.finalize()
  })
}

async function bundleExtension(target, archive = true) {
  const buildPath = path.resolve(__dirname, `../dist/${target}-build`)
  await fsx.mkdir(buildPath)
  await fsx.copy(path.resolve(__dirname, '../dist/build'), buildPath)
  await fsx.copy(
    path.resolve(__dirname, `../src/manifest.${target}.json`),
    `${buildPath}/manifest.json`
  )
  archive && await archiveBuild(`yt-distraction-remover-${target}.zip`, `${target}-build`)
}

async function run() {
  await fsx.remove(path.resolve(__dirname, '../dist'))
  console.log(c.bgBlue.bold('Compiling...'))
  await compileCode()
  console.log(c.bgBlue.bold('Bundling...'))
  await bundleExtension('firefox')
  console.log(c.green('Successfully bundled Firefox'))
  await bundleExtension('chrome', mode === 'production')
  console.log(c.green('Successfully bundled Chrome'))
  console.log(c.bgGreen.bold('Build Success'))
}

run()

