import * as React from "react";
import * as Three from "three";
import { useRef } from "react";
import {
    Annotation,
    SimpleVector2,
    SimpleVectorWithNormal,
    SimpleFaceWithNormal,
    visitAnnotation,
    AreaAnnotation,
    GroupAnnotation,
    PointAnnotation,
    visitAnnotationData,
    compact,
    MINIMUM_INTENSITY,
    IntensityValue,
} from "@external-lib";
import { Canvas, RootState, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AREA_ANNOTATION_COLOR, getHeatmapColor, SCENE_BACKGROUND_COLOR } from "../common/colors";
import { findTween, getTween } from "../utils/tweenUtils";
import {
    convertToThreeJSVector,
    convertWorldCoordsToScreenCoords,
    frameArea,
    getWorldPositionAndNormal,
} from "../utils/visualizerUtils";
import {
    INITIAL_CAMERA_SETTINGS,
    LIGHT_POSITION,
    ORBIT_CONTROLS_SETTINGS,
    SPHERE_GEOMETRY,
    MESH_MATERIAL,
} from "common/constants";
import { Mesh, Vector, Vector3 } from "three";

interface VisualizerProps {
    /**
     * Determines whether the canvas should be interactive. If set to `true`, you should not be able to move the camera
     */
    disableInteractions?: boolean;

    /**
     * The 3D model to display. This is loaded outside of the component, and the prop value never changes.
     */
    model: Three.Object3D<Three.Event>;

    /**
     * The list of annotations for the given model.
     */
    annotations: Annotation[];

    /**
     * Some models can have multiple layers that can be shown. This is a number ranging from 0-1 that indicates what the selected
     * zoom level is. Different models will interpret this value in different ways, so for now we can temporarily skip implementing it.
     */
    layerDepth: number;
    /**
     * Various types of annotations.
     */
    annotationType:string
    /**
     * Called when the canvas is ready.
     */
    onReady: () => void;

    /**
     * Called when a left click is registered. Unlike the other click listeners, this is always called even if `disableInteractions` is `true`.
     * @param wasClickIgnored Tells us whether interactions are disabled (this value is equal to `disableInteractions`)
     */
    onClick: (wasClickIgnored: boolean) => void;

    /**
     * Called when a model is clicked.
     * @param annotation
     */
    selectAnnotation: (annotation: Annotation) => void;

    /**
     * Called when a right click is registered.
     * @param worldPositionAndNormal
     * @param screenPosition
     * @returns
     */
    onRightClick: (worldPositionAndNormal: SimpleVectorWithNormal, screenPosition: SimpleVector2) => void;

    /**
     * selected annotation id in the viewer controller.
     */
    selectedAnnotationId: number;
}

interface VisualizerState {
    renderer: Three.WebGLRenderer;
    camera: Three.PerspectiveCamera;
    scene: Three.Scene;
    model: Three.Object3D;
    raycaster: Three.Raycaster;
}

