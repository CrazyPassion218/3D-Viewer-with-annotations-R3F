import React from "react";
import { Visualizer, AnnotationBar } from './viewer'
import { Annotation } from "@external-lib";
import * as Three from "three";

interface AppLayoutProps {
    /**
     * The 3D model to display. This is loaded outside of the component, and the prop value never changes.
     */
    model: Three.Object3D<Three.Event>;
}

export function AppLayout({
    model
    }: AppLayoutProps) {
    const [annotations, setAnnotations] = React.useState([] as Annotation[]);
    const [currentAnnotation, setCurrentAnnotation] = React.useState({} as Annotation);
    const [annotationType, setAnnotationType] = React.useState('point' as string);
    const [controlStatus, setControlStatus] = React.useState('normal' as string);
    const [selectedAnnotation, setSelectedAnnotation] = React.useState({} as Annotation);
    const [search, setSearch] = React.useState('' as string);

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
        updateAnnotation(annotation);
        setControlStatus('normal');
    }

    const removeAnnotation = (annotation: Annotation) => {
        let _annotations = [...annotations];

        setAnnotations([] as Annotation[]);
        setTimeout(function() {
            if (!annotation.title) {
                setAnnotations(_annotations.filter(a => a.id !== currentAnnotation.id));
            }
            else setAnnotations(_annotations.filter(a => a.id !== annotation.id));
        }, 100);

        setControlStatus('normal');
    }

    const updateAnnotation = (annotation: Annotation) => {
        let _annotations = [...annotations];
        _annotations = _annotations.map(a => {
            return (a.id === annotation.id) ? annotation : a;
        });
        setAnnotations([] as Annotation[]);
        setTimeout(function() {
            setAnnotations(_annotations);
        }, 100);

        setControlStatus('normal');
    }

    const updateAnnotationType = (value: string) => {
        setAnnotationType(value)
    }

    const updateControlStatus = (s: string) => {
        setControlStatus(s)
    }

    const selectAnnotationControl = (annotation: Annotation, key: string) => {
        if (key === 'select') {
            let _annotations = [...annotations];
            _annotations = _annotations.map(a => {
                if (a.id === annotation.id) {
                    a.select = true;
                } else {
                    a.select = false;
                }
                return a;
            });

            setAnnotations(_annotations);
            setSelectedAnnotation(annotation);
        }
        else {
            updateAnnotation(Object.assign({...annotation}, {select: false}));
            setSelectedAnnotation({} as Annotation);
        }
    }

    const changeSearch = (value: string) => {
        setSearch(value);

        const viewAnnotation = annotations.filter(a => a.title.indexOf(value) === 0);
        if (viewAnnotation.length === 1 && viewAnnotation[0].display) {
            updateAnnotation(Object.assign({...viewAnnotation[0]}, {select: true}));
            setSelectedAnnotation(viewAnnotation[0]);
        }
    }

    const checkAllChange = (checked: boolean) => {
        let _annotations = [...annotations];
        _annotations = _annotations.map(a => Object.assign({...a}, {display: checked}));
        setAnnotations(_annotations);
    }

    return (
        <div style={{'height': '100%'}}>
            <AnnotationBar
                insertAnnotation = {insertAnnotation}
                updateAnnotation = {updateAnnotation}
                removeAnnotation = {removeAnnotation}
                updateAnnotationType = {updateAnnotationType}
                updateControlStatus = {updateControlStatus}
                annotations = {annotations.filter(a => (a.type === annotationType && a.title && (!search || a.title.indexOf(search) === 0)))}
                controlStatus = {controlStatus}
                selectAnnotationControl = {selectAnnotationControl}
                checkAllChange = {checkAllChange}
                changeSearch = {changeSearch}
            />
            <Visualizer
                disableInteractions={false}
                model = {model}
                annotations = {annotations.filter(a => a.type === annotationType && (!search || a.title.indexOf(search) === 0) && a.display)}
                layerDepth = {1}
                annotationType = {annotationType}
                onReady = {() => {}}
                onClick = {()=>{}}
                onRightClick = {() =>{}}
                selectAnnotation = {selectAnnotation}
                selectedAnnotation = {selectedAnnotation}
            />
        </div>
    );
}
