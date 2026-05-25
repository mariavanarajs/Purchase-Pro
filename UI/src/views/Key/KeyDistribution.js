
import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody } from "reactstrap";
import { Modal } from "react-bootstrap";
import { ArrowDownLeft, ArrowLeft, Check, ChevronDown, ChevronUp, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import KeyDistributionList from "./KeyDistributionList";
import { RefreshBlock1 } from "../common/RefreshBlock1";

const KeyDistribution = () => {

    let { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            keyDetailsId: validation.required({ message: "Please Select Key", isObject: true }),
            receiverId: validation.required({ message: "Please Select Receiver Name", isObject: true })
        }),
        onSubmit() { },
    });

    const addKeyCollectionDetails = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;

        const postdata = {
            keyCollectionDetailsId: 0,
            keyDetailsId: formData.keyDetailsId.value,
            receiverId: formData.receiverId.value,
            giverId: formData.giverId ? formData.giverId.value : null,
            userInfoId: UserDetails.USERID
        };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addKeyCollectionDetails", postdata)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    confirmDialog({
                        title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                    })
                    form.resetForm()
                    getKeyCollectionDetails()
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

    const [landingData, setLandingData] = useState([]);

    const getKeyCollectionDetails = () => {
        console.log(apiBaseUrl + `GatePro/Master/getKeyCollectionDetails/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getKeyCollectionDetails/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setLandingData(data.results)
                }
                else if (data.success == false) {
                    // errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        getKeyCollectionDetails()
    }, [])

    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Key Distribution</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getDefinitionsList/4`}
                                    label={"Key Name"}
                                    form={form}
                                    id="keyDetailsId"
                                />
                            </FormGroup>
                        </Col>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={`${apiBaseUrl}GatePro/Master/getEmployeeDetails/${UserDetails.USERID}`}
                                    label={"Key Collector"}
                                    form={form}
                                    id="receiverId"
                                />
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className='mt-2'>
                                <Button color="primary" type="button" onClick={addKeyCollectionDetails}>
                                    <Check size={16} /> Save
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != '' ? <KeyDistributionList data={landingData} setData={setLandingData} getKeyCollectionDetails={getKeyCollectionDetails}/> : null}

            {landingData == '' ? <div style={{ marginBottom: "280px" }}></div> : null}
        </Fragment >
    );
};

export default KeyDistribution;
