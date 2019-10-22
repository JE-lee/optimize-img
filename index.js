#!/usr/bin/env node
const tinifyImage = require('./tinify')
const Path = require('path')
const chalk = require('chalk')
const linelog = require('single-line-log').stdout
const fs = require('fs')
const globby = require('globby')
const stream = require('stream')
const program = require('commander')

// parse comman line
program
  .version('0.0.1')
  .option('-k, --key [key]', 'store your tinify key')
  .parse(process.argv)

function storekey(key) {
  let source = new stream.PassThrough()
  source.end(key)
  let ws = fs.createWriteStream(Path.resolve(__dirname, './xx.key'))
  return new Promise((resolve, reject) => {
    source
      .pipe(ws)
      .on('finish', () => resolve())
      .on('error', reject)
  })
}
;(async () => {
  if (program.key) {
    await storekey(program.key)
    console.log('set key success')
    return
  }
  // 先读取key
  let keypath = Path.resolve(__dirname, './xx.key'),
    key = program.key
  if (fs.existsSync(keypath)) {
    key = fs.readFileSync(keypath, 'utf8')
  }

  //
  if (!key) {
    console.log('please set the tinify key first')
    return
  }

  const cwd = process.cwd()
  let patterns = (program.args[0] || '**')
    .split(',')
    .map(pattern => pattern.replace(/\\/g, '/'))
  let files = (await globby(patterns)).map(file => Path.join(cwd, `/${file}`))

  let total = files.length
  console.log(`start to compress ${total} images...`)
  let count = 0
  let results = await Promise.all(
    files.map(f =>
      tinifyImage(f, f, key).then(res => {
        linelog(`${(++count / total).toFixed(2) * 100}%`)
        return res
      })
    )
  )

  linelog.clear()

  // log
  results.forEach(result => {
    if (result.err) {
      console.log(
        chalk.red(
          `${result.source} compress fail !!!
        ${result.err}`
        )
      )
    } else {
      console.log(
        chalk.green(
          `${result.source} compress success !!! 
        tinified size: ${result.tinifySize} ---> tinify ratio:`
        ),
        chalk.yellow(`${result.tinifyRatio}`)
      )
    }
  })

  console.log(
    `compress finish !!! success: ${results.filter(f => !f.err).length} fail: ${
      results.filter(f => f.err).length
    }`
  )
})()
