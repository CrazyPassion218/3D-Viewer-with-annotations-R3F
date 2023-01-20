import React from 'react';
import './App.css';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { useLoader } from '@react-three/fiber'

import { Visualizer } from './viewer'

function App() {
  const obj = useLoader(OBJLoader, 'human_model.obj')
  console.log(obj)
  return (
      <Visualizer
        disableInteractions={false} 
        model = {obj}
        annotations = {[]}
        layerDepth = {1}
        onReady = {() => {}}
        onClick = {()=>{}}
        onRightClick = {() =>{}}
         />
  );
}

export default App;
