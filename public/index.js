class Node {
    constructor(value) {
        this.value = value
        this.cost = null
        this.previous = null
        this.neighbours = {}
    }
}

class NeighourListGraph {
    constructor() {
        this.nodelist = []
    }

    addNode(value) {
        const newNode = new Node(value)
        this.nodelist.push(newNode)
        return this.nodelist.length - 1
    }

    addEdge(from, to, weight) {
        this.nodelist[from].neighbours[to] = weight
    }

    getNeighbours(node_index) {
        const node = this.nodelist[node_index]
        let keys = Object.keys(node.neighbours)
        for (let i = 0; i < keys.length; i++) {
            keys[i] = parseInt(keys[i])
        }
        return keys
    }

    getWeight(from, to) {
        const weight = this.nodelist[from].neighbours[to]
        if (weight == undefined) {
            return null
        }
        return weight
    }

    getElement(node_index) {
        return this.nodelist[node_index].value
    }

    getCost(node_index) {
        return this.nodelist[node_index].cost
    }

    setCost(node_index, cost) {
        this.nodelist[node_index].cost = cost
    }

    removeCosts() {
        for (let i = 0; i < this.nodelist.length; i++) {
            this.nodelist[i].cost = null
            this.nodelist[i].previous = null
        }
    }

    getPrevious(node_index) {
        return this.nodelist[node_index].previous
    }

    setPrevious(node_index, prevIndex) {
        this.nodelist[node_index].previous = prevIndex
    }

    numNodes() {
        return this.nodelist.length
    }
}

let maze = []
let graph = null
let sizeX = 0
let sizeY = 0
let startIndex = null
let finishIndex = null

let wall = "#"
let open = " "
let start = "*"
let end = "-"

let c = document.querySelector('canvas')
let ctx = c.getContext("2d")

// Reading the uploaded file and converts to an matrix
document.getElementById("file").onchange = function () {
    var file = this.files[0];

    maze = []

    wall = document.querySelector("#wall").value
    open = document.querySelector("#path").value
    start = document.querySelector("#start").value
    end = document.querySelector("#end").value

    var reader = new FileReader();
    reader.onload = function (progressEvent) {
        // By lines
        var lines = this.result.split("\n");
        for (var line = 0; line < lines.length; line++) {
            if (line == 0) {
                sizeX = parseInt(lines[line])
            } else if (line == 1) {
                sizeY = parseInt(lines[line])
            } else {

                row = []
                for (let i = 0; i < lines[line].length; i++) {
                    if (row.length < sizeX) {
                        row.push(lines[line][i])
                    }
                }
                maze.push(row)
            }
        }

        buildMaze()
        drawMaze()
        findShortestPath()

    };
    reader.readAsText(file);
};

function buildMaze() {

    graph = new NeighourListGraph()

    // Adding all the nodes
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            graph.addNode([x, y])
        }
    }

    // Creating edges
    for (let i = 0; i < graph.numNodes(); i++) {

        let leftIndex = i % sizeX == 0 ? undefined : i - 1;
        let rightIndex = (i + 1) % sizeX == 0 ? undefined : i + 1
        let bottomIndex = i + sizeX <= graph.numNodes() ? i + sizeX : undefined
        let topIndex = i - sizeX >= 0 ? i - sizeX : undefined

        let xIndex = i % sizeX
        let yIndex = (Math.floor(i / (sizeY)))

        if(yIndex == sizeY){
            break
        }

        if(maze[yIndex][xIndex] == "-"){
            finishIndex = i
        }

        if(maze[yIndex][xIndex] == "*"){
            startIndex = i
        }


        if (maze[yIndex][xIndex] != undefined && maze[yIndex][xIndex] != wall) {

            if (leftIndex && maze[yIndex][xIndex - 1] != wall) {
                graph.addEdge(i, leftIndex, 1)
            }

            if (rightIndex && maze[yIndex][xIndex + 1] != wall) {
                graph.addEdge(i, rightIndex, 1)
            }

            if (bottomIndex && maze[yIndex + 1][xIndex] != wall) {
                graph.addEdge(i, bottomIndex, 1)
            }

            if (topIndex && maze[yIndex - 1][xIndex] != wall) {
                graph.addEdge(i, topIndex, 1)
            }

        }
    }
}

function drawMaze() {
    ctx.clearRect(0, 0, c.width, c.height);

    routeSizeX = 500 / sizeX
    routeSizeY = 500 / sizeY

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {

            if (maze[y][x] == "#") {
                ctx.fillStyle = "#000000";
            }else if(maze[y][x] == "-"){
                ctx.fillStyle = "#42f578"
            }else if(maze[y][x] == "*"){
                ctx.fillStyle = "#eff542"
            }else{
                ctx.fillStyle = "#ffffff";
            }


            ctx.fillRect(x * routeSizeX, y * routeSizeY, routeSizeX, routeSizeY);
        }
    }
}

function findShortestPath(){
    graph.removeCosts()

    let nodekoe = []

    graph.setCost(startIndex, 0)

    nodekoe.push(startIndex)

    while (nodekoe.length > 0){
        let node = nodekoe.shift()
        let cost = graph.getCost(node)
        
        let neighbours = graph.getNeighbours(node)

        for(let i = 0; i < neighbours.length; i++){
            if(graph.getCost(neighbours[i]) == null){
                graph.setCost(neighbours[i], cost + 1)
                graph.setPrevious(neighbours[i], node)
                nodekoe.push(neighbours[i])
                if(neighbours[i] == finishIndex){
                    document.querySelector("#length").innerHTML = "Shortest path: " + (cost + 1)
                    displayShortestPath()
                    return //escape
                }
            }
        }
        
    }
    document.querySelector("#length").innerHTML = "No path between start and finish..."
}

function displayShortestPath(){
    routeSizeX = 500 / sizeX
    routeSizeY = 500 / sizeY

    nodeIndex = finishIndex

    while(graph.getPrevious(nodeIndex) !== null){

        nodeIndex = graph.getPrevious(nodeIndex) 
        
        position = graph.getElement(nodeIndex)

        ctx.fillStyle = "#ff0000";
        ctx.fillRect(position[0] * routeSizeX, position[1] * routeSizeY, routeSizeX, routeSizeY);
        
    }
}