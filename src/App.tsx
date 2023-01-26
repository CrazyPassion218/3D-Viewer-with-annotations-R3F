import React, { Children } from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useGLTF } from "@react-three/drei";
import { useLoader } from '@react-three/fiber'
import {AppLayout} from "./AppLayout";

function App() {
    const obj = useLoader(OBJLoader, 'human_model.obj');
    
    return (
        <AppLayout
            model={obj}
        />
    );
}

export default App;
