// Justin Hershberger
// CS5410 Assignment 2
// 2/21/17

let Graphics = (function () {
    let context = null,
        m = null,
        mz = null,
        _x = 0,
        _y = -1,
        canvas = null,
        high_scores = [],
        sp = [],
        breadcrumb = [];

    function initialize(x,y,cell_size) {
        createMaze(x,y);
        CanvasRenderingContext2D.prototype.clear = function(curr_x, curr_y) {
          this.save();
          this.setTransform(1, 0, 0, 1, 0, 0);
          this.clearRect(0, 0, canvas.width, canvas.height);
          this.restore();
        };
    }

    function createMaze(x,y) {
      // clear the previous data structures
      sp = [];
      breadcrumb = [];

      //create the maze
      m = new Maze(x,y);

      //flag the end of the maze
      m.maze[x-1][0].end = true;
      mz = m.maze;

      //set the x and y so they are accessible by each function
      _x = x;
      _y = y;

      //get the shortest path and update the scoring based on it
      let path = shortestPath(0, y-1, p = []);
      for (let i=0; i < path.length; i++){
        let px = parseInt(path[i].split(',')[0]),
        py = parseInt(path[i].split(',')[1]);

        mz[px][py].score = 5;
        mz[px][py].path = true;
        sp.push([px,py]);
      }

      //add a score for the end and eliminate the score for the beginning
      mz[x-1][0].score = 5;
      mz[0][y-1].score = 0;

      //draw the maze data structure
      drawMaze(mz, x, y);
    }

    function shortestPath(x,y, path=[]){
      //we need to start at the beginning index and then visit each  vertex
      //getting the min distance to each neighbor. Eventually we will have
      //the shortest path from the source to all vertices
      var n = null,
          s = null,
          e = null,
          w = null;

      //start at the x,y passed in
      mz[x][y].visited = true;
      path.push(x + ',' + y);

      //check if we are at the end of the maze
      if (x == _x-1 && y == 0){
        path.push(x + ',' + y);
        return path;
      }

      //keep track of the north, south, east, and west neighbors
      var n = (function() {
        if (mz[x][y].north == true && mz[x][y+1].south == true){
          if(mz[x][y+1].visited != true){
            mz[x][y+1].visited = true;
            return shortestPath(x, y+1, path);
          } else {
            return false;
          }
        }
      }());

      var s = (function() {

        if (mz[x][y].south == true && mz[x][y-1].north == true){
          if(mz[x][y-1].visited != true){
            mz[x][y-1].visited = true;
            return shortestPath(x, y-1, path);
          } else {
            return false;
          }
        }
      }());

      var e = (function() {
        if (mz[x][y].east == true && mz[x+1][y].west == true){
          if(mz[x+1][y].visited != true){
            mz[x+1][y].visited = true;
            return shortestPath(x+1, y, path);
          } else {
            return false;
          }
        }
      }());

      var w = (function() {

        if (mz[x][y].west == true && mz[x-1][y].east == true){
          if(mz[x-1][y].visited != true){
            mz[x-1][y].visited = true;
            return shortestPath(x-1, y, path);
          } else {
            return false;
          }
        }
      }());

      //if there are no neighbors then we need to reset the path
      if (!n && !s && !e && !w ) {
        path.splice(path.indexOf(x + ',' + y));
      } else {
        //return which path has a result
        return (n || s || e || w);
      }


    }

    //the function to render the data structure
    function drawMaze(maze, x, y) {
      canvas = $('#mazeCanvas')[0];
      context = canvas.getContext('2d');
      let w = $('#mazeCanvas').width();
      let h = $('#mazeCanvas').height();
      let cell_size = w / x;

      context.translate(0.5,0.5);

      //the starting point
      context.fillStyle = 'rgba(200,0,0, 0.5)';
      context.fillRect  (0,h-cell_size,cell_size,cell_size);

      // the end point
      context.fillStyle = 'rgba(200,0,0, 0.5)';
      context.fillRect  (w-cell_size,0,cell_size,cell_size);

      //iterate through each cell and draw the walls according to the maze's data structure
      for (let c=0; c < x; c++) {
        for (let r=0; r < y; r++) {
          let i = c*cell_size+0.5;
          let j = r*cell_size+0.5;
          //The grid is opposite of what I expected so north and south are opposite
          if(maze[c][r].west !== true) {
            context.beginPath();
            context.strokeStyle = 'white';
            context.moveTo(i,j);
            context.lineTo(i, j+cell_size);
            context.stroke();
          }
          if(maze[c][r].north !== true) {
            context.beginPath();
            context.strokeStyle = 'white';
            context.moveTo(i,j+cell_size);
            context.lineTo(i+cell_size , j+cell_size);
            context.stroke();
          }
          if(maze[c][r].east !== true) {
            context.beginPath();
            context.strokeStyle = 'white';
            context.moveTo(i+cell_size,j+cell_size);
            context.lineTo(i+cell_size, j);
            context.stroke();
          }
          if(maze[c][r].south !== true) {
            context.beginPath();
            context.strokeStyle = 'white';
            context.moveTo(i+cell_size,j);
            context.lineTo(i, j);
            context.stroke();
          }
        }

      }

      //update the canvas to be the sprite layer now that we have the maze as a background
      canvas = $('#spriteCanvas')[0];
      context = canvas.getContext('2d');
    }

    //this is the sprite object
    function Texture(spec) {
        var that = {},
            ready = false,
            bc_ready = false,
            c_size = -1,
            image = new Image(),
            sp_img = new Image(),
            bc_img = new Image();

        image.onload = () => {
            ready = true;
        };

        bc_img.onload = () => {
          bc_ready = true;
        };

        sp_img.onload = () => {
          sp_ready = true;
        }

        sp_img.src = 'black-hole.png';
        bc_img.src = 'bread.png';
        image.src = spec.imageSource;

        that.init = function(cell_size) {
          c_size = cell_size;
          spec.width = cell_size;
          spec.height = cell_size;
          spec.center.x = 0;
          spec.center.y = 600 - cell_size;
          curr_x = parseInt(spec.center.x / cell_size);
          curr_y = parseInt(spec.center.y / cell_size);
        }


        that.update = function(total_time) {
            //add the current position to our breadcrumb trail
            breadcrumb.push([curr_x, curr_y]);

            //check if we are at the end
            if(m.maze[curr_x][curr_y].end == true) {

              //update the high scores
              high_scores.push(score);
              high_scores.sort(function(a,b){return b-a});

              //display the high scores
              $('.first').html(" 1) " + high_scores[0]);
              if(high_scores[1]){
                $('.second').html(" 2) " + high_scores[1]);

              }
              if(high_scores[2]){
                $('.third').html(" 3) " + high_scores[2]);

              }

              //clear the canvas
              context.clearRect(0,0,canvas.width,canvas.height);

              //Show the victory screen
              $('.cnvCont').html('<div class=row><div class="col-md-8 winner"> \
                You Win! <br><br> Final Score: ' + score + '<br><br>' + "Time to Solve: <br>"
                 + (total_time/1000).toFixed(2) + ' seconds</div></div>');

              //reset our values we maintain thru the life of the maze
              score = 0;
              total_time = 0;
              breadcrumb = [];
              sp = [];
            }
            $(".showScore").html("<h2>Score: " + score + " </h2>");

            //breadcrumb trail.
            canvas = $('#bcCanvas')[0];
            context = canvas.getContext('2d');

            //draw the bc trail on the bread crumb canvas layer
            if(bc_ready){
              for (let i=0; i < breadcrumb.length; i++){
                context.drawImage(bc_img, breadcrumb[i][0]*c_size+c_size/5 , breadcrumb[i][1]*c_size+c_size/5, c_size/2, c_size/2);
              }
            }

            //reset the canvas context
            canvas = $('#spriteCanvas')[0];
            context = canvas.getContext('2d');
        }

        that.moveLeft = function(elapsedTime) {
          if(spec.center.x - c_size >= 0 && (mz[curr_x][curr_y].west || mz[curr_x-1][curr_y].east)) {
            spec.center.x -= c_size;
            curr_x -= 1;

            //update the score and reset the score to 0
            score += mz[curr_x][curr_y].score;
            mz[curr_x][curr_y].score = 0;
          }

        };

        that.moveRight = function(elapsedTime) {
          if((spec.center.x + c_size) + c_size <= 600 && (mz[curr_x][curr_y].east || mz[curr_x+1][curr_y].west) ) {
            spec.center.x += c_size;

            curr_x += 1;

            //update the score and reset the score to 0
            score += mz[curr_x][curr_y].score;
            mz[curr_x][curr_y].score = 0;

          }

        };

        that.moveUp = function(elapsedTime) {
          if(spec.center.y - c_size >= 0 && (mz[curr_x][curr_y].south || mz[curr_x][curr_y-1].north)){
            spec.center.y -= c_size;
            curr_y -= 1;

            //update the score and reset the score to 0
            score += mz[curr_x][curr_y].score;
            mz[curr_x][curr_y].score = 0;
          }
        };

        that.moveDown = function(elapsedTime) {
          if((spec.center.y + c_size) + c_size <= 600 && (mz[curr_x][curr_y].north || mz[curr_x][curr_y+1].south) ) {
            spec.center.y += c_size;
            curr_y += 1;

            //update the score and reset the score to 0
            score += mz[curr_x][curr_y].score;
            mz[curr_x][curr_y].score = 0;

          }
        };

        that.score = function() {
          y_count += 1;

          //toggle the hidden class
          if (y_count % 2 != 0) {
            $(".showScore").removeClass("hidden");

          } else {
            $(".showScore").addClass("hidden");
          }
        };

        that.bcTrail = function() {
          b_count += 1;

          //toggle the hidden class
          if (b_count % 2 != 0) {
            $('#bcCanvas').removeClass('hidden');

          } else {
            $('#bcCanvas').addClass('hidden');

          }
        }

        that.showPath = function() {
          p_count += 1;
          canvas = $('#spCanvas')[0];
          context = canvas.getContext('2d');

          // remove the cells we have visited from the shortest path
          for(let i=0; i < breadcrumb.length; i++){
            for(let j=0; j < sp.length; j++) {
              if(breadcrumb[i][0] == sp[j][0] && breadcrumb[i][1] == sp[j][1]) {
                sp.splice(j,1)
              }
            }
          }

          //iterate through the shortest path
          for(let i=0; i < sp.length; i++ ){
            context.drawImage(sp_img, sp[i][0]*c_size+c_size/5 , sp[i][1]*c_size+c_size/5, c_size/2, c_size/2);
          }

          if(p_count % 2 != 0){
            score -= 10;
            $('#spCanvas').removeClass('hidden');
          } else {
            $('#spCanvas').addClass('hidden');
            context.clearRect(0,0,canvas.width,canvas.height);
          }

          canvas = $('#spriteCanvas')[0];
          context = canvas.getContext('2d');
        }


        //the hint function shows the next cell in the shortest path
        that.hint = function() {
          h_count += 1;
          canvas = $('#spCanvas')[0];
          context = canvas.getContext('2d');
          let dist = [],
              closest_sp = [],
              csp = [];


          //update the shortest path to only include the cells not visited.
          for(let i=0; i < breadcrumb.length; i++){
            for(let j=0; j < sp.length; j++) {
              if(breadcrumb[i][0] == sp[j][0] && breadcrumb[i][1] == sp[j][1]) {
                sp.splice(j,1);
              }
            }
          }

          //draw the next cell in the shortest path
          context.drawImage(sp_img, sp[0][0]*c_size+c_size/5 , sp[0][1]*c_size+c_size/5, c_size/2, c_size/2);

          if(h_count % 2 != 0){
            score -= 3;
            $('#spCanvas').removeClass('hidden');
          } else {
            context.clearRect(0,0,canvas.width,canvas.height);
            dist = [];
            closest_sp = [];
            $('#spCanvas').addClass('hidden');
          }

          canvas = $('#spriteCanvas')[0];
          context = canvas.getContext('2d');
        }

        //draw our sprite to the canvas
        that.draw = function() {
            if (ready) {
              canvas = $('#spriteCanvas')[0];
              context = canvas.getContext('2d');
                context.save();
                context.translate(spec.center.x+0.5, spec.center.y+0.5);
                context.translate(-(spec.center.x+0.5), -(spec.center.y+0.5));

                context.drawImage(
                    image,
                    spec.center.x,
                    spec.center.y,
                    spec.width, spec.height);

                context.restore();
            }
        }

        return that;
    }

    function beginRender() {
        context.clear(curr_x, curr_y);
    }

    return {
        initialize: initialize,
        beginRender: beginRender,
        Texture: Texture

    };

}());

