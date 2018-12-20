(function() {
// ?fdt=.abc,background-color,red&fdt=.def,width,100,px

var elContainer = document.createElement('DIV')
var elTable = document.createElement('TABLE')

location.search.substr(1).split('&')
.map(query => query.split('='))
.filter(query => query[0] === 'fdt')
.map(query => {
  var values = query[1].split(',')
  return {
    selector: values[0], 
    prop: values[1], 
    value: values[2], 
    type: values[3] || 'string', 
  }
})
.map(state => {
  var elItem = document.querySelector(state.selector)
  var elIp = document.createElement('input')

  var isNumber = state.type == 'px' || state.type === '%'

  elIp.type = isNumber ? 'number' : 'text'
  elIp.value = state.value

  elIp.addEventListener('change', e => {
    if (state.type !== 'string') {
      elItem.style[state.prop] = e.target.value + state.type
    } else {
      elItem.style[state.prop] = e.target.value
    }
  })
  return { elIp, state }
})
.map(({ elIp, state }) => {
  var td1 = document.createElement('TD')
  var td2 = document.createElement('TD')
  var td3 = document.createElement('TD')
  var tr = document.createElement('TR')

  td1.innerText = state.selector 
  td2.innerText = state.prop 
  td3.appendChild(elIp)
  tr.appendChild(td1)
  tr.appendChild(td2)
  tr.appendChild(td3)

  return tr
}).forEach(tr => {
  elTable.appendChild(tr)
})

elContainer.style.position = 'fixed'
elContainer.style.top = 0
elContainer.style.right = '-300px'
elContainer.style.backgroundColor = 'gray'
elContainer.style.opacity = 0.5
elContainer.style.transition = 'all 1s'

elContainer.appendChild(elTable)
document.body.appendChild(elContainer)

var flag = true
document.addEventListener('keydown', function(event) {
  var KEYR = 82
  if(event.ctrlKey && event.keyCode == KEYR ) {
    if (flag) {
      elContainer.style.transform = 'translate(-300px, 0)'
      flag = false
    } else {
      elContainer.style.transform = 'translate(0, 0)'
      flag = true
    }
  }
})
})()
