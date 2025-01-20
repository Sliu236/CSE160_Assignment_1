// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
}

function connectVariablesToGLSL() { 
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
  
    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
  
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if(!u_Size) {
      console.log('Failed to get the storage location of u_Size');
      return;
    }
}

const POINT = 0;
const TRIANGLE = 1;

// Global variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // White
let g_selectedSize = 5; // Default point size
let g_selectedType = POINT;

function addActionForHtmlUI() {

  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; }; // Green
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; }; // Red
  document.getElementById('blue').onclick = function() { g_selectedColor = [0.0,0.0,1.0,1.0]; }; // Blue
  document.getElementById('clearButton').onclick = function() { g_shapeList = []; renderAllShapes()}; // Clear


  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT}; // Point
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE}; // Triangle
  // slider event handling
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; }); // Red
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; }); // Green
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; }); // Blue

  // Size slider event handling
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; }); // Size
}

function main() {

  setupWebGL(); // WebGL Initialization

  connectVariablesToGLSL(); // GLSL Variables Connection

  addActionForHtmlUI(); // HTML UI Event Handling

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  canvas.onmousedown = click;
  canvas.onmousemove  = function(ev) { if (ev.buttons == 1) click(ev); }; // click and drag

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapeList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];  // The array to store the size of a point


function click(ev) {

  let [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if(g_selectedType == POINT) { 
    point = new Point();
  } else {
    point = new Triangle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes() {

  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
  var duration = performance.now() - startTime;
  sentTextToHTML("numdots: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sentTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log('Failed to get' + htmlElm + 'from HTML');
    return;
  }
  htmlElm.innerHTML = text;
}


