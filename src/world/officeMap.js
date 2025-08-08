const WIDTH = 60;
const HEIGHT = 40;

function createTile(type = 'floor', walkable = true) {
  return { type, walkable };
}

export function makeOfficeMap() {
  const tiles = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => createTile('floor', true)));
  const zones = [];

  // walls around
  for (let x = 0; x < WIDTH; x++) {
    tiles[0][x] = createTile('wall', false);
    tiles[HEIGHT - 1][x] = createTile('wall', false);
  }
  for (let y = 0; y < HEIGHT; y++) {
    tiles[y][0] = createTile('wall', false);
    tiles[y][WIDTH - 1] = createTile('wall', false);
  }

  // Open space kubiki (IT/HR mix)
  for (let y = 8; y <= 20; y += 6) {
    for (let x = 8; x <= 38; x += 10) {
      room(x, y, 8, 5, 'cubicle');
      tiles[y + 2][x] = createTile('floor', true); // door
      tiles[y + 2][x + 4] = createTile('desk', false);
    }
  }
  // Drukarka w open space
  tiles[14][20] = createTile('printer', true);

  // Kuchnia
  fill(2, 2, 13, 10, 'kitchen', true); // duża kuchnia
  zones.push({ label: 'Kuchnia', x: 8, y: 6 });
  // wyposażenie kuchni
  tiles[4][4] = createTile('fridge', true);
  tiles[6][6] = createTile('espresso', true);
  tiles[8][5] = createTile('plant', true);
  // Socjal HR (kanapy)
  room(14, 2, 10, 8, 'hr_social'); tiles[6][14] = createTile('floor', true);
  zones.push({ label: 'Socjal HR', x: 19, y: 6 });
  tiles[4][22] = createTile('plant', true);

  // Gabinety C-level (CEO + CFO + CTO)
  room(42, 2, 16, 8, 'c_suite'); tiles[6][42] = createTile('floor', true);
  zones.push({ label: 'C‑Suite', x: 50, y: 6 });
  // Sala zarządu (duża)
  room(40, 24, 18, 11, 'meeting'); tiles[29][40] = createTile('floor', true);
  zones.push({ label: 'Sala zarządu', x: 49, y: 29 });
  // Pokój administracji
  room(2, 28, 12, 8, 'admin'); tiles[32][2] = createTile('floor', true);
  zones.push({ label: 'Administracja', x: 8, y: 32 });
  tiles[30][6] = createTile('plant', true);
  // Serwerownia IT
  room(16, 28, 12, 8, 'server'); tiles[32][16] = createTile('floor', true);
  zones.push({ label: 'Serwerownia', x: 22, y: 32 });
  // IT room (narada)
  room(30, 28, 8, 8, 'it_room'); tiles[32][30] = createTile('floor', true);
  zones.push({ label: 'IT', x: 34, y: 32 });
  tiles[30][34] = createTile('plant', true);

  function get(x, y) {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return createTile('void', false);
    return tiles[Math.floor(y)][Math.floor(x)];
  }

  function isWalkable(x, y) {
    const t = get(x, y);
    return t.walkable !== false;
  }

  // helpers
  function room(x, y, w, h, label) {
    for (let i = 0; i < w; i++) { tiles[y][x + i] = createTile('wall', false); tiles[y + h - 1][x + i] = createTile('wall', false); }
    for (let j = 0; j < h; j++) { tiles[y + j][x] = createTile('wall', false); tiles[y + j][x + w - 1] = createTile('wall', false); }
    // decorate interior slightly
    const ix = x + Math.floor(w / 2), iy = y + Math.floor(h / 2);
    tiles[iy][ix] = createTile(label === 'meeting' ? 'meeting' : label === 'server' ? 'server' : label === 'kitchen' ? 'kitchen' : 'desk', label !== 'server');
  }
  function fill(x1, y1, x2, y2, type, walk=true) { for (let y=y1; y<=y2; y++){ for (let x=x1; x<=x2; x++){ tiles[y][x] = createTile(type, walk); }}}

  return { width: WIDTH, height: HEIGHT, get, isWalkable, zones };
}


