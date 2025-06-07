class BTreeNode {
    constructor(isLeaf = true, degree = 3) {
        this.isLeaf = isLeaf;
        this.keys = [];
        this.children = [];
        this.degree = degree; // Minimum degree
    }

    // Returns true if the node is full
    isFull() {
        return this.keys.length === 2 * this.degree - 1;
    }
}

class BTree {
    constructor(degree = 3) {
        this.root = new BTreeNode(true, degree);
        this.degree = degree;
        this.steps = []; // For tracking steps in operations
    }

    // Clears the steps array
    clearSteps() {
        this.steps = [];
    }

    // Search for a key in the tree, returns node and index if found, or null
    search(key, node = this.root) {
        this.clearSteps();
        return this._search(key, node);
    }

    _search(key, node) {
        this.steps.push(`Searching for key ${key} in node with keys [${node.keys.join(', ')}]`);
        
        let i = 0;
        // Find the first key greater than or equal to k
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }

        // If the found key is equal to k, return this node and index
        if (i < node.keys.length && key === node.keys[i]) {
            this.steps.push(`Found key ${key} at index ${i}`);
            return { node, index: i };
        }

        // If this is a leaf node, key is not in tree
        if (node.isLeaf) {
            this.steps.push(`Key ${key} not found in tree`);
            return null;
        }

        // Recur to the appropriate child
        this.steps.push(`Moving to child ${i}`);
        return this._search(key, node.children[i]);
    }

    // Insert a key into the tree
    insert(key) {
        this.clearSteps();
        this.steps.push(`Inserting key ${key} into the tree`);

        // If root is full, tree grows in height
        if (this.root.isFull()) {
            this.steps.push(`Root is full, creating new root`);
            let newRoot = new BTreeNode(false, this.degree);
            newRoot.children[0] = this.root;
            this.root = newRoot;
            this._splitChild(0, newRoot);
        }

        this._insertNonFull(key, this.root);
    }

    // Helper function to insert in a non-full node
    _insertNonFull(key, node) {
        this.steps.push(`Inserting ${key} into non-full node with keys [${node.keys.join(', ')}]`);
        
        let i = node.keys.length - 1;

        // If this is a leaf node
        if (node.isLeaf) {
            // Find position to insert and shift keys if needed
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                i--;
            }
            // Insert the key
            node.keys[i + 1] = key;
            this.steps.push(`Inserted ${key} at leaf node, keys now [${node.keys.join(', ')}]`);
        } else {
            // Find the child which is going to have the new key
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }
            i++;
            
            // If the child is full, split it
            if (node.children[i].isFull()) {
                this.steps.push(`Child at index ${i} is full, splitting`);
                this._splitChild(i, node);
                if (key > node.keys[i]) {
                    i++;
                }
            }
            this._insertNonFull(key, node.children[i]);
        }
    }

    // Split a child of a node
    _splitChild(index, parent) {
        let child = parent.children[index];
        let newChild = new BTreeNode(child.isLeaf, this.degree);
        
        this.steps.push(`Splitting child at index ${index} with keys [${child.keys.join(', ')}]`);
        
        // Move the upper half of child's keys to newChild
        for (let j = 0; j < this.degree - 1; j++) {
            newChild.keys[j] = child.keys[j + this.degree];
        }
        
        // If child is not a leaf, move the upper half of its children too
        if (!child.isLeaf) {
            for (let j = 0; j < this.degree; j++) {
                newChild.children[j] = child.children[j + this.degree];
            }
        }
        
        // Adjust child's key count
        child.keys.length = this.degree - 1;
        
        // Insert newChild into parent's children
        for (let j = parent.children.length; j > index + 1; j--) {
            parent.children[j] = parent.children[j - 1];
        }
        parent.children[index + 1] = newChild;
        
        // Move median key from child to parent
        for (let j = parent.keys.length; j > index; j--) {
            parent.keys[j] = parent.keys[j - 1];
        }
        parent.keys[index] = child.keys[this.degree - 1];
        
        this.steps.push(`Split complete. Parent keys now [${parent.keys.join(', ')}]`);
    }

    // Function to get all nodes for visualization
    getAllNodes() {
        let nodes = [];
        this._collectNodes(this.root, nodes, 0, 0);
        return nodes;
    }

    _collectNodes(node, nodes, level, position) {
        nodes.push({
            keys: node.keys,
            isLeaf: node.isLeaf,
            level: level,
            position: position
        });

        if (!node.isLeaf) {
            for (let i = 0; i < node.children.length; i++) {
                this._collectNodes(node.children[i], nodes, level + 1, position + i);
            }
        }
        return nodes;
    }
}