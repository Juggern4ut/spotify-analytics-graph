var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Graph = /** @class */ (function () {
    function Graph() {
        var _this = this;
        this.fps = 120;
        /**
         * Get the JSON data and save
         * it in the property
         */
        this.loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("/res/liked_songs.json")];
                    case 1:
                        response = _b.sent();
                        _a = this;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a.songs = _b.sent();
                        this.songs.forEach(function (song) {
                            var dur = _this.timeStringToSeconds(song.duration);
                            _this.longestDuration =
                                _this.longestDuration > dur ? _this.longestDuration : dur;
                        });
                        this.init();
                        return [2 /*return*/];
                }
            });
        }); };
        this.loadData();
    }
    /**
     * Will initialize the graph. This will
     * be called after the data form the
     * json has been loaded
     */
    Graph.prototype.init = function () {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvasSize = {
            width: parseInt(this.canvas.getAttribute("width")),
            height: parseInt(this.canvas.getAttribute("height"))
        };
        this.visibleRange = {
            start: 0,
            end: this.canvasSize.width
        };
        this.scaleY = this.canvasSize.height / this.longestDuration;
        this.startDrawingInterval();
        this.changeViewport();
        this.updateFps();
    };
    /**
     * Adds eventlisteners to the graph so the user
     * can click on songs to set them to active and
     * drag to change the viewport on the x axis
     */
    Graph.prototype.changeViewport = function () {
        var _this = this;
        var dragging = false;
        var initialX = 0;
        var initialDelta = 0;
        var delta = 0;
        var preventClick = false;
        this.canvas.addEventListener("mousedown", function (e) {
            dragging = true;
            initialX = e.pageX;
        });
        document.addEventListener("mouseup", function (e) {
            dragging = false;
            initialDelta = delta * _this.stepSize;
            if (e.target === _this.canvas && !preventClick) {
                var clickedSong = Math.floor((e.offsetX + initialDelta) / _this.stepSize);
                _this.songs.forEach(function (song) { return (song.active = false); });
                if (e.offsetY >
                    _this.canvasSize.height -
                        _this.timeStringToSeconds(_this.songs[clickedSong].duration) *
                            _this.scaleY) {
                    _this.songs[clickedSong].active = true;
                    _this.detailInfos = _this.songs[clickedSong];
                }
            }
            preventClick = false;
        });
        document.addEventListener("mousemove", function (e) {
            if (!dragging)
                return null;
            preventClick = true;
            delta = Math.floor((initialDelta + initialX - e.pageX) / _this.stepSize);
            delta = delta < 0 ? 0 : delta;
            var stepsPerViewPort = _this.canvasSize.width / _this.stepSize;
            var maxDelta = _this.songs.length - stepsPerViewPort;
            delta = delta > maxDelta ? maxDelta : delta;
            _this.visibleRange.start = Math.floor(delta);
            _this.visibleRange.end = Math.floor(stepsPerViewPort + delta);
        });
    };
    /**
     * Will start the Graph
     */
    Graph.prototype.startDrawingInterval = function () {
        var _this = this;
        this.drawingInterval = setInterval(function () {
            _this.initTime = performance.now();
            _this.draw();
            _this.deltaTime = performance.now() - _this.initTime;
        }, 1000 / this.fps);
    };
    /**
     * This function will be called on
     * every frame update
     */
    Graph.prototype.draw = function () {
        this.clear();
        this.drawDurationGraph();
        this.drawFps();
    };
    /**
     * Clear the whole canvas for the next
     * frame
     */
    Graph.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    };
    /**
     * Will loop through all songs and draw a
     * bar based of the length of the song
     */
    Graph.prototype.drawDurationGraph = function () {
        this.stepSize = 15;
        var x = 0;
        var infoX = 0;
        var infoY = 0;
        var drawInfo = false;
        for (var i = this.visibleRange.start; i < this.visibleRange.end; i++) {
            if (i >= this.songs.length)
                break;
            var song = this.songs[i];
            var height = this.timeStringToSeconds(song.duration);
            if (song.active) {
                this.ctx.fillStyle = "blue";
                infoX = x;
                infoY = height;
                drawInfo = true;
            }
            else {
                this.ctx.fillStyle = "red";
            }
            this.ctx.fillRect(x, this.canvasSize.height - height * this.scaleY, this.stepSize, height * this.scaleY);
            x += this.stepSize;
        }
        if (drawInfo) {
            this.drawDetailBubble(infoX, (this.canvasSize.height - infoY - 20) * this.scaleY);
        }
    };
    /**
     * Will display a white box with a black border
     * containing information about the currently
     * clicked song
     * @param x The x coordinate where the bubble should be displayed
     * @param y Thy y coordinate where the bubble should be displayed
     */
    Graph.prototype.drawDetailBubble = function (x, y) {
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
    };
    /**
     * Will take a string of a timestamp and
     * convert it into a number of seconds
     * (01:05 will become 65 for example)
     * @param timeString The Time in the format '02:21'
     * @returns {number} The time in seconds
     */
    Graph.prototype.timeStringToSeconds = function (timeString) {
        var total = 0;
        var tmp = timeString.split(":");
        total += parseInt(tmp[0]) * 60;
        total += parseInt(tmp[1]);
        return total;
    };
    /**
     * Will draw the lastly calculated fps at
     * the top left of the graph
     */
    Graph.prototype.drawFps = function () {
        this.ctx.fillStyle = "#000";
        this.ctx.fillText("FPS: " + this.calculatedFps, 5, 12);
    };
    /**
     * Since the FPS should not be updated every
     * frame, this external interval is used to
     * update the FPS every 300ms
     */
    Graph.prototype.updateFps = function () {
        var _this = this;
        setInterval(function () {
            _this.deltaTime = _this.deltaTime <= 0 ? 0 : _this.deltaTime;
            _this.calculatedFps = 60 / ((_this.deltaTime * _this.fps) / 1000);
            _this.calculatedFps =
                _this.calculatedFps > _this.fps
                    ? _this.fps
                    : Math.round(_this.calculatedFps);
        }, 300);
    };
    return Graph;
}());
