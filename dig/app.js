var awareTiles = function() {
  var tileSize = 16;
  
  function clientPosToCanvas(canvas, xClient, yClient) {
    var rect = canvas.getBoundingClientRect();
    var xCanvas = xClient - rect.left;
    var yCanvas = yClient - rect.top;
    // .width gives the internal width of canvas
    // .scrollWidth gives the width at which it is actually displayed
    // the "client" position values are in same scale as scrollWidth 
    // and require scaling to true internal-to-canvas space.
    var scale = canvas.width / canvas.scrollWidth;
    return {
      x: Math.floor(xCanvas * scale),
      y: Math.floor(yCanvas * scale)
    }
  };
  
  var tileSheet = function() {
    var sheetImage;
    window.addEventListener("load", function() {
      sheetImage = document.getElementById("tileSheet");
    });
    
    function draw(context, index, x, y) {
      if (sheetImage === undefined) return;
      
      xStart = index * tileSize;
      context.drawImage(sheetImage,
        xStart, 0,
        tileSize, tileSize,
        x, y,
        tileSize, tileSize
      );
    }
    
    return {
      draw: draw
    };
  }();
  
  function calcTileIndex(above, left, below, right) {
    var sum = 0;
    if (above) sum += 1;
    if (left)  sum += 2;
    if (below) sum += 4;
    if (right) sum += 8;
    return sum;
  };
  
  var singleDemo = function() {
    var canvas = document.getElementById("singleTileCanvas");
    var context = canvas.getContext("2d");
    var outputText = document.getElementById("singleText");
    
    function createNeighbour(xOffset, yOffset, initialSolid) {
      var isSolid = initialSolid;
      var xStart = xOffset * (tileSize + 1);
      var yStart = yOffset * (tileSize + 1);
      
      var draw = function() {
        context.strokeStyle = "#b7b7b8";
        context.fillStyle = "#b7b7b8";
        if (isSolid) {
          context.fillRect(
            xStart + 0.5, yStart + 0.5,
            tileSize + 1, tileSize + 1
          );
        }
        else {
          context.clearRect(
            xStart, yStart,
            tileSize + 1, tileSize + 1
          );
        }
        context.strokeRect(
          xStart + 0.5, yStart + 0.5,
          tileSize + 1, tileSize + 1
        );
      };
      
      var isInBounds = function(x, y) {
        return x >= xStart && x <= xStart + tileSize &&
             y >= yStart && y <= yStart + tileSize;
      }
      
      var setSolid = function(value) {
        if (value !== isSolid) {
          isSolid = !!value;
          draw();
        }
      };
      
      // when first created, call draw once
      draw();
      
      return {
        isInBounds: isInBounds,
        flipSolid: function() {
          setSolid(!isSolid);
        },
        getIsSolid: function() {
          return isSolid;
        }
      };
    }
    
    var n = {};
    n.above = createNeighbour(1, 0, false);
    n.left = createNeighbour(0, 1, false);
    n.below = createNeighbour(1, 2, true);
    n.right = createNeighbour(2, 1, true);
    
    var tileIndex = 0;
    
    function onClick(x, y) {
      for (key in n) {
        if(n[key].isInBounds(x,y)) {
          n[key].flipSolid();
          break;
        }
      }
    }
    
    function updateText() {
      var text = "tileIndex = ";
      if (n.above.getIsSolid()) text += "1 + ";
      if (n.left.getIsSolid()) text += "2 + ";
      if (n.below.getIsSolid()) text += "4 + ";
      if (n.right.getIsSolid()) text += "8 + ";
      // remove extraneous final "+ "
      text = text.substr(0, text.length - 2);
      
      // if we only added one number, no need to have the final sum display
      if (text.length !== 14) {
        text += "= " + tileIndex;
      }
      
      outputText.innerHTML = text;
    }
    
    function updateTile() {
      context.clearRect(tileSize + 2, tileSize + 2, tileSize, tileSize);
      tileSheet.draw(context, tileIndex, tileSize + 2, tileSize + 2);
    }
    
    function update() {
      tileIndex = calcTileIndex(
        n.above.getIsSolid(),
        n.left.getIsSolid(),
        n.below.getIsSolid(),
        n.right.getIsSolid()
      );
      updateTile();
      updateText();
    }
    
    canvas.addEventListener("click", function(e) {
      var pos = clientPosToCanvas(canvas, e.clientX, e.clientY);
      onClick(pos.x, pos.y);
      update();
    });
    
    // display the tile before any clicks (but after tilemap image has loaded)
    window.addEventListener("load", function() {
      update();
    });
  }();

  var fullDemo = function() {
    var canvas = document.getElementById("fullDemoCanvas");
    var context = canvas.getContext("2d");
    
    var xMapSize = 16;
    var yMapSize = 16;
    var tileCount = xMapSize * yMapSize;
    var tiles = [];
    
    var solidityMap = function() {
      var solidity = [
        0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
        1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
        1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0,
        1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0,
        1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
        0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ];
      
      function getIsSolid(x, y) {
        if (x < 0 || x >= xMapSize ||
          y < 0 || y >= yMapSize) {
          // default to false when outside map bounds
          return false;
        }
        else {
          return !!solidity[x + y * xMapSize];
        }
      }
      
      function setIsSolid(x, y, isSolid) {
        if (x < 0 || x >= xMapSize ||
          y < 0 || y >= yMapSize) {
          // do nothing outside of map bounds
          return;
        }
        else {
          solidity[x + y * xMapSize] = +!!isSolid;
        }
      }
      
      function flipSolid(x, y) {
        if (x < 0 || x >= xMapSize ||
          y < 0 || y >= yMapSize) {
          // do nothing outside of map bounds
          return;
        }
        else {
          var i = x + y * xMapSize
          solidity[i] = +!solidity[i];
        }
      }
      
      return {
        getIsSolid: getIsSolid,
        setIsSolid: setIsSolid,
        flipSolid: flipSolid,
        
        isAboveSolid: function(x, y) {
          return getIsSolid(x, y - 1);
        },
        isLeftSolid: function(x, y) {
          return getIsSolid(x - 1, y);
        },
        isBelowSolid: function(x, y) {
          return getIsSolid(x, y + 1);
        },
        isRightSolid: function(x, y) {
          return getIsSolid(x + 1, y);
        }
      };
    }();
    
    function createTile(x, y) {
      var xDisplay = x * tileSize;
      var yDisplay = y * tileSize;
      
      function draw() {
        context.clearRect(xDisplay, yDisplay, tileSize, tileSize);
        if (solidityMap.getIsSolid(x,y)) {
          var tileIndex = calcTileIndex(
            solidityMap.isAboveSolid(x, y),
            solidityMap.isLeftSolid (x, y),
            solidityMap.isBelowSolid(x, y),
            solidityMap.isRightSolid(x, y)
          );
          tileSheet.draw(context, tileIndex, xDisplay, yDisplay);
        }
      }
      
      function isInBounds(xTest, yTest) {
        return (
          xTest > xDisplay && xTest < xDisplay + tileSize &&
          yTest > yDisplay && yTest < yDisplay + tileSize
        );
      }
      
      // draw on creation
      draw();
      
      return {
        draw: draw,
        isInBounds: isInBounds
      }
    };
    
    function onClick(x, y) {
      var xTile = Math.floor(x / tileSize);
      var yTile = Math.floor(y / tileSize);
      if (xTile >= 0 && xTile < xMapSize &&
        yTile >= 0 && yTile < yMapSize) {
        changeSolidityAndUpdate(xTile, yTile);
      }
    }
    
    function changeSolidityAndUpdate(xTile, yTile) {
      solidityMap.flipSolid(xTile, yTile);
      updateTileAtPos(xTile, yTile);
      updateTileAtPos(xTile, yTile - 1);
      updateTileAtPos(xTile - 1, yTile);
      updateTileAtPos(xTile, yTile + 1);
      updateTileAtPos(xTile + 1, yTile);
    }
    
    function updateTileAtPos(xTile, yTile) {
      if (xTile >= 0 && xTile < xMapSize &&
        yTile >= 0 && yTile < yMapSize) {
        tiles[xTile + yTile * xMapSize].draw();
      }
    }
    
    function init() {
      for (var y = 0; y < yMapSize; y++) {
        for (var x = 0; x < xMapSize; x++) {
          tiles[x + y * xMapSize] = createTile(x,y);
        }
      }
      canvas.addEventListener("click", function(e) {
        var canvasPos = clientPosToCanvas(canvas, e.clientX, e.clientY)
        onClick(canvasPos.x, canvasPos.y);
      });
    }
    
    window.addEventListener("load", function() {
      init();
    });
  }();
}();