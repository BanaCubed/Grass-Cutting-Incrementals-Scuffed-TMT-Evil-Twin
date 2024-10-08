var layoutInfo = {
    startTab: "field",
    startNavTab: "field",
	showTree: true,

    treeLayout: [
        ['field'],
        ['pres', 'crys'],
        ['hop'],
    ]

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)


addLayer("tree-tab", {
    tabFormat: [
        ["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]
    ],
    previousTab: "",
    leftTab: true,
})