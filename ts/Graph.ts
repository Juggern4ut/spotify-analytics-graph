interface Song {
  title: string;
  artist: string;
  album: string;
  duration: string;
  active?: boolean;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface VisibleRange {
  start: number;
  end: number;
}

class Graph {
  songs: Song[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  canvasSize: CanvasSize;
  visibleRange: VisibleRange;
  fps: number = 120;
  drawingInterval: number;
  stepSize: number;
  detailInfos: Object;
  initTime: number;
  deltaTime: number;
  calculatedFps: number;

  constructor() {
    this.loadData();
  }

  /**
   * Will initialize the graph. This will
   * be called after the data form the
   * json has been loaded
   */
  init() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");

    this.canvasSize = {
      width: parseInt(this.canvas.getAttribute("width")),
      height: parseInt(this.canvas.getAttribute("height"))
    };

    this.visibleRange = {
      start: 0,
      end: this.canvasSize.width
    };

    this.startDrawingInterval();
    this.changeViewport();
    this.updateFps();
  }

  /**
   * Adds eventlisteners to the graph so the user
   * can click on songs to set them to active and
   * drag to change the viewport on the x axis
   */
  changeViewport() {
    let dragging = false;
    let initialX: number = 0;
    let initialDelta: number = 0;
    let delta: number = 0;
    let preventClick: boolean = false;

    this.canvas.addEventListener("mousedown", e => {
      dragging = true;
      initialX = e.pageX;
    });

    document.addEventListener("mouseup", e => {
      dragging = false;
      initialDelta = delta * this.stepSize;

      if (e.target === this.canvas && !preventClick) {
        let clickedSong = Math.floor(
          (e.offsetX + initialDelta) / this.stepSize
        );
        this.songs.forEach(song => (song.active = false));

        if (
          e.offsetY >
          this.canvasSize.height -
            this.timeStringToSeconds(this.songs[clickedSong].duration)
        ) {
          this.songs[clickedSong].active = true;
          this.detailInfos = this.songs[clickedSong];
        }
      }

      preventClick = false;
    });

    document.addEventListener("mousemove", e => {
      if (!dragging) return null;

      preventClick = true;

      delta = Math.floor((initialDelta + initialX - e.pageX) / this.stepSize);

      delta = delta < 0 ? 0 : delta;

      let stepsPerViewPort = this.canvasSize.width / this.stepSize;
      let maxDelta = this.songs.length - stepsPerViewPort;
      delta = delta > maxDelta ? maxDelta : delta;

      this.visibleRange.start = Math.floor(delta);
      this.visibleRange.end = Math.floor(stepsPerViewPort + delta);
    });
  }

  /**
   * Will start the Graph
   */
  startDrawingInterval(): void {
    this.drawingInterval = setInterval(() => {
      this.initTime = performance.now();
      this.draw();
      this.deltaTime = performance.now() - this.initTime;
    }, 1000 / this.fps);
  }

  /**
   * This function will be called on
   * every frame update
   */
  draw(): void {
    this.clear();
    this.drawDurationGraph();
    this.drawFps();
  }

  /**
   * Clear the whole canvas for the next
   * frame
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
  }

  /**
   * Get the JSON data and save
   * it in the property
   */
  loadData = async () => {
    let response = await fetch("/res/liked_songs.json");
    this.songs = await response.json();
    this.init();
  };

  /**
   * Will loop through all songs and draw a
   * bar based of the length of the song
   */
  drawDurationGraph(): void {
    this.stepSize = 5;
    let x = 0;
    let infoX = 0;
    let infoY = 0;
    let drawInfo = false;
    for (let i = this.visibleRange.start; i < this.visibleRange.end; i++) {
      if (i >= this.songs.length) break;

      let song = this.songs[i];
      let height = this.timeStringToSeconds(song.duration);

      if (song.active) {
        this.ctx.fillStyle = "blue";
        infoX = x;
        infoY = height;
        drawInfo = true;
      } else {
        this.ctx.fillStyle = "red";
      }

      this.ctx.fillRect(
        x,
        this.canvasSize.height - height,
        this.stepSize,
        height
      );

      x += this.stepSize;
    }

    if (drawInfo) {
      this.drawDetailBubble(infoX, this.canvasSize.height - infoY - 100);
    }
  }

  /**
   * Will display a white box with a black border
   * containing information about the currently
   * clicked song
   * @param x The x coordinate where the bubble should be displayed
   * @param y Thy y coordinate where the bubble should be displayed
   */
  drawDetailBubble(x: number, y: number): void {
    y = y < 1 ? 1 : y;
    x += 3;
    x = x > this.canvasSize.width - 200 ? this.canvasSize.width - 201 : x;

    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(x - 1, y - 1, 202, 82);
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(x, y, 200, 80);
    this.ctx.fillStyle = "#000";
    this.ctx.fillText(this.detailInfos["title"], x + 10, y + 20, 180);
    this.ctx.fillText(this.detailInfos["artist"], x + 10, y + 35, 180);
    this.ctx.fillText(this.detailInfos["album"], x + 10, y + 50, 180);
    this.ctx.fillText(this.detailInfos["duration"], x + 10, y + 65, 180);
  }

  /**
   * Will take a string of a timestamp and
   * convert it into a number of seconds
   * (01:05 will become 65 for example)
   * @param timeString The Time in the format '02:21'
   * @returns {number} The time in seconds
   */
  timeStringToSeconds(timeString: string): number {
    let total = 0;
    let tmp = timeString.split(":");
    total += parseInt(tmp[0]) * 60;
    total += parseInt(tmp[1]);
    return total;
  }

  /**
   * Will draw the lastly calculated fps at
   * the top left of the graph
   */
  drawFps(): void {
    this.ctx.fillStyle = "#000";
    this.ctx.fillText("FPS: " + this.calculatedFps, 5, 12);
  }

  /**
   * Since the FPS should not be updated every
   * frame, this external interval is used to
   * update the FPS every 300ms
   */
  updateFps(): void {
    setInterval(() => {
      this.deltaTime = this.deltaTime <= 0 ? 0 : this.deltaTime;
      this.calculatedFps = 60 / ((this.deltaTime * this.fps) / 1000);
      this.calculatedFps =
        this.calculatedFps > this.fps
          ? this.fps
          : Math.round(this.calculatedFps);
    }, 300);
  }
}
