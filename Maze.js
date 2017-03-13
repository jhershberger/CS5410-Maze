// export default
class Maze {
    constructor(x,y) {
      this.x = parseInt(x);
      this.y = parseInt(y);
      this.total_cells = x*y;
    }

    //This function will simply initialize the maze
    initMaze() {
      var maze = new Array();

      //iterate through the x, y provided to create a x by y maze
      for (let i = 0; i < this.x; i++) {
        //we create an array at each index so it is a two-dimensional array
        maze[i] = new Array();

        for (let j = 0; j < this.y; j++) {
          //Initialize each cell with a value that signifies it is a wall
          //Prim's algorithm starts with a grid full of walls

          //each cell has 4 walls, left right up down
          maze[i][j] = { x:i, y:j, north: false, south: false, east: false, west: false, visited: false, active: null, path: null, breadcrumb: false, start: false, end: false, score: -1 };
        }
      }
      return maze;

    }


    randomizeMaze(maze) {
      //pick a random cell and mark it part of the maze
      let curr_x = parseInt(Math.random() * (this.x-1)),
      curr_y = parseInt(Math.random() * (this.y-1)),
      visited = 1,
      rand_neighbor = -1,
      rand_unvisited = -1,
      neighbors = [],
      unvisited = [],
      x = this.x,
      y = this.y;


      //add curr to the maze
      maze[curr_x][curr_y].path = true;


      //add curr's neighbors to the list, if curr isn't in borders then add all neighbors
      //else see which neighbors are in the grid and add them to neighbors
      function add_neighbors(unvisited, cell_x, cell_y) {
        if(maze[cell_x+1] && maze[cell_x + 1][cell_y] && maze[cell_x+1][cell_y].path !== true && unvisited.indexOf((cell_x+1) + ','+ cell_y) < 0) {
          unvisited.push((cell_x+1) + ',' + cell_y);
        }
        if(maze[cell_x-1] && maze[cell_x-1][cell_y] && maze[cell_x-1][cell_y].path !== true && unvisited.indexOf((cell_x-1) + ','+ cell_y) < 0) {
          unvisited.push((cell_x-1) + ',' + cell_y);
        }
        if(maze[cell_x][cell_y-1] && maze[cell_x][cell_y-1].path !== true && unvisited.indexOf(cell_x + ',' + (cell_y-1)) < 0) {
          unvisited.push(cell_x + ',' + (cell_y-1));
        }
        if(maze[cell_x][cell_y+1] && maze[cell_x][cell_y+1].path !== true && unvisited.indexOf(cell_x + ',' + (cell_y+1)) < 0) {
          unvisited.push(cell_x + ',' + (cell_y+1));
        }
      }

      add_neighbors(unvisited, curr_x, curr_y);

      //while there are walls in the list, add the unvisited neighbors to the unvisited
      //and make paths between the cells
      while(unvisited.length) {
        //pick a random wall from the list
        rand_unvisited = parseInt(Math.random() * (unvisited.length-1));

        //choose a random unvisited cell
        curr_x = parseInt(unvisited[rand_unvisited].split(',')[0]);
        curr_y = parseInt(unvisited[rand_unvisited].split(',')[1]);

        //remove the cell from the unvisited
        unvisited.splice(rand_unvisited, 1);


        //make a path between the random adjacent neighbor and the neighbor that is a part of the maze
        if (curr_y+1 < y && maze[curr_x][curr_y+1].path === true) {
          neighbors.push('north');
        }
        if (curr_x-1 >= 0 && maze[curr_x-1][curr_y].path === true) {
          neighbors.push('west');
        }
        if (curr_y-1 >= 0 && maze[curr_x][curr_y - 1].path === true) {
          neighbors.push('south');
        }
        if (curr_x+1 < x && maze[curr_x+1][curr_y].path === true) {
          neighbors.push('east');
        }

        //if multiple neighbors are in the maze, randomly choose one of them
        if (neighbors.length > 1) {
          rand_neighbor = parseInt(Math.random() * (neighbors.length-1));
        } else {
          rand_neighbor = 0;
        }

        //add the current cell as part of the maze
        maze[curr_x][curr_y].path = true;

        //open up the path between the cells
        if (neighbors[rand_neighbor] == 'north') {
          maze[curr_x][curr_y].north = true;
          maze[curr_x][curr_y+1].south = true;
        } else if (neighbors[rand_neighbor] == 'west') {
          maze[curr_x][curr_y].west = true;
          maze[curr_x-1][curr_y].east = true;
        } else if (neighbors[rand_neighbor] == 'south') {
          maze[curr_x][curr_y].south = true;
          maze[curr_x][curr_y-1].north = true;
        } else if (neighbors[rand_neighbor] == 'east') {
          maze[curr_x][curr_y].east = true;
          maze[curr_x+1][curr_y].west = true;
        }

        //update the unvisited list
        add_neighbors(unvisited, curr_x, curr_y);

        //reset neighbors
        neighbors = [];

      }

      maze[x-1][0].end = true;
      return maze;
    }

    add_bc(maze,x,y) {
      maze[x][y].breadcrumb = true;
    }



    //return the randomized maze
    get maze() {
      return this.randomizeMaze(this.initMaze());
    }

}
