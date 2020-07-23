let parse = require('csv-parse/lib/sync')
let fs = require('fs')
let crypto = require('crypto')
let { URL } = require('url')

function loadCSV() {
  let content = fs.readFileSync('./中国近年文字狱事件盘点(twitter.com_SpeechFreedomCN) - 总表.csv', 'utf8')
  let records = parse(content, {
    columns: true,
    skip_empty_lines: true
  })
  return records
}

function loadStore() {
  let store = JSON.parse(fs.readFileSync('./database.json', 'utf8'))
  return store
}

function commitStore(store) {
  fs.writeFileSync('./database.json', JSON.stringify(store))
}

let records = loadCSV()
let json = records.map(r => ({raw: r, id: crypto.randomBytes(16).toString('hex')}))

commitStore(json)