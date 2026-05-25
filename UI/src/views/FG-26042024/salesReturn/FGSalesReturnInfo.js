import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Input, InputGroup, Label, Row } from 'reactstrap'
import { CustomDropdownInput, CustomTextInput, Yup, validation } from '../../forms/custom-form'
import { apiBaseUrl } from '../../../urlConstants'
import { ArrowLeft, Check, Plus, Search } from 'react-feather'
import { useState } from 'react'
import { ShowToast, errorToast } from '../../../helper/appHelper'
import { useLoader } from '../../../utility/hooks/useLoader'
import { apiPostMethod, apiGetMethod } from '../../../helper/axiosHelper'
import { useFormik } from 'formik'
import { useSelector } from 'react-redux'
import confirmDialog from '../../../@core/components/confirm/confirmDialog'

const FGSalesReturnInfo = () => {

    const [isDisable, setIsDisable] = useState(false);

    let { showLoader, hideLoader } = useLoader();
    const [data, setData] = useState("")
    const [quantityDetails, setQuantityDetails] = useState([])
    const [invoiceValue, setInvoiceValue] = useState('')

    const [moduleTypeId, setModuleTypeId] = useState('')

    const SelectInvoice = (e) => {
        console.log(e.target.value);
        setInvoiceValue(e.target.value)
    }

    const getInvoiceDetails = (type) => {

        const postdata = { invoiceNo: invoiceValue, userInfoId: UserDetails.USERID };

        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/getInvoiceDetails", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Master/getInvoiceDetails", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    setData(res.data[0])
                    setQuantityDetails(res.data[0].LINE_ITEM)
                    setIsDisable(true)
                    setModuleTypeId(res.moduleTypeId)
                    setQuantityDetailsData([])
                }
                else if (res.success == false) {
                    errorToast(res.message)
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            driverMobileNumber: validation.number({ min: 10, max: 10 }),
            vehicleNo: validation.required({ message: "Please Enter Vehicle No", isObject: false }),
            returnReasonId: validation.required({ message: "Please Select Return Reason", isObject: true }),
            returnRefNo: validation.required({ message: "Please Enter Return Ref No", isObject: false }),
        }),
        addFgSalesReturnInfo() { },
    });

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const [quantityDetailsData, setQuantityDetailsData] = useState([])

    const addQuantityDetails = (quantityList, returnQuantity) => {

        if (quantityDetailsData.length == 0) {
            const obj = {
                material: quantityList.MATERIAL,
                description: quantityList.DESCRIPTION,
                quantity: quantityList.QUANTITY,
                returnQuantity: returnQuantity,
                totalReturnQuantity: quantityList.QUANTITY - returnQuantity,
                line: quantityList.LINE,
                invoiceNo: invoiceValue,
                masterPlantId: data.PLANT,
                customerNumber: data.CUSTOMER_NUMBER,
                customerName: data.CUSTOMER_NAME,
                billingDate: data.BILLING_DATE
            };

            quantityDetailsData.push(obj);

            quantityList.TOTALVALUE = quantityList.QUANTITY - returnQuantity
            if (quantityList.TOTALVALUE < 0) {
                quantityList.Color = { color: "#BD362F" }
            } else {
                quantityList.Color = {}
            }
            let details = []
            let color = []
            quantityDetails.map(quantityList => details.push(quantityList))
            quantityDetails.map(quantityList => color.push(quantityList))
            setQuantityDetails(details)
        }
        else {
            let selectedItem;
            quantityDetailsData.forEach((item, index) => {
                if (item['line'] == quantityList.LINE) {
                    selectedItem = item
                }
            });
            if (selectedItem != undefined) {
                selectedItem['returnQuantity'] = returnQuantity
                selectedItem['totalReturnQuantity'] = selectedItem['quantity'] - returnQuantity

                quantityList.TOTALVALUE = quantityList.QUANTITY - returnQuantity
                if (quantityList.TOTALVALUE < 0) {
                    quantityList.Color = { color: "#BD362F" }
                } else {
                    quantityList.Color = {}
                }
                let details = []
                let color = []
                quantityDetails.map(quantityList => details.push(quantityList))
                quantityDetails.map(quantityList => color.push(quantityList))
                setQuantityDetails(details)
            } else {
                var obj
                obj = {
                    material: quantityList.MATERIAL,
                    description: quantityList.DESCRIPTION,
                    quantity: quantityList.QUANTITY,
                    returnQuantity: returnQuantity,
                    totalReturnQuantity: quantityList.QUANTITY - returnQuantity,
                    line: quantityList.LINE,
                    invoiceNo: invoiceValue,
                    masterplantId: data.PLANT,
                    customerNumber: data.CUSTOMER_NUMBER,
                    customerName: data.CUSTOMER_NAME,
                    billingDate: data.BILLING_DATE
                };

                quantityDetailsData.push(obj);

                quantityList.TOTALVALUE = quantityList.QUANTITY - returnQuantity
                if (quantityList.TOTALVALUE < 0) {
                    quantityList.Color = { color: "#BD362F" }
                } else {
                    quantityList.Color = {}
                }
                let details = []
                let color = []
                quantityDetails.map(quantityList => details.push(quantityList))
                quantityDetails.map(quantityList => color.push(quantityList))
                setQuantityDetails(details)
            }
        }
    }

    const quality = quantityDetailsData.map((quantityDetailsData) => quantityDetailsData.totalReturnQuantity);
    const returnQuality = quality.filter((quality) => quality < 0);
    // const checkQuantityDetails = quantityList.filter((quantityList) => quantityList.returnQuantity != "" && quantityList.returnQuantity != 0);

    const reset = () => {
        setData("")
        setInvoiceValue("")
        setQuantityDetails([])
        setQuantityDetailsData([])
    }

    const [quantityList, setQuantityList] = useState([])

    const add = () => {

        const quantityDetails = quantityDetailsData.filter((data) => data.returnQuantity != '' && data.returnQuantity != 0);
        const plant = UserDetails.plantids.filter((userPlant) => userPlant == data.PLANT);

        console.log(quantityDetails);

        if (plant == '') {
            confirmDialog({
                title: `<h5><strong class="text-white">Plant not assigned for user, please assign</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
            })
        }
        else if (returnQuality != '') {
            errorToast('Please Check Return Quantity')
        }
        else {
            if (quantityList.length == 0) {
                if (quantityDetails == '') {
                    confirmDialog({
                        title: `<h5><strong class="text-white">Please Enter Return Quantity</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                } else {
                    reset()
                    setQuantityList(quantityList.concat(quantityDetails))
                }
            } else {
                const checkInvoiceNo = quantityList.filter((quantityList) => quantityList.invoiceNo == invoiceValue);
                if (checkInvoiceNo != '') {
                    reset()
                    confirmDialog({
                        title: `<h5><strong class="text-white">Invoice Details Already Added</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
                else if (quantityList[0].masterPlantId != data.PLANT) {
                    reset()
                    confirmDialog({
                        title: `<h5><strong class="text-white">Plant Not Matched</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#BD362F`
                    })
                }
                else {
                    reset()
                    setQuantityList(quantityList.concat(quantityDetails))
                }
            }
        }
    }

    const addFgSalesReturnInfo = () => {
        if (!form.isValid) {
            form.setSubmitting(true);
            form.validateForm();
            return;
        }
        let formData = form.values;
        const postdata = {
            moduleTypeId: moduleTypeId,
            returnRefNo: formData.returnRefNo,
            vehicleNo: formData.vehicleNo,
            masterPlantId: quantityList[0].masterPlantId,
            driverMobileNumber: formData.driverMobileNumber,
            returnReasonId: formData.returnReasonId.value,
            remarks: formData.remarks ? formData.remarks : null,
            userInfoId: UserDetails.USERID,
            quantityDetails: quantityList

        };
        showLoader();
        console.log(apiBaseUrl + "GatePro/Master/addFgSalesReturnInfo", postdata);
        apiPostMethod(apiBaseUrl + "GatePro/Master/addFgSalesReturnInfo", postdata)
            .then((response) => {
                const res = response.data;
                if (res.success == true) {
                    ShowToast(res.message);
                    cancel()
                }
                else if (res.success == false) {
                    errorToast(res.message)
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

    const cancel = () => {
        setData("")
        setInvoiceValue("")
        form.resetForm()
        setIsDisable(false)
        setQuantityList([])
    }

    return (
        <Card>
            <CardHeader><h5>Return Info</h5></CardHeader>
            <hr></hr>
            <CardBody>
                <Row>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <CustomTextInput label={"Return Ref No"} id="returnRefNo" form={form} />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <CustomDropdownInput
                            url={`${apiBaseUrl}GatePro/Master/getMasterRejectReason`}
                            label={"Return Reason"}
                            form={form}
                            id="returnReasonId"
                        />
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <CustomTextInput label={"Vehicle No"} id="vehicleNo" form={form} maxLength={10} />
                        </FormGroup>
                    </Col>
                    <Col md="4" sm="4">
                        <FormGroup>
                            <CustomTextInput label={"Driver Phone No"} type="number" form={form} id="driverMobileNumber" />
                        </FormGroup>
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <CustomTextInput label={"Remarks"} id="remarks" form={form} />
                        </FormGroup>
                    </Col>

                    <Col md="12" sm="12"><hr></hr></Col>

                    <Col md="12" sm="12">
                        <h4 className="text-primary"><u>Invoice Info</u></h4>
                    </Col>

                    <Col md="4" sm="4">
                        <FormGroup>
                            <Label>Invoice No</Label>
                            <InputGroup>
                                <Input type="text" placeholder="Invoice No" onChange={SelectInvoice} value={invoiceValue} />
                                <Button size="sm" color="success" style={{ height: '38px', width: '50px' }} onClick={() => getInvoiceDetails('list')}>
                                    <Search size={20} />
                                </Button>
                            </InputGroup>
                        </FormGroup>
                    </Col>

                    {data ? <>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Plant</Label>
                                <Input placeholder="Plant" value={data.PLANT} disabled />
                            </FormGroup>
                        </Col>
                        <Col md="4" sm="4">
                            <FormGroup>
                                <Label>CustomerName</Label>
                                <Input placeholder="CustomerName" value={data.CUSTOMER_NAME} disabled />
                            </FormGroup>
                        </Col> </> : null
                    }

                    {quantityDetails.map((quantityList, index) => (
                        <Col md="12" sm="12" key={quantityList.LINE}>
                            <Row>
                                <Col md="3" sm="3">
                                    <FormGroup>
                                        <Label>Material</Label>
                                        <Input placeholder="Material" value={quantityList.MATERIAL} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="3" sm="3" >
                                    <FormGroup>
                                        <Label>Description</Label>
                                        <Input placeholder="Material Description" value={quantityList.DESCRIPTION} disabled />
                                    </FormGroup>
                                </Col>

                                < Col md="2" sm="2" >
                                    <FormGroup>
                                        <Label>Quantity</Label>
                                        <Input placeholder="Qty" value={quantityList.QUANTITY} disabled />
                                    </FormGroup>
                                </Col>

                                <Col md="2" sm="2" >
                                    <FormGroup>
                                        <Label>Return Quantity</Label>
                                        <Input placeholder="Qty" style={quantityList?.Color} onInput={(e) => addQuantityDetails(quantityList, e.target.value)} />
                                    </FormGroup>
                                </Col>

                                <Col md="2" sm="2">
                                    <FormGroup>
                                        <Label>Total</Label>
                                        <Input placeholder="Total Qty" value={quantityList.TOTALVALUE == null ? quantityList.QUANTITY : quantityList.TOTALVALUE} disabled />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Col>
                    ))}

                    {data ? <>
                        <Col sm="12" md="12" className='d-flex justify-content-center mb-0'>
                            <label>&nbsp;</label>
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={add}>
                                    <Plus size={16} /> Add
                                </Button.Ripple>
                            </FormGroup>
                        </Col> </> : null
                    }

                    {quantityList != '' ?
                        <Col md="12" sm="12">
                            <label></label>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <td className="bg-primary text-white"><strong>Invoice No</strong></td>
                                        <td className="bg-primary text-white"><strong>Line</strong></td>
                                        <td className="bg-primary text-white"><strong>Material</strong></td>
                                        <td className="bg-primary text-white"><strong>Description</strong></td>
                                        <td className="bg-primary text-white"><strong>Quantity</strong></td>
                                        <td className="bg-primary text-white"><strong>Return Quantity</strong></td>
                                        <td className="bg-primary text-white"><strong>Total Return Quantity</strong></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quantityList?.map((quantity) => (
                                        <tr key={quantity.totalReturnQuantity}>
                                            <td>{quantity.invoiceNo}</td>
                                            <td>{quantity.line}</td>
                                            <td>{quantity.material}</td>
                                            <td>{quantity.description}</td>
                                            <td>{quantity.quantity}</td>
                                            <td>{quantity.returnQuantity}</td>
                                            <td>{quantity.totalReturnQuantity}</td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </Col> : null
                    }

                    {quantityList != '' ? <>
                        <Col md="10" sm="10">
                            <br />
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <Button.Ripple outline color="primary" type="button" onClick={cancel}>
                                    <ArrowLeft size={16} /> Cancel
                                </Button.Ripple>
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <br />
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <Button.Ripple color="primary" type="button" onClick={addFgSalesReturnInfo}>
                                    <Check size={16} /> Submit
                                </Button.Ripple>
                            </FormGroup>
                        </Col> </> : null
                    }
                </Row>
            </CardBody>
        </Card>
    )
}

export default FGSalesReturnInfo