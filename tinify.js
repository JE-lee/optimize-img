const tinify = require('tinify')
const fs = require('fs')
const util = require('util')
const Stream = require('stream')

const readFile = util.promisify(fs.readFile)

tinify.key = '71VjKYqfknJkXBLVLq6zynHb4m8WCWrW'

/**
 * 
 * @param {String} source 
 * @param {String} dest 
 */
module.exports = async function tinifyImage(source, dest, cover){
  let sourceData = await readFile(source)
  return new Promise((resolve, reject) => {
    tinify.fromBuffer(sourceData).toBuffer((err, resultData) => {
      if(err){
        resolve({ 
          err,
          source
        })
      }else {
        let stream = new Stream.PassThrough(),
          wstream = fs.createWriteStream(cover ? source : dest)
        stream.end(resultData)
        stream.pipe(wstream).on('finish',() => {
          let originSize = sourceData.length,
          tinifySize = resultData.length
          resolve({
            source,
            dest,
            originSize: `${(originSize / 1024).toFixed(2)}Kb`,
            tinifySize: `${(tinifySize / 1024).toFixed(2)}Kb`,
            tinifyRatio: `${(1 - (tinifySize / originSize)).toFixed(2)*100}%`
          })
        }).on('error', err => reject(err))
      }
       
    })
  })
  
}