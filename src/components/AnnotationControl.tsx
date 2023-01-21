import React from 'react';
// import ComboBox from 'react-responsive-combo-box'
import 'react-responsive-combo-box/dist/index.css'

interface AnnotationControllerProps{
    /**
     * annotation
     * @param changeAnnotationType
     */
    changeAnnotationType: (event: React.FormEvent) => void;
    /**
     * annotation
     * @param addChecked
     */
    addChecked: (event: React.FormEvent) => void;
}
export function AnnotatoinController({
    addChecked,
    changeAnnotationType
}: AnnotationControllerProps) {
    return (
        <div style={{
            'border': '1px dark solid',
            'position': "absolute",
            'top': "10%",
            'right': "5%",
            'zIndex': "10000",}}>
            <p>Select the type of annotation</p>
            <select 
                style={{'height': '35px', 'width': '140px', 'marginRight': '10px'}}
                className="form-control" 
                id="searchType" 
                onChange={ changeAnnotationType }>
                <option value="Point">Point</option>
                <option value="Area">Area</option>
                <option value="Group">Group</option>
                <option value="Path">Path</option>
            </select>
            <input
                aria-label='Create option'
                type="checkbox"
                id='checkbox'
                // checked={ischeck}
                onChange={addChecked}
            />
        </div>
    );
}
