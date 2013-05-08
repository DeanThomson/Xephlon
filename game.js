var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

var paused;

var then, now, delta, lastShot;

var healthBar, specialBar, xpBar;
var stars, bullets;
var up, down, left, right, shoot;
var player;

function drawBackground() {
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,width,height);
}

function drawUI() {
	ctx.font = "bold 12px courier";
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";

	healthBar.draw();
	specialBar.draw();
	xpBar.draw();
}

function drawPauseScreen() {
	ctx.font = "bold 50px courier";
	ctx.fillStyle = "yellow";
	ctx.strokeStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("PAUSED",width/2,height/2);
	ctx.strokeText("PAUSED",width/2,height/2);
}

function player(x, y) {
	
	this.x = x;
	this.y = y;
	this.speed = 300;
	this.pheight = 100; //20
	this.pwidth = 76; //50
	
	this.pimage = new Image();
	this.pimage.src = "player.png";
	
	this.health = 200;
	this.special = 0;
	this.xp = 0;
	this.level = 1;
	
	this.update = function() {
		if(up) this.y -= this.speed*delta;
		if(right) this.x += this.speed*delta;
		if(down) this.y += this.speed*delta;
		if(left) this.x -= this.speed*delta;
		
		if(this.x < 0) this.x=0;
		if(this.x > width-this.pwidth) this.x = width-this.pwidth;
		if(this.y < 50) this.y=50;
		if(this.y > height-this.pheight) this.y = height-this.pheight;
		
		healthBar.value = this.health;
		specialBar.value = this.special;
		xpBar.value = this.xp;
		
		if(shoot && (now - lastShot)/1000 > 0.2) {
			this.shoot();
			lastShot = now;
		}
	}
	
	this.draw = function() {
		if(this.health < 50) this.pimage.src = "playerDamaged.png";
		else this.pimage.src = "player.png";
		ctx.drawImage(this.pimage,this.x,this.y);
	}
	
	this.shoot = function() {
		bullets[bullets.length] = new bullet();
	}
}

function bullet() {
	this.bheight = 9;
	this.bwidth = 33;
	this.x = player.x + (player.pwidth/2);
	this.y = player.y + (player.pheight/2) - (this.bheight/2);
	this.speed = player.speed*2;
	this.damage = 50;
	
	var bimage = new Image();
	bimage.src = "laserRed.png";
	
	this.update = function() {
		this.x += this.speed*delta;
	}
	
	this.draw = function() {
		ctx.drawImage(bimage,this.x,this.y);
	}
}

function updateBullets() {
	var j;
	for(var i=0; i<bullets.length; i++) {
		if(bullets[i].x > width) j=i;
		bullets[i].update();
	}
	bullets.splice(0,j+1);
}

function statBar(title, color, value, x, y) {
	this.title = title;
	this.color = color;
	this.value = value;
	this.x = x;
	this.y = y;
	
	this.draw = function() {
		ctx.fillStyle = "yellow";
		ctx.fillText(this.title,this.x,this.y+5);
		
		ctx.fillStyle = "black";
		ctx.fillRect(this.x,this.y,200,10);
		
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.value,10);
		
		ctx.strokeStyle = "white";
		ctx.strokeRect(this.x,this.y,200,10);
	};
	
	this.update = function() {
		if(this.value > 200) this.value = 0;
		if(this.value < 0) this.value = 200;
	};
}

function star(size, x, y) {
	this.size = size;
	this.speed = size*20;
	this.x = x;
	this.y = y;
	
	this.update = function() {
		this.x -= (this.speed * delta);
		if(this.x < 0) { this.x = width; this.y = Math.random()*height }
	}
	
	this.draw = function() {
		ctx.fillStyle = "white";
		ctx.fillRect(this.x,this.y,this.size,this.size);
	}
}

function init() {
	healthBar = new statBar("Shields:","red",200,590,5);
	specialBar = new statBar("Special:","blue",0,590,20);
	xpBar = new statBar("XP:","lime",0,590,35);
	
	stars = new Array(250);
	for(var i=0; i<stars.length; i++) {
		stars[i] = new star(Math.random()*2, Math.random()*width, Math.random()*height);
	}
	
	player = new player(50,height/2);
	
	bullets = [];
	
	then = Date.now();
	now = then;
	lastShot = then;
	
	paused = false;
}

function update() {
	
	for(var i=0; i<stars.length; i++) {
		stars[i].update();
	}
	
	player.update();
	
	updateBullets();
	
	//healthBar.value -= (Math.random()*50)*delta;
	//specialBar.value += (Math.random()*50)*delta;
	//xpBar.value += (Math.random()*50)*delta;
	if(player.health > 40) player.health -= 1;
	player.xp = 25;
	player.special = 125;
	
	healthBar.update();
	specialBar.update();
	xpBar.update();
}

function render() {
	drawBackground();
	
	for(var i=0; i<stars.length; i++) {
		stars[i].draw();
	}
	
	for(var i=0; i<bullets.length; i++) {
		bullets[i].draw();
	}
	
	player.draw();
	
	drawUI();
}

function mainLoop() {
	now = Date.now();
	delta = (now - then)/1000;
	if(paused) {
		drawPauseScreen();
	}
	else {
		update();
		render();
	}
	then = now;
	requestAnimationFrame(mainLoop);
}
init();

// Cross browser compatability
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

mainLoop();

window.onblur = function() {
	paused = true;
}

document.body.onkeydown = function(e) {
	var key = e.which;
	if(key == "65" && !left) {left = true; right = false;}
	else if(key == "87" && !up) {up = true; down = false;}
	else if(key == "68" && !right) {right = true; left = false;}
	else if(key == "83" && !down) {down = true; up = false;}
	else if(key == "32" && !shoot) {e.preventDefault(); shoot = true;}
	else if(key == "80") {paused = !paused; shoot = false;}
}

document.body.onkeyup = function(e) {
	var key = e.keyCode;
	if(key == "65") left = false;
	else if(key == "87") up = false;
	else if(key == "68") right = false;
	else if(key == "83") down = false;
	else if(key == "32") shoot = false;
}

document.body.onkeypress = function(e) {
	var key = e.which;
	if(key == "32" && !left) e.preventDefault();
}