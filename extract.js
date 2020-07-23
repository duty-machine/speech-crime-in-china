let parse = require('csv-parse/lib/sync')
let fs = require('fs')
let crypto = require('crypto')
let { URL } = require('url')
let readline = require('readline')


let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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

//let records = loadCSV()
//let json = records.map(r => ({raw: r, id: crypto.randomBytes(16).toString('hex')}))

//commitStore(json)

function prompt(diff, _new, old) {
  return new Promise((resolve) => {
    console.log(`difference: ${diff}`)
    console.log('new:')
    console.log(_new)
    console.log('old:')
    console.log(old)
    rl.question(`new(n) or update(u)? `, answer => {
      resolve(answer)
    })
  })
}

async function updateDatabaseByCSV(path) {
  let content = fs.readFileSync(path, 'utf8')
  let records = parse(content, {
    columns: true,
    skip_empty_lines: true
  })

  let currentDatabase = loadStore()

  let currentHash = currentDatabase.reduce((hash, entry) => {
    hash[JSON.stringify(entry.raw)] = entry
    return hash
  }, {})

  let toUpdate = records.filter(r => {
    return !currentHash.hasOwnProperty(JSON.stringify(r))
  })

  let differences = toUpdate.map(r => {
    return currentDatabase.reduce((bestMatch, entry) => {
      let difference = Object.keys(r).reduce((difference, key) => {
        if (r[key] == entry.raw[key]) {
          return difference
        } else {
          return difference + 1
        }
      }, 0)

      let diff = {
        difference,
        id: entry.id,
        new: r,
        old: entry.raw
      }

      if (bestMatch) {
        if (bestMatch.difference > difference) {
          return diff
        } else {
          return bestMatch
        }
      } else {
        return diff
      }
    }, null)
  })

  for (i in differences) {
    if (differences[i].difference == 1) {
      let toUpdate = currentDatabase.find(entry => {
        return entry.id == differences[i].id
      })
      toUpdate.raw = differences[i].new
      commitStore(currentDatabase)
      continue
    }
    let strategy = await prompt(differences[i].difference, differences[i].new, differences[i].old)
    switch(strategy) {
      case 'n':
        currentDatabase.push({raw: differences[i].new, id: crypto.randomBytes(16).toString('hex')})
        commitStore(currentDatabase)
        break
      case 'u':
        let toUpdate = currentDatabase.find(entry => {
          return entry.id == differences[i].id
        })
        toUpdate.raw = differences[i].new
        commitStore(currentDatabase)
        break
    }
  }

  console.log(`csv: ${records.length}`)
  console.log(`database: ${currentDatabase.length}`)

  let csvHash = records.reduce((hash, entry) => {
    hash[JSON.stringify(entry)] = entry
    return hash
  }, {})

  currentDatabase.filter(entry => {
    if (csvHash[JSON.stringify(entry.raw)] == null) {
      console.log(entry)
    }
  })


}

updateDatabaseByCSV('./中国近年文字狱事件盘点(twitter.com_SpeechFreedomCN) - 总表(1).csv')