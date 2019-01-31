// Globals...
"use strict"
var _gui = new dat.GUI();
var _scene = new THREE.Scene();
var _aspect = window.innerWidth / window.innerHeight;
var _frustumSize = 14;
var _camera = new THREE.OrthographicCamera(_frustumSize * _aspect / -2, _frustumSize * _aspect / 2, _frustumSize / 2, _frustumSize / -2, 1, 2000);
var _controls = null;
var _renderer = new THREE.WebGLRenderer();
var _meshMaterial = new THREE.MeshStandardMaterial({
    color: vacuumParms.color,
    opacity: vacuumParms.opacity,
    transparent: true,
    depthTest: vacuumParms.depthTest,
    depthWrite: vacuumParms.depthWrite,
    roughness: vacuumParms.roughness,
    wireframe: vacuumParms.wireframe
}); //new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: false });
var _geometryS = new THREE.SphereBufferGeometry(vacuumParms.radius, 20, 20);
var _groups = new THREE.Group();

// Point properties
var _pointColor = new THREE.Color();
var _matPoint = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: THREE.VertexColors
});
var _groupsPoints = new THREE.Group();

// Line Properties
var _matLine = new THREE.LineBasicMaterial({
    linewidth: 1,
    vertexColors: THREE.VertexColors
});
var _groupsLines = new THREE.Group();

Initialize();
scaleCamera();

createGeometry();

showSpheres(vacuumParms.numSpheres);

function scaleCamera() {
    _camera.zoom = vacuumParms.zoom;
    _camera.updateProjectionMatrix();
    _controls.update();
}

function Initialize() {
    // THREE.Vector3.visible = true;
    // THREE.Vector3.layer = 0;

    _renderer.setSize(window.innerWidth, window.innerHeight);
    _renderer.setPixelRatio(window.devicePixelRatio);
    _renderer.setClearColor(0x000000, 1);

    document.body.appendChild(_renderer.domElement);

    _controls = new THREE.OrbitControls(_camera, _renderer.domElement);

    initLights(_scene);

    //initPoints(_scene);
}

function initLights(_scene) {
    // Ambient light
    var light = new THREE.AmbientLight(0xFFFFFF, 2.5);
    _scene.add(light);
    var lights = [];
    var distL = -400;
    var intensity = 0.3;
    lights[0] = new THREE.PointLight(0xffffff, intensity, distL);
    lights[1] = new THREE.PointLight(0xffffff, intensity, distL);
    lights[2] = new THREE.PointLight(0xffffff, intensity, distL);
    lights[3] = new THREE.PointLight(0xffffff, intensity, distL);

    lights[0].position.set(1000, 1000, -100);
    lights[1].position.set(-1000, 1000, 100);
    lights[2].position.set(-1000, -1000, -100);
    lights[3].position.set(1000, -1000, -100);

    for (var i = 0; i < lights.length; i++) {
        _scene.add(lights[i]);
    }
}

function createGeometry() {
    // Create the first sphere (center).
    var group1 = createSphere(0, 0, 0, 0, _geometryS, _meshMaterial);
    _groups.add(group1);

    // createSpherePaths(_groups, vacuumParms.radius, _geometryS, _meshMaterial);
    // createLines(_groups, vacuumParms.radius);
    createAxisPoints(_groups, vacuumParms.radius, 4);

    _scene.add(_groups);
    _scene.add(_groupsPoints);
    _scene.add(_groupsLines);

    _camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);

        if (vacuumParms.rotateAnimation) {
            var rotRate = 0.01;
            _groups.rotation.y += rotRate;
            _groupsPoints.rotation.y += rotRate;
            _groupsLines.rotation.y += rotRate;
        }

        _renderer.render(_scene, _camera);
    };

    animate();
}

