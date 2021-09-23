const fs = require('fs')
const archiver = require('archiver')
const path = require('path')

const output = fs.createWriteStream(path.resolve(__dirname, '../dist/yt-distraction-remover.zip'))
const archive = archiver('zip', {
  zlib: { level: 9 },
})

output.on('close', () => {
  console.log(`${archive.pointer()} total bytes`)
  console.log('Archived Successfully')
})

archive.on('error', function(err) {
  console.error(err)
})

archive.pipe(output)
archive.directory(
  path.resolve(__dirname, '../dist/build'),
  false,
)

archive.finalize()