let total_time = 0;
score = 0,
y_count = 0,
p_count = 0,
h_count = 0,
b_count = 0;

let MyGame = (function() {
    let that = {};
    let previousTime = performance.now();
    let elapsedTime = 0;
    let inputDispatch = {};
    let myTexture = Graphics.Texture({
        imageSource: 'earth.png',
        center: { x: 0, y: 570 },
        width: 30,
        height: 30,
    });

    function update(elapsedTime) {
        total_time += elapsedTime;
        myTexture.update(total_time);
    }

    function render() {
      Graphics.beginRender();
      myTexture.draw();
    }

    function gameLoop(time) {
        elapsedTime = time - previousTime;
        previousTime = time;

        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    }

    function keyDown(e) {
        if (inputDispatch.hasOwnProperty(e.key)) {
            inputDispatch[e.key](elapsedTime);
        }
    }

    that.initialize = function(x,y,cell_size) {
        Graphics.initialize(x,y,cell_size);
        myTexture.init(cell_size);


        window.addEventListener('keydown', keyDown);

        //movement
        inputDispatch['a'] = myTexture.moveLeft;
        inputDispatch['d'] = myTexture.moveRight;
        inputDispatch['w'] = myTexture.moveUp;
        inputDispatch['s'] = myTexture.moveDown;
        inputDispatch['j'] = myTexture.moveLeft;
        inputDispatch['l'] = myTexture.moveRight;
        inputDispatch['i'] = myTexture.moveUp;
        inputDispatch['k'] = myTexture.moveDown;

        //utility functions
        inputDispatch['y'] = myTexture.score;
        inputDispatch['b'] = myTexture.bcTrail;
        inputDispatch['p'] = myTexture.showPath;
        inputDispatch['h'] = myTexture.hint;

        requestAnimationFrame(gameLoop);
    }

    return that;
}());

