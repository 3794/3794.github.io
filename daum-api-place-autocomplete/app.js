
var autocomplete = (function() {
var autocomplete = function(that) {
   var registry = {}
   var my = {}

   //options
   // my.type = 'all' // 'local' 전체 검색 or 지역 반경 검색  local인 경우 중심좌표 location이 있어야 하고 radius가 있어야 함.
   // my.radius = 5000 //기본값 5000, 최소값 0, 최대값 20000
   // my.count = 15 //한 페이지 당 건수 기본 15, 최소 1, 최대 15
   // my.page = 1 //페이지 번호 기본 1, 최소 1, 최대 3
   // my.sort = 0 //실제정확도 기본값 0: 정확도순, 1: 인기순, 2: 거리순

   //private
   var items = []
   var itemIndex = -1
   var container = ''
   var old = ''

   that.setAttribute("autocomplete", "off")

   my.init = function() {

      var css = '.pac-container{background-color:#fff;position:absolute!important;z-index:1000;border-radius:2px;border-top:1px solid #d9d9d9;font-family:Arial,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.3);-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden}.pac-logo:after{content:"";padding:1px 1px 1px 0;height:16px;text-align:right;display:block;background-image:url(https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png);background-position:right;background-repeat:no-repeat;background-size:120px 14px}.hdpi.pac-logo:after{background-image:url(https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3_hdpi.png)}.pac-item{cursor:default;padding:0 4px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;line-height:30px;text-align:left;border-top:1px solid #e6e6e6;font-size:11px;color:#999}.pac-item:hover{background-color:#fafafa}.pac-item-selected,.pac-item-selected:hover{background-color:#ebf2fe}.pac-matched{font-weight:700}.pac-item-query{font-size:13px;padding-right:3px;color:#000}.pac-icon{width:15px;height:20px;margin-right:7px;margin-top:6px;display:inline-block;vertical-align:top;background-image:url(https://maps.gstatic.com/mapfiles/api-3/images/autocomplete-icons.png);background-size:34px}.hdpi .pac-icon{background-image:url(https://maps.gstatic.com/mapfiles/api-3/images/autocomplete-icons_hdpi.png)}.pac-icon-search{background-position:-1px -1px}.pac-item-selected .pac-icon-search{background-position:-18px -1px}.pac-icon-marker{background-position:-1px -161px}.pac-item-selected .pac-icon-marker{background-position:-18px -161px}.pac-placeholder{color:gray}'
      insertCss(css)

      container = document.createElement('div')
      container.className = 'pac-container'
      container.style.width = (that.offsetWidth) + 'px'
      container.style.left = (getPosition(that).x) + 'px'
      container.style.top = (getPosition(that).y) + 'px'
      container.style.display = 'none'
      container = container

      document.body.appendChild(container)
      
      document.addEventListener('click', function(e) {
         var isthat = that.contains(e.target);
         if (!isthat) {
            my.close()
         }else{
            my.restore()
         }
      })
   
      // that.addEventListener('input', function(e) {
         
         
      // })
      that.addEventListener('keydown', function(e) {
         
         if(e.keyCode === 38 || e.keyCode === 40) { // up and down
            e.preventDefault()
            my.restore()
            e.keyCode === 38 ? my.previous() : my.next()
            
         
         } else if(e.keyCode === 13) {
            
            if(itemIndex > -1 && itemIndex < items.length) {
               that.fire({ type: 'place_changed', item: items[itemIndex]}) 
            } 
            my.close()

            if(itemIndex > -1){ //class 지우고화
               var nodes = container.children   
               removeClassName(nodes[itemIndex], 'pac-item-selected')
            }
            itemIndex = -1 //인덱스 초기
         } else {
            setTimeout(function(){ //fixed input deley
               if(e.target.value !== '') {
                  if(e.target.value !== old){

                     
                     itemIndex = -1 //인덱스 초기
                     
                     my.close()
                     empty_element(container)
                     my.open()//before callback open container
                     that.request(e.target.value, function(_items) {
                        
                        empty_element(container)
                        items = _items
                        items.forEach(function(item) {
                           container.appendChild(that.ItemComponent(item, function(node, item) {
                              if(node && item){
                                 node.addEventListener('click', function(e) {
                                    that.fire({ type: 'place_changed', item: item}) 
                                    
                                    my.close()
                                 })
                              }
                           }))
                        })
                     })
                     old = e.target.value
                  }  
               }else{
                  my.close()
               }

            }, 1)
                  
         }
      })
   }

   my.restore = function() {
      
      var nodes = container.children
      if(nodes.length < 1 && items.length > 0){


         empty_element(container) // 컨테이너를 닫을때마다 앨리먼트를 삭제하기 때문에 마지막 아이템리스트를 복구한다.
         my.open()
         items.forEach(function(item) {
            container.appendChild(that.ItemComponent(item, function(node, item) {
               if(node && item){
                  node.addEventListener('click', function(e) {
                     that.fire({ type: 'place_changed', item: item}) 
                     
                     my.close()
                  })
               }
            }))
         })
      }
   }

   my.close = function() {

      container.style.display = 'none'
      empty_element(container)
      itemIndex = -1
   }
   my.open = function() {
      
      
         container.style.display = 'block'
         
         
      

      
   }
   my.next = function() {
      if(items.length > 0){
         var nodes = container.children   
         var index = itemIndex + 1 
         if(nodes.length - 1 >= index){
            my.goto(index)
         } else {
            my.goto(-1)
         }  
      }
      
   }
   my.previous = function() {
      if(items.length > 0){

         var index = itemIndex - 1
         if(index >= -1){
            my.goto(index)
         } else {
            var nodes = container.children   
            my.goto(nodes.length - 1 )
         }
      }
      
   }

   my.goto = function(index) {
      var nodes = container.children
      if(itemIndex > -1){
         removeClassName(nodes[itemIndex], 'pac-item-selected')
      }
      if(index > -1){
         nodes[index].classList ? nodes[index].classList.add('pac-item-selected') : nodes[index].className += ' pac-item-selected' 
      }
      itemIndex = index

   }
   
   //service
   that.request = function(param, cb){
      // param으로 요청
      if(param == '') {
         cb([])
      }
      cb(data.channel.item)
   }

   


   /**
    * cb(node, item)
    */
   that.ItemComponent = function(item, cb) {
      var pacItem = document.createElement('div')
      pacItem.className = 'pac-item' //pac-item-seleted
      var pacIcon = document.createElement('span')
      pacIcon.className = 'pac-icon pac-icon-marker' //'pac-icon pac-icon-search'
      var pacItemQuery = document.createElement('span')
      pacItemQuery.className = 'pac-item-query'

      pacItemQuery.appendChild(document.createTextNode(item.title))

      pacItem.appendChild(pacIcon)
      pacItem.appendChild(pacItemQuery)

      //
      cb(pacItem, item)

      //render
      return pacItem
   }



   //handler
   that.fire = function(event) {

      var array,
         func,
         handler,
         i,
         type = typeof event === 'string' ? event : event.type

      if(registry.hasOwnProperty(type)) {
         array = registry[type]
         for(i = 0; i < array.length; i+=1) {

            handler = array[i];
            func = handler.method
            if(typeof func === 'string') {
               func = this[func]
            }

            func.apply(this, handler.parameters || [event])
         }
      }

      return this
   }

   that.addListener = function(type, method, parameters) {
      var handler = {
         method: method,
         parameters: parameters
      }
      if(registry.hasOwnProperty(type)) {
         registry[type].push(handler)
      } else {
         registry[type] = [handler]
      }
      return this
   }


   that.addListener('place_changed', function(e) {
      //do something
   })

   if (typeof Document !== "undefined") {
      // DOM already loaded?
      if (document.readyState !== "loading") {
         my.init()
      }
      else {
         // Wait for it
         document.addEventListener("DOMContentLoaded", my.init);
      }
   }

   return that

}


//util
function removeClassName(elem, name){
    var remClass = elem.className;
    var re = new RegExp('(^| )' + name + '( |$)');
    remClass = remClass.replace(re, '$1');
    remClass = remClass.replace(/ $/, '');
    elem.className = remClass;
}

function getPosition(e) {
   var rect = e.getBoundingClientRect() 
   return { y:rect.bottom, x: rect.left }
}

function insertCss(cssCode) {
   var styleElement = document.createElement("style");
   styleElement.type = "text/css";
   if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssCode;
   } else {
      styleElement.appendChild(document.createTextNode(cssCode));
   }
   document.getElementsByTagName("head")[0].appendChild(styleElement);
}

function empty_element(element) {

   var node = element;

   while (element.hasChildNodes()) { 

      if (node.hasChildNodes()) {
         node = node.lastChild;
      } else {
         
         node = node.parentNode;
         node.removeChild(node.lastChild);
      }
   }
}

return autocomplete
})()
