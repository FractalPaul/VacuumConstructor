// Globals...
var gui = new dat.GUI();
var scene = new THREE.Scene();
var spheres = [];
var group = new THREE.Group();
var groupPoints = new THREE.Group();
var groupLines = new THREE.Group();
var aspect = window.innerWidth / window.innerHeight;
var frustumSize = 14;
var camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 2000);
//new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var controls = null;
var renderer = new THREE.WebGLRenderer();
var meshMaterial = new THREE.MeshStandardMaterial({
    color: vacuumParms.color,
    opacity: vacuumParms.opacity,
    transparent: true,
    depthTest: vacuumParms.depthTest,
    depthWrite: vacuumParms.depthWrite,
    roughness: vacuumParms.roughness,
    wireframe: vacuumParms.wireframe
}); //new THREE.MeshPhongMaterial({ color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: false });
var geometryS = new THREE.SphereBufferGeometry(vacuumParms.radius, 32, 32);
// var geometryPoints = new THREE.BufferGeometry();
var points = [];


Initialize();
scaleCamera();

drawGeometry();

showSpheres(vacuumParms.numSpheres);

function scaleCamera() {
    camera.zoom = vacuumParms.zoom;
    camera.updateProjectionMatrix();
    controls.update();
}

function Initialize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);

    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    initLights(scene);

    //initPoints(scene);
}

function initLights(scene) {
    // Ambient light
    var light = new THREE.AmbientLight(0xFFFFFF, 2.5);
    scene.add(light);
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
        scene.add(lights[i]);
    }
}

function resetGroup() {
    //var ch = group.children;
    console.log('num children: ' + group.children.length);
    while (group.children.length > 0) {
        group.children.forEach(element => {
            group.remove(element);
        });
    }
    //group = new THREE.Group();
}

function drawGeometry() {
    //meshMaterial = new THREE.MeshStandardMaterial({ color: 0x156289, opacity: vacuumParms.opacity, transparent: true });
    // var materialS = new THREE.LineBasicMaterial( {color: 0xffff00, wireframe: true} );
    // var sphere = new THREE.Line( geometryS, materialS );
    var sphere1 = new THREE.Mesh(geometryS, meshMaterial);
    scene.add(sphere1);

    sphere1.position.x = 0;
    sphere1.position.y = 0;
    sphere1.position.z = 0;
    points.push(sphere1.position.x, sphere1.position.y, sphere1.position.z);

    AddSpheres(vacuumParms.radius, group, geometryS, meshMaterial);

    scene.add(group);
    drawPoints(scene);
    drawLines(scene, points, vacuumParms.radius);

    camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);

        if (vacuumParms.rotateAnimation) {
            group.rotation.y += 0.01;
            groupLines.rotation.y += 0.01;
            groupPoints.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
    };

    animate();
}

function drawPoints(scene) {

    var color = new THREE.Color();
    var matPoint = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: THREE.VertexColors
    });

    for (var i = 0; i < points.length; i++) {
        if (i % 3 == 0) {
            color.setRGB(10, 212, 10);

            var eachPoint = [];
            eachPoint.push(points[i], points[i + 1], points[i + 2]);
            var geoPoint = new THREE.BufferGeometry();
            var pointColor = [];
            pointColor.push(color.r, color.g, color.b);
            geoPoint.addAttribute('position', new THREE.Float32BufferAttribute(eachPoint, 3));
            geoPoint.addAttribute('color', new THREE.Float32BufferAttribute(pointColor, 3));

            geoPoint.computeBoundingSphere();

            var pointMesh = new THREE.Points(geoPoint, matPoint);
            groupPoints.add(pointMesh);
        }
    }

    scene.add(groupPoints);
}

