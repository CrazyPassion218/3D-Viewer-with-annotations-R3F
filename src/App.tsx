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

    const obj = useLoader(OBJLoader, 'human_model.obj');

    React.useEffect(() => {
        if (controlStatus === 'normal')
            setAnnotation({} as Annotation);
    }, [controlStatus]);

    const selectAnnotation = (a: Annotation) => {
        if (controlStatus === 'add')
            setAnnotation(a);
    }

    const insertAnnotation = (title: String, description: String) => {
        console.log(annotation);
        if (!annotation.type) {
            alert('Please select point annotation!');
            return;
        }

        var date = new Date();
        const a = {
            id: date.valueOf(),
            title: title,
            description: description,
            annotationType: annotationType,
            annotation: annotation,
        }

        setAnnotationBuffers([...annotationBuffers, a])
        setControlStatus('normal');
    }

    const removeAnnotation = (id: Number) => {
        let _annotationBuffers = [...annotationBuffers];
        setAnnotationBuffers(_annotationBuffers.filter(a => a.id !== id));
        setControlStatus('normal');
    }

    const updateAnnotation = (id: Number, a: AnnotationBuffer) => {
        let _annotations = [...annotationBuffers];
        _annotations.map(_a => {
            return (_a.id === id) ? a : _a;
        });
        setAnnotationBuffers(_annotations);
    }

    const updateAnnotationType = (event: React.FormEvent) => {
        let type = ((event.target) as any).value;
        setAnnotationType(type)
    }

    const updateControlStatus = (s: String) => {
        setControlStatus(s)
    }

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
                selectAnnotation = {selectAnnotation}
            />
        </div>
    );
}

export default App;
