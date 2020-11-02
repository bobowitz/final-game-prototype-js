ctx = document.getElementById("canvas").getContext('2d');

let drawCircle = (x, y, r) => {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
};

let drawRect = (x, y, w, h) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, w, h);
};

FRAMERATE = 60.0;
TILESIZE = 20;
TILES_W = 20;
TILES_H = 20;
W = TILES_W * TILESIZE;
H = TILES_H * TILESIZE;

GRID_EMPTY = 0;
GRID_PLAYER = 1;
GRID_NUM_PLAYERS = 2;
GRID_OWNED_BY_PLAYER = GRID_PLAYER * GRID_NUM_PLAYERS + 1;
GRID_ATTEMPTING_BY_PLAYER = GRID_PLAYER * GRID_NUM_PLAYERS * 2 + 1;

let pressedKeys = {};

let grid = [];
for(let x = 0; x < TILES_W; x++) {
    grid.push([]);
    for (let y = 0; y < TILES_H; y++) {
        grid[x][y] = GRID_EMPTY;
    }
}

let players = [];

players.push({x: TILES_W / 2, y: 0, dx: 0, dy: 0, points: []});
players.push({x: TILES_W / 2, y: TILES_H - 1, dx: 0, dy: 0, points: []});

// set player1 and player 2
grid[players[0].x][players[0].y] = GRID_PLAYER;
grid[players[1].x][players[1].y] = GRID_PLAYER + 1;

let frame = 0;
let TICK_FRAME_COUNT = 10; // 60fps ticks per frame of movement

let init = () => {
    // init
};

let gridValueEquals = (x, y, value) => {
    if (value == GRID_EMPTY) return grid[x][y] == value;
    else return grid[x][y] >= value && grid[x][y] < value + GRID_NUM_PLAYERS;
};

let floodfill = (x, y, value) => {
    if (value == grid[x][y]) return;
    fill(x, y, value, grid[x][y]);
};

let fill = (x, y, value, oldValue) => {
    if (x < 0 || x >= TILES_W || y < 0 || y >= TILES_H) return;
    if (grid[x][y] == oldValue) {
        grid[x][y] = value;

        fill(x + 1, y, value, oldValue);
        fill(x - 1, y, value, oldValue);
        fill(x, y + 1, value, oldValue);
        fill(x, y - 1, value, oldValue);
    }
};

