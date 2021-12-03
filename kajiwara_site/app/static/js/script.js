
$(".openbtn").click(function () {//ボタンがクリックされたら
	$(this).toggleClass('active');//ボタン自身に activeクラスを付与し
    $("#g-nav").toggleClass('panelactive');//ナビゲーションにpanelactiveクラスを付与
});

$("#g-nav a").click(function () {//ナビゲーションのリンクがクリックされたら
    $(".openbtn").removeClass('active');//ボタンの activeクラスを除去し
    $("#g-nav").removeClass('panelactive');//ナビゲーションのpanelactiveクラスも除去
});

/*
Recreation of:
https://codepen.io/towc/pen/mJzOWJ
Most of the code is my own, but I used a few things from the original, such as the neon/electric drawing effect using shadows (and replacing the light component of the HSL values), and the ctx.globalCompositeOperation change to make it look nicer.
*/
var ctx = canvas.getContext('2d');

var settings = {
  //these first two aren't currently editable from the control box
  lineLength: 50,
  speed: 1,
  lifeTime: 500,
  maxParticles: 80,
  radius: 1,
  avoidVisited: true,
  clearTrails: function() {ctx.clearRect(0, 0, width, height); visited = [];},
  restart: function() {ctx.clearRect(0, 0, width, height); particles = []; visited = [];}
};
var visited = [];

function onResize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
function rotate(vec, angle) {
  //convert the angle from degrees to radians
  angle = angle * Math.PI / 180;
  return [(vec[0] * Math.cos(angle)) - (vec[1] * Math.sin(angle)), (vec[0] * Math.sin(angle)) + (vec[1] * Math.cos(angle))];
}
//starting directions for particles
var dirVecs = [
  [1, 0],
  rotate([1, 0], 120),
  rotate([1, 0], 240)
];
var particles = [];

function isVisited(x, y) {
  //if the position appears in the visited list
  //using Math.floor should help reduce incorrect results due to rounding errors (hopefully)
  var pos = [Math.floor(x), Math.floor(y)];
  for (var i = 0; i < visited.length; i++) {
    if (visited[i][0] == pos[0] && visited[i][1] == pos[1]) {
      return true;
    }
  }
  return false;
}
function addToVisited(x, y) {
  //add the position to the list if it does not already appear in the list
  if (!isVisited(x, y)) {
    var pos = [Math.floor(x), Math.floor(y)];
    visited.push(pos);
  }
}

function particle() {
  this.x = 0;
  this.y = 0;
  this.age = 0;
  //choose a random starting direction from the possible 3
  this.dir = dirVecs[Math.floor(Math.random() * 3)];
  //color changes based on spawn time
  this.color = 'hsl(' + ((Date.now() / 100.0) % 360.0) + ', 90%, light%)';
}
particle.prototype.updateAndDraw = function() {
  //The movement is all based on a fixed time step, regardless of how quickly it draws
  //This means the hexagons drawn should all be nearly perfect
  this.age += 1;
  //if the age is a multiple of the lineLength (meaning it should make a turn)
  if (this.age % settings.lineLength == 0) {
    //get the two possible directions
    var dir1 = rotate(this.dir, 60);
    var dir2 = rotate(this.dir, -60);
    
    var options = [];
    
    if (settings.avoidVisited) {
      if (!isVisited(this.x + dir1[0] * settings.lineLength, this.y + dir1[1] * settings.lineLength)) {
        //if the first option hasn't been visited before
        options.push(dir1);
      }
      if (!isVisited(this.x + dir2[0] * settings.lineLength, this.y + dir2[1] * settings.lineLength)) {
        //if the second option hasn't been visited before
        options.push(dir2);
      }
      if (options.length == 0) {
        //if both have been visited, both should be made valid choices
        options = [dir1, dir2];
      }
    } else {
      //if the option is off, choose randomly
      options = [dir1, dir2];
    }
    //get a random direction from those possible
    this.dir = options[Math.floor(Math.random() * options.length)];
    
    addToVisited(this.x, this.y);
  }
  ctx.fillStyle = this.color.replace('light', '70');
  ctx.beginPath();
  ctx.arc(width/2.0 + this.x, height/2.0 + this.y, settings.radius, 0, 6.3);
  
  ctx.shadowBlur = settings.radius * 6;
  ctx.shadowColor = this.color.replace('light', '30');
  ctx.fill();
  
  this.x += this.dir[0] * settings.speed;
  this.y += this.dir[1] * settings.speed;
}

function updateAndDraw() {
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = 'source-over';
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter';
  
  //go backwards through the particles, allowing them to be removed if neccesary
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].updateAndDraw();
    if (particles[i].age > settings.lifeTime) {
      //remove the particle if it is to old
      particles.splice(i, 1);
    }
  }
  if (particles.length < settings.maxParticles) {
    //if more particles can be added
    if (Math.random() > 0.9) {
      particles.push(new particle());
    }
  } else if (particles.length > settings.maxParticles) {
    //if there are two many particles
    particles.splice(0, settings.maxParticles);
  }
  requestAnimationFrame(updateAndDraw);
}
function init() {
  //set the canvas width/height
  onResize();
  
  //update the width/height if the window is resized
  window.onresize = onResize;
  
  //start drawing
  updateAndDraw();
  
  //add controls
  var gui = new dat.GUI();
  //gui.add(settings, 'speed', 0.5, settings.lineLength).step(1);
  gui.add(settings, 'lifeTime', 50, 3000);
  gui.add(settings, 'maxParticles', 1, 200);
  gui.add(settings, 'radius', 0.5, 6);
  gui.add(settings, 'avoidVisited');
  gui.add(settings, 'clearTrails');
  gui.add(settings, 'restart');
}

init();