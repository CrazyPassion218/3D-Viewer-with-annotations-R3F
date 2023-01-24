import React from "react";
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'
import { Visualizer } from './components/Visualizer'
import { ViewerControl } from './components/ViewerControl'
import { Annotation } from "@external-lib";
import { ObjectLoader } from "three";

function App() {
    const [annotations, setAnnotations] = React.useState([] as Annotation[]);
    const [currentAnnotation, setCurrentAnnotation] = React.useState({} as Annotation);
    const [annotationType, setAnnotationType] = React.useState('point' as string);
    const [controlStatus, setControlStatus] = React.useState('normal' as string);
    const [selectedAnnotationId, setSelectedAnnotationId] = React.useState(0 as number);

    const obj = useLoader(OBJLoader, 'human_model.obj');

    React.useEffect(() => {
        if (controlStatus === 'normal')
            setCurrentAnnotation({} as Annotation);
    }, [controlStatus, annotations]);

    React.useEffect(() => {
        setAnnotations([] as Annotation[]);
        setTimeout(function() {
            setAnnotations([...annotations]);
        }, 100);
    }, [annotationType])

    const selectAnnotation = (a: Annotation) => {
        if (controlStatus === 'annotation') {
            const date = new Date();
            a.id = date.valueOf();
            
            setAnnotations([...annotations, a])
            setCurrentAnnotation(a);
            updateControlStatus('add');
        }
    }

    const insertAnnotation = (title: string, description: string) => {
        if (!currentAnnotation.type) {
            alert('Please select point annotation!');
            return;
        }
        let annotation = currentAnnotation;
        annotation.title = title;
        annotation.description = description;
        updateAnnotation(annotation.id, annotation);
        setControlStatus('normal');
    }

    const removeAnnotation = (id: number) => {
        let _annotations = [...annotations];

        setAnnotations([] as Annotation[]);
        setTimeout(function() {
            if (id === 0) setAnnotations(_annotations.filter(a => a.id !== currentAnnotation.id));
            else setAnnotations(_annotations.filter(a => a.id !== id));
        }, 100);

        setControlStatus('normal');
    }

    const updateAnnotation = (id: number, a: Annotation) => {
        let _annotations = [...annotations];
        _annotations.map(_a => {
            return (_a.id === id) ? a : _a;
        });
        setAnnotations([] as Annotation[]);
        setTimeout(function() {
            setAnnotations(_annotations);
        }, 100);

        setControlStatus('normal');
    }

    const updateAnnotationType = (event: React.FormEvent) => {
        let type = ((event.target) as any).value;
        setAnnotationType(type)
    }

    const updateControlStatus = (s: string) => {
        setControlStatus(s)
    }

    const selectAnnotationId = (id: number) => {
        setSelectedAnnotationId(id);
    }

    return (
        <div style={{'height': '100%'}}>
            <ViewerControl
                insertAnnotation = {insertAnnotation}
                updateAnnotation = {updateAnnotation}
                removeAnnotation = {removeAnnotation}
                updateAnnotationType = {updateAnnotationType}
                updateControlStatus = {updateControlStatus}
                annotations = {annotations.filter(a => (a.type === annotationType && a.title))}
                controlStatus = {controlStatus}
                selectAnnotationId={selectAnnotationId}
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
                selectedAnnotationId = {selectedAnnotationId}
            />
        </div>
    );
}

export default App;
