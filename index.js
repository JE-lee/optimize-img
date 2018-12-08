const tinifyImage = require("./tinify")
const util = require("./util")
const Path = require("path")
const mkDir = require('make-dir')
const chalk = require('chalk')
const linelog = require('single-line-log').stdout

const dir = Path.resolve(__dirname, "./assets")
const dest = Path.resolve(__dirname, './dist')

mkDir(dest)

;(async () => {
  let files = await util.walk(dir),
    total = files.length
  console.log(`开始压缩${total}张图片...`)
  let count = 0
  let results = await Promise.all(files.map(
      f => 
      tinifyImage(f, f.replace('assets','dist'))
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

  console.log('finish')
})();
