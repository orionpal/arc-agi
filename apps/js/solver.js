// idk why I'm doing this in js

// General Strategy:
// 1. Find Objects
    // 1. Primary Features:
        // 1. shape (see https://en.wikipedia.org/wiki/Geometric_hashing for info on this)
        // 2. colors
    // 2. Secondary Features:
        // 1. area
        // 2. perimeter
        // 3. coordinates
    // 3. Tertiary Features:
        // 1. Symmetry
        // 2. Adjacent Shapes
        // 3. ???



// Will represent the mathematical classification of the shape
class ShapeGroup {
    // Loop
    // Line
    // Line + n arms
}

// Will represent the literal shape
class ShapeObject {
    constructor(shape, colors, area, original_coord) {
    
    }
}

// 2. How can we use these objects for the solution
    // 1. translated
    // 2. repeated
    // 3. reflected
    // 4. rotated
    // 5. scaled
    // 6. compared
    // 7. counts
    // 8. pasted over each other
    // 9. the idea of lines/directionality


// Types of problems:
// 1. key -> pick from solution set
    // When outputs are all same dimensions and have similar objects
    // key might be negative space
    // might be choosing a color
    // might be choosing a shape based on group/area/any feature
// 2. filling in empty space for larger shape/pattern
    // - use idea of symmetry
// 3. pasting objects over each other/ doing stuff with objects
// 4. connecting objects based on special pieces
    // piece determined by color, connection based on orientation
// 5. coloring based on feature
    // based on count

function solve_full() {
    // 1. Find out if there's a dimension change
        // 1. always same dimensions; 100% confident
        // 2. in dimensions always same, out dimensions always same; 100% confident
        // 3. in dimensions different, out dimensions same; 100% confident
        // 4. in dimensions same, out dimensions different; ?% confident
        // 5. in dimensions different, out dimensions different; ?% confident
    var dimensions_type = get_dimensions_type()
    console.log(`dimensions type: ${dimensions_type}`)
    height = 1
    width = 1
    if (dimensions_type == 1) {
        height = CURRENT_INPUT_GRID.height
        width = CURRENT_INPUT_GRID.width
    }
    if (dimensions_type == 2 || dimensions_type == 3) {
        height = TRAIN_PAIRS[0]['output'].length
        width = TRAIN_PAIRS[0]['output'][0].length
    }
    // 2. Let's get some heckin objects based on shape
    objects = find_objects_BFS(CURRENT_INPUT_GRID)
    console.log(`trying to find objects`)
    console.log(objects)

    object = objects[0]
    console.log(`height: ${height} and width: ${width}`)
    CURRENT_OUTPUT_GRID = new Grid(height, width, object)
    // CURRENT_OUTPUT_GRID = random_answer()
    syncFromDataGridToEditionGrid(); // MUST UPDATE
}




function line(startRow, startCol, direction) {

}

function get_dimensions_type() {
    // 1. Find out if there's a dimension change
        // 1. always same dimensions; 100% confident
        // 2. in dimensions always same, out dimensions always same; 100% confident
        // 3. in dimensions different, out dimensions same; 100% confident
        // 4. in dimensions same, out dimensions different; ?% confident
        // 5. in dimensions different, out dimensions different; ?% confident
        // For 4 and 5, see if the dimensions of any identified objects in input match the dimensions of output
    var results = {
        alwaysSameDimensions: true,
        inSameOutSame: true,
        inDifferentOutSame: true,
        inSameOutDifferent: true,
    };
    const num_tests = TRAIN_PAIRS.length
    var in_base_dimension = { width: TRAIN_PAIRS[0]['input'][0].length, height: TRAIN_PAIRS[0]['input'].length }
    var out_base_dimension = { width: TRAIN_PAIRS[0]['output'][0].length, height: TRAIN_PAIRS[0]['output'].length }
    for (let i = 0; i < num_tests; i++) {
        const inDimensions = { width: TRAIN_PAIRS[i]['input'][0].length, height: TRAIN_PAIRS[i]['input'].length };
        const outDimensions = { width: TRAIN_PAIRS[i]['output'][0].length, height: TRAIN_PAIRS[i]['output'].length };

        const inOutSame = inDimensions.width === outDimensions.width && inDimensions.height === outDimensions.height
        const allInSame = inDimensions.width === in_base_dimension.width && inDimensions.height === in_base_dimension.height;
        const allOutSame = outDimensions.width === out_base_dimension.width && outDimensions.height === out_base_dimension.height;

        if (!inOutSame){
            results.alwaysSameDimensions = false
        }
        if (!allInSame || !allOutSame) {
            results.inSameOutSame = false;
        }
        if (!allOutSame) {
            results.inDifferentOutSame = false;
        }
        if (!allInSame) {
            results.inSameOutDifferent = false;
        }
    }

    if (results.alwaysSameDimensions) {
        return 1
    }
    if (results.inSameOutSame) {
        return 2
    }
    if (results.inDifferentOutSame) {
        return 3
    }
    if (results.inSameOutDifferent) {
        return 4
    }
    return 5
}

