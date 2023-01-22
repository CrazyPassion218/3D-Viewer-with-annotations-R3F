import * as Three from "three";
import { /*DEFAULT_ANNOTATION_COLOR, */POINT_ANNOTATION_COLOR } from "./colors";

export const INITIAL_CAMERA_SETTINGS = {
    fov: 70,
    aspect: window.innerWidth / window.innerHeight,
    position : new Three.Vector3(5, 5, 5)
};

export const ORBIT_CONTROLS_SETTINGS = {
    maxZoom: 30,
    minZoom: 20,
};

export const LIGHT_POSITION = new Three.Vector3(5, 10, 2);

export const SPHERE_GEOMETRY = new Three.SphereGeometry(0.1);

export const MESH_MATERIAL = new Three.MeshLambertMaterial({
    emissive: new Three.Color(POINT_ANNOTATION_COLOR),
    emissiveIntensity: 0.25,
});
