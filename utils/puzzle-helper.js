export class PuzzleHelper {
  constructor(imageSize, difficulty = 3) {
    this.imageSize = imageSize;
    this.difficulty = difficulty;
    this.tileSize = imageSize / difficulty;
    this.tiles = [];
    this.emptyTile = { row: difficulty - 1, col: difficulty - 1 };
  }

  initializeTiles() {
    this.tiles = [];
    for (let row = 0; row < this.difficulty; row++) {
      for (let col = 0; col < this.difficulty; col++) {
        if (row === this.difficulty - 1 && col === this.difficulty - 1) continue;
        
        this.tiles.push({
          currentPos: { row, col },
          originalPos: { row, col },
          x: col * this.tileSize,
          y: row * this.tileSize,
          width: this.tileSize,
          height: this.tileSize
        });
      }
    }
  }

  getTileAtPosition(row, col) {
    return this.tiles.find(tile => 
      tile.currentPos.row === row && tile.currentPos.col === col
    );
  }

  shuffleTiles() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
      
      // Update current positions
      const temp = this.tiles[i].currentPos;
      this.tiles[i].currentPos = this.tiles[j].currentPos;
      this.tiles[j].currentPos = temp;
    }
  }

  isSolvable() {
    let inversions = 0;
    for (let i = 0; i < this.tiles.length - 1; i++) {
      for (let j = i + 1; j < this.tiles.length; j++) {
        if (this.tiles[i].originalPos.row * this.difficulty + this.tiles[i].originalPos.col >
            this.tiles[j].originalPos.row * this.difficulty + this.tiles[j].originalPos.col) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  }

  canMoveTile(row, col) {
    return (
      (Math.abs(row - this.emptyTile.row) === 1 && col === this.emptyTile.col) ||
      (Math.abs(col - this.emptyTile.col) === 1 && row === this.emptyTile.row)
    );
  }

  isValidMove(newRow, newCol) {
    return (
      newRow >= 0 && newRow < this.difficulty &&
      newCol >= 0 && newCol < this.difficulty &&
      (Math.abs(newRow - this.emptyTile.row) === 1 && newCol === this.emptyTile.col) ||
      (Math.abs(newCol - this.emptyTile.col) === 1 && newRow === this.emptyTile.row)
    );
  }

  moveTile(row, col) {
    if (!this.canMoveTile(row, col)) return false;

    const tileIndex = this.tiles.findIndex(t => 
      t.currentPos.row === row && t.currentPos.col === col
    );

    if (tileIndex === -1) return false;

    // Swap positions
    const tile = this.tiles[tileIndex];
    const tempPos = { ...tile.currentPos };
    tile.currentPos = { ...this.emptyTile };
    this.emptyTile = tempPos;

    return true;
  }

  isComplete() {
    return this.tiles.every(tile => 
      tile.currentPos.row === tile.originalPos.row && 
      tile.currentPos.col === tile.originalPos.col
    );
  }
}