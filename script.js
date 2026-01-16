const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.8;

const video = document.getElementById("video");

let tool = "select";
let players = [];
let routes = {};
let dragging = null;
let drawingRouteFor = null;

let animPlaying = false;
let animTime = 0;

function initPlayers() {
    const startX = canvas.width/2;
    const startY = canvas.height/2;

    const labels = ["QB","RB","WR1","WR2","WR3","LT","LG","C","RG","RT","TE"];
    
    labels.forEach((label,i)=>{
        players.push({
            id:label,
            label:label,
            x:startX + (i*30 - 150),
            y:startY,
            orientation:0
        });
    });
}
initPlayers();

function drawField() {
    ctx.fillStyle = "#0b3d0b";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    for (let y=0; y<canvas.height; y+=40) {
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(canvas.width,y);
        ctx.stroke();
    }
}

function drawPlayers() {
    players.forEach(p=>{
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.orientation);
        ctx.fillStyle = "#00aaff";
        ctx.beginPath();
        ctx.arc(0,0,16,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign="center";
        ctx.fillText(p.label,0,4);
        ctx.restore();
    });
}

function drawRoutes() {
    ctx.strokeStyle="yellow";
    ctx.lineWidth=3;
    Object.values(routes).forEach(segList=>{
        segList.forEach(seg=>{
            ctx.beginPath();
            ctx.moveTo(seg.x1,seg.y1);
            ctx.lineTo(seg.x2,seg.y2);
            ctx.stroke();
        });
    });
}

function render() {
    drawField();
    drawRoutes();
    drawPlayers();
    requestAnimationFrame(render);
}
render();

canvas.addEventListener("mousedown",e=>{
    const mx=e.offsetX, my=e.offsetY;
    if (tool==="move") {
        dragging = players.find(p => Math.hypot(p.x-mx,p.y-my)<20);
        return;
    }
    if (tool==="draw") {
        drawingRouteFor = players.find(p => Math.hypot(p.x-mx,p.y-my)<20);
        if (!drawingRouteFor) return;
        if (!routes[drawingRouteFor.id]) routes[drawingRouteFor.id]=[];
        routes[drawingRouteFor.id].push({
            x1:drawingRouteFor.x,
            y1:drawingRouteFor.y,
            x2:mx,
            y2:my
        });
    }
});

canvas.addEventListener("mousemove",e=>{
    const mx=e.offsetX, my=e.offsetY;
    if (dragging) {
        dragging.x=mx;
        dragging.y=my;
    }
    if (tool==="draw" && drawingRouteFor) {
        let seg = routes[drawingRouteFor.id].at(-1);
        seg.x2=mx; seg.y2=my;
        drawingRouteFor.orientation = Math.atan2(
            seg.y2-seg.y1,
            seg.x2-seg.x1
        );
    }
});

canvas.addEventListener("mouseup",()=>{
    dragging=null;
    drawingRouteFor=null;
});

document.getElementById("toolSelect").onclick=()=>tool="select";
document.getElementById("toolMove").onclick=()=>tool="move";
document.getElementById("toolDraw").onclick=()=>tool="draw";

function animate() {
    if (!animPlaying) return;
    animTime += 0.02;
    players.forEach(p=>{
        const segs = routes[p.id];
        if (!segs || segs.length===0) return;
        const index = Math.floor(animTime) % segs.length;
        const seg = segs[index];
        const t = animTime - Math.floor(animTime);
        p.x = seg.x1 + (seg.x2 - seg.x1)*t;
        p.y = seg.y1 + (seg.y2 - seg.y1)*t;
        p.orientation = Math.atan2(seg.y2-seg.y1, seg.x2-seg.x1);
    });
    requestAnimationFrame(animate);
}

document.getElementById("playAnim").onclick=()=>{animPlaying=true; animTime=0; animate();}
document.getElementById("pauseAnim").onclick=()=>animPlaying=false;
document.getElementById("resetAnim").onclick=()=>{animPlaying=false; animTime=0;}

function savePlay() {
    localStorage.setItem("playData", JSON.stringify({players,routes}));
    alert("Play saved!");
}

function loadPlay() {
    let data = localStorage.getItem("playData");
    if (!data) return alert("No saved play.");
    let obj = JSON.parse(data);
    players = obj.players;
    routes = obj.routes;
}

function toggleVideo() {
    video.style.display = video.style.display==="none" ? "block" : "none";
}

document.getElementById("videoURL").addEventListener("change",()=>{
    video.src = document.getElementById("videoURL").value;
    video.style.display="block";
});
