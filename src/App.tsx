import React from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'
import { AnnotationBuffer } from "user-types/annotationBuffer";
import { Visualizer } from './viewer'
import { ViewerControl } from './components/ViewerControl'
import { Annotation } from "@external-lib";

function App() {
    const [annotationBuffers, setAnnotationBuffers] = React.useState([] as AnnotationBuffer[]);
    const [annotation, setAnnotation] = React.useState({} as Annotation);
    const [annotationType, setAnnotationType] = React.useState('point' as String);
    const [controlStatus, setControlStatus] = React.useState('normal' as String);

    const obj = useLoader(OBJLoader, 'human_model.obj')

    const insertAnnotation = React.useCallback(
        (title: String, description: String) => {
            if (!annotation) {
                alert('Please select point annotation!');
                return;
            }

            var date = new Date();
            const a = {
                id: date.valueOf(),
                title: title + 'title',
                description: description + 'description',
                annotationType: annotationType,
                annotation: annotation,
            }

            setAnnotationBuffers([...annotationBuffers, a])
            setControlStatus('normal');
        }, [annotationBuffers]);

    const removeAnnotation = React.useCallback(
        (id: Number) => {
            let _annotations = [...annotationBuffers];
            _annotations.map(a => a.id !== id);
            setAnnotationBuffers(_annotations);
        }, [annotationBuffers]);

    const updateAnnotation = React.useCallback(
        (id: Number, a: AnnotationBuffer) => {
            let _annotations = [...annotationBuffers];
            _annotations.map(_a => {
                return (_a.id === id) ? a : _a;
            });
            setAnnotationBuffers(_annotations);
        }, [annotationBuffers]);

    const updateAnnotationType = React.useCallback(
    (event: React.FormEvent) => {
        let type = ((event.target) as any).value;
        setAnnotationType(type)
    }, [annotationType]);

    const updateControlStatus = React.useCallback(
        (s: String) => {
            setControlStatus(s)
        }, [controlStatus]);

    return (
        <div style={{'height': '100%'}}>
            <ViewerControl
                insertAnnotation = {insertAnnotation}
                updateAnnotation = {updateAnnotation}
                removeAnnotation = {removeAnnotation}
                updateAnnotationType = {updateAnnotationType}
                updateControlStatus = {updateControlStatus}
                annotationBuffers = {annotationBuffers}
                controlStatus = {controlStatus}
            />
            <Visualizer
                disableInteractions={false}
                model = {obj}
                annotationBuffers = {annotationBuffers}
                layerDepth = {1}
                annotationType = {annotationType}
                onReady = {() => {}}
                onClick = {()=>{}}
                onRightClick = {() =>{}}
                setAnnotation = {setAnnotation}
            />
        </div>
    );
}

export default App;
