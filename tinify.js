const tinify = require('tinify')
const fs = require('fs')
const util = require('util')
const Stream = require('stream')
const Path = require('path')

const readFile = util.promisify(fs.readFile)

/**
 *
 * @param {String} source
 * @param {String} dest
 */
module.exports = async function tinifyImage(source, dest, key) {
  tinify.key = key
  let sourceData = null
  try {
    sourceData = await readFile(source)
  } catch (error) {
    return Promise.resolve({
      err: `${source} did not find`,
      source,
    })
  }

  return new Promise((resolve, reject) => {
    tinify.fromBuffer(sourceData).toBuffer((err, resultData) => {
      if (err) {
        resolve({
          err: err || 'error',
          source,
        })
      } else {
        let stream = new Stream.PassThrough(),
          wstream = fs.createWriteStream(
            Path.parse(dest).ext
              ? dest
              : Path.resolve(dest, Path.parse(source).base)
          )
        stream.end(resultData)
        stream
          .pipe(wstream)
          .on('finish', () => {
            let originSize = sourceData.length,
              tinifySize = resultData.length
            resolve({
              source,
              dest,
              originSize: `${(originSize / 1024).toFixed(2)}Kb`,
              tinifySize: `${(tinifySize / 1024).toFixed(2)}Kb`,
              tinifyRatio: `${(1 - tinifySize / originSize).toFixed(2) * 100}%`,
            })
          })
          .on('error', err => reject(err))
      }
    })
  })
}
