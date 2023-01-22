import * as React from "react";
import * as Three from "three";
import {
    Annotation,
    SimpleVector2,
    SimpleVectorWithNormal,
    visitAnnotation,
    AreaAnnotation,
    GroupAnnotation,
    PointAnnotation,
    visitAnnotationData,
    compact,
    MINIMUM_INTENSITY,
    IntensityValue,
} from "@external-lib";
import { Canvas, RootState } from "@react-three/fiber";
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
    selectAnnotation
}: VisualizerProps) {
    const [state, setState] = React.useState<VisualizerState>();
    // TODO use `layerDepth` to show the various layers of an object

    // compute the box that contains all the stuff in the model
    const modelBoundingBox = new Three.Box3().setFromObject(model);
    const modelBoundingBoxSize = modelBoundingBox.getSize(new Three.Vector3()).length();
    const modelBoundingBoxCenter = modelBoundingBox.getCenter(new Three.Vector3());

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
                            x: intersections[0].point.x, y: intersections[0].point.y, z: intersections[0].point.z,
                        } as SimpleVectorWithNormal,
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
            <primitive object={model} />
            {annotations.map((annotation) =>
                visitAnnotation(annotation, {
                    area: (a) => renderAreaAnnotation(a, model),
                    group: (a) => <>{renderGroupAnnotation(a, model)}</>, // not sure if this is a good way to do things
                    point: (a) => renderPointAnnotation(a, model),
                    path: () => undefined, // Paths are not currently supported, ignore this
                    unknown: () => undefined,
                })
            )}
            {annotations.map((annotation) =>
                visitAnnotation(annotation, {
                    area: (a) => undefined,
                    group: (a) => undefined, // not sure if this is a good way to do things
                    point: (a) => renderSprite(a.title, a.location, 1),
                    path: () => undefined, // Paths are not currently supported, ignore this
                    unknown: () => undefined,
                })
            )}
        </Canvas>
    );
}

function renderAreaAnnotation(annotation: AreaAnnotation, model: Three.Object3D): JSX.Element | undefined {
    const mesh = model.children.find((c): c is Three.Mesh => c instanceof Three.Mesh);
    if (mesh === undefined) {
        return renderPoint(annotation.center);
    }
    
    if(!mesh.geometry.attributes.color){	    
        let count = mesh.geometry.attributes.position.count;
        mesh.geometry.setAttribute( 'color', new Three.BufferAttribute( new Float32Array( count * 3 ), 3 ) );
    };   
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
    
    return renderPoint(annotation.center);
}

function renderGroupAnnotation(annotation: GroupAnnotation, model: Three.Object3D): JSX.Element[] {
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

            return renderPoint({
                x: center.x,
                y: center.y,
                z: boundingBox.max.z, // wip(3d) find a better way to stick this on the surface of the model
                normal: { x: 0, y: 0, z: 0 },
            });
        })
    );
}

function renderPointAnnotation(annotation: PointAnnotation, model: Three.Object3D): JSX.Element | undefined {
    return visitAnnotationData<JSX.Element | undefined>(annotation.data, {
        basic: () => renderPoint(annotation.location),
        heatmap: (heatmap) => {
            // NOTE: This was my attempt at rendering heatmaps. The strategy was to color the vertices of the mesh based on how far
            // away it was from the center of the annotation, but it's not a great solution since it's hard to "un-color" the vertices
            // when an annotation is deleted and this also probably won't work if the model has textures. I will leave the implementation
            // here for you to see but feel free to delete it and write a new implementation.

            const mesh = model.children.find((c): c is Three.Mesh => c instanceof Three.Mesh);
            if (mesh === undefined) {
                return renderPoint(annotation.location);
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
            return renderPoint(annotation.location);
        },
        unknown: () => undefined,
    });
}

// Just renders a sphere
function renderPoint(annotationLocation: SimpleVectorWithNormal): JSX.Element {
    return (
        <mesh
            geometry={SPHERE_GEOMETRY}
            material={MESH_MATERIAL}
            position={convertToThreeJSVector(annotationLocation)}
        />
    );
}

function renderSprite(children: string, position: SimpleVectorWithNormal, opacity: number, color = 'red', fontSize = 35 ):JSX.Element | undefined {
    if (children === undefined) return;

    const fontsize = fontSize;
    const borderThickness =  4;
    const location = new Three.Vector3(position.x, position.y, position.z);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if(context){
        context.textBaseline = 'middle'
        context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`

        const metrics = context.measureText( children );
        const textWidth = metrics.width;

        context.lineWidth = borderThickness;

        context.fillStyle = color
        context.fillText( children, textWidth - (textWidth*0.8), fontsize);
    }
    return (
        <sprite
            scale={[5, 3, 3]}
            position={location}>
            <spriteMaterial attach="material" transparent alphaTest={opacity} >
                <canvasTexture attach="map" image={canvas} />
            </spriteMaterial>
        </sprite>
    )
}
