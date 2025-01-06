// pages/game/puzzle/game.js
import { PuzzleHelper } from '../../../utils/puzzle-helper';

Page({
  data: {
    moves: 0,
    gameComplete: false,
    showPreview: false,
    imagePath: '',
  },

  onLoad(options) {
    this.setData({
      imagePath: options.imagePath
    });
    this.initializeGame();
  },

  async initializeGame() {
    const query = wx.createSelectorQuery();
    query.select('#puzzleCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size with margin for gaps
        canvas.width = 320;  // 300 + gaps
        canvas.height = 320;
        
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.loadImage();
      });
  },

  async loadImage() {
    const image = this.canvas.createImage();
    
    image.onload = () => {
      this.image = image;
      this.puzzleHelper = new PuzzleHelper(300, 3);  // Keep original size for image
      this.setupNewGame();
    };
    
    image.src = this.data.imagePath;
  },

  setupNewGame() {
    this.setData({ 
      moves: 0, 
      gameComplete: false,
      showPreview: false
    });
    
    this.puzzleHelper.initializeTiles();
    do {
      this.puzzleHelper.shuffleTiles();
    } while (!this.puzzleHelper.isSolvable());
    
    this.drawPuzzle();
  },

  drawPuzzle() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const gap = 5;  // Gap between tiles
    const tileSize = this.puzzleHelper.tileSize;
    const offsetX = gap;  // Start with offset to center the puzzle
    const offsetY = gap;

    // Draw background
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.puzzleHelper.tiles.forEach(tile => {
      const { x, y, width, height } = tile;
      const { row, col } = tile.currentPos;
      
      // Calculate position with gaps
      const drawX = offsetX + col * (width + gap);
      const drawY = offsetY + row * (height + gap);
      
      // Draw tile background
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(drawX, drawY, width, height);
      
      // Draw tile image
      this.ctx.drawImage(
        this.image,
        x, y, width, height,  // source
        drawX, drawY, width, height  // destination
      );
      
      // Draw tile border
      this.ctx.strokeStyle = '#2196F3';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(drawX, drawY, width, height);
    });

    // Draw empty tile space with different style
    const emptyX = offsetX + this.puzzleHelper.emptyTile.col * (tileSize + gap);
    const emptyY = offsetY + this.puzzleHelper.emptyTile.row * (tileSize + gap);
    this.ctx.fillStyle = '#E3F2FD';
    this.ctx.fillRect(emptyX, emptyY, tileSize, tileSize);
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.strokeRect(emptyX, emptyY, tileSize, tileSize);
  },

  onTouchStart(e) {
    const touch = e.touches[0];
    const gap = 5;
    const tileSize = this.puzzleHelper.tileSize;
    
    // Adjust for gaps in calculation
    const row = Math.floor((touch.y - gap) / (tileSize + gap));
    const col = Math.floor((touch.x - gap) / (tileSize + gap));
    
    if (this.puzzleHelper.canMoveTile(row, col)) {
      if (this.puzzleHelper.moveTile(row, col)) {
        // Add animation effect
        wx.vibrateShort();  // 添加触感反馈
        
        this.setData({ moves: this.data.moves + 1 });
        this.drawPuzzle();
        
        if (this.puzzleHelper.isComplete()) {
          this.setData({ gameComplete: true });
          wx.showModal({
            title: '恭喜',
            content: `你完成了拼图！共移动 ${this.data.moves} 次`,
            showCancel: false
          });
        }
      }
    }
  },

  drawPreviewCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#previewCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 300;
        canvas.height = 300;
        
        const image = canvas.createImage();
        image.onload = () => {
          // 绘制原图
          ctx.drawImage(image, 0, 0, 300, 300);
          
          // 绘制网格线
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          
          // 绘制水平线
          for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 100);
            ctx.lineTo(300, i * 100);
            ctx.stroke();
          }
          
          // 绘制垂直线
          for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 100, 0);
            ctx.lineTo(i * 100, 300);
            ctx.stroke();
          }
          
          // 绘制外边框
          ctx.strokeRect(0, 0, 300, 300);
        };
        image.src = this.data.imagePath;
      });
  },

  togglePreview() {
    const showPreview = !this.data.showPreview;
    this.setData({ showPreview });
    if (showPreview) {
      // 当显示预览时，初始化预览画布
      setTimeout(() => this.drawPreviewCanvas(), 100);
    }
  },
  restartGame() {
    this.setupNewGame();
  }
});