let tick = () => {
    let i = 0;
    for(player of players) {
        // take control of current square
        if (gridValueEquals(player.x, player.y, GRID_ATTEMPTING_BY_PLAYER) && grid[player.x][player.y] != GRID_ATTEMPTING_BY_PLAYER + i) {
            let p_i = grid[player.x][player.y] - GRID_ATTEMPTING_BY_PLAYER;
            players[p_i].points = [];
            for(let x = 0; x < TILES_W; x++) {
                for (let y = 0; y < TILES_H; y++) {
                    if (grid[x][y] == GRID_ATTEMPTING_BY_PLAYER + p_i)
                        grid[x][y] = GRID_EMPTY;
                }
            }
        }
        grid[player.x][player.y] = GRID_ATTEMPTING_BY_PLAYER + i;

        player.x += player.dx;
        player.y += player.dy;

        if (player.x < 0) player.x = 0;
        if (player.x > TILES_W - 1) player.x = TILES_W - 1;
        if (player.y < 0) player.y = 0;
        if (player.y > TILES_H - 1) player.y = TILES_H - 1;

        player.points.push({x: player.x, y: player.y});

        if (gridValueEquals(player.x, player.y, GRID_ATTEMPTING_BY_PLAYER) && grid[player.x][player.y] != GRID_ATTEMPTING_BY_PLAYER + i) {
            let p_i = grid[player.x][player.y] - GRID_ATTEMPTING_BY_PLAYER;
            players[p_i].points = [];
            for(let x = 0; x < TILES_W; x++) {
                for (let y = 0; y < TILES_H; y++) {
                    if (grid[x][y] == GRID_ATTEMPTING_BY_PLAYER + p_i)
                        grid[x][y] = GRID_EMPTY;
                }
            }
        }

        if ((player.dx != 0 || player.dy != 0) && grid[player.x][player.y] == GRID_ATTEMPTING_BY_PLAYER + i) {
            // close the loop

            let loop_points = [];
            for (let j = 0; j < player.points.length; j++) {
                if (player.points[j].x == player.x && player.points[j].y == player.y) {
                    loop_points = player.points.slice(j);
                    break;
                }
            }

            let loop_min_x_at_y = {};
            let loop_max_x_at_y = {};
            // loop_points.sort((a, b) => (a.y - b.y) * TILES_W + (a.x - b.x));
            for (let j = 0; j < loop_points.length; j++) {
                if (loop_points[j].y in loop_min_x_at_y) {
                    loop_min_x_at_y[loop_points[j].y] = Math.min(loop_min_x_at_y[loop_points[j].y], loop_points[j].x);
                    loop_max_x_at_y[loop_points[j].y] = Math.max(loop_max_x_at_y[loop_points[j].y], loop_points[j].x);
                } else {
                    loop_min_x_at_y[loop_points[j].y] = loop_points[j].x;
                    loop_max_x_at_y[loop_points[j].y] = loop_points[j].x;
                }
            }

            console.log(loop_min_x_at_y);
            
            for (let y in loop_min_x_at_y) {
                for (let x = loop_min_x_at_y[y]; x <= loop_max_x_at_y[y]; x++) {
                    grid[x][y] = GRID_OWNED_BY_PLAYER + i;
                }
            }

            //floodfill(player.x + 1, player.y - 1, GRID_OWNED_BY_PLAYER + i);

            player.points = [];
            for(let x = 0; x < TILES_W; x++) {
                for (let y = 0; y < TILES_H; y++) {
                    if (grid[x][y] == GRID_ATTEMPTING_BY_PLAYER + i)
                        grid[x][y] = GRID_EMPTY;
                }
            }
        }
        grid[player.x][player.y] = GRID_PLAYER + i;

        player.dx = 0;
        player.dy = 0;

        i++;
    }
};

let loop = () => {
    if (pressedKeys[87] && !pressedKeys[83]) { players[0].dy = -1; players[0].dx = 0; }
    if (pressedKeys[83] && !pressedKeys[87]) { players[0].dy = 1; players[0].dx = 0; }
    if (pressedKeys[65] && !pressedKeys[68]) { players[0].dx = -1; players[0].dy= 0; }
    if (pressedKeys[68] && !pressedKeys[65]) { players[0].dx = 1; players[0].dy= 0; }

    if (pressedKeys[38] && !pressedKeys[40]) { players[1].dy = -1; players[1].dx = 0; }
    if (pressedKeys[40] && !pressedKeys[38]) { players[1].dy = 1; players[1].dx = 0; }
    if (pressedKeys[37] && !pressedKeys[39]) { players[1].dx = -1; players[1].dy= 0; }
    if (pressedKeys[39] && !pressedKeys[37]) { players[1].dx = 1; players[1].dy= 0; }

    frame++;
    if (frame >= TICK_FRAME_COUNT) {
        frame = 0;
        tick();
    }

};

playerColors = ["#ff0000", "#0000ff"];
playerOwnsColors = ["#ff4040", "#4040ff"];
playerAttemptingColors = ["#ffa0a0", "#a0a0ff"];

let draw = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    // draw
    for (let x = 0; x < TILES_W; x++) {
        for (let y = 0; y < TILES_H; y++) {
            ctx.fillStyle = "#ffffff";
            if (gridValueEquals(x, y, GRID_PLAYER)) {
                ctx.fillStyle = playerColors[grid[x][y] - GRID_PLAYER];
            } else if (gridValueEquals(x, y, GRID_OWNED_BY_PLAYER)) {
                ctx.fillStyle = playerOwnsColors[grid[x][y] - GRID_OWNED_BY_PLAYER];
            } else if (gridValueEquals(x, y, GRID_ATTEMPTING_BY_PLAYER)) {
                ctx.fillStyle = playerAttemptingColors[grid[x][y] - GRID_ATTEMPTING_BY_PLAYER];
            }
            ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
        }
    }
};

window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

init();
setInterval(
    () => {
        loop();
        draw();
    },
    1000 / FRAMERATE);