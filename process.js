let fs = require('fs')
let { URL } = require('url')

function loadStore() {
  let store = JSON.parse(fs.readFileSync('./database.json', 'utf8'))
  return store
}

function commitStore(store) {
  fs.writeFileSync('./database.json', JSON.stringify(store))
}

let database = loadStore()

database.map(entry => {
  if (entry.raw['处罚'].match(/有期徒刑/)) {
    entry.punishment = '有期徒刑'
  } else if (entry.raw['处罚'].match(/拘|羁押/)) {
    entry.punishment = '拘留'
  } else if (entry.raw['处罚'].match(/开除|吊销|免职|解聘|停职|撤职/)) {
    entry.punishment = '开除/吊销/免职'
  } else if (entry.raw['处罚'].match(/行政处罚|罚款|治安处罚/)) {
    entry.punishment = '行政处罚/罚款'
  } else if (entry.raw['处罚'].match(/教|训|警告|批评/)) {
    entry.punishment = '教育/训诫'
  } else {
    entry.punishment = '其他'
  }
})

commitStore(database)

let notAssignedPunishment = database.filter(x => !x.punishment)

console.log(notAssignedPunishment)