function createAxisPoints(groups, radius, numLayers) {
    var polarAngle = 0;
    var azimuthAngle = 0;
    var allAxisPoints = [];

    // Calculate the points from origin to north Polar Angle 0. Up.
    polarAngle = 0;
    var primeAxisPointsZero = calcPrimaryAxisPoints(polarAngle, azimuthAngle, radius, numLayers);
    convertVectorToGraphPoints(_groupsPoints, primeAxisPointsZero);
    convertVectorToSpheres(_groups, -1, primeAxisPointsZero);

    for (var azimuthIndex = 0; azimuthIndex < 6; azimuthIndex++) {
        azimuthAngle = Math.PI * (azimuthIndex / 3.0);
        allAxisPoints.push([]);
        // Calculate the Primary Axis along the 1/3 and 2/3 pi axis.
        for (var polarIndex = 1; polarIndex < 3; polarIndex++) {
            polarAngle = Math.PI * polarIndex / 3.0;
            var axisPoints = calcPrimaryAxisPoints(polarAngle, azimuthAngle, radius, numLayers);

            convertVectorToGraphPoints(_groupsPoints, axisPoints);
            convertVectorToSpheres(_groups, -1, axisPoints);

            allAxisPoints[azimuthIndex].push(axisPoints);
        }
    }
    // Calculate the points going along the Polar Angle of Pi (down)
    polarAngle = Math.PI;
    azimuthAngle=0;
    var primeAxisPointsPi = calcPrimaryAxisPoints(polarAngle, azimuthAngle, radius, numLayers);
    convertVectorToGraphPoints(_groupsPoints, primeAxisPointsPi);
    convertVectorToSpheres(_groups, -1, primeAxisPointsPi);

    calcLinesBetweenAxis(_groupsLines, primeAxisPointsZero, allAxisPoints, primeAxisPointsPi);
    calcPointsBetweenAxis(_groupsPoints, radius, primeAxisPointsZero, allAxisPoints, primeAxisPointsPi);

    console.log("Number of Points: " + _groupsPoints.children.length);
}

function convertVectorToGraphPoints(groupsPoints, axisPoints) {
    for (var i = 0; i < axisPoints.length; i++) {
        groupsPoints.add(createPointFromVector(axisPoints[i]));
    }
}

function convertVectorToSpheres(groups, layer, centerPoints) {
    var lp = layer;
    for (var i = 0; i < centerPoints.length; i++) {
        if (layer == -1)
            lp = i + 1;
        else lp = layer;

        groups.add(createSphere(centerPoints[i].x, centerPoints[i].y, centerPoints[i].z, lp, _geometryS, _meshMaterial));
    }
}

function calcLinesBetweenAxis(groups, primeAxisPointsZero, allAxisPoints, primeAxisPointsPi) {

    // draw lines from the Primary Zero points to the 1/3 pi points.
    for (var j = 0; j < primeAxisPointsZero.length; j++) {
        for (var i = 0; i < allAxisPoints.length; i++) {
            createLine(groups, primeAxisPointsZero[j], allAxisPoints[i][0][j]);
        }
    }

    // draw lines from 1/3 PI points to 2/3 PI points
    for (var j = 0; j < allAxisPoints.length; j++) {
        for (var i = 0; i < allAxisPoints[j][0].length; i++) {
            createLine(groups, allAxisPoints[j][0][i], allAxisPoints[j][1][i]);
        }
    }
    
    // draw lines between points on the 1/3 PI points set azimuthally.
    for (var j = 1; j < allAxisPoints.length ; j++) {
        for (var i = 0; i < allAxisPoints[j][0].length; i++) {
            createLine(groups, allAxisPoints[j-1][0][i], allAxisPoints[j ][0][i]);
        }
    }
    // draw lines between points on the 1/3 Pi points set azimuthally, match up the last one with the first one to close the cirlce.
    for (var i = 0; i < allAxisPoints[0][0].length; i++) {
        createLine(groups, allAxisPoints[0][0][i], allAxisPoints[allAxisPoints.length-1 ][0][i]);
    }

    // draw lines between points on the 2/3 PI points set azimuthally.
    for (var j = 1; j < allAxisPoints.length ; j++) {
        for (var i = 0; i < allAxisPoints[j][0].length; i++) {
            createLine(groups, allAxisPoints[j-1][1][i], allAxisPoints[j ][1][i]);
        }
    }
    // draw lines between the points on the 2/3 Pi points set azimuthally match up the last one with the first one to close the cirlce.
    for (var i = 0; i < allAxisPoints[0][0].length; i++) {
        createLine(groups, allAxisPoints[0][1][i], allAxisPoints[allAxisPoints.length-1 ][1][i]);
    }

    // draw lines from the Primary Pi points to the 2/3 PI points.
    for (var j = 0; j < primeAxisPointsPi.length; j++) {
        for (var i = 0; i < allAxisPoints.length; i++) {
            createLine(groups, primeAxisPointsPi[j], allAxisPoints[i][1][j]);
        }
    }
}

// Given to Points (vector3) Point 1, Point 2 calculate the line between the 2.
// Calcualate the points in between of a distance between in radius length.
function calcPointsOnLine(vecPoint1, vecPoint2, radius) {
    var lineAxis = new THREE.Line3(vecPoint1, vecPoint2);

    var numPoints = Math.round(lineAxis.distance() / radius);
    var pts = [];

    if (numPoints > 1) {
        for (var i = 1; i < numPoints; i++) {
            var vecPoint = new THREE.Vector3();
            var vecResult = lineAxis.at(i / numPoints, vecPoint);
            pts.push(vecPoint);
        }
    }

    return pts;
}