// Generic way to identify "things", in a more intelligent model this might be something like a Segment Anything Model (SAM)
function find_objects_BFS(grid, includeDiagonals = true, sameColor = false) {
    const directions = [
        [0, 1],  // right
        [1, 0],  // down
        [0, -1], // left
        [-1, 0], // up
    ];

    if (includeDiagonals) {
        directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]); // diagonals
    }

    const rows = grid.height;
    const cols = grid.width;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const objects = [];

    const isValidCell = (row, col) => {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    };
    // Function for turning coordinates into grid
    function convertCoordinatesToGrid(coords) {
        // Step 1: Find the maximum x and y coordinates
        let minX = coords[0][0];
        let maxX = coords[0][0];
        let minY = coords[0][1];
        let maxY = coords[0][1];

        coords.forEach(([x, y, val]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });

        // Step 2: Initialize the 2D array with 0s
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const array = Array.from({ length: width }, () => Array(height).fill(0));

        // Step 3: Set the coordinates in the array to 1
        coords.forEach(([x, y, val]) => {
            const adjustedX = x - minX;
            const adjustedY = y - minY;
            array[adjustedX][adjustedY] = val;
        });

        return array;
    }

    // Function to BFS for cells for an object
    const exploreObject = (startRow, startCol) => {
        const queue = [[startRow, startCol]];
        const object_coords = [];

        const startValue = grid.grid[startRow][startCol];

        // Get coordinates for cells
        while (queue.length > 0) {
            const [currentRow, currentCol] = queue.shift();

            if (
                !isValidCell(currentRow, currentCol) ||
                visited[currentRow][currentCol] ||
                grid.grid[currentRow][currentCol] === 0 ||
                (sameColor && grid.grid[currentRow][currentCol] !== startValue)
            ) {
                continue;
            }

            visited[currentRow][currentCol] = true;
            const cell_value = grid.grid[currentRow][currentCol]
            object_coords.push([currentRow, currentCol, cell_value]);

            for (const [dRow, dCol] of directions) {
                queue.push([currentRow + dRow, currentCol + dCol]);
            }
        }
        // Convert coordinates into object
        return convertCoordinatesToGrid(object_coords);
    };

    // Just look through grid to find non empty (0) spaces
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!visited[i][j] && grid.grid[i][j] !== 0) {
                const object = exploreObject(i, j);
                if (object.length > 0) {
                    objects.push(object);
                }
            }
        }
    }
    return objects;
}

// placeholder to know I can make shit
function random_answer(){
    let rng = Math.random();
    let min = 1;
    let max = 30;
    let width = Math.floor(Math.random() * (max - min + 1)) + min;
    let height = Math.floor(Math.random() * (max - min + 1)) + min;
    let data = []

    for (let i = 0; i < height; i++) {
        data[i] = [];
        for (let j = 0; j < width; j++) {
            data[i][j] = Math.floor(Math.random() * 9);
        }
    }
    return new Grid(height, width, data)
}