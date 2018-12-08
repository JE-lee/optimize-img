#!/usr/bin/env node

const tinifyImage = require("./tinify")
const util = require("./util")
const Path = require("path")
const mkDir = require('make-dir')
const chalk = require('chalk')
const linelog = require('single-line-log').stdout

const program = require('commander')

// 解析comman line
program
  .version('0.0.1')
  .option('-s, --source [dir]', 'specify images source directory')
  .option('-d, --dest [dest]', 'specify output dir. if without dest, the Images will be coverd')
  .parse(process.argv)


const dir = program.source || process.cwd()
const dest = program.dest ? program.dest.trim() : ''

if(dest){ 
  mkDir(dest)
}

/**
 * 
 * @param {String} source | file path
 * @param {String} dest | dir path
 */
let tranform = function(source, dest){
  return Path.normalize(source.replace(dir, dest))
}


;(async () => {
  let files = await util.walk(dir),
    total = files.length
  console.log(`start to compress ${total} images...`)
  let count = 0
  let results = await Promise.all(files.map(
      f => 
      tinifyImage(f, tranform(f, dest), !dest)
      .then((res) => {
        linelog(`${ ((++count) / total).toFixed(2) * 100 }%`)
        return res
      })
    )
  )

  linelog.clear()

  // 打印结果
  results.forEach(result => {
    if(result.err){
      console.log(chalk.red(
        `${result.source} compress fail !!!
        ${err}`
    ))
    }else{
      console.log(chalk.green(
        `${result.source} compress success !!! 
        tinified size: ${result.tinifySize} ---> tinify ratio:`
    ), chalk.yellow(`${result.tinifyRatio}`))
    }
  })

  console.log(`compress finish !!! success: ${results.filter(f => !f.err).length} fail: ${results.filter( f => f.err ).length}`)
})();
