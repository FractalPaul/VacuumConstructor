var vacuumParms = {
    numSpheres: 14,
    color: 0x2f7dbd,
    opacity: 0.2,
    zoom: 5,
    radius: 0.5,
    rotateAnimation: false,
    rotateReset: false,
    roughness: 0.4,
    metalness: 0.4,
    depthTest: false,
    depthWrite: true,
    wireframe: false,
    wireframeline: 0.2,
    drawLines: true,
    drawPoints: true,
    firstLayer: true,
    secondLayer: true,
}

window.onload = function () {

    _gui.add(vacuumParms, 'numSpheres', 0, 47, 1)
        .name("# of Spheres")
        .onChange(function (newValue) { // Listen to changes within the _gui
            //console.log("Value changed to:  ", newValue);
            showSpheres(vacuumParms.numSpheres);
        })
        .listen(); // Listen to changes outside the gui - GUI will update when changed from outside

    _gui.addColor(vacuumParms, 'color')
        .onChange(function (newValue) {
            _meshMaterial.color.set(newValue);
        })
        .listen();

    _gui.add(vacuumParms, 'zoom', 1, 10)
        .onChange(function (newValue) {
            scaleCamera();
        })
        .listen();

    _gui.add(vacuumParms, 'opacity', 0, 1)
        .onChange(function (newValue) {
            //console.log("Num Spheres changed to: ",newValue);
            _meshMaterial.opacity = vacuumParms.opacity;
            //drawGeometry();
        })
        .listen(); // Listen to changes outside the gui - GUI will update when changed from outside
    _gui.add(vacuumParms, 'roughness', 0, 1)
        .name("Reflectivity")
        .onChange(function (newValue) {
            _meshMaterial.roughness = vacuumParms.roughness;
        })
        .listen();

    _gui.add(vacuumParms, 'metalness', 0, 1)
        .name("Shine")
        .onChange(function (newValue) {
            _meshMaterial.metalness = vacuumParms.metalness;
        })
        .listen();

    _gui.add(vacuumParms, 'depthTest')
        .name("Depth Overlay")
        .onChange(function (newValue) {
            _meshMaterial.depthTest = vacuumParms.depthTest;
        })
        .listen();

    _gui.add(vacuumParms, 'depthWrite')
        .name("Depth Write")
        .onChange(function (newValue) {
            _meshMaterial.depthWrite = vacuumParms.depthWrite;
        })
        .listen();

    _gui.add(vacuumParms, 'wireframe')
        .name('Wireframe')
        .onChange(function (newValue) {
            _meshMaterial.wireframe = vacuumParms.wireframe;
        })
        .listen();

    _gui.add(vacuumParms, 'rotateAnimation')
        .name('Animate Rotation ')
        .onChange(function (newValue) {

        })
        .listen();
    _gui.add(vacuumParms, 'rotateReset')
        .name('Rotation Reset')
        .onChange(function (newValue) {
            if (vacuumParms.rotateReset) {
                rotationReset();
                vacuumParms.rotateReset = false;
            }
        })
        .listen();
    _gui.add(vacuumParms, 'drawLines')
        .name("Draw Lines")
        .onChange(function(newValue) {
            showLines(newValue);
        })
        .listen();
    _gui.add(vacuumParms, 'drawPoints')
        .name('Draw Points')
        .onChange(function(newValue){
showPoints(newValue);
        });
};