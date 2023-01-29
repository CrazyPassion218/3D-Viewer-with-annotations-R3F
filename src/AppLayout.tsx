import React from "react";
import { Visualizer, AnnotationBar } from './viewer'
import * as Three from "three";
import {
    SimpleVector2,
    SimpleVectorWithNormal,
    SimpleFaceWithNormal,
} from "@external-lib";
import {
    AnnotationExtends,
    // visitAnnotationExtends,
    AreaAnnotationExtends,
    // GroupAnnotationExtends,
    PointAnnotationExtends,
} from 'user-types'
import { MeshLambertMaterial } from "three";
interface AppLayoutProps {
    /**
     * The 3D model to display. This is loaded outside of the component, and the prop value never changes.
     */
    model: Three.Object3D<Three.Event>;
}

export function AppLayout({
    model
    }: AppLayoutProps) {
    /**
     * all annotations. This means virtual annotation database.
     */
    const [annotations, setAnnotations] = React.useState([] as AnnotationExtends[]);
    /**
     * This means annotation set on the model by user.
     */
    const [currentAnnotation, setCurrentAnnotation] = React.useState({} as AnnotationExtends);
    /**
     * This means annotation type set in the current time.
     */
    const [annotationType, setAnnotationType] = React.useState('point' as string);
    /**
     * This means annotation control status.
     */
    const [controlStatus, setControlStatus] = React.useState('normal' as string);
    /**
     * This means selected and unselected annotation control.
     */
    const [selectedAnnotation, setSelectedAnnotation] = React.useState({} as AnnotationExtends);
    /**
     * This means search string input by user in the current time.
     */
    const [search, setSearch] = React.useState('' as string);

    /**
     * useEffect function when call by following controlStatus and annotations's changing.
     */
    React.useEffect(() => {
        if (controlStatus === 'normal')
            setCurrentAnnotation({} as AnnotationExtends);
    }, [controlStatus, annotations]);

    /**
     * useEffect function when call by following annotation type's changing.
     */
    React.useEffect(() => {
        setAnnotations([] as AnnotationExtends[]);
        setTimeout(function() {
            setAnnotations([...annotations]);
        }, 100);
    }, [annotationType])

    /**
     * Called when user selected point annotation.
     * @param a Annotation
     * @returns
     */
    const selectAnnotation = (a: AnnotationExtends) => {
        if (controlStatus === 'annotation') {
            const date = new Date();
            a.id = date.valueOf();
            
            setAnnotations([...annotations, a])
            setCurrentAnnotation(a);
            updateControlStatus('add');
        }
    }

    /**
     * insert annotation by user.
     * @param title string
     * @param description string
     * @returns
     */
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

    /**
     * remove annotation by user.
     * @param annotation Annotation
     * @returns
     */
    const removeAnnotation = (annotation: AnnotationExtends) => {
        let _annotations = [...annotations];

        setAnnotations([] as AnnotationExtends[]);
        setTimeout(function() {
            if (!annotation.title) {
                setAnnotations(_annotations.filter(a => a.id !== currentAnnotation.id));
            }
            else setAnnotations(_annotations.filter(a => a.id !== annotation.id));
        }, 100);

        setControlStatus('normal');
    }

    /**
     * update annotation by user.
     * @param annotation Annotation
     * @returns
     */
    const updateAnnotation = (annotation: AnnotationExtends) => {
        let _annotations = [...annotations];
        _annotations = _annotations.map(a => {
            return (a.id === annotation.id) ? annotation : a;
        });
        setAnnotations([] as AnnotationExtends[]);
        setTimeout(function() {
            setAnnotations(_annotations);
        }, 100);

        setControlStatus('normal');
    }

    /**
     * called when user changed annotation type.
     * @param value string
     * @returns
     */
    const updateAnnotationType = (value: string) => {
        setAnnotationType(value)
    }

    /**
     * called when control status(normal, add, edit, delete) is changed.
     * @param s string
     * @returns
     */
    const updateControlStatus = (s: string) => {
        setControlStatus(s)
    }

    /**
     * called when user selected and unselected annotation control.
     * @param annotation Annotation
     * @param key string
     * @returns
     */
    const selectAnnotationControl = (annotation: AnnotationExtends, key: string) => {
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
            setSelectedAnnotation({} as AnnotationExtends);
        }
    }

    /**
     * called when search string is changed.
     * @param value string
     * @returns
     */
    const changeSearch = (value: string) => {
        setSearch(value);

        const viewAnnotation = annotations.filter(a => a.title.indexOf(value) === 0);
        if (viewAnnotation.length === 1 && viewAnnotation[0].display) {
            updateAnnotation(Object.assign({...viewAnnotation[0]}, {select: true}));
            setSelectedAnnotation(viewAnnotation[0]);
        }
    }

    /**
     * called when show all checkbox is checked.
     * @param checked boolean
     * @returns
     */
    const checkAllChange = (checked: boolean) => {
        let _annotations = [...annotations];
        _annotations = _annotations.map(a => Object.assign({...a}, {display: checked}));
        setAnnotations(_annotations);
    }

    const handleMouseRightClicked = (worldPositionAndNormal : SimpleVectorWithNormal,
        screenPosition: SimpleVector2, annoMaterial: MeshLambertMaterial) => {
        switch (annotationType) {
            case 'point':
                selectAnnotation({
                    type: "point",
                    location: {
                        x: worldPositionAndNormal.x, y: worldPositionAndNormal.y, z: worldPositionAndNormal.z
                    } as SimpleVectorWithNormal,
                    face: worldPositionAndNormal as unknown as SimpleFaceWithNormal,
                    material: annoMaterial, 
                    data: {
                        type: 'basic'
                    },
                    display: true,
                    select: false
                } as PointAnnotationExtends);
                break;
            case 'area':
                selectAnnotation({
                    type: "area",
                    center: {
                        x: worldPositionAndNormal.x, y: worldPositionAndNormal.y, z: worldPositionAndNormal.z,
                    } as SimpleVectorWithNormal,
                    location: {
                        x: worldPositionAndNormal.x, y: worldPositionAndNormal.y, z: worldPositionAndNormal.z,
                    } as SimpleVectorWithNormal,
                    face: worldPositionAndNormal as unknown as SimpleFaceWithNormal,
                    material: annoMaterial, 
                    radius: 20,
                    data: {
                        type: 'basic'
                    },
                    display: true,
                    select: false
                } as AreaAnnotationExtends);
                break;
            case 'Group':
                break;
            default:
                break;
        }
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
                annotations = {annotations.filter(a => { 
                    return (a.title? a.type === annotationType && (!search || a.title.indexOf(search) === 0) && a.display : true)})}
                layerDepth = {1}
                onReady = {() => {}}
                onClick = {()=>{}}
                onRightClick = {handleMouseRightClicked}
                selectedAnnotation = {selectedAnnotation}
                currentState = {controlStatus}
            />
        </div>
    );
}
