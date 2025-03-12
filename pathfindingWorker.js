// Listen for messages from the main thread
self.onmessage = (event) => {
    // Destructure the grid, start, and end points from the event data
    const { grid, start, end } = event.data;
    // Find the path using the A* algorithm
    const path = findPath(grid, start, end);
    // Post the path back to the main thread
    self.postMessage({ path });
};

// A* pathfinding algorithm
const findPath = (grid, start, end) => {
    const openSet = [start]; // Set of discovered nodes that need to be evaluated
    const cameFrom = new Map(); // Map of navigated nodes
    const gScore = new Map(); // Cost from start to a node
    const fScore = new Map(); // Estimated cost from start to end through a node

    gScore.set(JSON.stringify(start), 0); // gScore of start is 0
    fScore.set(JSON.stringify(start), heuristic(start, end)); // fScore of start is the heuristic estimate to the end

    while (openSet.length > 0) {
        // Get the node in openSet with the lowest fScore value
        let current = openSet.reduce((a, b) => (fScore.get(JSON.stringify(a)) < fScore.get(JSON.stringify(b)) ? a : b));

        // If the current node is the end node, reconstruct and return the path
        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current);
        }

        // Remove current node from openSet
        openSet.splice(openSet.indexOf(current), 1);

        // Iterate over the neighbors of the current node
        for (let neighbor of getNeighbors(grid, current)) {
            let tentativeGScore = gScore.get(JSON.stringify(current)) + 1; // Calculate tentative gScore

            // If this path to neighbor is better than any previous one
            if (tentativeGScore < (gScore.get(JSON.stringify(neighbor)) || Infinity)) {
                // Record the best path to the neighbor
                cameFrom.set(JSON.stringify(neighbor), current);
                gScore.set(JSON.stringify(neighbor), tentativeGScore);
                fScore.set(JSON.stringify(neighbor), tentativeGScore + heuristic(neighbor, end));

                // If neighbor is not in openSet, add it
                if (!openSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    return []; // Return an empty array if no path is found
};

// Heuristic function for A* (Manhattan distance)
const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Get the neighbors of a node
const getNeighbors = (grid, node) => {
    const neighbors = [];
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    // Check each direction for valid neighbors
    for (let direction of directions) {
        const neighbor = { x: node.x + direction.x, y: node.y + direction.y };
        // Ensure the neighbor is within bounds and walkable (represented by 0)
        if (grid[neighbor.x] && grid[neighbor.x][neighbor.y] === 0) {
            neighbors.push(neighbor);
        }
    }

    return neighbors;
};

// Reconstruct the path from end to start
const reconstructPath = (cameFrom, current) => {
    const path = [current];
    // Follow the path back to the start
    while (cameFrom.has(JSON.stringify(current))) {
        current = cameFrom.get(JSON.stringify(current));
        path.unshift(current);
    }
    return path;
};