function calcPointsBetweenAxis(groupsPoints, radius, primeAxisPointsZero, allAxisPoints, primeAxisPointsPi) {
    var vecPts = [];
    var vecAllPts = [];
    var vecPrev = [];
var vecFirst = [];
    // Calculate Points from the Primary Zero points to the 1/3 Primary Axis points.
    // iterate over the planes to calculate the points between the layers on each axis (Primary Zero Axis and 1/3 Axis).
    for (var i = 0; i < allAxisPoints.length; i++) {
        vecAllPts = [];
        // iterate over the layers on the Prime Zero Axis.
        for (var j = 0; j < primeAxisPointsZero.length; j++) {
            vecPts = calcPointsOnLine(primeAxisPointsZero[j], allAxisPoints[i][0][j], radius);
            convertVectorToGraphPoints(groupsPoints, vecPts);
            convertVectorToSpheres(_groups, j + 1, vecPts);

            if (vecPts != null && vecPts.length > 0)
                vecAllPts.push(vecPts);
        }
        if (i ==0) 
        vecFirst = vecAllPts;

        // Calculate the points between the points between the Primary Zero Axis and the 1/3 Primary Axis. going across the planes.
        if (vecPrev.length > 0) {
            for (var b = 0; b < vecAllPts.length; b++) {
                for (var m = 0; m < vecAllPts[b].length; m++) {
                    var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecPrev[b][m], radius);
                    convertVectorToGraphPoints(groupsPoints, vecBetween);
                    convertVectorToSpheres(_groups, m + 1, vecBetween);
                }
            }
        }
        vecPrev = vecAllPts;
    }

    // Calculate the points between the points between the Primary Zero Axis and the 1/3 Primary Axis. going across the planes between the first and last set.
    for (var b = 0; b < vecAllPts.length; b++) {
        for (var m = 0; m < vecAllPts[b].length; m++) {
            var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecFirst[b][m], radius);
            convertVectorToGraphPoints(groupsPoints, vecBetween);
            convertVectorToSpheres(_groups, m + 1, vecBetween);
        }
    }

    vecPrev = [];
    // Calculate Points between from 1/3 PI points to 2/3 PI points
    // iterate over the planes
    for (var j = 0; j < allAxisPoints.length; j++) {
        vecAllPts = [];
        // iterate over the layer points between the two axis (1/3 and 2/3 Primary Axis).
        for (var i = 0; i < allAxisPoints[j][0].length; i++) {
            vecPts = calcPointsOnLine(allAxisPoints[j][0][i], allAxisPoints[j][1][i], radius);
            convertVectorToGraphPoints(groupsPoints, vecPts);
            convertVectorToSpheres(_groups, i + 1, vecPts);

            if (vecPts != null && vecPts.length > 0)
                vecAllPts.push(vecPts);
        }
        if (j==0)
        vecFirst = vecAllPts;

        // Calculate Points between the points between 1/3 Pi and 2/3 Pi Primary axis points.
        if (vecPrev.length > 0) {
            for (var b = 0; b < vecAllPts.length; b++) {
                for (var m = 0; m < vecAllPts[b].length; m++) {
                    var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecPrev[b][m], radius);
                    convertVectorToGraphPoints(groupsPoints, vecBetween);
                    convertVectorToSpheres(_groups, m + 1, vecBetween);
                }
            }
        }
        vecPrev = vecAllPts;
    }

        // Calculate Points between the points between 1/3 Pi and 2/3 Pi Primary axis points. Between the first and last plane.
    for (var b = 0; b < vecAllPts.length; b++) {
        for (var m = 0; m < vecAllPts[b].length; m++) {
            var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecFirst[b][m], radius);
            convertVectorToGraphPoints(groupsPoints, vecBetween);
            convertVectorToSpheres(_groups, m + 1, vecBetween);
        }
    }

    vecPrev = [];
    // Calculate Points between points on the 1/3 PI points set azimuthally. Between the planes.
    // iterate over the planes and calculate the points between the planes on a given axis (1/3 Primary Axis).
    for (var j = 1; j < allAxisPoints.length; j++) {
        for (var i = 0; i < allAxisPoints[j][0].length; i++) {
            vecPts = calcPointsOnLine(allAxisPoints[j - 1][0][i], allAxisPoints[j][0][i], radius);
            convertVectorToGraphPoints(groupsPoints, vecPts);
            convertVectorToSpheres(_groups, i + 1, vecPts);
        }
    }
   
    // Calculate Points between points on the 1/3 PI points set azimuthally. Between the first and last planes to close the cirlce.
    for (var i = 0; i < allAxisPoints[0][0].length; i++) {
        vecPts = calcPointsOnLine(allAxisPoints[0][0][i], allAxisPoints[allAxisPoints.length-1][0][i], radius);
        convertVectorToGraphPoints(groupsPoints, vecPts);
        convertVectorToSpheres(_groups, i + 1, vecPts);
    }

    vecPrev = [];
    // Calculate Points between points on the 2/3 PI points set azimuthally. Between the planes.
    for (var j = 1; j < allAxisPoints.length; j++) {
        for (var i = 0; i < allAxisPoints[j][1].length; i++) {
            vecPts = calcPointsOnLine(allAxisPoints[j - 1][1][i], allAxisPoints[j][1][i], radius);
            convertVectorToGraphPoints(groupsPoints, vecPts);
            convertVectorToSpheres(_groups, i + 1, vecPts);
        }
    }

    // Calculate Points between points on the 2/3 PI points set azimuthally. Between the first and last planes.
    for (var i = 0; i < allAxisPoints[0][1].length; i++) {
        vecPts = calcPointsOnLine(allAxisPoints[0][1][i], allAxisPoints[allAxisPoints.length -1][1][i], radius);
        convertVectorToGraphPoints(groupsPoints, vecPts);
        convertVectorToSpheres(_groups, i + 1, vecPts);
    }
    
    vecPrev = [];
    // Calculate Points from the Primary Pi points to the 2/3 PI points.
    // Iterate over the places to calculate the points between the Primary Pi Axis and the 2/3 Primary Axis.
    for (var i = 0; i < allAxisPoints.length; i++) {
        vecAllPts = [];
        // iterate over the layer points between the two axis.
        for (var j = 0; j < primeAxisPointsPi.length; j++) {

            vecPts = calcPointsOnLine(primeAxisPointsPi[j], allAxisPoints[i][1][j], radius);
            convertVectorToGraphPoints(groupsPoints, vecPts);
            convertVectorToSpheres(_groups, j + 1, vecPts);
            if (vecPts != null && vecPts.length > 0)
                vecAllPts.push(vecPts);
        }
        if (i==0)
        vecFirst = vecAllPts;

        // Calculate Points between the points on the Primary Pi Axis points to the 2/3 Pi Primary axis points.
        if (vecPrev.length > 0) {
            for (var b = 0; b < vecAllPts.length; b++) {
                for (var m = 0; m < vecAllPts[b].length; m++) {
                    var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecPrev[b][m], radius);
                    convertVectorToGraphPoints(groupsPoints, vecBetween);
                    convertVectorToSpheres(_groups, m + 1, vecBetween);
                }
            }
        }
        vecPrev = vecAllPts;
    }

    // Calculate Points between the points on the Primary Pi Axis points to the 2/3 Pi Primary axis points.  From the first to last plane.
    for (var b = 0; b < vecAllPts.length; b++) {
        for (var m = 0; m < vecAllPts[b].length; m++) {
            var vecBetween = calcPointsOnLine(vecAllPts[b][m], vecFirst[b][m], radius);
            convertVectorToGraphPoints(groupsPoints, vecBetween);
            convertVectorToSpheres(_groups, m + 1, vecBetween);
        }
    }
}