export function Visualizer({
    disableInteractions = false,
    model,
    annotations,
    annotationType,
   // layerDepth,
    onReady,
    onClick,
    onRightClick,
    selectAnnotation,
    selectedAnnotationId
}: VisualizerProps) {
    const [state, setState] = React.useState<VisualizerState>();
    const [spriteOpacity, setSpriteOpacity] = React.useState<number>(0);
    const [annoId, setAnnoId] = React.useState<number>(0);
    // TODO use `layerDepth` to show the various layers of an object
    // compute the box that contains all the stuff in the model
    const modelBoundingBox = new Three.Box3().setFromObject(model);
    const modelBoundingBoxSize = modelBoundingBox.getSize(new Three.Vector3()).length();
    const modelBoundingBoxCenter = modelBoundingBox.getCenter(new Three.Vector3());
    const focuSelectedAnnotation = React.useEffect(
        () => {
            const selectedAnnotation = annotations.filter(function (annotation){
                return annotation.id === selectedAnnotationId;
            })
            if(selectedAnnotation.length !== 0){
                const directVec = selectedAnnotation[0].face.normal;
                const distance = 4;
                let cameraPosition = state?.camera.position;
                let objectPosition = new Vector3(selectedAnnotation[0].location.x, selectedAnnotation[0].location.y, selectedAnnotation[0].location.z);
                const newPosition = new Three.Vector3(selectedAnnotation[0].location.x + directVec.x * distance, selectedAnnotation[0].location.y + directVec.y * distance, selectedAnnotation[0].location.z + directVec.z * distance);
                state?.renderer.setAnimationLoop(() => {
                    // if()
                    state.camera.lookAt(objectPosition);
                    state.camera.position.lerp(newPosition, 0.1);
                })
            }
        },[selectedAnnotationId]
    )
    const getClickContext = React.useCallback(
        (event: React.MouseEvent) => {
            if (state === undefined) {
                return undefined;
            }

            state.raycaster.setFromCamera(
                {
                    x: (event.clientX / state.renderer.domElement.clientWidth) * 2 - 1,
                    y: -(event.clientY / state.renderer.domElement.clientHeight) * 2 + 1,
                },
                state.camera
            );

            const intersections = state.raycaster.intersectObject(model, true);

            return {
                intersections,
                camera: state.camera,
                renderer: state.renderer,
            };
        },
        [model, state]
    );

    const handleCanvasCreated = React.useCallback(
        (rootState: RootState) => {
            rootState.scene.background = new Three.Color(SCENE_BACKGROUND_COLOR);
            // set the camera to frame the model into view
            frameArea(
                modelBoundingBoxSize * 1.2,
                modelBoundingBoxSize,
                modelBoundingBoxCenter,
                rootState.camera as Three.PerspectiveCamera
            );

            setState({
                camera: rootState.camera as Three.PerspectiveCamera,
                renderer: rootState.gl,
                scene: rootState.scene,
                model,
                raycaster: rootState.raycaster,
            });

            onReady(
                
            );
        },
        [model, modelBoundingBoxCenter, modelBoundingBoxSize, onReady]
    );

    const handleClick = React.useCallback(
        (ev: React.MouseEvent) => {
            const clickContext = getClickContext(ev);
            if (disableInteractions || clickContext === undefined || clickContext.intersections.length === 0) {
                return;
            }

            const { intersections/*, camera, renderer*/ } = clickContext;
            switch (annotationType) {
                case 'point':
                    selectAnnotation({
                        type: "point",
                        location: {
                            x: intersections[0].point.x, y: intersections[0].point.y, z: intersections[0].point.z
                        } as SimpleVectorWithNormal,
                        face: intersections[0].face as unknown as SimpleFaceWithNormal,
                        data: {
                            type: 'basic'
                        }
                    } as PointAnnotation);
                    break;
                case 'area':
                    selectAnnotation({
                        type: "area",
                        center: {
                            x: intersections[0].point.x, y: intersections[0].point.y, z: intersections[0].point.z,
                        } as SimpleVectorWithNormal,
                        radius: 20,
                        data: {
                            type: 'basic'
                        }
                    } as AreaAnnotation);
                    break;
                case 'Group':
                    break;
                default:
                    break;
            }

            onClick(disableInteractions);
    }, [getClickContext, disableInteractions, onClick]);

    const handleRightClick = React.useCallback(
        (ev: React.MouseEvent) => {
            const clickContext = getClickContext(ev);

            if (disableInteractions || clickContext === undefined || clickContext.intersections.length === 0) {
                return;
            }

            const { intersections, camera, renderer } = clickContext;

            const worldPositionAndNormal = getWorldPositionAndNormal(intersections[0]);

            onRightClick(
                worldPositionAndNormal,
                convertWorldCoordsToScreenCoords(worldPositionAndNormal, camera, renderer)
            );
        },
        [disableInteractions, getClickContext, onRightClick]
    );

    const handleOpacity = React.useCallback((value: number) => 
    {
        setSpriteOpacity(value);
    },[spriteOpacity]);
    return (
        <Canvas
            onClick={handleClick}
            onContextMenu={handleRightClick}
            resize={{ debounce: 50 }}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
            }}
            camera={INITIAL_CAMERA_SETTINGS}
            onCreated={handleCanvasCreated}
        >
            <directionalLight color={0xffffff} intensity={1} position={LIGHT_POSITION} />
            <OrbitControls
                enabled={!disableInteractions}
                enableDamping={false}
                enablePan={true}
                maxDistance={modelBoundingBoxSize * 10}
                maxZoom={ORBIT_CONTROLS_SETTINGS.maxZoom}
                minZoom={ORBIT_CONTROLS_SETTINGS.minZoom}
                mouseButtons={{
                    LEFT: Three.MOUSE.ROTATE,
                    MIDDLE: undefined,
                    RIGHT: undefined,
                }}
                target={modelBoundingBoxCenter}
            />
            <primitive object={model}/>
            {annotations.map((annotation) =>
                visitAnnotation(annotation, {
                    area: (a) => renderAreaAnnotation(a, model, handleOpacity, setAnnoId),
                    group: (a) => <>{renderGroupAnnotation(a, model, handleOpacity, setAnnoId)}</>, // not sure if this is a good way to do things
                    point: (a) => renderPointAnnotation(a, model, handleOpacity, setAnnoId),
                    path: () => undefined, // Paths are not currently supported, ignore this
                    unknown: () => undefined,
                })
            )}
            {annotations.map((annotation) =>
                visitAnnotation(annotation, {
                    area: (a) => renderSprite(a, a.center, 0.2, 'red', 60, annoId),
                    group: (a) => undefined, // not sure if this is a good way to do things
                    point: (a) => renderSprite(a, a.location, spriteOpacity, 'red', 60, annoId),
                    path: () => undefined, // Paths are not currently supported, ignore this
                    unknown: () => undefined,
                })
            )}
        </Canvas>
    );
}

