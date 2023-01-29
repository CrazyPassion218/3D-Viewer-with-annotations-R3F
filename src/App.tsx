import React/*, { Children } */from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { useGLTF } from "@react-three/drei";
import { useLoader } from '@react-three/fiber'
import {AppLayout} from "./AppLayout";
// import * as Three from "three";
// import { color } from "@mui/system";
function App() {
    const obj = useLoader(OBJLoader, 'human_model.obj');
    // const cube = new Three.BoxGeometry(8,2,2);
    // const cubeMaterial = new Three.MeshLambertMaterial({'color': 'white'});
    // const mesh = new Three.Mesh(cube, cubeMaterial);
    // // console.log(mesh.material.vertexColors)
    // mesh.material.vertexColors = true;

    return (
        <AppLayout
            model={obj}
        />
    );
}

export default App;
