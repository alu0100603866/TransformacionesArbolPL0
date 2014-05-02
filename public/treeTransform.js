function treeTransform (node) {
    if (!node) return null;
    
    var result;
    switch (node.type) {
        case 'BLOCK':
        case 'PROCEDURE':
            for (var i in node.procs)
                node.procs[i] = treeTransform(node.procs[i]);
            if (node.content) {
                if (node.content.length)
                    for (var i in node.content)
                        node.content[i] = treeTransform(node.content[i]);
                else
                    node.content = treeTransform(node.content);
            }
            break;
        case '=':
            node.right = treeTransform(node.right);
            break;
        case '<':
        case '<=':
        case '>':
        case '>=':
        case '==':
        case '!=':
            node.left = treeTransform(node.left);
            node.right = treeTransform(node.right);
            break;
        case '*':
        case '+':
        case '/':
            node.left = treeTransform(node.left);
            node.right = treeTransform(node.right);
            node = constantFolding(node);
            
            if (node.type == '*' || node.type == '/')
                node = multOptimization(node);
            break;
        case '-':
            // - Binario
            if (node.left) {
                node.left = treeTransform(node.left);
                node.right = treeTransform(node.right);
                node = constantFolding(node);
            }
            // - Unario
            else {
                node.value = treeTransform(node.value);
                
                // -(NUM(x)) --> NUM(-x)
                if (node.value.type == 'NUMBER') {
                    node = node.value;
                    node.value = -node.value;
                }
            }
            break;
        case 'PROC_CALL':
            for (var i in node.arguments)
                node.arguments[i] = treeTransform(node.arguments[i]);
            break;
        case 'IFELSE':
            for (var i in node.sf)
                node.sf[i] = treeTransform(node.sf[i]);
            // Fall-through
        case 'IF':
        case 'WHILE':
            node.cond = treeTransform(node.cond);
            for (var i in node.st)
                node.st[i] = treeTransform(node.st[i]);
            break;
        case 'ODD':
            node.exp = treeTransform(node.exp);
            break;
        case 'ARGEXP':
            node.content = treeTransform(node.content);
            break;
    }
    
    return node;
}

function constantFolding (node) {
    if (node.left.type == 'NUMBER' && node.right.type == 'NUMBER') {
        switch (node.type) {
            case '+':
                node.value = parseInt(node.left.value) + parseInt(node.right.value);
                break;
            case '-':
                node.value = parseInt(node.left.value) - parseInt(node.right.value);
                break;
            case '*':
                node.value = parseInt(node.left.value) * parseInt(node.right.value);
                break;
            case '/':
                node.value = parseInt(node.left.value) / parseInt(node.right.value);
                break;
        }
        node.type = 'NUMBER';
        delete node.left;
        delete node.right;
    }
    
    return node;
}

function multOptimization (node) {
    if (node.right.type == 'NUMBER') {
        var val = node.right.value;
        // Potencia de 2
        if (val != 0 && (val & val-1) == 0) {
            node.type = (node.type == '*')? 'SHIFTLEFT' : 'SHIFTRIGHT';
            node.right = { type: 'NUMBER', value: Math.log(val)/Math.log(2)};
        }
    }
    
    return node;
}
