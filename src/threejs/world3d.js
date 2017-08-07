// import data from './globe';
import Map3DGeometry from './map3d';
export default (worldUrl='../d/world_geometry.json', landUrl='../d/gold.jpg', rtt=-1.57) => {
    /*eslint no-console: 0 */
    const _ = {sphereObject: new THREE.Object3D()};

    function loadCountry() {
        const data = _.world;
        for (var name in data) {
            var geometry = new Map3DGeometry(data[name], 0.9);
            _.sphereObject.add(data[name].mesh = new THREE.Mesh(geometry, _.material));
        }
        _.loaded = true;
    }

    function init() {
        this._.options.showWorld = true;
        _.sphereObject.rotation.y = rtt;
        _.sphereObject.scale.set(205,205,205);
        makeEnvMapMaterial(landUrl, function(material) {
            _.material = material;
            if (_.world && !_.loaded) {
                loadCountry()
            }
        });
    }

    function create() {
        if (_.material && !_.loaded) {
            loadCountry()
        }
        _.sphereObject.visible = this._.options.showWorld;
        const tj = this.threejsPlugin;
        tj.addGroup(_.sphereObject);
    }

    const vertexShader = `
    varying vec2 vN;
    void main() {
        vec4 p = vec4( position, 1. );
        vec3 e = normalize( vec3( modelViewMatrix * p ) );
        vec3 n = normalize( normalMatrix * normal );
        vec3 r = reflect( e, n );
        float m = 2. * length( vec3( r.xy, r.z + 1. ) );
        vN = r.xy / m + .5;
        gl_Position = projectionMatrix * modelViewMatrix * p;
    }
    `
    const fragmentShader = `
    uniform sampler2D tMatCap;
    varying vec2 vN;
    void main() {
        vec3 base = texture2D( tMatCap, vN ).rgb;
        gl_FragColor = vec4( base, 1. );
    }
    `
    function makeEnvMapMaterial(imgUrl, cb) {
        const loader = new THREE.TextureLoader();
        loader.load(imgUrl, function(value) {
            const type = 't';
            const uniforms = {tMatCap:{type,value}};
            const material = new THREE.ShaderMaterial({
                uniforms,
                vertexShader,
                fragmentShader,
                shading: THREE.SmoothShading
            });
            cb.call(this, material);
        });
    }

    function refresh() {
        if (_.sphereObject) {
            _.sphereObject.visible = this._.options.showWorld;
        }
    }

    return {
        name: 'world3d',
        urls: worldUrl && [worldUrl],
        onReady(err, data) {
            this.world3d.data(data);
        },
        onInit() {
            init.call(this);
        },
        onCreate() {
            create.call(this);
        },
        onRefresh() {
            refresh.call(this);
        },
        rotate(rtt) {
            _.sphereObject.rotation.y = rtt;
        },
        data(data) {
            if (data) {
                _.world = data;
            } else {
                return  _.world;
            }
        },
        sphere() {
            return _.sphereObject;
        },
    }
}