function renderAreaAnnotation(annotation: AreaAnnotation, model: Three.Object3D, handleOpacity:Function, setAnnoId:Function): JSX.Element | undefined {
    const mesh = model.children.find((c): c is Three.Mesh => c instanceof Three.Mesh);
    if (mesh === undefined) {
        return renderPoint(annotation, handleOpacity, setAnnoId);
    }
    
    if(!mesh.geometry.attributes.color){	    
        let count = mesh.geometry.attributes.position.count;
        mesh.geometry.setAttribute( 'color', new Three.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    };   
    console.log(mesh);
    const colorList = new Float32Array(mesh.geometry.attributes.color.array);
    const geometryPositionsArray = Array.from(mesh.geometry.getAttribute("position").array);
    const vertex = new Three.Vector3();
    const areaCenter = new Three.Vector3(annotation.center.x, annotation.center.y, annotation.center.z);
    const color = new Three.Color(AREA_ANNOTATION_COLOR);
    const rgbValues = [color.r, color.g, color.b];
    for (let i = 0; i <= geometryPositionsArray.length - 3; i += 3) {
        vertex.set(geometryPositionsArray[i], geometryPositionsArray[i + 1], geometryPositionsArray[i + 2]);
        const distance = vertex.distanceTo(areaCenter);
        // if this vertex is within the radius, color it
        if (distance <= annotation.radius) {
            colorList.set(rgbValues, i);
        }
    }
    // note: this will only work for non indexed geometry
    const colorsAttribute = new Three.BufferAttribute(colorList, 3);
    mesh.geometry.setAttribute("color", colorsAttribute);
    mesh.geometry.attributes.color.needsUpdate = true;
    
    return renderPoint(annotation, handleOpacity, setAnnoId);
}

function renderGroupAnnotation(annotation: GroupAnnotation, model: Three.Object3D, handleOpacity: Function, setAnnoId:Function): JSX.Element[] {
    return compact(
        annotation.groupIds.map((group) => {
            const obj = model.getObjectByName(group);

            if (!(obj instanceof Three.Mesh) || !(obj.geometry instanceof Three.BufferGeometry)) {
                return undefined;
            }

            if (obj.geometry.boundingBox === null) {
                obj.geometry.computeBoundingBox();
            }

            const boundingBox = obj.geometry.boundingBox!;

            const center = new Three.Vector3();
            boundingBox.getCenter(center);

            return renderPoint(
                annotation, handleOpacity, setAnnoId
            //     {
            //     x: center.x,
            //     y: center.y,
            //     z: boundingBox.max.z, // wip(3d) find a better way to stick this on the surface of the model
            //     normal: { x: 0, y: 0, z: 0 },
            // }
            
            );
        })
    );
}

function renderPointAnnotation(annotation: PointAnnotation, model: Three.Object3D, handleOpacity: Function, setAnnoId: Function): JSX.Element | undefined {
    return visitAnnotationData<JSX.Element | undefined>(annotation.data, {
        basic: () => renderPoint(annotation, handleOpacity, setAnnoId),
        heatmap: (heatmap) => {
            // NOTE: This was my attempt at rendering heatmaps. The strategy was to color the vertices of the mesh based on how far
            // away it was from the center of the annotation, but it's not a great solution since it's hard to "un-color" the vertices
            // when an annotation is deleted and this also probably won't work if the model has textures. I will leave the implementation
            // here for you to see but feel free to delete it and write a new implementation.

            const mesh = model.children.find((c): c is Three.Mesh => c instanceof Three.Mesh);
            if (mesh === undefined) {
                return renderPoint(annotation, handleOpacity, setAnnoId);
            }
            const colorList = new Float32Array(mesh.geometry.attributes.color.array);
            const geometryPositionsArray = Array.from(mesh.geometry.getAttribute("position").array);
            const vertex = new Three.Vector3();
            const heatMapCenter = new Three.Vector3(
                annotation.location.x,
                annotation.location.y,
                annotation.location.z
            );
            for (let i = 0; i <= geometryPositionsArray.length - 3; i += 3) {
                vertex.set(geometryPositionsArray[i], geometryPositionsArray[i + 1], geometryPositionsArray[i + 2]);
                const distance = vertex.distanceTo(heatMapCenter);

                // if this vertex is within the heatmap radius, get the color based on the distance
                if (distance <= heatmap.radius) {
                    // invert the tween to get the colors in the right order
                    const tween = 1 - findTween(0, heatmap.radius, distance);
                    const intensity = getTween(MINIMUM_INTENSITY, heatmap.intensity, tween);
                    const color = getHeatmapColor(intensity as IntensityValue);

                    // Color values apparently have to range from 0-1
                    colorList.set([color.red() / 255, color.green() / 255, color.blue() / 255], i);
                }
            }

            // note: this will only work for non indexed geometry
            const colorsAttribute = new Three.BufferAttribute(colorList, 3);
            mesh.geometry.setAttribute("color", colorsAttribute);
            mesh.geometry.attributes.color.needsUpdate = true;
            return renderPoint(annotation, handleOpacity, setAnnoId);
        },
        unknown: () => undefined,
    });
}

// Just renders a sphere
function renderPoint(annotation: Annotation, handleOpacity: Function, setAnnoId:Function): JSX.Element {
    const onMouseOverAnnotaion = () => {
        handleOpacity(0.6);
        setAnnoId(annotation.id);
    }
    const onMouseLeaveAnnotaion = () => {
        handleOpacity(0);
        setAnnoId(0);
    }
    return (
        <mesh
            onPointerOver={onMouseOverAnnotaion}
            onPointerLeave={onMouseLeaveAnnotaion}
            geometry={SPHERE_GEOMETRY}
            material={MESH_MATERIAL}
            position={convertToThreeJSVector(annotation.location)}
        />
    );
}

function renderSprite(annotation: Annotation, position: SimpleVectorWithNormal, opacity: number, color = 'red', fontSize = 60, annoId: number ):JSX.Element | undefined {
    if (annotation === undefined) return;
    // if(!annoId)opacity = 0;
    if(annoId !== annotation.id)opacity = 0;
    if(annotation.title === undefined) return;
    let children = annotation.title;
    const fontface = "Georgia"
    const fontsize = fontSize;
    const borderThickness = 3; 
	var borderColor = {r:0, g:0, b:0, a:1.0};
    var backgroundColor = {r:10, g:10, b:10, a:1.0};
    const location = new Three.Vector3(position.x , position.y - 0.8, position.z );
    const canvas = document.createElement('canvas');
    canvas.width += children.length * 30;
    const context = canvas.getContext('2d');
    if(context){
        // context.textBaseline = 'middle'
        // context.font = `${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
        context.font = "Bold " + fontsize + "px " + fontface;
        const metrics = context.measureText( children );
        const textWidth = metrics.width;
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                    + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        context.fillStyle = "rgba(255, 255, 255 , 1.0)";
        // context.fillStyle = color
        context.fillText( children, borderThickness, fontsize + borderThickness);
    }
    return (
        <sprite
            scale={[3, 1.4, 1]}
            position={location}>
            <spriteMaterial  transparent alphaTest={opacity} depthTest={false} opacity={opacity}>
                <canvasTexture attach="map" image={canvas}/>
            </spriteMaterial>
        </sprite>
    )
}

function roundRect(ctx : CanvasRenderingContext2D, x : any, y : any, w : any, h : any, r : any) 
{
    ctx.beginPath();
    ctx.moveTo(x/2 + r, y/2);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}