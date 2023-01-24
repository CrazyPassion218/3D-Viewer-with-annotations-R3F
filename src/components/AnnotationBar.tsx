import React from 'react';
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import { Annotation } from "@external-lib";
import { Select, Button, Form, Input } from "antd";
import { PlusOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";

const validateMessages = {
    required: '${label} is required!',
};

interface AnnotationControllerProps{
    /**
     * Called when annotation type is changed.
     * @param event React Select Change Event
     */
    updateAnnotationType: (value: string) => void;

    /**
     * Called when annotation is added.
     * @param a AnnotationBuffer Interface
     */
    insertAnnotation: (title: string, description: string) => void;

    /**
     * Called when annotation is removed.
     * @param id AnnotationBuffer id String
     */
    removeAnnotation: (annotation: Annotation) => void;

    /**
     * Called when annotation is updated.
     * @param id AnnotationBuffer id String
     * @param a AnnotationBuffer Interface
     */
    updateAnnotation: (annotation: Annotation) => void;

    /**
     * Called when current control view status is changed.
     * @param s String
     */
    updateControlStatus: (s: string) => void;

    /**
     * Called when annotation list is clicked.
     * @param id number
     */
    selectAnnotationControl: (a: Annotation) => void;

    /**
     * The list of annotations buffers for the given model.
     */
    annotations: Annotation[];

    /**
     * current control view status
     */
    controlStatus: string;
}

export function AnnotationBar({
    updateAnnotationType,
    insertAnnotation,
    updateAnnotation,
    removeAnnotation,
    selectAnnotationControl,
    updateControlStatus,
    annotations,
    controlStatus
}: AnnotationControllerProps) {
    const [form] = Form.useForm();

    const handleCancelClick = (ev: React.MouseEvent, key: string) => {
        ev.preventDefault();

        if (key === 'add') {
            removeAnnotation({} as Annotation);
        }

        updateControlStatus("normal");
    }

    const handleAddClick = (ev: React.MouseEvent) => {
        ev.preventDefault();

        updateControlStatus("annotation");
    }

    const handleSaveClick = (values: any) => {
        insertAnnotation(values.title, values.description);
    }

    const handleChangeClick = (values: any, annotation: Annotation) => {
        annotation.title = values.title;
        annotation.description = values.description;

        updateAnnotation(annotation);
    }

    const handleDeleteClick = (ev: React.MouseEvent, annotation: Annotation) => {
        ev.preventDefault();

        removeAnnotation(annotation);
    }

    const handleEditClick = (ev: React.MouseEvent, annotation: Annotation) => {
        ev.preventDefault();

        form.setFieldsValue({ title: annotation.title, description: annotation.description });
        updateControlStatus('edit' + annotation.id);
    }

    const handleListClick = (ev: React.MouseEvent, annotation: Annotation) => {
        ev.preventDefault();
        selectAnnotationControl(annotation);
    }

    return (
        <div style={{
            border: '1px dark solid',
            position: "absolute",
            textAlign: 'center',
            width: "250px",
            top: "10%",
            right: "5%",
            zIndex: 100,
            background: '#6e7377'
        }}>
            <p style={{color: 'white'}}>Select the type of annotation</p>
            <Select
                defaultValue="Point"
                style={{ width: 120, marginRight: 10}}
                onChange={updateAnnotationType}
                options={[
                    { value: 'point', label: 'Point' },
                    { value: 'area', label: 'Area' },
                    { value: 'group', label: 'group', disabled: true },
                ]}
            />
            {
                controlStatus !== 'normal'?
                    <Button type="primary" shape="circle" icon={<PlusOutlined />} disabled></Button> :
                    <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={handleAddClick}></Button>
            }
            <div style={{marginTop: '10px', height: '450px', overflow: 'auto'}}>
                {
                    controlStatus === 'annotation' ?
                        <p style={{color: 'red'}}>Please select annotation</p> : ''
                }
                {
                    controlStatus === 'add' ?
                        <Form
                            layout="vertical"
                            name="nest-messages"
                            onFinish={handleSaveClick}
                            style={{ maxWidth: 600, padding: 10, background: '#4b4f52', margin: 5, borderRadius: 5 }}
                            validateMessages={validateMessages}
                        >
                            <Form.Item name="title" rules={[{ required: true }]} style={{marginBottom: 5}}>
                                <Input placeholder="title" />
                            </Form.Item>
                            <Form.Item name="description" rules={[{ required: true }]} style={{marginBottom: 5}}>
                                <Input.TextArea placeholder="description" />
                            </Form.Item>
                            <Form.Item style={{marginBottom: 0}}>
                                <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                    Save
                                </Button>
                                <Button htmlType="button" onClick={(ev: React.MouseEvent) => {handleCancelClick(ev, 'add')}}>
                                    Cancel
                                </Button>
                            </Form.Item>
                        </Form> : ''
                }
                {
                    annotations.map(a => {
                        if (controlStatus === ('edit' + a.id)) {
                            return (
                                <Form
                                    layout="vertical"
                                    name="nest-messages"
                                    onFinish={(values: any) => {handleChangeClick(values, a)}}
                                    style={{ maxWidth: 600, padding: 10, background: '#4b4f52', margin: 5, borderRadius: 5 }}
                                    validateMessages={validateMessages}
                                    form={form}
                                >
                                    <Form.Item name="title" rules={[{ required: true }]} style={{marginBottom: 5}}>
                                        <Input placeholder="title" />
                                    </Form.Item>
                                    <Form.Item name="description" rules={[{ required: true }]} style={{marginBottom: 5}}>
                                        <Input.TextArea placeholder="description" />
                                    </Form.Item>
                                    <Form.Item style={{marginBottom: 0}}>
                                        <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                            Save
                                        </Button>
                                        <Button htmlType="button" onClick={(ev: React.MouseEvent) => {handleCancelClick(ev, 'change')}}>
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )
                        } else {
                            return (
                                <Card className="annotation-list" style={{background: '#afafaf', margin: 5, textAlign: 'left'}} onClick={(ev: React.MouseEvent) => {handleListClick(ev, a)}}>
                                    <CardContent style={{padding: '5px 15px 0px 15px'}}>
                                        <Typography gutterBottom variant="h5" component="h5" style={{marginBottom: '0px', fontSize: '15px'}}>
                                            {a.title}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" component="p" style={{marginBottom: '0px', fontSize: '12px'}}>
                                            {a.description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions disableSpacing style={{textAlign: "right", padding: '3px', display: 'block'}}>
                                        <Button icon={<EditFilled />} onClick={(ev: React.MouseEvent) => {handleEditClick(ev, a)}} />
                                        <Button icon={<DeleteFilled />} onClick={(ev: React.MouseEvent) => {handleDeleteClick(ev, a)}} />
                                    </CardActions>
                                </Card>
                            )
                        }
                    })
                }
            </div>
        </div>
    );
}
