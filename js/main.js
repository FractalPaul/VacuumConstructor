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

// function resetGroup() {
//     //var ch = _group.children;
//     //console.log('num children: ' + _group.children.length);
//     while (_group.children.length > 0) {
//         _group.children.forEach(element => {
//             _group.remove(element);
//         });
//     }
//     //_group = new THREE._group();
// }

function createGeometry() {
    // Create the first sphere (center).
    var group1 = createSphere(0, 0, 0, 0, _geometryS, _meshMaterial);
    _groups.add(group1);
    createSurroundingSpheres(vacuumParms.radius, _groups, _geometryS, _meshMaterial);
    createLines(_groups, vacuumParms.radius);

    _scene.add(_groups);

    _camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);

        if (vacuumParms.rotateAnimation) {
            _groups.rotation.y += 0.01;
        }

        _renderer.render(_scene, _camera);
    };

    animate();
}

function createSphere(x, y, z, layer, geoSphere, meshMaterial) {
    var sphere1 = new THREE.Mesh(geoSphere, meshMaterial);

    sphere1.position.x = x;
    sphere1.position.y = y;
    sphere1.position.z = z;
    sphere1.layer = layer;

    var group = new THREE.Group();
    group.add(sphere1);
    group.add(createPoint(sphere1));

    return group;
}

function createPoint(sphere) {
    //console.log("Create Point for sphere");
    var color = new THREE.Color();
    var matPoint = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: THREE.VertexColors
    });

    var geoPoint = new THREE.BufferGeometry();
    var eachPoint = [];
    var colors = [];

    eachPoint.push(sphere.position.x, sphere.position.y, sphere.position.z);
    color.setRGB(255, 12, 12);
    colors.push(color.r, color.g, color.b);

    geoPoint.addAttribute('position', new THREE.Float32BufferAttribute(eachPoint, 3));
    geoPoint.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    geoPoint.computeBoundingSphere();
    var pointMesh = new THREE.Points(geoPoint, matPoint);

    return pointMesh;
}

function showPoints(visible) {
    for (var i = 0; i < _groups.children.length; i++) {
        _groups.children[i].children[1].visible = visible;
    }
}

function showLines(visible) {
    for (var i = 0; i < _groups.children.length; i++) {
        if (_groups.children[i].children.length > 2) {
            _groups.children[i].children[2].visible = visible;
        }
    }
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
    for (var i = 0; i < groups.children.length - 1; i++) {
        targetGroup = groups.children[i];
        vecTarget = createVector(targetGroup.children[0].position, 1);
        // console.log("Target Vector: " + vecTarget);
        for (var j = i + 1; j < groups.children.length; j++) {
            nextGroup = groups.children[j];
            vecNext = createVector(nextGroup.children[0].position, 1);
            if (vecTarget.distanceTo(vecNext) <= radius * 1.01) {
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
        var midPt = topPt.clone().add(botPt).multiplyScalar(0.5);

        group = createSphere(midPt.x, midPt.y, midPt.z, 2, geometry, mesh);
        groups.add(group);

        // calculate point between the two spheres of north pole to get the 'mid' sphere close to the north pole.
        var northPt = northPoint.clone().add(topPt).multiplyScalar(0.5);

        group = createSphere(northPt.x, northPt.y, northPt.z, 2, geometry, mesh);
        groups.add(group);

        // calculate point between the two spheres of south pole to get the 'mid' sphere close to the south pole.
        var southPt = southPoint.clone().add(botPt).multiplyScalar(0.5);
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