function drawLines(scene, points, radius) {
    var material = new THREE.LineBasicMaterial({
        linewidth: 1,
        vertexColors: THREE.VertexColors
    });
    var firstX, firstY, firstZ = 0;
    var firstFound = false;

    var positions = [];
    var colors = [];
    for (var i = 0; i < points.length - 1; i++) {
        if (i % 3 == 0) {
            for (var j = i + 1; j < points.length; j++) {
                if (j % 3 == 0) {
                    if (calcDistance(points[i], points[i + 1], points[i + 2], points[j], points[j + 1], points[j + 2]) <= radius * 1.01) {
                        if (!firstFound) {
                            firstX = points[i];
                            firstY = points[i + 1];
                            firstZ = points[i + 2];
                            firstFound = true;
                        }
                        //if (positions.length < 7) {
                        positions.push(points[i], points[i + 1], points[i + 2]);
                        colors.push(20, 20, 130);
                        // }
                        // if (positions.length < 7) {
                        positions.push(points[j], points[j + 1], points[j + 2]);
                        colors.push(20, 20, 130);
                        //}

                    }
                }
            }
            if (positions.length > 0) {
                // positions.push(firstX, firstY, firstZ);
                // colors.push(20, 20, 130);
                firstFound = false;
                var geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                geometry.computeBoundingSphere();

                var mesh = new THREE.Line(geometry, material);
                groupLines.add(mesh);

                console.log('positions len: ', positions.length);
                positions = [];
                colors = [];
            }
        }
    }

    scene.add(groupLines);
}

function calcDistance(x1, y1, z1, x2, y2, z2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
}

function rotationReset() {
    group.rotation.y = 0;
    group.rotation.x = 0;
    group.rotation.z = 0;

    groupLines.rotation.x= 0;
    groupLines.rotation.y = 0;
    groupLines.rotation.z = 0;

    groupPoints.rotation.x = 0;
    groupPoints.rotation.y = 0;
    groupPoints.rotation.z = 0;
}

function showSpheres(numSpheres) {
    //if (numSpheres == 1) numSpheres = 0;

    // make invisible
    for (var i = group.children.length - 1; i >= numSpheres; i--) {
        group.children[i].visible = false;
    }

    for (var i = groupPoints.children.length - 1; i > numSpheres; i--) {
        groupPoints.children[i].visible = false;
    }

    // make visible
    for (var i = 0; i < numSpheres; i++) {
        if (i < group.children.length)
            group.children[i].visible = true;
    }

    for (var i = 0; i < numSpheres; i++) {
        if (i + 1 < groupPoints.children.length)
            groupPoints.children[i + 1].visible = true;
    }

}

function AddSpheres(radius, group, geometry, mesh) {
    var deltaAngle = Math.PI / 3;
    //var offsetAngle = Math.PI / 3;
    var polarAngle = 0;
    var azimuthAngle = 0;

    // add North and South pole X-Y axis spheres surrounding the central sphere. 
    for (var i = 0; i < 2; i++) {
        // Make the north pole (polar angle is zero)
        var sphere = new THREE.Mesh(geometry, mesh);

        sphere.position.x = calcSphericalToX(radius, polarAngle, azimuthAngle);
        sphere.position.z = calcSphericalToY(radius, polarAngle, azimuthAngle);
        sphere.position.y = calcSphericalToZ(radius, polarAngle);

        points.push(sphere.position.x, sphere.position.y, sphere.position.z);

        group.add(sphere);

        polarAngle = Math.PI;
    }

    polarAngle= deltaAngle;
    azimuthAngle = 0;
    
    while (azimuthAngle < Math.PI *1.01) {
        polarAngle = deltaAngle;
        // Add X-Z Axis spheres surrounding the central sphere. 2 in front
        for (var i = 0; i < 2; i++) {
            var sphere = new THREE.Mesh(geometry, mesh);

            sphere.position.x = calcSphericalToX(radius, polarAngle, azimuthAngle);
            sphere.position.z = calcSphericalToY(radius, polarAngle, azimuthAngle);
            sphere.position.y = calcSphericalToZ(radius, polarAngle);

            points.push(sphere.position.x, sphere.position.y, sphere.position.z);

            group.add(sphere);
            polarAngle += deltaAngle;
        }
        polarAngle = Math.PI + deltaAngle;

        // Add X-Z Axis spheres surrounding the central sphere. 2 in back.
        for (var i = 0; i < 2; i++) {
            var sphere = new THREE.Mesh(geometry, mesh);

            sphere.position.x = calcSphericalToX(radius, polarAngle, azimuthAngle);
            sphere.position.z = calcSphericalToY(radius, polarAngle, azimuthAngle);
            sphere.position.y = calcSphericalToZ(radius, polarAngle);

            points.push(sphere.position.x, sphere.position.y, sphere.position.z);

            group.add(sphere);
            polarAngle += deltaAngle;
        }
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

function drawCube() {
    var geometry = new THREE.BoxGeometry(2, .5, 1);
    var material = new THREE.MeshBasicMaterial({
        color: 0x9751bd
    });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x += 3;

    var animateCube = function () {
        requestAnimationFrame(animateCube);

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
}