function calcPrimaryAxisPoints(polarAngle, azimuthAngle, radius, numLayers) {
    // Given a fixed Polar Angle and Azimuth Angle calculate the points (3D) along that axis up to the number of layers.  
    // Each point on the axis is a center point of sphere along the axis. Each Point is a layer point steming out from the center.
    var axisPoints = [];
    var x, y, z = 0;
    for (var i = 1; i <= numLayers; i++) {
        x = calcSphericalToX(radius * i, polarAngle, azimuthAngle);
        y = calcSphericalToY(radius * i, polarAngle, azimuthAngle);
        z = calcSphericalToZ(radius * i, polarAngle);
        axisPoints.push(new THREE.Vector3(x, y, z));
    }
    return axisPoints;
}

function createSpherePaths(groups, radius, geo, mesh) {
    var x = 0,
        y = 0,
        z = 0,
        x2 = 0,
        y2 = 0,
        z2 = 0;
    var group, group2;
    var azimuthAngle = 0;
    var polarAngle = 0;
    var numLayers = 2;
    var angleDivisions = 3;
    var deltaAngle = Math.PI / angleDivisions;
    var radial = radius;
    var azimuthDivisions = angleDivisions;
    var vecNorth, vecSouth;
    var vecNode;
    var vecZero = [],
        vecZeroB = [],
        vec60 = [],
        vec60B = [],
        vec120 = [],
        vec120B = [];

    // iterate over the number of layers to add to the spheres.
    for (var nl = 1; nl <= numLayers; nl++) {
        // increate the radius based on the layer number.
        radial = nl * radius;
        //angleDivisions = 3 * nl;
        //deltaAngle = Math.PI / angleDivisions;
        //azimuthDivisions = angleDivisions;
        azimuthAngle = 0;

        // Calculate the points on the spherical coordinate system to calculate the x, y, z points in cartesian coordinates to place the spheres around the center sphere.
        x = calcSphericalToX(radial, polarAngle, azimuthAngle);
        y = calcSphericalToZ(radial, polarAngle);
        z = calcSphericalToY(radial, polarAngle, azimuthAngle);
        group = createSphere(x, y, z, nl, geo, mesh);
        groups.add(group);
        // keep treck of the north point sphere as a vector to calculate the spheres between other spheres in the same layer.
        vecNorth = new THREE.Vector3(x, y, z);

        group2 = createSphere(-x, -y, -z, nl, geo, mesh);
        groups.add(group2);
        // keep track of the south point sphere as a vector to calculate the spheres between other spheres in the same layer.
        vecSouth = new THREE.Vector3(-x, -y, -z);

        // keep track of the spheres in the zero azimth angle plane.
        vecZero = [];
        vecZeroB = [];
        // keep track of the spheres center point as a vector in the 60 degree angle plane.
        vec60 = [];
        vec60B = [];
        // keep track of the spheres center point as a vector in the 120 degree angle plane.
        vec120 = [];
        vec120B = [];
        // iterate over the azimuth angles to calculate the planes that intersect the y-z plane.
        for (var i = 1; i <= azimuthDivisions; i++) {
            // console.log('Azimuth angle: '+ azimuthAngle);
            polarAngle = deltaAngle;
            for (var j = 1; j < angleDivisions; j++) {
                x = calcSphericalToX(radial, polarAngle, azimuthAngle);
                y = calcSphericalToZ(radial, polarAngle);
                z = calcSphericalToY(radial, polarAngle, azimuthAngle);

                x2 = x;
                y2 = y;
                z2 = z;

                group = createSphere(x2, y2, z2, nl, geo, mesh);
                groups.add(group);
                // based on the azimuthal angle determine which array to put  this point into.
                vecNode = new THREE.Vector3(x2, y2, z2);
                if (i == 1) //
                    vecZero.push(vecNode);
                else if (i == 2)
                    vec60.push(vecNode);
                else if (i == 3)
                    vec120.push(vecNode);

                group2 = createSphere(-x2, -y2, -z2, nl, geo, mesh);
                groups.add(group2);

                // based on the azimuthal angle determine which array to put this pint into.
                vecNode = new THREE.Vector3(-x2, -y2, -z2);
                if (i == 1) // if azimuth angle zero (index =1) put in the zero vector array.
                    vecZeroB.push(vecNode);
                else if (i == 2) // if azimuth angle 60 (index = 2) put in the 60 degree vector array.
                    vec60B.push(vecNode);
                else if (i == 3) // if azimuth angle 120 (index = 3) put in the 120 degree vector array.
                    vec120B.push(vecNode);

                x2 += x;
                y2 += y;
                z2 += z;

                polarAngle += deltaAngle;
            }
            azimuthAngle += deltaAngle;
        }

        FillInMissingSpheres(groups, vecNorth, vecSouth, vecZero, vec60, vec120, nl, geo, mesh, radius);
        // FillInMissingSpheres(groups, vecNorth, vecSouth, vecZeroB, vec60B, vec120B, nl, geo, mesh, radius);

    }
    console.log('Groups count: ' + groups.children.length);
}

