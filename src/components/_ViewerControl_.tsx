import React from 'react';

import { Annotation } from "@external-lib";

import { Select, Button, Form, Input, Table, Typography, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
    required: '${label} is required!',
};

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: any;
    inputType: 'textarea' | 'string';
    record: Annotation;
    index: number;
    children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                       editing,
                                                       dataIndex,
                                                       title,
                                                       inputType,
                                                       record,
                                                       index,
                                                       children,
                                                       ...restProps
                                                   }) => {
    const inputNode = inputType === 'textarea' ? <Input.TextArea /> : <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[
                        {
                            required: true,
                            message: `Please Input ${title}!`,
                        },
                    ]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

// rowSelection object indicates the need for row selection
const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: Annotation[]) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: Annotation) => ({
        disabled: record.description === 'Disabled User', // Column configuration not to be checked
        description: record.description,
    }),
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
    removeAnnotation: (id: number) => void;

    /**
     * Called when annotation is updated.
     * @param id AnnotationBuffer id String
     * @param a AnnotationBuffer Interface
     */
    updateAnnotation: (id: number, a: Annotation) => void;

    /**
     * Called when current control view status is changed.
     * @param s String
     */
    updateControlStatus: (s: string) => void;

    /**
     * Called when annotation list is clicked.
     * @param id number
     */
    selectAnnotationId: (id: number) => void;

    /**
     * The list of annotations buffers for the given model.
     */
    annotations: Annotation[];

    /**
     * current control view status
     */
    controlStatus: string;
}

export function _ViewerControl_({
    updateAnnotationType,
    insertAnnotation,
    updateAnnotation,
    removeAnnotation,
    selectAnnotationId,
    updateControlStatus,
    annotations,
    controlStatus
}: AnnotationControllerProps) {
    const [editingKey, setEditingKey] = React.useState(0);
    const [form] = Form.useForm();

    const isEditing = (record: Annotation) => record.id === editingKey;

    const handleEditClick = (record: Partial<Annotation> & { id: React.Key }) => {
        form.setFieldsValue({ description: '', ...record });
        setEditingKey(record.id);
    };

    const cancel = () => {
        setEditingKey(0);
    };

    const handleUpdateClick = async (id: React.Key) => {
        try {
            const row = (await form.validateFields()) as Annotation;

            const newData = [...annotations];
            const index = newData.findIndex((item) => id === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                // setData(newData);
                setEditingKey(0);
            } else {
                newData.push(row);
                // setData(newData);
                setEditingKey(0);
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: 'description',
            dataIndex: 'description',
            width: '95%',
            editable: true,
        },
        {
            title: 'action',
            dataIndex: 'action',
            render: (_: any, record: Annotation) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Typography.Link onClick={() => handleUpdateClick(record.id)} style={{ marginRight: 8 }}>
                          Save
                        </Typography.Link>
                        <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                          <a>Cancel</a>
                        </Popconfirm>
                      </span>
                ) : (
                    <Typography.Link disabled={editingKey !== 0} onClick={() => handleEditClick(record)}>
                        Edit
                    </Typography.Link>
                );
            },
        },
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: Annotation) => ({
                record,
                inputType: 'textarea',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    // const [title, setTitle] = React.useState('' as string);
    // const [description, setDescription] = React.useState('' as string);
    //
    // React.useEffect(() => {
    //     if (controlStatus === 'normal') {
    //         setTitle('');
    //         setDescription('');
    //     }
    // }, [controlStatus]);

    const handleCancelClick = (ev: React.MouseEvent, key: string) => {
        ev.preventDefault();

        if (key === 'add') {
            removeAnnotation(0);
        }

        updateControlStatus("normal");
    }

    const handleAddClick = (ev: React.MouseEvent) => {
        ev.preventDefault();

        updateControlStatus("annotation");
    }

    const saveSubmit = (values: any) => {
        insertAnnotation('', values.description);
    }

    // const handleChangeClick = (ev: React.MouseEvent, id: number) => {
    //     ev.preventDefault();
    //
    //     if (!title) {
    //         alert('Please input the title!');
    //         return;
    //     } else if (!description) {
    //         alert('Please input the description!');
    //         return;
    //     }
    //
    //     const a = annotations.filter(a => a.id === id);
    //     let _a = a[0];
    //     _a.title = title;
    //     _a.description = description;
    //
    //     updateAnnotation(id, _a);
    // }
    //
    // const handleDeleteClick = (ev: React.MouseEvent, id: number) => {
    //     ev.preventDefault();
    //
    //     removeAnnotation(id);
    // }
    //
    // const handleEditClick = (ev: React.MouseEvent, id: number) => {
    //     ev.preventDefault();
    //
    //     const a = annotations.filter(a => a.id === id);
    //     setTitle(a[0].title);
    //     setDescription(a[0].description);
    //     updateControlStatus('edit' + id);
    // }

    // const handleTitleChange = (ev: React.ChangeEvent) => {
    //     ev.preventDefault();
    //     setTitle(((ev.target) as any).value);
    // }
    //
    // const handleDescriptionChange = (ev: React.ChangeEvent) => {
    //     ev.preventDefault();
    //     setDescription(((ev.target) as any).value);
    // }
    //
    // const handleListClick = (ev: React.MouseEvent, id: number) => {
    //     ev.preventDefault();
    //     selectAnnotationId(id);
    // }

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
            {
                controlStatus === 'annotation' ?
                    <p style={{color: 'red'}}>Select the type of annotation</p> : ''
            }
            {
                controlStatus === 'add' ?
                    <Form
                        layout="vertical"
                        name="nest-messages"
                        onFinish={saveSubmit}
                        style={{ maxWidth: 600, padding: 10 }}
                        validateMessages={validateMessages}
                    >
                        <Form.Item name="description" rules={[{ required: true }]} style={{marginBottom: 10}}>
                            <Input.TextArea placeholder="description" />
                        </Form.Item>
                        <Form.Item style={{marginBottom: 10}}>
                            <Button type="primary" htmlType="submit" style={{marginRight: 5}}>
                                Save
                            </Button>
                            <Button htmlType="button" onClick={(ev: React.MouseEvent) => {handleCancelClick(ev, 'add')}}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </Form> : ''
            }
            <Table
                components={{
                    body: {
                        cell: EditableCell,
                    },
                }}
                bordered
                dataSource={annotations}
                columns={mergedColumns}
                rowClassName="editable-row"
                pagination={{
                    onChange: cancel,
                }}
                style={{padding: 5}}
            />
        </div>
    );
}
