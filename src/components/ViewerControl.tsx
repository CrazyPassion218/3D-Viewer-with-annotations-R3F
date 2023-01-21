import React from 'react';
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { AnnotationBuffer } from "user-types/annotationBuffer";
import { Grid, Paper, TextField } from "@mui/material";

interface AnnotationControllerProps{
    /**
     * Called when annotation type is changed.
     * @param event React Select Change Event
     */
    updateAnnotationType: (event: React.FormEvent) => void;

    /**
     * Called when annotation is added.
     * @param a AnnotationBuffer Interface
     */
    insertAnnotation: (title: String, description: String) => void;

    /**
     * Called when annotation is removed.
     * @param id AnnotationBuffer id String
     */
    removeAnnotation: (id: Number) => void;

    /**
     * Called when annotation is updated.
     * @param id AnnotationBuffer id String
     * @param a AnnotationBuffer Interface
     */
    updateAnnotation: (id: Number, a: AnnotationBuffer) => void;

    /**
     * Called when current control view status is changed.
     * @param s String
     */
    updateControlStatus: (s: String) => void;

    /**
     * The list of annotations buffers for the given model.
     */
    annotationBuffers: AnnotationBuffer[];

    /**
     * current control view status
     */
    controlStatus: String;
}

export function ViewerControl({
    updateAnnotationType,
    insertAnnotation,
    // updateAnnotation,
    // removeAnnotation,
    updateControlStatus,
    annotationBuffers,
    controlStatus
}: AnnotationControllerProps) {
    const [title, setTitle] = React.useState('' as String);
    const [description, setDescription] = React.useState('' as String);

    const handleCancelClick = React.useCallback(
        (ev: React.MouseEvent) => {
            ev.preventDefault();

            updateControlStatus("normal");
        }, [controlStatus]);

    const handleAddClick = React.useCallback(
        (ev: React.MouseEvent) => {
            ev.preventDefault();

            updateControlStatus("add");
        }, [controlStatus]);

    const handleSaveClick = React.useCallback(
        (ev: React.MouseEvent) => {
            ev.preventDefault();

            // if (!title) {
            //     alert('Please input the title!');
            //     return;
            // } else if (!description) {
            //     alert('Please input the description!');
            //     return;
            // }

            insertAnnotation(title, description);
        }, [controlStatus]);

    const handleTitleChange = React.useCallback(
        (ev: React.ChangeEvent) => {
            ev.preventDefault();
            setTitle(((ev.target) as any).value);
        }, [title]);

    const handleDescriptionChange = React.useCallback(
        (ev: React.ChangeEvent) => {
            ev.preventDefault();
            setDescription(((ev.target) as any).value);
        }, [description]);

    return (
        <div style={{
            'border': '1px dark solid',
            'position': "absolute",
            'width': "250px",
            'top': "10%",
            'right': "5%",
            'zIndex': "10000",}}>
            <p>Select the type of annotation</p>
            <select 
                style={{'height': '35px', 'width': '140px', 'marginRight': '10px'}}
                className="form-control" 
                id="searchType" 
                onChange={ updateAnnotationType }>
                <option value="point">Point</option>
                <option value="area">Area</option>
                <option value="group">Group</option>
                <option value="path">Path</option>
            </select>
            {
                controlStatus !== 'normal'? <Button color="primary" variant="contained" disabled> Add </Button> : <Button color="primary" variant="contained" onClick={handleAddClick}> Add </Button>
            }
            {
                controlStatus === 'add' ?
                    <Grid item xs={12} sm={12} md={12}>
                        <Paper>
                            <Grid item xs={12}>
                                <TextField  placeholder="title" onChange={handleTitleChange} value={title}></TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField  placeholder="description" onChange={handleDescriptionChange} value={description}></TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <Button size="small" color="primary" onClick={handleSaveClick}>
                                    Save
                                </Button>
                                <Button size="small" color="secondary" onClick={handleCancelClick}>
                                    Cancel
                                </Button>
                            </Grid>
                        </Paper>
                    </Grid> : ''
            }
            {
                annotationBuffers.map(a =>
                    <Card>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="h2">
                                {a.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p">
                                {a.description}
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <Button size="small" color="primary">
                                Edit
                            </Button>
                            <Button size="small" color="secondary"/* onClick={(ev: React.MouseEvent) => {handleDeleteClick(ev, a.id)}}*/>
                                Delete
                            </Button>
                        </CardActions>
                    </Card>
                )
            }
        </div>
    );
}