function FillInMissingSpheres(groups, vecNorth, vecSouth, vecZero, vec60, vec120, layer, geo, mesh, radius) {
    // given a set of nodes find any missing or open spots that a sphere needs to be inserted.
    var dist1 = 0,
        dist2 = 0;
    var vecPlane = [];
    var missSpheres = [];
    // iterate over the points in each plane, 0, 60, 120
    // Azimuth angle of zero degrees plane.
    vecPlane.push(vecNorth);
    for (var i = 0; i < vecZero.length; i++) {
        vecPlane.push(vecZero[i]);
    }
    vecPlane.push(vecSouth);
    // fill in missing spheres between points in the zero plane.
    missSpheres = fillInMissingSpheresBetweenPoints(vecPlane, layer, geo, mesh, radius);
    for (var i = 0; i < missSpheres.length; i++) {
        groups.add(missSpheres[i]);
    }
    console.log('missing spheres zero : ' + missSpheres.length);

    // Azimuth angle of 60 degrees plane.
    vecPlane = [];
    vecPlane.push(vecNorth);
    for (var i = 0; i < vec60.length; i++) {
        vecPlane.push(vec60[i]);
    }
    vecPlane.push(vecSouth);
    // fill in missing spheres between points in the 60 degree plane.
    missSpheres = fillInMissingSpheresBetweenPoints(vecPlane, layer, geo, mesh, radius);
    for (var i = 0; i < missSpheres.length; i++) {
        groups.add(missSpheres[i]);
    }
    console.log('missing spheres 60 : ' + missSpheres.length);

    // Azimuth angle of 120 degrees plane.
    vecPlane = [];
    vecPlane.push(vecNorth);
    for (var i = 0; i < vec120.length; i++) {
        vecPlane.push(vec120[i]);
    }
    vecPlane.push(vecSouth);
    missSpheres = fillInMissingSpheresBetweenPoints(vecPlane, layer, geo, mesh, radius);
    for (var i = 0; i < missSpheres.length; i++) {
        groups.add(missSpheres[i]);
    }
    console.log('missing spheres 120 : ' + missSpheres.length);

    // compare points between the planes of points.
    // for (var i = 0; i < vecZero.length; i++) {
    //     dist1 = vec60[i].distanceTo(vecZero[i]);
    //     dist2 = vec60[i].distanceTo(vec120[i]);
    // }
}

