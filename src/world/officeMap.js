const WIDTH = 60;
const HEIGHT = 40;

function createTile(type = 'floor', walkable = true) {
  return { type, walkable };
}

export function makeOfficeMap() {
  const tiles = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => createTile('floor', true)));

  // walls around
  for (let x = 0; x < WIDTH; x++) {
    tiles[0][x] = createTile('wall', false);
    tiles[HEIGHT - 1][x] = createTile('wall', false);
  }
  for (let y = 0; y < HEIGHT; y++) {
    tiles[y][0] = createTile('wall', false);
    tiles[y][WIDTH - 1] = createTile('wall', false);
  }

  // desks area
  // cubicles (boxy walls)
  for (let y = 8; y <= 18; y += 5) {
    for (let x = 8; x <= 40; x += 8) {
      // rectangle walls
      for (let i = 0; i < 6; i++) {
        tiles[y][x + i] = createTile('wall', false);
        tiles[y + 4][x + i] = createTile('wall', false);
      }
      for (let j = 0; j < 5; j++) {
        tiles[y + j][x] = createTile('wall', false);
        tiles[y + j][x + 6] = createTile('wall', false);
      }
      // door gap
      tiles[y + 2][x] = createTile('floor', true);
      // inside desk marker
      tiles[y + 2][x + 3] = createTile('desk', false);
    }
  }

  // kitchen (bigger)
  for (let y = 2; y <= 10; y++) {
    for (let x = 2; x <= 12; x++) {
      tiles[y][x] = createTile('kitchen', true);
    }
  }

  // meeting rooms (two)
  for (let y = 24; y <= 34; y++) tiles[y][45] = createTile('wall', false);
  for (let x = 40; x <= 58; x++) {
    tiles[24][x] = createTile('wall', false);
    tiles[34][x] = createTile('wall', false);
  }
  // second meeting divider
  for (let y = 24; y <= 34; y++) tiles[y][52] = createTile('wall', false);
  // doors
  tiles[29][45] = createTile('floor', true);
  tiles[29][52] = createTile('floor', true);

  function get(x, y) {
    if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return createTile('void', false);
    return tiles[Math.floor(y)][Math.floor(x)];
  }

  function isWalkable(x, y) {
    const t = get(x, y);
    return t.walkable !== false;
  }

  return { width: WIDTH, height: HEIGHT, get, isWalkable };
}


