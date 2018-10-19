// Globals...
var gui = new dat.GUI();
var scene = new THREE.Scene();
var spheres = [];
var group = new THREE.Group();
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
}

function initLights(scene) {
    //if (vacuumParms.ambientLight) {
    // Ambient light
    var light = new THREE.AmbientLight(0xFFFFFF, 2.5);
    scene.add(light);
    //} else {
    // Point lights (3)
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

    //}
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

    AddSpheres(vacuumParms.radius, group, geometryS, meshMaterial);

    scene.add(group);
    //scene.add(sphere);

    camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame(animate);

        if (vacuumParms.rotateAnimation) {
            group.rotation.y += 0.01;
        }

        renderer.render(scene, camera);
    };

    animate();
}

function showSpheres(numSpheres) {
    //if (numSpheres == 1) numSpheres = 0;

    // make invisible
    for (var i = group.children.length - 1; i >= numSpheres; i--) {
        group.children[i].visible = false;
    }
    // make visible
    for (var i = 0; i < numSpheres; i++) {
        group.children[i].visible = true;
    }

}

function AddSpheres(radius, group, geometry, mesh) {
    var deltaAngle = Math.PI / 3;
    var offsetAngle = Math.PI / 6;
    var angle = 0;

    // add X-Y axis spheres surrounding the central sphere. Max 6 spheres
    for (var i = 0; i < 6; i++) {
        var sphere = new THREE.Mesh(geometry, mesh);

        sphere.position.x = radius * Math.cos(angle);
        sphere.position.y = radius * Math.sin(angle);
        sphere.position.z = 0;

        group.add(sphere);

        angle += deltaAngle;
    }

    angle =  deltaAngle;
    // Add X-Z Axis spheres surrounding the central sphere. 2 in front

    for (var i = 0; i < 3; i++) {
        var sphere = new THREE.Mesh(geometry, mesh);

        sphere.position.x = 0;
        sphere.position.y = radius * Math.sin(angle);
        sphere.position.z = radius * Math.cos(angle);

        group.add(sphere);
        angle += deltaAngle;
    }
    angle = Math.PI + deltaAngle;

    // Add X-Z Axis spheres surrounding the central sphere. 2 in back.
    for (var i = 0; i < 3; i++) {
        var sphere = new THREE.Mesh(geometry, mesh);

        sphere.position.x = 0;
        sphere.position.y = radius * Math.sin(angle);
        sphere.position.z = radius * Math.cos(angle);

        group.add(sphere);
        angle += deltaAngle;
    }

    angle = offsetAngle;
    radius *= 2;

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