function fillInMissingSpheresBetweenPoints(vecPlane, layer, geo, mesh, radius) {
    // between any two consecutive points in an array check to see if there are any distances greater than the radius.  
    // if so then add in the missing spheres between the two points.
    // return the array of missing spheres between the points.
    var dist = 0;
    var vecMissingPt;
    var numSpheres = 0;
    var missSpheres = [];
    for (var i = 0; i < vecPlane.length - 1; i++) {
        //for (var k = i + 1; k < vecPlane.length; k++) {
        dist = vecPlane[i].distanceTo(vecPlane[i + 1]);
        //console.log('Distance calc: ' + dist);
        if (dist > radius && dist <= radius * 2.01) {
            numSpheres = dist / radius;
            //console.log("missing number of spheres: " + numSpheres);
            for (var j = 1; j <= numSpheres; j++) {
                vecMissingPt = vecPlane[i].clone().sub(vecPlane[i + 1]).multiplyScalar(j / numSpheres).add(vecPlane[i + 1]);
                // console.log('Miss sphere x: ' + vecMissingPt.x + ' y: ' + vecMissingPt.y + ' z: ' + vecMissingPt.z);

                missSpheres.push(createSphere(vecMissingPt.x, vecMissingPt.y, vecMissingPt.z, layer, geo, mesh));
            }
        }
        // }
    }

    return missSpheres;
}

function createCircles(radius, scene) {
    // create a path of circles on the x-axis.
    var group = new THREE.Group();
    var geometry = new THREE.CircleBufferGeometry(radius, 20);
    var material = new THREE.MeshPhongMaterial({
        color: 0x2f7dbd,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        flatShading: false,
        opacity: 0.3
    });

    var circle, circle2;
    for (var i = 0; i < 5; i++) {
        circle = new THREE.Mesh(geometry, material);
        circle2 = new THREE.Mesh(geometry, material);
        circle2.position.y -= i * radius;
        group.add(circle2);
        circle.position.y += i * radius;
        group.add(circle);
    }
    scene.add(group);
}

function createSphere(x, y, z, layer, geoSphere, meshMaterial) {
    var sphere1 = new THREE.Mesh(geoSphere, meshMaterial);

    sphere1.position.x = x;
    sphere1.position.y = y;
    sphere1.position.z = z;
    sphere1.layer = layer;

    var group = new THREE.Group();
    group.add(sphere1);
    //group.add(createPoint(sphere1));

    return group;
}

function createPoint(sphere) {
    //console.log("Create Point for sphere");

    var geoPoint = new THREE.BufferGeometry();
    var eachPoint = [];
    var colors = [];

    eachPoint.push(sphere.position.x, sphere.position.y, sphere.position.z);
    _pointColor.setRGB(255, 12, 12);
    colors.push(_pointColor.r, _pointColor.g, _pointColor.b);

    geoPoint.addAttribute('position', new THREE.Float32BufferAttribute(eachPoint, 3));
    geoPoint.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geoPoint.computeBoundingSphere();
    var pointMesh = new THREE.Points(geoPoint, _matPoint);

    return pointMesh;
}

