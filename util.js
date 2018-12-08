const fs = require('fs')
const util = require('util')
const Path = require('path')

const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)

async function walk(dir){
  let result = []
  let files = await readdir(dir)
  for(let i =0; i< files.length; i++){
    let file = files[i]
    let filePath = Path.resolve(dir, file)
    let fstat = await stat(filePath)
    if(fstat.isDirectory()){
      result = result.concat(await walk(filePath))
    }else {
      result.push(filePath)
    }
  }
  
  return result
}

module.exports = {
  walk
}