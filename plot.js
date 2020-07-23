
let punishmentLevel = [
  '其他',
  '教育/训诫',
  '行政处罚/罚款',
  '开除/吊销/免职',
  '拘留',
  '有期徒刑'
]

function prepareData(raw) {
  let dataSets = []
  let x = []
  let y = []
  let hovertext = []

  raw.map(entry => {
    let date = new Date(entry.raw['日期'])
    x.push(date)
    y.push(punishmentLevel.findIndex(x => x == entry.punishment) + (Math.random() * 0.9 + 0.05))

    let entryText = `${entry.raw['日期']}, ${entry.raw['地点/单位']}<br>${entry.raw['人物']}<br>${entry.raw['言论主要内容']}<br>${entry.raw['处罚']}`
    hovertext.push(entryText)
  })

  return {
    type: 'scatter',
    mode: 'markers',
    hoverinfo: 'text',
    name: 'graph',
    marker: {
      symbol: 0,
      opacity: 0.5
    },
    x,
    y,
    hovertext,
    hoverlabel: {
      align: 'left'
    }
  }
}

fetch('https://raw.githubusercontent.com/duty-machine/speech-crime-in-china/master/database.json').then(e => e.json()).then(raw => {
  let data = prepareData(raw)

  let layout = {
    title: '因言获罪',
    hovermode: 'closest',
    dragmode: 'zoom',
    xaxis: {
      title: {
        text: '时间',
      },
      type: 'date',
      showgrid: true,
      rangeselector: {
        x: 0.1,
        y: 1,
        buttons: [
          {
            step: 'year',
            stepmode: 'backward',
            count: 5,
            label: '5y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 10,
            label: '10y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 15,
            label: '15y'
          },
          {
            step: 'year',
            stepmode: 'backward',
            count: 20,
            label: '20y'
          },
          {
            step: 'all'
          }
        ]
      },
      rangeslider: {
        bgcolor: '#E5ECF6',
        thickness: 0.15,
        yaxis: {
          rangemode: 'match'
        }
      },
      tickmode: 'linear',
      dtick: 'M12',
      tick0: '2000-01-01'
    },
    yaxis: {
      title: {
        text: '处罚'
      },
      ticktext: punishmentLevel.map(x => `${x}<br><br>`),
      tickvals: [0, 1, 2, 3, 4, 5],
      showgrid: true,
      fixedrange: false
    }
  }

  Plotly.newPlot('chart', [data], layout)
})