$(document).ready(function(){

  //when a maze option is clicked, remove the choices and add a start over link that
  //reloads the page
  let sizes = $('.mazeOptions').clone();
  $(".mazeSize").on('click', function(){

    let canvas = $('#bcCanvas')[0];
    let context = canvas.getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);

    canvas = $('#spCanvas')[0];
    context = canvas.getContext('2d');
    context.clearRect(0,0, canvas.width, canvas.height);

    $(".mazeOptions").addClass('hidden');
    $('.startOver').removeClass('hidden');
    score = 0;
    y_count = 0;
    b_count = 0;
    p_count = 0;
    h_count = 0;
    total_time = 0;
  });

  $('.startOver').on('click', function(){
    $(".startOver").addClass('hidden');
    $('.mazeOptions').removeClass('hidden');
    $('.cnvCont').html("<canvas id='mazeCanvas' width=600 height=600 style='border:1px solid #000000;'></canvas> \
    <canvas id='spriteCanvas' width=600 height=600 style='border:1px solid #000000;'></canvas>\
    <canvas class='hidden' id='bcCanvas' width=600 height=600 style='border:1px solid #000000;'></canvas>\
    <canvas class='hidden' id='spCanvas' width=600 height=600 style='border:1px solid #000000;'></canvas>");
  });
})
