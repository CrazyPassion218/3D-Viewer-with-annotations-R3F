import React from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'
import { Visualizer } from './viewer'
import { ViewerControl } from './components/ViewerControl'
import { Annotation } from "@external-lib";

function App() {
    const [annotations, setAnnotations] = React.useState([] as Annotation[]);
    const [currentAnnotation, setCurrentAnnotation] = React.useState({} as Annotation);
    const [annotationType, setAnnotationType] = React.useState('point' as string);
    const [controlStatus, setControlStatus] = React.useState('normal' as string);

    const obj = useLoader(OBJLoader, 'human_model.obj');

    React.useEffect(() => {
        if (controlStatus === 'normal')
            setCurrentAnnotation({} as Annotation);
    }, [controlStatus, annotationType]);

    const selectAnnotation = (a: Annotation) => {
        if (controlStatus === 'add')
            setCurrentAnnotation(a);
    }

    const insertAnnotation = (title: string, description: string) => {
        if (!currentAnnotation.type) {
            alert('Please select point annotation!');
            return;
        }
        let annotation = currentAnnotation;

        const date = new Date();
        annotation.id = date.valueOf();
        annotation.title = title;
        annotation.description = description;

        setAnnotations([...annotations, annotation])
        setControlStatus('normal');
    }

    const removeAnnotation = (id: number) => {
        let _annotations = [...annotations];
        setAnnotations(_annotations.filter(a => a.id !== id));
        setControlStatus('normal');
    }

    const updateAnnotation = (id: number, a: Annotation) => {
        let _annotations = [...annotations];
        _annotations.map(_a => {
            return (_a.id === id) ? a : _a;
        });
        setAnnotations(_annotations);
        setControlStatus('normal');
    }

    const updateAnnotationType = (event: React.FormEvent) => {
        let type = ((event.target) as any).value;
        setAnnotationType(type)
    }

    const updateControlStatus = (s: string) => {
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
                annotations = {annotations.filter(a => a.type === annotationType)}
                controlStatus = {controlStatus}
            />
            <Visualizer
                disableInteractions={false}
                model = {obj}
                annotations = {annotations.filter(a => a.type === annotationType)}
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