function createPointFromVector(vecPoint) {
    var geoPoint = new THREE.BufferGeometry();
    var eachPoint = [];
    var colors = [];

    eachPoint.push(vecPoint.x, vecPoint.y, vecPoint.z);
    _pointColor.setRGB(125, 255, 124);
    colors.push(_pointColor.r, _pointColor.g, _pointColor.b);

    geoPoint.addAttribute('position', new THREE.Float32BufferAttribute(eachPoint, 3));
    geoPoint.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geoPoint.computeBoundingSphere();
    var pointMesh = new THREE.Points(geoPoint, _matPoint);

    return pointMesh;
}

function showPoints(visible) {
    for (var i = 0; i < _groupsPoints.children.length; i++) {
        _groupsPoints.children[i].visible = visible;
    }
}

function showLines(visible) {
    for (var i = 0; i < _groupsLines.children.length; i++) {
        _groupsLines.children[i].visible = visible;
    }
}

function createLine(groups, vecPoint1, vecPoint2) {
    var positions = [];
    var colors = [];

    positions.push(vecPoint1.x, vecPoint1.y, vecPoint1.z);
    positions.push(vecPoint2.x, vecPoint2.y, vecPoint2.z);

    colors.push(2, 2, 2);
    colors.push(2, 2, 2);
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    var mesh = new THREE.Line(geometry, _matLine);
    groups.add(mesh);
}

function createLines(groups, radius) {
    var material = new THREE.LineBasicMaterial({
        linewidth: 1,
        vertexColors: THREE.VertexColors
    });
    //console.log('Create Lines');
    var groupLines = new THREE.Group();
    var positions = [];
    var colors = [];
    //console.log('draw lines points.length: ' + points.length);
    var targetGroup;
    var nextGroup;
    var vecTarget, vecNext;
    var radial = 0;
    for (var i = 0; i < groups.children.length - 1; i++) {
        targetGroup = groups.children[i];
        vecTarget = createVector(targetGroup.children[0].position, 1);
        // console.log("Target Vector: " + vecTarget);
        for (var j = i + 1; j < groups.children.length; j++) {
            nextGroup = groups.children[j];
            vecNext = createVector(nextGroup.children[0].position, 1);
            radial = vecTarget.distanceTo(vecNext);
            if (radial >= radius * 0.99 && radial <= radius * 1.01) {
                positions.push(vecTarget.x, vecTarget.y, vecTarget.z);
                colors.push(2, 2, 2);
                positions.push(vecNext.x, vecNext.y, vecNext.z);
                colors.push(2, 2, 2);
            }
        }
        if (positions.length > 0) {
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.computeBoundingSphere();

            var mesh = new THREE.Line(geometry, material);
            groupLines.add(mesh);
            targetGroup.add(groupLines);

            //console.log('lines added: ' + groupLines.children.length);
            groupLines = new THREE.Group();
            positions = [];
            colors = [];
        } else {
            positions = [];
            colors = [];
        }
    }
}

function calcDistance(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
}

function rotationReset() {
    _groups.rotation.y = 0;
    _groups.rotation.x = 0;
    _groups.rotation.z = 0;
    _groupsPoints.rotation.x = 0;
    _groupsPoints.rotation.y =0;
    _groupsPoints.rotation.z= 0;
    _groupsLines.rotation.x=0;
    _groupsLines.rotation.y=0;
    _groupsLines.rotation.z=0;
}

function showSpheres(numSpheres) {
    // make invisible
    for (var i = _groups.children.length - 1; i >= numSpheres; i--) {
        _groups.children[i].visible = false;
    }

    // make visible
    for (var i = 0; i < numSpheres; i++) {
        if (i < _groups.children.length)
            _groups.children[i].visible = true;
    }
}

function createSurroundingSpheres(radius, groups, geometry, mesh) {
    //console.log('Add Spheres');

    addFirstLayerSpheres(radius, groups, geometry, mesh);
    addSecondLayerSpheres(radius, groups, geometry, mesh);
}

function addFirstLayerSpheres(radius, groups, geometry, mesh) {
    var deltaAngle = Math.PI / 3;
    var polarAngle = 0;
    var azimuthAngle = 0;
    var x, y, z = 0;
    var group;
    // Add First layer
    // add North and South pole X-Y axis spheres surrounding the central sphere. 
    for (var i = 0; i < 2; i++) {
        // Make the north pole (polar angle is zero)
        x = calcSphericalToX(radius, polarAngle, azimuthAngle);
        z = calcSphericalToY(radius, polarAngle, azimuthAngle);
        y = calcSphericalToZ(radius, polarAngle);
        group = createSphere(x, y, z, 1, geometry, mesh);
        groups.add(group);

        polarAngle = Math.PI;
    }

    polarAngle = deltaAngle;
    azimuthAngle = 0;

    while (azimuthAngle < Math.PI * 1.9) {
        polarAngle = deltaAngle;
        // Add X-Z Axis spheres surrounding the central sphere. 2 in front
        for (var i = 0; i < 2; i++) {
            x = calcSphericalToX(radius, polarAngle, azimuthAngle);
            z = calcSphericalToY(radius, polarAngle, azimuthAngle);
            y = calcSphericalToZ(radius, polarAngle);

            group = createSphere(x, y, z, 1, geometry, mesh);
            groups.add(group);

            polarAngle += deltaAngle;
        }

        azimuthAngle += deltaAngle;
    }
}

