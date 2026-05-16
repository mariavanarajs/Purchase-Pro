import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label, Input } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Check, Key, X } from "react-feather";
import { useFormik } from "formik";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, Yup, validation } from "../forms/custom-form";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiBaseUrl } from "../../urlConstants";
import { apiPostMethod } from "../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import TableComponent from "../common/TableComponent";
import confirmDialog from "../../@core/components/confirm/confirmDialog";

export const taColumns = [
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "200px",
    },
    // {
    //     name: "PLANT",
    //     selector: "plantName",
    //     sortable: true,
    //     minWidth: "190px",
    //     cell: (row) => {
    //         return <Col sm="12" md="12">
    //             <br></br>
    //             <FormGroup className="d-flex justify-content-start mb-0">
    //                 <p className="fs-6">{row.plantName} - {row.werks} </p>
    //             </FormGroup>
    //         </Col>
    //     },
    // },
    {
        name: "KEY NAME",
        selector: "keyName",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "KEY COLLECTOR",
        selector: "receiverName",
        sortable: true,
        minWidth: "250px",
    }
];

const KeyDistributionList = ({ actionRendorer, data, setData, getKeyCollectionDetails }) => {

    let { showLoader, hideLoader } = useLoader();
    const [show, setShow] = useState(false);
    const [keyDetailsData, setKeyDetailsData] = useState([]);
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            giverId: validation.required({ message: "Please Select Giver Name", isObject: true }),
        }),
        onSubmit() { },
    });

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "100px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button color="primary" size="sm" type="button" onClick={() => onActionClick(row)}> Collect</Button>
                </Row>
            );
        },
    };

    const onActionClick = (row) => {
        setShow(true)
        setKeyDetailsData(row)
    };

    const addKeyCollectionDetails = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            keyCollectionDetailsId: keyDetailsData.keyCollectionDetailsId,
            giverId: formData.giverId.value,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setShow(false)
                    setData([])
                    getKeyCollectionDetails()
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                hideLoader();
            });
    }


    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>Key Distribution List</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal show={show} centered size="sm">
                <Row>
                    <Col md="12" sm="12">
                        <FormGroup>
                            <ModalHeader><h5>Key Collection</h5><X onClick={() => setShow(false)} /></ModalHeader>
                        </FormGroup>
                    </Col>
                </Row>
                <ModalBody>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Va Number</Label>
                                <Input placeholder="Key Name" value={keyDetailsData.vaNumber} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Key Name</Label>
                                <Input placeholder="Key Name" value={keyDetailsData.keyName} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="12" sm="12">
                            <FormGroup>
                                <Label>Key Collector</Label>
                                <Input placeholder="Receiver Name" value={keyDetailsData.receiverName} disabled />
                            </FormGroup>
                        </Col>
                        <Col sm="12" md="12">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                    label={"Submitted By"}
                                    form={form}
                                    id="giverId"
                                />
                            </FormGroup>
                        </Col>

                        <Col sm="12" md="12">
                            <FormGroup className="d-flex justify-content-center">
                                <Button color="primary" type="button" onClick={addKeyCollectionDetails}>
                                    <Check size={16} /> Save
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </>
    );
};

export default KeyDistributionList;

