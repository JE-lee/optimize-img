#!/usr/bin/env node

const tinifyImage = require('./tinify')
const Path = require('path')
const mkDir = require('make-dir')
const chalk = require('chalk')
const linelog = require('single-line-log').stdout
const fs = require('fs')
const glob = require('glob')
const stream = require('stream')

const program = require('commander')

// parse comman line

program
  .version('0.0.1')
  .option('-s, --source [dir]', 'specify images source directory')
  .option(
    '-d, --dest [dest]',
    'specify output dir. if without dest, the Images will be coverd'
  )
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

function handleCommander(_source = '', _dest = '') {
  let cwd = process.cwd(),
    dir = _source,
    dest = _dest ? Path.resolve(cwd, _dest) : cwd,
    type = 'glob'

  function isHasExt(path) {
    return !!Path.parse(path).ext
  }
  if (!isHasExt(dir)) {
    // 1. no -s or -d
    dir = dir ? Path.resolve(cwd, dir) : cwd
    // if the dest is not a directory, use the file dir for the dest
    if (isHasExt(dest)) {
      dest = Path.parse(dest).dir.replace(/\*/g, 'tiny')
    }

    // add glob
    dir = Path.join(dir, '**/*.?(png|jpg)')
  } else {
    // 2. source params is a file name or serveral file name joined with comma
    //    dest params must be a file path or a directory path.

    if (dir.indexOf('*') != -1) {
      // if has glob
      dir = Path.resolve(cwd, dir)
      // dest is not a directory
      if (isHasExt(dest)) {
        dest = Path.parse(dest).dir.replace(/\*/g, 'tiny')
      }
    } else {
      // specific file name
      type = 'files'
      dir = dir.split(',').map(i => Path.resolve(cwd, i))
      if (dir.length > 1 && isHasExt(dest)) {
        dest = Path.parse(dest).dir.replace(/\*/g, 'tiny')
      } else if (dir.length == 1 && !isHasExt(dest)) {
        dir = dir[0]
        dest = Path.resolve(dest, Path.parse(dir).base)
      }
    }
  }
  return { type, dir, dest }
}

function walk(pattern) {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, files) => {
      if (err) return reject(err)
      else resolve(files)
    })
  })
}

let op = handleCommander(program.source, program.dest)
if (op.type == 'glob') mkDir(op.dest)
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

  let files = []
  if (op.type == 'files') {
    files = op.dir
  } else {
    files = await walk(op.dir)
  }

  let total = files.length
  console.log(`start to compress ${total} images...`)
  let count = 0
  let results = await Promise.all(
    files.map(f =>
      tinifyImage(f, op.dest, key).then(res => {
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
