var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

var paused;

var then, now, delta, lastShot, lastEnemy;

var healthBar, specialBar, xpBar;
var stars, bullets, enemies, enemyBullets;
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
	
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillStyle = "yellow";
	ctx.font = "bold 20px courier";
	ctx.fillText("Score: ".concat(player.score.toString()),5,0);
	ctx.fillText("Level: ".concat(player.level.toString()),5,30);
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
	this.pheight = 100;
	this.pwidth = 76;
	
	this.pimage = new Image();
	this.pimage.src = "player.png";
	
	this.health = 200;
	this.special = 0;
	this.xp = 0;
	this.level = 1;
	this.bulletDamage = 50;
	this.score = 0;
	
	this.update = function() {
		if(up) this.y -= this.speed*delta;
		if(right) this.x += this.speed*delta;
		if(down) this.y += this.speed*delta;
		if(left) this.x -= this.speed*delta;
		
		if(this.x < 0) this.x=0;
		if(this.x > width-this.pwidth) this.x = width-this.pwidth;
		if(this.y < 50) this.y=50;
		if(this.y > height-this.pheight) this.y = height-this.pheight;
		
		if(this.xp > (this.level*200)) {
			this.xp = 0;
			this.level += 1;
		}
		
		healthBar.value = this.health;
		specialBar.value = this.special;
		xpBar.value = (this.xp / (this.level*200))*200;
		console.log(xpBar.value);
		
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
		bullets[bullets.length] = new bullet(1, this.speed*2, this.bulletDamage, this.x + (this.pwidth/2), this.y + (this.pheight/2));
	}
}

function enemy(x, y) {
	this.x = x;
	this.y = y;
	this.health = 100;
	this.speed = 100;
	this.eheight = 100;
	this.ewidth = 76;
	this.eimage = new Image();
	this.eimage.src = "enemyShip.png";
	this.bulletDamage = 25;
	this.xp = 25;
	this.score = 25;
	
	this.update = function() {
		this.x -= this.speed*delta;
		if(Math.floor(Math.random()*200) == 1) this.shoot();
	}
	
	this.draw = function() {
		ctx.drawImage(this.eimage,this.x,this.y);
	}
	
	this.shoot = function() {
		enemyBullets[enemyBullets.length] = new bullet(-1, this.speed*3, this.bulletDamage, this.x + (this.ewidth/2), this.y + (this.eheight/2));
	}
}

function spawnEnemy() {
	enemies[enemies.length] = new enemy(width,(Math.random()*(height-150))+50); // enemy(width, (Math.random()*(height-enemyheight-50))+50;
}

function bullet(direction, speed, damage, x, y) {
	this.direction = direction;
	this.bheight = 9;
	this.bwidth = 33;
	this.x = x;
	this.y = y - this.bheight/2;
	this.speed = speed;
	this.damage = damage;
	
	var bimage = new Image();
	if(direction == 1) bimage.src = "laserRed.png";
	else bimage.src = "laserGreen.png";
	
	this.update = function() {
		this.x += (this.speed*delta) * direction;
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
	
	for(var i=enemyBullets.length-1; i>=0; i--) {
		if(enemyBullets[i].x < 0) enemyBullets.splice(i,1);
		else enemyBullets[i].update();
	}
}

function updateEnemies() {
	for(var i=enemies.length-1; i>=0; i--) {
		enemies[i].update();
		if(enemies[i].x+enemies[i].width < 0) {
			enemies.splice(i,1);
		}
	}
}

function checkBulletCollisions() {
	
	// Player bullets
	for(var i=bullets.length-1; i>=0; i--) {
		var tipX = bullets[i].x + bullets[i].bwidth;
		var tipY = bullets[i].y + bullets[i].bheight/2;
		for(var j=enemies.length-1; j>=0; j--) {
			if(((tipX>enemies[j].x+5) && (tipX<(enemies[j].x+enemies[j].ewidth))) && ((tipY>enemies[j].y) && (tipY<(enemies[j].y+enemies[j].eheight)))) {
				enemies[j].health -= bullets[i].damage;
				if(enemies[j].health <= 0) {
					player.xp += enemies[j].xp;
					player.score += enemies[j].score;
					enemies.splice(j, 1);
					bullets.splice(i, 1);
					break;
				}
				bullets.splice(i, 1);
				break;
			}
		}
	}
	
	// Enemy bullets
	for(var i=enemyBullets.length-1; i>=0; i--) {
		var tipX = enemyBullets[i].x;
		var tipY = enemyBullets[i].y + enemyBullets[i].bheight/2;
		if((tipX>player.x && tipX<player.x+player.pwidth) && ((tipY<player.y+player.pheight) && (tipY>player.y))) {
			player.health -= enemyBullets[i].damage;
			enemyBullets.splice(i,1);
			break;
		}
	}
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
	enemies = [];
	enemyBullets = [];
	
	then = Date.now();
	now = then;
	lastShot = then;
	lastEnemy = then;
	
	paused = false;
}

function update() {
	
	for(var i=0; i<stars.length; i++) {
		stars[i].update();
	}
	
	updateBullets();
	updateEnemies();
	checkBulletCollisions();
	
	if((now - lastEnemy)/1000 > 2) {
		spawnEnemy();
		lastEnemy = now;
	}
	
	player.update();
	
	healthBar.update();
	specialBar.update();
	xpBar.update();
}

function render() {
	drawBackground();
	
	for(var i=0; i<stars.length; i++) {
		stars[i].draw();
	}
	
	for(var i=0; i<enemyBullets.length; i++) {
		enemyBullets[i].draw();
	}
	
	for(var i=0; i<enemies.length; i++) {
		enemies[i].draw();
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