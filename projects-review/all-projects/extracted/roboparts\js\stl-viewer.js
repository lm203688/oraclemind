/* Three.js STL Viewer for RoboLink */

let stlViewer = null;
let stlScene = null;
let stlRenderer = null;
let stlCamera = null;
let stlControls = null;
let stlCurrentModel = null;
let stlRobotArmModel = null;  // 当前加载的机械臂模型
let stlAnimId = null;

function initSTLViewer() {
    // 加载Three.js
    if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            const script2 = document.createElement('script');
            script2.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            script2.onload = () => {
                const script3 = document.createElement('script');
                script3.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js';
                script3.onload = () => setupViewer();
                script3.onerror = () => setupViewer(); // fallback
                document.head.appendChild(script3);
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
    } else {
        setupViewer();
    }
}

function setupViewer() {
    stlViewer = document.getElementById('stl3dViewer');
    if (!stlViewer) return;

    const w = stlViewer.clientWidth || 400;
    const h = stlViewer.clientHeight || 300;

    stlScene = new THREE.Scene();
    stlScene.background = new THREE.Color(0xf8f7f4);

    stlCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    stlCamera.position.set(50, 40, 50);

    stlRenderer = new THREE.WebGLRenderer({ antialias: true });
    stlRenderer.setSize(w, h);
    stlRenderer.setPixelRatio(window.devicePixelRatio);
    stlViewer.appendChild(stlRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    stlScene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 80, 50);
    stlScene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x8888ff, 0.4);
    dirLight2.position.set(-50, 20, -50);
    stlScene.add(dirLight2);

    // Grid
    const grid = new THREE.GridHelper(100, 20, 0xcccccc, 0xe8e8e8);
    stlScene.add(grid);

    // Controls
    if (typeof THREE.OrbitControls !== 'undefined') {
        stlControls = new THREE.OrbitControls(stlCamera, stlRenderer.domElement);
        stlControls.enableDamping = true;
        stlControls.dampingFactor = 0.05;
        stlControls.autoRotate = true;
        stlControls.autoRotateSpeed = 2;
    }

    animate();
}

function animate() {
    stlAnimId = requestAnimationFrame(animate);
    if (stlControls) stlControls.update();
    if (stlRenderer) stlRenderer.render(stlScene, stlCamera);
}

function loadSTLModel(id) {
    const url = `stl/${id}.stl`;

    // Remove old model
    if (stlCurrentModel) {
        stlScene.remove(stlCurrentModel);
        stlCurrentModel = null;
    }

    // Show viewer modal
    const modal = document.getElementById('stlPreviewModal');
    if (modal) modal.style.display = 'flex';

    // Init viewer if not yet
    if (!stlRenderer) {
        initSTLViewer();
        setTimeout(() => loadSTLModel(id), 1500);
        return;
    }

    if (typeof THREE.STLLoader === 'undefined') {
        // Fallback: can't load STL, show message
        showToast('3D预览加载中，请稍后刷新重试');
        return;
    }

    const loader = new THREE.STLLoader();
    loader.load(url, (geometry) => {
        const material = new THREE.MeshPhongMaterial({
            color: 0x378ADD,
            specular: 0x333333,
            shininess: 60,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Center and scale
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        mesh.position.sub(center);

        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 60 / maxDim;
        mesh.scale.set(scale, scale, scale);

        stlScene.add(mesh);
        stlCurrentModel = mesh;

        // Reset camera
        stlCamera.position.set(50, 40, 50);
        stlCamera.lookAt(0, 0, 0);
        if (stlControls) {
            stlControls.target.set(0, 0, 0);
            stlControls.update();
        }
    }, undefined, (err) => {
        showToast('模型加载失败');
    });
}

function closeSTLPreview() {
    const modal = document.getElementById('stlPreviewModal');
    if (modal) modal.style.display = 'none';
}

// ========== 加载机械臂模型（程序化生成）==========
function loadRobotArmModel(armId) {
  // 移除旧模型
  if (stlRobotArmModel) {
    stlScene.remove(stlRobotArmModel);
    stlRobotArmModel = null;
  }

  // 程序化生成一个简单的 3 轴机械臂
  const armGroup = new THREE.Group();

  // 基座
  const baseGeo = new THREE.CylinderGeometry(10, 12, 5, 32);
  const baseMat = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 2.5;
  armGroup.add(baseMesh);

  // 臂杆 1（垂直）
  const link1Geo = new THREE.CylinderGeometry(5, 5, 30, 16);
  const link1Mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const link1Mesh = new THREE.Mesh(link1Geo, link1Mat);
  link1Mesh.position.y = 20;
  armGroup.add(link1Mesh);

  // 臂杆 2（水平）
  const link2Geo = new THREE.CylinderGeometry(4, 4, 25, 16);
  const link2Mat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });
  const link2Mesh = new THREE.Mesh(link2Geo, link2Mat);
  link2Mesh.rotation.z = Math.PI / 2;
  link2Mesh.position.set(12.5, 35, 0);
  armGroup.add(link2Mesh);

  // 腕部（法兰）
  const flangeGeo = new THREE.CylinderGeometry(5, 5, 3, 32);
  const flangeMat = new THREE.MeshPhongMaterial({ color: 0x378ADD });
  const flangeMesh = new THREE.Mesh(flangeGeo, flangeMat);
  flangeMesh.position.set(25, 35, 0);
  armGroup.add(flangeMesh);

  // 标记法兰位置（用于后续加载夹爪时定位）
  armGroup.userData.flangePosition = new THREE.Vector3(25, 35, 0);
  armGroup.userData.flangeRotation = new THREE.Euler(0, 0, 0);

  stlScene.add(armGroup);
  stlRobotArmModel = armGroup;
}

// ========== 加载夹爪模型并定位到机械臂法兰 ==========
function loadGripperOnArm(gripperId) {
  // 先加载夹爪模型
  const url = `stl/${gripperId}.stl`;
  const loader = new THREE.STLLoader();

  loader.load(url, (geometry) => {
    const material = new THREE.MeshPhongMaterial({
      color: 0xDC2626,
      specular: 0x333333,
      shininess: 60,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);

    // 居中缩放
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    mesh.position.sub(center);

    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 40 / maxDim;
    mesh.scale.set(scale, scale, scale);

    // 定位到机械臂法兰
    if (stlRobotArmModel && stlRobotArmModel.userData.flangePosition) {
      mesh.position.copy(stlRobotArmModel.userData.flangePosition);
      // 调整方向（使夹爪 Z 轴对齐法兰）
      mesh.rotation.set(-Math.PI / 2, 0, 0);
    }

    stlScene.add(mesh);
    stlCurrentModel = mesh;

    // 重置相机
    stlCamera.position.set(60, 50, 60);
    stlCamera.lookAt(0, 20, 0);
    if (stlControls) {
      stlControls.target.set(0, 20, 0);
      stlControls.update();
    }
  }, undefined, (err) => {
    showToast('夹爪模型加载失败');
  });
}
