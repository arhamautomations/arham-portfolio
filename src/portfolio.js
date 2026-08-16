import * as THREE from 'three';

export function initPortfolio(root) {
  // The original site uses Three.js globally; expose it for the preserved robot code.
  window.THREE = THREE;

  const previousRoot = document.getElementById('portfolio-react-root');
  if (previousRoot && previousRoot !== root) previousRoot.remove();


  const passionTabs = document.querySelectorAll('.passion-highlight .passion-tab');
  passionTabs.forEach(tab => tab.classList.remove('passion-active'));

  (function(){
  var mount = document.getElementById('arm3d');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.physicallyCorrectLights = true;
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x2c3a40, 2.0));
  var hemiLight = new THREE.HemisphereLight(0x8fb8c9, 0x1a1410, 1.6);
  scene.add(hemiLight);
  var keyLight = new THREE.PointLight(0xff6a1a, 3.4, 30);
  keyLight.position.set(4, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.bias = -0.002;
  scene.add(keyLight);
  var rimLight = new THREE.PointLight(0x2de6dc, 2.4, 30);
  rimLight.position.set(-4, 3, -3);
  scene.add(rimLight);
  var topLight = new THREE.DirectionalLight(0xdfeef0, 0.4);
  topLight.position.set(0, 8, 2);
  scene.add(topLight);
  var fillLight = new THREE.PointLight(0xffb27a, 0.9, 20);
  fillLight.position.set(1.6, -0.5, 5);
  scene.add(fillLight);
  var leftFillLight = new THREE.PointLight(0xaad4ff, 3.6, 35);
  leftFillLight.position.set(-6, 4, 5);
  scene.add(leftFillLight);
  var leftFillLight2 = new THREE.PointLight(0xaad4ff, 2.2, 30);
  leftFillLight2.position.set(-6, 1, -3);
  scene.add(leftFillLight2);

  // Glossier, more "painted metal" materials — lower roughness reads as clearcoat
  var matOrange = new THREE.MeshPhysicalMaterial({ color: 0xE24E1B, metalness: 0.55, roughness: 0.22, clearcoat: 0.75, clearcoatRoughness: 0.16, emissive: 0x210900, emissiveIntensity: 0.035 });
  var matDark = new THREE.MeshPhysicalMaterial({ color: 0x101214, metalness: 0.72, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.25 });
  var matSteel = new THREE.MeshPhysicalMaterial({ color: 0x9ca3a8, metalness: 0.92, roughness: 0.2, clearcoat: 0.25, clearcoatRoughness: 0.2 });
  var matCyan = new THREE.MeshStandardMaterial({ color: 0x0e1417, metalness: 0.4, roughness: 0.3, emissive: 0x2de6dc, emissiveIntensity: 0.5 });
  var matSafety = new THREE.MeshStandardMaterial({ color: 0xE8C400, metalness: 0.15, roughness: 0.45 });
  var matBolt = new THREE.MeshStandardMaterial({ color: 0x1c1e20, metalness: 0.75, roughness: 0.3 });

  // A rounded "capsule" link: cylinder body with spherical caps, like the smooth pipe-shaped
  // links on real arms — reads far more organic than a plain tapered cylinder.
  function makeLink(rBottom, rTop, length, material, segments, flatBottom){
    segments = segments || 20;
    var group = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, length, segments), material);
    body.position.y = length / 2;
    group.add(body);
    if (!flatBottom){
      var capBottom = new THREE.Mesh(new THREE.SphereGeometry(rBottom, segments, Math.max(8, segments / 2)), material);
      group.add(capBottom);
    }
    var capTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, segments, Math.max(8, segments / 2)), material);
    capTop.position.y = length;
    group.add(capTop);
    return group;
  }

  // Black accordion bellows — the flexible cable-guard rings visible at real robot joints
  function makeBellows(radius, count, spacing, centerY){
    var group = new THREE.Group();
    for (var i = 0; i < count; i++){
      var wide = i % 2 === 0;
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(wide ? radius : radius * 0.78, wide ? radius : radius * 0.78, spacing * 0.7, 16), matDark);
      disc.position.y = centerY + i * spacing;
      group.add(disc);
    }
    return group;
  }

  // Ring of bolt heads around a disc face — matches the rivet pattern on the base housing
  function addBoltRing(parent, radius, count, boltR, y){
    for (var i = 0; i < count; i++){
      var a = (i / count) * Math.PI * 2;
      var bolt = new THREE.Mesh(new THREE.CylinderGeometry(boltR, boltR, 0.05, 8), matBolt);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      parent.add(bolt);
    }
  }
  // Same, but for a disc whose face points along Z (used by the shoulder/elbow bearing hubs)
  function addBoltRingZ(parent, radius, count, boltR, z){
    for (var i = 0; i < count; i++){
      var a = (i / count) * Math.PI * 2;
      var bolt = new THREE.Mesh(new THREE.CylinderGeometry(boltR, boltR, boltR * 3, 8), matBolt);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(Math.cos(a) * radius, Math.sin(a) * radius, z);
      parent.add(bolt);
    }
  }
  // Ring of bolts on a disc whose face points along Z.
  // Joint 2's bearing face is oriented along Z, so its bolts must lie in the X/Y plane.
  function addBoltRingZ(parent, radius, count, boltR, z){
    for (var i = 0; i < count; i++){
      var a = (i / count) * Math.PI * 2;
      var bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(boltR, boltR, boltR * 3, 8),
        matBolt
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(
        Math.cos(a) * radius,
        1.25 + Math.sin(a) * radius,
        z
      );
      parent.add(bolt);
    }
  }

  // Same, but for a disc whose face points along X (used by the wrist bearing hub)
  function addBoltRingX(parent, radius, count, boltR, x){
    for (var i = 0; i < count; i++){
      var a = (i / count) * Math.PI * 2;
      var bolt = new THREE.Mesh(new THREE.CylinderGeometry(boltR, boltR, boltR * 3, 8), matBolt);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(x, Math.cos(a) * radius, Math.sin(a) * radius);
      parent.add(bolt);
    }
  }
  // A bearing-look joint hub with a big solid black face cap dominating most of the
  // visible circle — like the real motor/encoder covers on an actual arm — plus a
  // ring of bolts visible around its border on the orange rim.
  function addBearingHub(parent, radius, thickness, material, boltCount){
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 28), material);
    hub.rotation.x = Math.PI / 2;
    parent.add(hub);
    var faceCap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.74, radius * 0.74, thickness * 0.45, 28), matDark);
    faceCap.rotation.x = Math.PI / 2;
    faceCap.position.z = thickness * 0.4;
    parent.add(faceCap);
    // Small steel center hub — like the grease fitting/center bolt on a real bearing cap
    var centerHub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.16, radius * 0.16, thickness * 0.55, 16), matSteel);
    centerHub.rotation.x = Math.PI / 2;
    centerHub.position.z = thickness * 0.55;
    parent.add(centerHub);
    if (boltCount) addBoltRingZ(parent, radius * 0.86, boltCount, radius * 0.08, thickness * 0.55);
    return hub;
  }


  // Flexible industrial cable / hose routed between two local points.
  function addCable(parent, points, radius){
    var curve = new THREE.CatmullRomCurve3(points);
    var geo = new THREE.TubeGeometry(curve, 36, radius || 0.025, 8, false);
    var matCable = new THREE.MeshPhysicalMaterial({
      color:0x08090a, metalness:0.05, roughness:0.72, clearcoat:0.18, clearcoatRoughness:0.55
    });
    var cable = new THREE.Mesh(geo, matCable);
    cable.castShadow = true;
    cable.receiveShadow = true;
    parent.add(cable);
    return cable;
  }

  // Procedural hazard-stripe texture — black/yellow diagonal tape, like a real base skirt
  function makeHazardTexture(){
    var canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#F2C200';
    var w = 26, gap = 26;
    for (var x = -64; x < 320; x += w + gap){
      ctx.beginPath();
      ctx.moveTo(x, 64); ctx.lineTo(x + w, 64); ctx.lineTo(x + w + 34, 0); ctx.lineTo(x + 34, 0);
      ctx.closePath(); ctx.fill();
    }
    var tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(7, 1);
    return tex;
  }

  // Procedural "DANGER / KEEP OUT" placard, like the real safety labels on industrial arms
  function makeDangerTexture(){
    var canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 180;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f2f2ef'; ctx.fillRect(0, 0, 320, 180);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.strokeRect(3, 3, 314, 174);
    ctx.fillStyle = '#c81e1e';
    ctx.beginPath(); ctx.ellipse(160, 52, 118, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('DANGER', 160, 54);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillText('KEEP OUT', 160, 128);
    return new THREE.CanvasTexture(canvas);
  }

  var matHazard = new THREE.MeshStandardMaterial({ map: makeHazardTexture(), metalness: 0.3, roughness: 0.5 });
  var matDangerLabel = new THREE.MeshStandardMaterial({ map: makeDangerTexture(), metalness: 0.1, roughness: 0.55 });

  var root = new THREE.Group();
  root.position.x = 1.6;
  scene.add(root);

  // Fixed foot — grey base plate + hazard-striped black skirt (does not rotate)
  var basePlate = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.16, 32), matSteel);
  basePlate.position.y = -1.7;
  root.add(basePlate);

  var footCollar = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.05, 0.2, 32, 1, true), matHazard);
  footCollar.position.y = -1.56;
  root.add(footCollar);
  var footCollarCap = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 1.06, 0.05, 36), matDark);
  footCollarCap.position.y = -1.46;
  root.add(footCollarCap);
  addBoltRing(root, 1.0, 20, 0.035, -1.435);

  var waistPivot = new THREE.Group();
  waistPivot.position.y = -1.5;
  root.add(waistPivot);

  // Axis 1 housing — the large bolted disc that rotates with the waist
  // Recessed bearing groove — narrower than both neighbors so it reads as an
  // actual gap/shadow line, not a flush color change. This is the real axis-1 bearing.
  var waistGroove = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.09, 40), matDark);
  waistGroove.position.y = 0.045;
  waistPivot.add(waistGroove);

  var waistDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.78, 0.5, 36), matOrange);
  waistDisc.position.y = 0.34;
  waistPivot.add(waistDisc);
  addBoltRing(waistPivot, 0.8, 16, 0.045, 0.58);

  var baseMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.46, 16), matDark);
  baseMotor.rotation.x = Math.PI / 2;
  baseMotor.position.set(0, 0.25, 0.95);
  waistPivot.add(baseMotor);
  var baseMotorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 14), matSteel);
  baseMotorCap.rotation.x = Math.PI / 2;
  baseMotorCap.position.set(0, 0.25, 1.19);
  waistPivot.add(baseMotorCap);

  var waistLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), matDangerLabel);
  waistLabel.rotation.y = Math.PI / 2;
  waistLabel.position.set(0.97, 0.28, 0);
  waistPivot.add(waistLabel);

  // Joint 2 side neck / pedestal.
  // This support rises from the base on the side opposite the shoulder motor,
  // then meets the shoulder bearing laterally, like a real cast robot housing.
  // It stays with the base/waist assembly, so it does not move with the shoulder link.

  function makeStrutBetween(parent, a, b, width, depth, material, zOffset){
    var mid = a.clone().add(b).multiplyScalar(0.5);
    var length = a.distanceTo(b);
    var strut = new THREE.Mesh(
      new THREE.BoxGeometry(width, length, depth),
      material
    );
    strut.position.set(mid.x, mid.y, zOffset || 0);
    strut.rotation.z = Math.atan2(b.x - a.x, b.y - a.y);
    strut.castShadow = true;
    strut.receiveShadow = true;
    parent.add(strut);
    return strut;
  }

  // Broad lower casting that grows out of the base.
  var neckFoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 0.24, 0.72),
    matDark
  );
  neckFoot.position.set(0, 0.62, -0.56);
  waistPivot.add(neckFoot);

  var neckFootPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.10, 0.82),
    matSteel
  );
  neckFootPlate.position.set(0, 0.78, -0.56);
  waistPivot.add(neckFootPlate);

  // Two separated side rails make the neck look like a cast/fabricated support,
  // not a thin floating column.
  makeStrutBetween(
    waistPivot,
    new THREE.Vector3(-0.30, 0.72, -0.56),
    new THREE.Vector3(-0.22, 1.20, -0.56),
    0.24, 0.34, matDark
  );
  makeStrutBetween(
    waistPivot,
    new THREE.Vector3(0.30, 0.72, -0.56),
    new THREE.Vector3(0.22, 1.20, -0.56),
    0.24, 0.34, matDark
  );

  // Broad shoulder mounting block at the top of the neck.
  // It terminates directly against the negative-Z side of the real J2 axis.
  var neckTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.30, 0.58),
    matOrange
  );
  neckTop.position.set(0, 1.25, -0.28);
  waistPivot.add(neckTop);

  // Joint 2 side bearing: its center is exactly on the shoulder pivot.
  // The motor is on the opposite (+Z) side, while this bearing/neck assembly
  // sits on the open (-Z) side, matching the industrial reference layout.
  var neckBearing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 0.22, 40),
    matOrange
  );
  neckBearing.rotation.x = Math.PI / 2;
  neckBearing.position.set(0, 1.25, -0.36);
  waistPivot.add(neckBearing);

  var neckBearingFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.10, 40),
    matDark
  );
  neckBearingFace.rotation.x = Math.PI / 2;
  neckBearingFace.position.set(0, 1.25, -0.50);
  waistPivot.add(neckBearingFace);

  var neckBearingInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.045, 36),
    matSteel
  );
  neckBearingInner.rotation.x = Math.PI / 2;
  neckBearingInner.position.set(0, 1.25, -0.56);
  waistPivot.add(neckBearingInner);

  // The shoulder pivot is exactly at the center of this bearing.
  var upperArmPivot = new THREE.Group();
  upperArmPivot.position.y = 1.25;
  waistPivot.add(upperArmPivot);

  // Broad cast shoulder link: a long flat housing with rounded ends, rather than a pipe.
  var upperArm = new THREE.Group();
  var upperBody = new THREE.Mesh(new THREE.BoxGeometry(0.64, 1.45, 0.46), matOrange);
  upperBody.position.y = 0.72;
  upperArm.add(upperBody);
  var upperCapTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.46, 32), matOrange);
  upperCapTop.rotation.z = Math.PI / 2;
  upperCapTop.position.y = 1.42;
  upperArm.add(upperCapTop);
  var upperCapBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.46, 32), matOrange);
  upperCapBottom.rotation.z = Math.PI / 2;
  upperCapBottom.position.y = 0.04;
  upperArm.add(upperCapBottom);
  upperArmPivot.add(upperArm);

  // Large shoulder bearing face with concentric rings and visible fasteners.
  var shoulderBearing = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.50, 0.18, 40), matOrange);
  shoulderBearing.rotation.x = Math.PI / 2;
  shoulderBearing.position.set(0, 0.05, 0.28);
  upperArmPivot.add(shoulderBearing);
  var shoulderBearingFace = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.10, 40), matDark);
  shoulderBearingFace.rotation.x = Math.PI / 2;
  shoulderBearingFace.position.set(0, 0.05, 0.39);
  upperArmPivot.add(shoulderBearingFace);

  // Joint 2 bolts are mounted directly on this bearing face.
  // Their local Z position is the face surface, so they physically sit on the bearing.
  var shoulderBoltRing = new THREE.Group();
  shoulderBoltRing.position.set(0, 0.05, 0.455);
  upperArmPivot.add(shoulderBoltRing);

  for (var sb = 0; sb < 12; sb++){
    var sba = (sb / 12) * Math.PI * 2;
    var shoulderBolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.055, 10),
      matBolt
    );
    shoulderBolt.rotation.x = Math.PI / 2;
    shoulderBolt.position.set(
      Math.cos(sba) * 0.31,
      Math.sin(sba) * 0.31,
      0
    );
    shoulderBoltRing.add(shoulderBolt);
  }

  // Side mounted motor / gearbox housing, matching the reference's prominent black unit.
  // Sideways shoulder motor: mounted on the lateral face of the shoulder bearing.
  // The motor shaft is aligned with the shoulder's Z-axis rotation.
  var shoulderMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.48, 24), matDark);
  shoulderMotor.rotation.x = Math.PI / 2;
  shoulderMotor.position.set(0, 0.05, 0.52);
  upperArmPivot.add(shoulderMotor);

  var shoulderMotorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.46, 0.34), matDark);
  shoulderMotorHousing.position.set(0, 0.05, 0.70);
  upperArmPivot.add(shoulderMotorHousing);

  var shoulderMotorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 24), matSteel);
  shoulderMotorCap.rotation.x = Math.PI / 2;
  shoulderMotorCap.position.set(0, 0.05, 0.94);
  upperArmPivot.add(shoulderMotorCap);

  addCable(upperArmPivot, [
    new THREE.Vector3(-0.28, 0.22, 0.32),
    new THREE.Vector3(-0.48, 0.65, 0.34),
    new THREE.Vector3(-0.38, 1.20, 0.34),
    new THREE.Vector3(-0.18, 1.62, 0.32)
  ], 0.035);

  var elbowPivot = new THREE.Group();
  elbowPivot.position.y = 2.02;
  upperArmPivot.add(elbowPivot);

  // Large elbow bearing: the reference has a broad circular gearbox at the bend.
  var elbowHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.50, 40), matOrange);
  elbowHousing.rotation.x = Math.PI / 2;
  elbowPivot.add(elbowHousing);
  var elbowFace = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.56, 40), matOrange);
  elbowFace.rotation.x = Math.PI / 2;
  elbowFace.position.z = 0.05;
  elbowPivot.add(elbowFace);
  var elbowBearingFace = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.58, 36), matDark);
  elbowBearingFace.rotation.x = Math.PI / 2;
  elbowBearingFace.position.z = 0.08;
  elbowPivot.add(elbowBearingFace);
  addBoltRingX(elbowPivot, 0.27, 12, 0.022, 0.39);

  // Black gearbox/motor mounted beside the elbow bearing.
  // Sideways elbow motor: mounted directly behind the elbow bearing.
  // It follows the same Z-axis as the elbow joint instead of sitting above/below it.
  var elbowMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.44, 24), matDark);
  elbowMotor.rotation.x = Math.PI / 2;
  elbowMotor.position.set(0, 0.02, 0.46);
  elbowPivot.add(elbowMotor);

  var elbowMotorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.40, 0.34), matDark);
  elbowMotorHousing.position.set(0, 0.02, 0.68);
  elbowPivot.add(elbowMotorHousing);

  var elbowMotorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 20), matSteel);
  elbowMotorCap.rotation.x = Math.PI / 2;
  elbowMotorCap.position.set(0, 0.02, 0.88);
  elbowPivot.add(elbowMotorCap);

  var forearmPivot = new THREE.Group();
  elbowPivot.add(forearmPivot);
  var forearmRoll = new THREE.Group();
  forearmPivot.add(forearmRoll);

  // Short, wide forearm housing with a tapered silhouette.
  var forearm = new THREE.Group();
  var forearmBody = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.98, 0.40), matOrange);
  forearmBody.position.y = 0.49;
  forearm.add(forearmBody);
  var forearmTop = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.40, 28), matOrange);
  forearmTop.rotation.z = Math.PI / 2;
  forearmTop.position.y = 0.98;
  forearm.add(forearmTop);
  var forearmBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.40, 28), matOrange);
  forearmBottom.rotation.z = Math.PI / 2;
  forearmBottom.position.y = 0.02;
  forearm.add(forearmBottom);
  forearmRoll.add(forearm);

  var forearmBearing = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 32), matDark);
  forearmBearing.rotation.x = Math.PI / 2;
  forearmBearing.position.set(0, 0.02, 0.23);
  forearmRoll.add(forearmBearing);
  addBoltRingX(forearmRoll, 0.22, 10, 0.018, 0.33);

  addCable(forearmRoll, [
    new THREE.Vector3(-0.18, 0.08, 0.22),
    new THREE.Vector3(-0.26, 0.36, 0.25),
    new THREE.Vector3(-0.23, 0.72, 0.25),
    new THREE.Vector3(-0.12, 1.02, 0.23)
  ], 0.026);

  // Real gap bridged by a bracket, instead of the joint overlapping the forearm's
  // rounded tip — forearm's cap ends at y=1.2, joint now starts clear of that
  var wristBracket = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.16), matSteel);
  wristBracket.position.set(0.18, 1.24, 0);
  forearmRoll.add(wristBracket);
  var wristBandA = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 20), matDark);
  wristBandA.position.y = 1.28;
  forearmRoll.add(wristBandA);

  var wristJointA = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 20), matOrange);
  wristJointA.position.y = 1.42;
  forearmRoll.add(wristJointA);
  // Black end cap on the joint's face — same visual language as Joint 2's big
  // bearing cap, scaled down for this smaller roll joint
  var wristACap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 20), matDark);
  wristACap.position.y = 1.55;
  forearmRoll.add(wristACap);
  // Sideways wrist motor, mounted on the lateral face of the wrist housing.
  var wristAMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.22, 14), matDark);
  wristAMotor.rotation.x = Math.PI / 2;
  wristAMotor.position.set(0, 1.42, 0.27);
  forearmRoll.add(wristAMotor);
  var wristAMotorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), matSteel);
  wristAMotorCap.rotation.z = Math.PI / 2;
  wristAMotorCap.position.set(0.34, 1.42, 0);
  forearmRoll.add(wristAMotorCap);
  var wristSidePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.045, 24), matDark);
  wristSidePlate.rotation.x = Math.PI / 2;
  wristSidePlate.position.set(0, 1.42, 0.40);
  forearmRoll.add(wristSidePlate);
  addBoltRing(forearmRoll, 0.205, 12, 0.024, 1.52);
  addBoltRing(forearmRoll, 0.16, 10, 0.016, 1.55);

  var wristPivot = new THREE.Group();
  wristPivot.position.y = 1.56;
  forearmRoll.add(wristPivot);
  var wristJointB = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.22, 18), matOrange);
  wristJointB.rotation.z = Math.PI / 2;
  wristPivot.add(wristJointB);
  var wristBMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.18, 14), matDark);
  wristBMotor.rotation.x = Math.PI / 2;
  wristBMotor.position.set(0, 0.05, 0.2);
  wristPivot.add(wristBMotor);
  var wristBMotorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.035, 12), matSteel);
  wristBMotorCap.rotation.x = Math.PI / 2;
  wristBMotorCap.position.set(0, 0.05, 0.29);
  wristPivot.add(wristBMotorCap);
  var wristSeamB = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.03, 18), matDark);
  wristSeamB.rotation.z = Math.PI / 2;
  wristPivot.add(wristSeamB);
  addBoltRingX(wristPivot, 0.175, 10, 0.018, 0.1);

  // Axis 6 tool flange and compact industrial parallel gripper.
  var gripperPivot = new THREE.Group();
  wristPivot.add(gripperPivot);
  var gripLabel = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 28), matOrange);
  gripLabel.position.y = 0.15;
  gripperPivot.add(gripLabel);
  var gripBellows = makeBellows(0.14, 3, 0.07, 0.24);
  gripperPivot.add(gripBellows);

  var toolCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.12, 24), matSteel);
  toolCollar.position.y = 0.48;
  gripperPivot.add(toolCollar);
  addBoltRing(gripperPivot, 0.085, 6, 0.012, 0.545);

  var gripperBody = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.26), matDark);
  gripperBody.position.y = 0.68;
  gripperBody.castShadow = true;
  gripperPivot.add(gripperBody);

  var fingerGeo = new THREE.BoxGeometry(0.07, 0.34, 0.10);
  var fingerL = new THREE.Mesh(fingerGeo, matSteel);
  fingerL.position.set(-0.13, 0.94, 0);
  gripperPivot.add(fingerL);
  var fingerR = fingerL.clone();
  fingerR.position.x = 0.13;
  gripperPivot.add(fingerR);

  var padGeo = new THREE.BoxGeometry(0.085, 0.13, 0.13);
  var padL = new THREE.Mesh(padGeo, matDark);
  padL.position.set(-0.10, 1.08, 0);
  gripperPivot.add(padL);
  var padR = padL.clone();
  padR.position.x = 0.10;
  gripperPivot.add(padR);

  // Box carried in the gripper — hidden until the pick completes
  var matBox = new THREE.MeshStandardMaterial({ color: 0x1c2226, metalness: 0.2, roughness: 0.6 });
  var matBoxEdge = new THREE.MeshStandardMaterial({ color: 0x0e1417, metalness: 0.3, roughness: 0.3, emissive: 0x2de6dc, emissiveIntensity: 0.35 });
  function makeBox(){
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), matBox);
    g.add(body);
    var band = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), matBoxEdge);
    g.add(band);
    return g;
  }
  var carriedBox = makeBox();
  carriedBox.position.set(0, 0.85, 0);
  carriedBox.visible = false;
  gripperPivot.add(carriedBox);




  root.traverse(function(obj){
    if (obj.isMesh){
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  // ===== Realistic point-to-point motion =====
  // Real industrial arms don't wobble continuously — they move from waypoint to
  // waypoint with synchronized joints and an ease-in/out velocity profile, then
  // dwell briefly before the next move. This models that behavior with a pose list.
  function easeInOutCubic(x){
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // ===== Forward kinematics helper =====
  // Drives the joints to a given angle set and reads back the gripper's real
  // world position — used both for scene placement and for the IK solver below.
  function fk(a){
    waistPivot.rotation.y = a.waist;
    upperArmPivot.rotation.z = a.shoulder;
    forearmPivot.rotation.z = a.elbow;
    forearmRoll.rotation.y = 0;
    wristPivot.rotation.z = a.wristBend;
    gripperPivot.rotation.y = 0;
    root.updateMatrixWorld(true);
    var v = new THREE.Vector3();
    carriedBox.getWorldPosition(v);
    return v;
  }

  var HOME = { waist: -0.6, shoulder: 0.6, elbow: -0.7, wristBend: 0.15 };

  // Reference pose used only to place the shelf scenery — not part of any script
  var shelfPoint = fk({ waist: -0.9, shoulder: 0.95, elbow: -0.3, wristBend: 0.4 });

  var shelfGroup = new THREE.Group();
  shelfGroup.position.set(shelfPoint.x, shelfPoint.y - 0.24, shelfPoint.z);
  scene.add(shelfGroup);
  var shelfPlank = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.85), matSteel);
  shelfGroup.add(shelfPlank);
  var legGeo = new THREE.BoxGeometry(0.07, 2.6, 0.07);
  [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]].forEach(function(p){
    var leg = new THREE.Mesh(legGeo, matDark);
    leg.position.set(p[0], -1.3, p[1]);
    shelfGroup.add(leg);
  });
  var shelfBox = makeBox();
  shelfBox.position.set(0, 0.24, 0);
  shelfGroup.add(shelfBox);

  var floorY = -1.78;



  function resize(){
    var w = mount.clientWidth, h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  function easeInOutCubic(x){
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  // ===== Inverse kinematics via CCD (Cyclic Coordinate Descent) =====
  // For each joint, in order from the tip back to the base, compute the exact angle
  // that rotates the end effector's current direction onto the target direction
  // around that joint's real world rotation axis — then repeat several sweeps.
  // This is the standard IK method for exactly this kind of problem and converges
  // far more precisely than nudging angles via gradient descent.
  var LIMITS = { waist: [-3.05, 3.05], shoulder: [-1.3, 1.7], elbow: [-2.7, 2.7], wristBend: [-2.3, 2.3] };
  var CHAIN = [
    { obj: waistPivot, axis: new THREE.Vector3(0, 1, 0), key: 'waist' },
    { obj: upperArmPivot, axis: new THREE.Vector3(0, 0, 1), key: 'shoulder' },
    { obj: forearmPivot, axis: new THREE.Vector3(0, 0, 1), key: 'elbow' },
    { obj: wristPivot, axis: new THREE.Vector3(0, 0, 1), key: 'wristBend' }
  ];

  function endEffectorPos(){
    var v = new THREE.Vector3();
    carriedBox.getWorldPosition(v);
    return v;
  }

  function solveIK(target, seed){
    var a = { waist: seed.waist, shoulder: seed.shoulder, elbow: seed.elbow, wristBend: seed.wristBend };
    fk(a);

    var order = [0, 1, 2, 3]; // waist, shoulder, elbow, wristBend — base-first
    var P = new THREE.Vector3(), Q = new THREE.Quaternion(), axisWorld = new THREE.Vector3();
    var vE = new THREE.Vector3(), vT = new THREE.Vector3(), cross = new THREE.Vector3();

    for (var sweep = 0; sweep < 14; sweep++){
      var closeEnough = true;
      for (var oi = 0; oi < order.length; oi++){
        var joint = CHAIN[order[oi]];
        joint.obj.getWorldPosition(P);
        joint.obj.getWorldQuaternion(Q);
        axisWorld.copy(joint.axis).applyQuaternion(Q).normalize();

        var E = endEffectorPos();
        vE.copy(E).sub(P);
        vT.copy(target).sub(P);
        // project both onto the plane perpendicular to this joint's rotation axis
        vE.sub(axisWorld.clone().multiplyScalar(vE.dot(axisWorld)));
        vT.sub(axisWorld.clone().multiplyScalar(vT.dot(axisWorld)));
        var lenE = vE.length(), lenT = vT.length();
        if (lenE < 1e-4 || lenT < 1e-4) continue;
        vE.normalize(); vT.normalize();
        cross.crossVectors(vE, vT);
        var angle = Math.atan2(cross.dot(axisWorld), vE.dot(vT));
        if (Math.abs(angle) > 0.003) closeEnough = false;

        var damping = joint.key === 'waist' ? 1.0 : 0.85;
        a[joint.key] += angle * damping; // damped correction to avoid overshoot/oscillation
        if (a[joint.key] < LIMITS[joint.key][0]) a[joint.key] = LIMITS[joint.key][0];
        if (a[joint.key] > LIMITS[joint.key][1]) a[joint.key] = LIMITS[joint.key][1];
        fk(a);
      }
      if (closeEnough && endEffectorPos().distanceTo(target) < 0.02) break;
    }
    return a;
  }

  var DEFAULT_SEQUENCE = [
    { waist: 0.108, shoulder: 1.451, elbow: -0.612, wristBend: 0.819 },
    { waist: 1.196, shoulder: 0.384, elbow: -1.068, wristBend: 1.456 },
    { waist: 3.002, shoulder: 1.299, elbow: -0.805, wristBend: 1.798 },
    { waist: 3.004, shoulder: 0.936, elbow: -0.877, wristBend: 1.35 },
    { waist: 0.391, shoulder: 1.351, elbow: -2.7, wristBend: 2.3 },
    { waist: 0.109, shoulder: 1.516, elbow: -1.092, wristBend: 0.609 }
  ];

  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var clickPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.4);
  var current = { waist: HOME.waist, shoulder: HOME.shoulder, elbow: HOME.elbow, wristBend: HOME.wristBend };
  var tween = null;
  var mode = 'auto';
  var playIndex = 0, playState = 'move', playT0 = 0;
  var detourPhase = 'move', detourT0 = 0;
  var clickMarker = null;
  var statusEl = document.getElementById('teachStatus');

  function updateStatus(){
    if (!statusEl) return;
    statusEl.textContent = mode === 'detour'
      ? 'Calculating a path to your point...'
      : 'Click anywhere near the robot arm. An inverse kinematics algorithm calculates the joint angles needed to reach that point.';
  }

  function startTween(to, dur){
    tween = { from: { waist: current.waist, shoulder: current.shoulder, elbow: current.elbow, wristBend: current.wristBend }, to: to, start: clock.getElapsedTime(), dur: dur || 1.0 };
  }

  function clampTarget(hit){
    var waistBase = new THREE.Vector3(); waistPivot.getWorldPosition(waistBase);
    var maxReach = 3.75;
    hit.y = Math.max(floorY + 1.3, Math.min(hit.y, 2.9));
    var toHit = hit.clone().sub(waistBase);
    if (toHit.length() > maxReach) toHit.setLength(maxReach);
    hit.copy(waistBase).add(toHit);
    if (hit.y < floorY + 1.3) hit.y = floorY + 1.3;
    return hit;
  }

  function onPointerDown(evt){
    var rect = renderer.domElement.getBoundingClientRect();
    var clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    var clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    var hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(clickPlane, hit)) return;
    hit = clampTarget(hit);

    var solved = solveIK(hit, current);
    mode = 'detour'; detourPhase = 'move'; detourT0 = clock.getElapsedTime();
    startTween(solved, 1.0);

    if (clickMarker) scene.remove(clickMarker);
    clickMarker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), matCyan);
    clickMarker.position.copy(hit);
    scene.add(clickMarker);

    updateStatus();
  }

  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  var clock = new THREE.Clock();
  startTween(DEFAULT_SEQUENCE[0], 1.2);
  updateStatus();

  function animate(){
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    if (mode === 'auto'){
      var elapsed = t - playT0;
      if (playState === 'move' && elapsed >= 1.2){
        playState = 'hold'; playT0 = t;
      } else if (playState === 'hold' && elapsed >= 0.8){
        playIndex = (playIndex + 1) % DEFAULT_SEQUENCE.length;
        playState = 'move'; playT0 = t;
        startTween(DEFAULT_SEQUENCE[playIndex], 1.2);
      }
    } else if (mode === 'detour'){
      var dElapsed = t - detourT0;
      if (detourPhase === 'move' && dElapsed >= 1.0){
        detourPhase = 'hold'; detourT0 = t;
      } else if (detourPhase === 'hold' && dElapsed >= 1.3){
        mode = 'auto'; playIndex = 0; playState = 'move'; playT0 = t;
        startTween(DEFAULT_SEQUENCE[0], 1.2);
        if (clickMarker){ scene.remove(clickMarker); clickMarker = null; }
        updateStatus();
      }
    }

    if (tween){
      var localT = Math.min(1, (t - tween.start) / tween.dur);
      var e = easeInOutCubic(localT);
      current.waist = tween.from.waist + (tween.to.waist - tween.from.waist) * e;
      current.shoulder = tween.from.shoulder + (tween.to.shoulder - tween.from.shoulder) * e;
      current.elbow = tween.from.elbow + (tween.to.elbow - tween.from.elbow) * e;
      current.wristBend = tween.from.wristBend + (tween.to.wristBend - tween.from.wristBend) * e;
      if (localT >= 1) tween = null;
    }

    fk(current);

    camera.position.x = 1.6 + Math.sin(t * 0.04) * 0.4;
    camera.position.z = 8.5 + Math.sin(t * 0.03) * 0.3;
    camera.position.y = 0.4 + Math.sin(t * 0.03) * 0.15;
    camera.lookAt(1.6, -0.2, 0.4);

    renderer.render(scene, camera);
  }
  animate();
})();

  (function(){
  var items = document.querySelectorAll('.tl-item');
  if (!items.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  items.forEach(function(item){ observer.observe(item); });
})();

  (function(){
  var drone = document.getElementById('flightDrone');
  var rail = document.getElementById('flightRail');
  var contactSection = document.getElementById('contact');
  if (!drone || !rail || !contactSection) return;

  function update(){
    var railRect = rail.getBoundingClientRect();
    var railTop = railRect.top;
    var railHeight = railRect.height;

    // Progress runs from page top (0) to the Contact section's top (1) —
    // "home" to "destination", not the whole document including the footer.
    var contactTop = contactSection.getBoundingClientRect().top + window.scrollY;
    var scrollY = window.scrollY;
    var progress = contactTop > 0 ? scrollY / contactTop : 0;
    progress = Math.max(0, Math.min(1, progress));

    var y = railTop + progress * railHeight;
    drone.style.top = y + 'px';

    // Slight bank in the direction of travel for a more alive feel
    var bank = (progress - (update.lastProgress || 0)) * 400;
    update.lastProgress = progress;
    bank = Math.max(-12, Math.min(12, bank));
    drone.style.transform = 'rotate(' + bank + 'deg)';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

  return () => {};
}
