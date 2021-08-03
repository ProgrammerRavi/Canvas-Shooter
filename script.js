// UI
const startingBoard = document.querySelector('.gameUI');
const points = document.querySelector('.points');

// Canvas Variables
const canvas = document.querySelector('.canvas');
const c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let cPos = canvas.getBoundingClientRect();


// velocity and distance
function velocity(x1, y1, x2, y2) {
	let angle = Math.atan2(y2-y1, x2-x1);
	let velo = {
		x: Math.cos(angle),
		y: Math.sin(angle)};
	return velo;
}
function distance(x1, y1, x2, y2){
	let dis = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
	return dis;
}


// Score
var score = 0;
const scoreNum = document.querySelector('.score');
scoreNum.innerText = score;


// Player
class Player {
	constructor() {
		this.x = canvas.width/2;
		this.y = canvas.height/2;
		this.size = 10;
		this.color = 'white';
	}
	draw() {
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.size, 0, Math.PI*2);
		c.fill();
		c.closePath();
	}
}


// Bullets
class Bullet {
	constructor(x, y, size, velocity, color) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.size = size;
		this.color = color;
	}
	update() {
		this.x += this.velocity.x * 8;
		this.y += this.velocity.y * 8;
	}
	draw() {
		this.update();
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.size, 0, Math.PI*2);
		c.fill();
		c.closePath();
	}
}


// Enemies
class Enemy {
	constructor(x, y, size, velocity, color) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.size = size;
		this.color = color;
	}
	update() {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}
	draw() {
		this.update();
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.size, 0, Math.PI*2);
		c.fill();
		c.closePath();
	}
}


// Particles
class Particle {
	constructor(x, y, size, velocity, color) {
		this.x = x;
		this.y = y;
		this.velocity = velocity;
		this.size = size;
		this.color = color;
		this.alpha = 1;
		this.friction = 0.99;
	}
	update() {
		this.velocity.x *= this.friction;
		this.velocity.y *= this.friction;
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.alpha -= 0.01;
	}
	draw() {
		this.update();
		c.save();
		c.globalAlpha = this.alpha;
		c.fillStyle = this.color;
		c.beginPath();
		c.arc(this.x, this.y, this.size, 0, Math.PI*2);
		c.fill();
		c.closePath();
		c.restore();
	}
}

// Player Object
var player = new Player();


// Bullets Objects
var bullets = [];
var bulX = canvas.width/2;
var bulY = canvas.height/2;


// Enemy Objects
var enemies = [];
function createEnemy() {
	setInterval(function() {
		var eneSize = Math.random()*(17-4)+4;
		let eneX;
		let eneY;
		if(Math.random() < 0.5){
			eneX = Math.random()<0.5 ? 0-eneSize : canvas.width+eneSize;
			eneY = Math.random()*canvas.height;
		}else{
			eneY = Math.random()<0.5 ? 0-eneSize : canvas.height+eneSize ;
			eneX = Math.random()*canvas.width;
		}
		var eneVelo = velocity(eneX, eneY, canvas.width/2, canvas.height/2);
		var eneColor = 'hsl('+Math.random()*360+',100%,50%)';
		enemies.push(new Enemy(eneX, eneY, eneSize, eneVelo, eneColor));
	}, 1000);
}


// Particles Objects
var particles = [];


// Mouse
let mouse = {
	x: null,
	y: null
};
canvas.addEventListener('click', e => {
	mouse.x = e.clientX- cPos.x;
	mouse.y = e.clientY - cPos.y;
	bulVelo = velocity(bulX, bulY, mouse.x, mouse.y);
	bullets.push(new Bullet(bulX, bulY, 6, bulVelo, 'white'));
});


function	startGame(){
	// Hiding Starting Board
	startingBoard.style.display = 'none';
	c.fillStyle = "black";
	c.clearRect(0,0,canvas.width,canvas.height);
	
	// Animation Loop
	animationLoop = setInterval(function() {
		c.fillStyle = "rgba(0,0,0,0.1)";
		c.fillRect(0,0,canvas.width, canvas.height);
		
		player.draw();
		
		particles.forEach((elem, i) => {
			if (elem.alpha <= 0.03){
				particles.splice(i, 1);
			}else{
				elem.draw();
			}
		});
		
		bullets.forEach((e, i) => {
			e.draw();
			if (e.x - e.size < 0 || e.y - e.size < 0 || e.x + e.size > canvas.width || e.x + e.size > canvas.height){
				bullets.splice(i, 1);
			}
		});
		
		enemies.forEach((e, i) => {
			let disEP = distance(player.x, player.y, e.x, e.y);
			if(disEP - e.size - player.size < 1){
				clearInterval(animationLoop);
				startingBoard.style.display = 'flex';
				for (let l = 0; l < enemies.length; l++) {
					enemies.splice(l, 100);
					enemies = [];
					points.innerText = score;
					score = 0;
				}
			}
			
			bullets.forEach((b, j) => {
				let disEneBul = distance(b.x, b.y, e.x, e.y);
				if (disEneBul - e.size - b.size < 1){
					for(let k=0; k<e.size*2; k++){
						particles.push(new Particle(e.x, e.y, Math.random()*2, {x: (Math.random()-0.5)*(Math.random()*6), y: (Math.random()-0.5)*(Math.random()*6)}, e.color));
					}
					
					score++;
					
					if(e.size-6 > 6){
						e.size -= 4;
						bullets.splice(j, 1);
					}else{
						enemies.splice(i, 1);
						bullets.splice(j, 1);
						e.velocity.x *= 8;
						e.velocity.y *= 8;
					}
				}
			});
			e.draw();
		});
		
		scoreNum.innerText = score;
	}, 10);
	createEnemy();
	createEnemy();
}