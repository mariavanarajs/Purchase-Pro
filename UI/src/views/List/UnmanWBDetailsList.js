import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input, Badge } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { Delete, Edit, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import { apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Select from 'react-select'
import { set } from "lodash";

export const taColumns = [

    {
        name: "System No",
        selector: "systemNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "Weighbridge Name",
        selector: "weighbridgeName",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "User ID",
        selector: "userId",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Printer Name",
        selector: "printerName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Port Name",
        selector: "portName",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Plant Code",
        selector: "plantCode",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "Status",
        selector: "status",
        sortable: true,
        minWidth: "120px",
        cell: (row) => {
            return (
                    <FormGroup className="d-flex justify-content-center mb-0">
                        {row.status == 1 &&
                        <Badge color="success" pill>
                           Active
                        </Badge>}
                        {row.status == 0 &&
                        <Badge color="danger" pill>
                           Deactivate
                        </Badge>}
                    </FormGroup>
            );
        },
    },
];

const UnmanWBDetailsList = ({ actionRendorer, getCameraDetails, allData }) => {

    const actionsCol = {
        name: "Actions",
        selector: "status",
        minWidth: "90px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateCameraDetails(row.systemNo, row.printerName, row.portName, row.plantCode, row.status,row.id,row.weighbridgeName,row.userId)}><Edit size={16} /> Edit</Button.Ripple>&nbsp;
                    
                </Row>
            );
        },
    };

    const { showLoader, hideLoader } = useLoader('');
    const [data, setData] = useState();
    const [systemNo, setSystemNo] = useState('');
    const [printerName, setPrinterName] = useState();
    const [portName, setPortName] = useState('');
    const [plantCode, setPlantCode] = useState('');
    const [status, setStatus] = useState('');
    const [ID, setID] = useState('');
    const [weighbridgeName, setWeighbridgeName] = useState('');
    const [userId, setUserId] = useState('');
    const [isActive, setisActive] = useState('');
    const [plant, setPlant] = useState('');
    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const [deleteCamera, setDeleteCamera] = useState(false);
    const closeCameraDetails = () => setDeleteCamera(false);

    const selectPlant = (e) => {
        console.log(e.ID);
        setPlant([e])
        const plantId = e.ID;

        console.log(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/${plantId}`);
        apiPostMethod(apiBaseUrl + `GatePro/Master/getCameraDetailsPlantId/${plantId}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const onSubmit = () => {
        showLoader();

        const postData = {
           
            userInfoId: UserDetails.USERID,
            id:ID,
            systemNo: systemNo,
            printerName: printerName,
            portName: portName,
            plantCode: plantCode,
            weighbridgeName: weighbridgeName,
            userId: userId,
            status: status,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "AutoMailMaster/updateUnmanWBMaster", postData)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setShow(false);
                    ShowToast(data.message);
                    setDeleteCamera(false)
                    getCameraDetails()
                } else if (data.success == 0) {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }

    const updateCameraDetails = (systemNo, printerName, portName, plantCode, status,id,weighbridgeName,userId) => {
        setSystemNo(systemNo);
        setPrinterName(printerName)
        setPortName(portName)
        setPlantCode(plantCode)
        setStatus(status)
        setID(id)
        setWeighbridgeName(weighbridgeName)
        setUserId(userId)
        setShow(true)
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            driverPhoneNo: ""
        }),
    });

    const columns = [...taColumns, actionsCol];   

    // const deleteCameraDetails = (cctvCameraId, masterPlantId, cameraName, url, username, password, isPrint, isActive) => {
    //     setisActive(isActive)
    //     setDeleteCamera(true)
    //     setcameraName(cameraName);
    //     setUrl(url)
    //     setUsername(username)
    //     setPassword(password)
    //     setIsPrint(isPrint)
    //     setcctvCameraId(cctvCameraId)
    //     setmasterPlantId(masterPlantId)
    // };


    const options = [
        { value: 1, label: 'Yes' },
        { value: 0, label: 'No' }
    ];

    const statusValue = [
        { value: status, label: status == 1 ? 'Yes' : 'No' }
    ];

    return (
        <div>
            <Card>
                <CardHeader><h5>Unman WB Master Details</h5></CardHeader>
                <hr></hr>
                <CardBody>
                    <Modal show={show} centered size = 'lg'>
                        <Modal.Header>
                            <Row>
                                <Col md="12" sm="12">
                                    <FormGroup style={{ width: 460 }}>
                                        <Modal.Title>Update Unman WB Details <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>System No</Label>
                                        <Input placeholder="Url" type="text" value={systemNo} onChange={(e) => setSystemNo(e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>Weighbridge Name</Label>
                                        <Input placeholder="Url" type="text" value={weighbridgeName} onChange={(e) => setWeighbridgeName(e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>User Id</Label>
                                        <Input placeholder="Url" type="text" value={systemNo} onChange={(e) => setUserId(e.target.value)} />
                                    </FormGroup>
                                </Col>
                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>Port Name</Label>
                                        <Input placeholder="Url" type="text" value={portName} onChange={(e) => setPortName(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                <FormGroup>
                                        <Label>Printer Name</Label>
                                        <Input placeholder="Url" type="textarea" value={printerName} onChange={(e) => setPrinterName(e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="6" sm="6">
                                    <FormGroup>
                                        <Label>Plant Code</Label>
                                        <Input placeholder="Url" type="textarea" value={plantCode} onChange={(e) => setPlantCode(e.target.value)} />
                                    </FormGroup>
                                </Col>
                               
                                <Col md="6" sm="6">
                                    <Label>Is Active</Label>
                                    <Select
                                        value={statusValue}
                                        options={options}
                                        onChange={(e) => setStatus(e.value)}
                                    />
                                </Col>

                                <Col md="2" sm="2" >
                                    <label>&nbsp;</label>
                                    <FormGroup>
                                        <Button color="primary" type="button" onClick={onSubmit}>
                                            Update
                                        </Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>

                    <Modal show={deleteCamera} centered size="sm">
                        <Modal.Body>
                            <Row>
                                <Col md="12" sm="12"><X onClick={closeCameraDetails} style={{ float: "right" }} /></Col>
                                {isActive == 1 ?
                                    <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>Are you sure you want to In Active</h5></Label></Col> :
                                    <Col md="12" sm="12"><Label className="d-flex justify-content-center mb-0"><h5>Are you sure you want to Active</h5></Label></Col>
                                }

                                <Col md="4" sm="4"></Col>
                                <Col md="4" sm="4">
                                    <FormGroup>
                                        {isActive == 1 ?
                                            <Button.Ripple color="warning" type="button" onClick={onSubmit}>
                                                In Active
                                            </Button.Ripple> :
                                            <Button.Ripple color="success" type="button" onClick={onSubmit}>
                                                Active
                                            </Button.Ripple>
                                        }
                                    </FormGroup>

                                </Col>
                            </Row>
                        </Modal.Body>
                    </Modal>

                    <TableComponent columns={columns} data={plant ? data : allData} />

                </CardBody>
            </Card>
        </div>
    );
};

export default UnmanWBDetailsList;
