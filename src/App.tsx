import React from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'

import { Visualizer } from './viewer'
import { Annotation } from "@external-lib";

function App() {
    const [annotations, setAnnotations] = React.useState([] as Annotation[]);
    const obj = useLoader(OBJLoader, 'human_model.obj')

    const insertAnnotation = React.useCallback(
    (a: Annotation) => {
        setAnnotations([...annotations, a])
    }, [annotations]);

    return (
        <Visualizer
            disableInteractions={false}
            model = {obj}
            annotations = {annotations}
            layerDepth = {1}
            onReady = {() => {}}
            onClick = {()=>{}}
            onRightClick = {() =>{}}
            insertAnnotation = {insertAnnotation}
        />
    );
}

export default App;