function addSecondLayerSpheres(radius, groups, geometry, mesh) {
    // ****************************************************************************************
    // ########   Add 2nd layer   ##############################################
    // ****************************************************************************************
    var deltaAngle = Math.PI / 3;
    radius *= 2;
    var polarAngle = 0;
    var azimuthAngle = 0;
    var northPoint;
    var southPoint;
    var x, y, z = 0;
    var firstPoint = true;
    var group;
    // add North and South pole X-Y axis spheres surrounding the central sphere. 
    for (var i = 0; i < 2; i++) {
        // Make the north pole (polar angle is zero)
        x = calcSphericalToX(radius, polarAngle, azimuthAngle);
        z = calcSphericalToY(radius, polarAngle, azimuthAngle);
        y = calcSphericalToZ(radius, polarAngle);
        group = createSphere(x, y, z, 2, geometry, mesh);
        groups.add(group);

        if (firstPoint) {
            northPoint = createVector(group.children[0].position, 2);
            firstPoint = false;
        } else {
            southPoint = createVector(group.children[0].position, 2);
        }

        polarAngle = Math.PI;
    }

    polarAngle = deltaAngle;
    azimuthAngle = 0;

    var topPt;
    var botPt;
    while (azimuthAngle < Math.PI * 1.9) {
        polarAngle = deltaAngle;
        firstPoint = true;
        topPt = null;
        botPt = null;
        // Add X-Z Axis spheres surrounding the central sphere. 2 in front
        for (var i = 0; i < 2; i++) {
            x = calcSphericalToX(radius, polarAngle, azimuthAngle);
            z = calcSphericalToY(radius, polarAngle, azimuthAngle);
            y = calcSphericalToZ(radius, polarAngle);
            group = createSphere(x, y, z, 2, geometry, mesh);
            groups.add(group);
            if (firstPoint) {
                topPt = createVector(group.children[0].position, 2);
                firstPoint = false;
            } else {
                botPt = createVector(group.children[0].position, 2);
            }

            polarAngle += deltaAngle;
        }
        // calculate point between the two spheres to get the 'mid' sphere.
        var midPt = topPt.clone().sub(botPt).multiplyScalar(0.5).add(topPt);

        group = createSphere(midPt.x, midPt.y, midPt.z, 2, geometry, mesh);
        groups.add(group);

        // calculate point between the two spheres of north pole to get the 'mid' sphere close to the north pole.
        var northPt = northPoint.clone().sub(topPt).multiplyScalar(0.5).add(northPoint);

        group = createSphere(northPt.x, northPt.y, northPt.z, 2, geometry, mesh);
        groups.add(group);

        // calculate point between the two spheres of south pole to get the 'mid' sphere close to the south pole.
        var southPt = southPoint.clone().sub(botPt).multiplyScalar(0.5).add(southPoint);
        group = createSphere(southPt.x, southPt.y, southPt.z, 2, geometry, mesh);
        groups.add(group);

        // increment the azimuthal angle around the central axis.
        azimuthAngle += deltaAngle;
    }
}

function calcSphericalToX(radius, polarAngle, azimuthAngle) {
    return radius * Math.sin(polarAngle) * Math.cos(azimuthAngle);
}

function calcSphericalToY(radius, polarAngle, azimuthAngle) {
    return radius * Math.sin(polarAngle) * Math.sin(azimuthAngle);
}

function calcSphericalToZ(radius, polarAngle) {
    return radius * Math.cos(polarAngle);
}

function createVector(pos, layer) {
    var vec = new THREE.Vector3(pos.x, pos.y, pos.z);
    vec.layer = layer;
    vec.visible = true;

    return vec;
}

function drawCube() {
    var geometry = new THREE.BoxGeometry(2, .5, 1);
    var material = new THREE.MeshBasicMaterial({
        color: 0x9751bd
    });
    var cube = new THREE.Mesh(geometry, material);
    _scene.add(cube);
    cube.position.x += 3;

    var animateCube = function () {
        requestAnimationFrame(animateCube);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        _renderer.render(_scene, _camera);
    }
}