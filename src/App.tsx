import React from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { useLoader } from '@react-three/fiber'
// import { useGLTF } from "@react-three/drei";
import { Visualizer } from './viewer'
import { AnnotatoinController } from './components/AnnotationControl'
import { Annotation } from "@external-lib";

function App() {
    const [annotations, setAnnotations] = React.useState([] as Annotation[]);
    const [annotationType, setAnnotationType] = React.useState('point');
    const [isChecked, setIsChecked] = React.useState(false);
    const obj = useLoader(OBJLoader, 'human-again.obj')

    const insertAnnotation = React.useCallback(
    (a: Annotation) => {
        setAnnotations([...annotations, a])
    }, [annotations]);

    const changeAnnotationType = React.useCallback(
    (event: React.FormEvent) => {
        // setAnnotationType(event.target.)
        let type = ((event.target) as any).value;
        setAnnotationType(type);
    }, [annotationType]);

    const addChecked = React.useCallback(
        (event: React.FormEvent) => {
            // setAnnotationType(event.target.)
            let check = ((event.target) as any).value;
            console.log(check);
            setIsChecked(check);
        }, [isChecked]);

    return (
        <div style={{'height': '100%'}}>
        <AnnotatoinController
            addChecked = {addChecked}
            changeAnnotationType = {changeAnnotationType}
        />
        <Visualizer
            disableInteractions={false}
            model = {obj}
            annotations = {annotations}
            layerDepth = {1}
            annotationType = {annotationType}
            onReady = {() => {}}
            onClick = {()=>{}}
            onRightClick = {() =>{}}
            insertAnnotation = {insertAnnotation}
        />
        </div>
    );
}

export default App;
