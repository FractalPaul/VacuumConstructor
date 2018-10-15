var vacuumParms = {
    numSpheres: 6,
    opacity: .5,
    zoom: 1,
    radius: 0.5,
    rotateAnimation: false
    
}

window.onload = function () {

    gui.add(vacuumParms, 'numSpheres', 0, 12,1)
        .onChange(function (newValue) { // Listen to changes within the GUI
            //console.log("Value changed to:  ", newValue);
            showSpheres(vacuumParms.numSpheres);
        })
        .listen(); // Listen to changes outside the GUI - GUI will update when changed from outside

    gui.add(vacuumParms, 'zoom', 1, 10)
        .onChange(function (newValue) {
           scaleCamera();
        })
        .listen();

    gui.add(vacuumParms, 'opacity', 0, 1)
        .onChange(function (newValue) {
            //console.log("Num Spheres changed to: ",newValue);
            meshMaterial.opacity = vacuumParms.opacity;
            //drawGeometry();
        })
        .listen(); // Listen to changes outside the GUI - GUI will update when changed from outside
    gui.add(vacuumParms, 'rotateAnimation')
        .onChange(function (newValue) {

        })
        .listen();    
};