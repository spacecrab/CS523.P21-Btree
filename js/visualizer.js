document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('btree-canvas');
    const degreeInput = document.getElementById('degree');
    const valueInput = document.getElementById('value');
    const insertBtn = document.getElementById('insert');
    const searchBtn = document.getElementById('search');
    const deleteBtn = document.getElementById('delete');
    const resetBtn = document.getElementById('reset');
    const operationSteps = document.getElementById('operation-steps');
    
    let btree = new BTree(parseInt(degreeInput.value));
    
    // Visualize the current state of the tree
    function visualizeTree() {
        canvas.innerHTML = '';
        const nodes = btree.getAllNodes();
        
        if (nodes.length === 0) return;
        
        // Group nodes by level
        const levelMap = {};
        let maxLevel = 0;
        
        nodes.forEach(node => {
            if (!levelMap[node.level]) {
                levelMap[node.level] = [];
            }
            levelMap[node.level].push(node);
            maxLevel = Math.max(maxLevel, node.level);
        });
        
        // Create SVG element
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        
        const levelHeight = 80;
        const nodeWidth = 50;
        const nodeHeight = 30;
        const horizontalSpacing = 20;
        
        // Calculate SVG dimensions
        const svgHeight = (maxLevel + 1) * levelHeight + 50;
        let svgWidth = 0;
        
        for (let level in levelMap) {
            const levelWidth = levelMap[level].length * (nodeWidth + horizontalSpacing);
            svgWidth = Math.max(svgWidth, levelWidth);
        }
        
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);
        canvas.appendChild(svg);
        
        // Draw connections first (so they appear behind nodes)
        for (let level = 0; level < maxLevel; level++) {
            const parentNodes = levelMap[level];
            const childNodes = levelMap[level + 1] || [];
            
            parentNodes.forEach(parent => {
                const parentX = parent.position * (nodeWidth + horizontalSpacing) + nodeWidth / 2;
                const parentY = level * levelHeight + nodeHeight;
                
                // Draw lines to children
                childNodes.forEach(child => {
                    if (child.parentIndex === parent.position) {
                        const childX = child.position * (nodeWidth + horizontalSpacing) + nodeWidth / 2;
                        const childY = (level + 1) * levelHeight;
                        
                        const line = document.createElementNS(svgNS, "line");
                        line.setAttribute("x1", parentX);
                        line.setAttribute("y1", parentY);
                        line.setAttribute("x2", childX);
                        line.setAttribute("y2", childY);
                        line.setAttribute("stroke", "#666");
                        line.setAttribute("stroke-width", "1");
                        svg.appendChild(line);
                    }
                });
            });
        }
        
        // Draw nodes
        for (let level in levelMap) {
            const nodes = levelMap[level];
            nodes.forEach((node, index) => {
                const x = index * (nodeWidth + horizontalSpacing);
                const y = level * levelHeight;
                
                // Create node rectangle
                const rect = document.createElementNS(svgNS, "rect");
                rect.setAttribute("x", x);
                rect.setAttribute("y", y);
                rect.setAttribute("width", nodeWidth);
                rect.setAttribute("height", nodeHeight);
                rect.setAttribute("fill", node.isLeaf ? "#aed581" : "#90caf9");
                rect.setAttribute("stroke", "#333");
                rect.setAttribute("rx", "5");
                svg.appendChild(rect);
                
                // Add keys text
                const text = document.createElementNS(svgNS, "text");
                text.setAttribute("x", x + nodeWidth / 2);
                text.setAttribute("y", y + nodeHeight / 2 + 5);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("font-size", "12");
                text.textContent = node.keys.join(",");
                svg.appendChild(text);
            });
        }
    }
    
    // Display operation steps
    function displaySteps(steps) {
        operationSteps.innerHTML = '';
        steps.forEach(step => {
            const p = document.createElement('p');
            p.textContent = step;
            operationSteps.appendChild(p);
        });
    }
    
    // Event listeners
    insertBtn.addEventListener('click', function() {
        const value = parseInt(valueInput.value);
        if (!isNaN(value)) {
            btree.insert(value);
            visualizeTree();
            displaySteps(btree.steps);
            valueInput.value = '';
        }
    });
    
    searchBtn.addEventListener('click', function() {
        const value = parseInt(valueInput.value);
        if (!isNaN(value)) {
            btree.search(value);
            visualizeTree();
            displaySteps(btree.steps);
        }
    });
    
    resetBtn.addEventListener('click', function() {
        btree = new BTree(parseInt(degreeInput.value));
        visualizeTree();
        operationSteps.innerHTML = '<p>Tree has been reset.</p>';
    });
    
    degreeInput.addEventListener('change', function() {
        const degree = parseInt(this.value);
        if (degree >= 2) {
            btree = new BTree(degree);
            visualizeTree();
            operationSteps.innerHTML = '<p>Tree degree changed to ' + degree + '.</p>';
        }
    });
    
    // Initial visualization
    visualizeTree();
});