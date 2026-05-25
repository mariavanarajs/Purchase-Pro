import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, validation, Yup } from "../forms/custom-form";
import { apiBaseUrl } from "../../urlConstants";
import { Row, Col, Button, Label, FormGroup, Input, Card, CardHeader, CardBody, InputGroup } from "reactstrap";
import { Modal } from "react-bootstrap";
import { Check, ChevronDown, ChevronUp, Search, StopCircle, X } from "react-feather";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { useEffect } from "react";
import { RefreshBlock1 } from "../common/RefreshBlock1";
import moment from "moment";

const FoodBill = () => {

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    let { showLoader, hideLoader } = useLoader();

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [totalDays, setTotalDays] = useState('')
    const [poNo, setPoNo] = useState('');
    const [poDetails, setPoDetails] = useState('');

    const getPoDetails = (type) => {
        showLoader();
        const poNumber = { poNumber: poNo, moduleTypeId: 12 }
        apiPostMethod(apiBaseUrl + `GatePro/Master/getPoDetails`, poNumber)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setPoDetails(data.data[0])
                } else {
                    // errorToast(data.message)
                    setPoDetails('show')
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

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({
            workNatureId: validation.required({ message: "Please Select Nature Of Work", isObject: true }),
            prefferedShiftId: validation.required({ message: "Please Select Preffered Shift", isObject: true }),
            masterPlantId: validation.required({ message: "Please Select Location Name", isObject: true }),
            supervisorId: validation.required({ message: "Please Select Supervisor Name", isObject: true }),
            contractorName: validation.required({ message: "Please Enter Contractor Name", isObject: false }),
            noOfPerson: validation.required({ message: "Please Enter No Of Persons", isObject: false })
        }),
        onSubmit() { },
    });

    function days_between(date1, date2) {

        setStartDate(date1)
        setEndDate(date2)

        const startDate = new Date(moment(date1).format('YYYY-MM-DD'));
        const endDate = new Date(moment(date2).format('YYYY-MM-DD'));

        const ONE_DAY = 1000 * 60 * 60 * 24;
        const differenceMs = Math.abs(startDate.getTime() - endDate.getTime());
        let totalDays = Math.round(differenceMs / ONE_DAY);
        setTotalDays(totalDays);
    }

    const addWorkPermit = () => {


        let formData = form.values;
        const postdata = {
            vendorId:formData.hotelName.value,
            employeeId:employeeId,
            shiftId:shiftId,
            shiftTime:shiftTime,
            outTime:formData.outTime,
            inTime:inTime,
            amount:amount,
            remark: formData?.remarks,
            userInfoId: UserDetails.USERID,
            plantCode:plantCode,
            billDate:poDetailsData.postingDate || currentDate,
        };

            showLoader();
            console.log(apiBaseUrl + "FoodTeaTokenController/foodBillPosting", postdata);
            apiPostMethod(apiBaseUrl + "FoodTeaTokenController/foodBillPosting", postdata)
                .then((response) => {
                    const data = response.data;
                    if (data.success == true) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#51A351`
                        }).then(() => {
                            window.location.reload();
                        });
                        
                    }
                    else if (data.success == false) {
                        confirmDialog({
                            title: `<h5><strong class="text-white">` + data.message + `</strong></h5>`, cancelButton: false, confirmText: false, confirmButton: false, background: `#f50e0a`
                        })
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
    const [poDetailsData, setPoDetailsData] = useState({
        postingDate: '',
        invoiceDate: ''
      });
    const [department, setDepartment] = useState('');
    const [shiftTime, setShiftTime] = useState('');
    const [inTime, setInTime] = useState('');
    const [amount, setAmount] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [shiftId, setShiftId] = useState('');
    const [plantCode, setPlantCode] = useState('');

    const handleInputChange1 = (value, field) => {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
      
        const minDate = threeDaysAgo.toISOString().split("T")[0];
        const maxDate = today.toISOString().split("T")[0];
      
        // Clamp date within range
        if (value < minDate) value = minDate;
        if (value > maxDate) value = maxDate;
      
        setPoDetailsData(prev => ({
          ...prev,
          [field === 'posting' ? 'postingDate' : 'invoiceDate']: value
        }));
      };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const handleEmployeeNameChange = async (employeename) => {
        const postData = { employeename: employeename };
        // console.log(employeeId.value)
        try {
          const response = await apiPostMethod(`${apiBaseUrl}CourierMaster/getEmployeeDetails`, postData);
          const { data } = response;
      
          if (data?.length > 0) {
            setDepartment(data[0].emp_department);  // ✅ Set department state
            setEmployeeId(data[0].emp_id)
            setPlantCode(data[0].plant_code)
          } else {
            setDepartment(''); // optional fallback
          }
        } catch (error) {
          console.error("Error fetching employee details:", error);
          errorToast("Failed to fetch employee department");
        }
      };
      const handleShiftChange = (selectedShift) => {
        setShiftTime(selectedShift.shiftInTime)
        setAmount(selectedShift.amount)
        setShiftId(selectedShift.value)
        setInTime(selectedShift.shiftInTime)
      };
    return (
        <Fragment>
            <Card>
                <CardHeader><h5>Food Bill Token</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                            <Col md="4" sm="4">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={poDetailsData.postingDate || new Date().toISOString().split("T")[0]}
                                    min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                    max={new Date().toISOString().split("T")[0]}
                                    onChange={(e) => handleInputChange1(e.target.value, 'posting')}
                                    onKeyDown={handleKeyDown}
                                />
                            </Col>

                            <Col md="4" sm="4">
                                <FormGroup>
                                <CustomDropdownInput
                                        url={apiBaseUrl + `FoodTeaTokenController/getVendor/${'FOOD'}`} 
                                        label={"Hotel Name"}
                                        form={form}
                                        id="hotelName"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <CustomDropdownInput
                                        url={`${apiBaseUrl}FoodTeaTokenController/GetEmployeeName/${UserDetails.plantids}`}
                                        label={"Employee Name"}
                                        form={form}
                                        id="empname"
                                        name="empname"
                                        value={form.values.empname}
                                        onChange={(employeename) => {
                                        handleEmployeeNameChange(employeename);
                                        }}
                                />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Department"} type="text" form={form} id="department" value={department} disabled/>
                                </FormGroup>
                            </Col>
                            <Col sm="4" md="4">
                            <FormGroup>
                                <CustomDropdownInput
                                    url={apiBaseUrl +"FoodTeaTokenController/getShift"}
                                    label={"Shift"}
                                    form={form}
                                    id="shiftId"
                                    value={form.values.shiftId}
                                    onChange={(selectedShift) => handleShiftChange(selectedShift)}
                                />
                            </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Shift Time"} type="text" form={form} id="shiftTime" value={shiftTime} disabled/>
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <Label for="inTime">In Time</Label>
                                <Input type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} />
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput 
                                    label={"Out Time"} 
                                    type="time" 
                                    form={form} 
                                    id="outTime"
                                    />
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Amount"} type="text" form={form} id="amount" value={amount} disabled/>
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Issued By"} type="text" form={form} value={UserDetails.username} id="amount" disabled/>
                                </FormGroup>
                            </Col>
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <CustomTextInput label={"Remarks"} type="text" form={form} id="remarks" />
                                </FormGroup>
                            </Col>

                            <Col sm="12" md="12">
                                <FormGroup className="d-flex justify-content-end">
                                    <Button.Ripple color="primary" type="button" onClick={addWorkPermit}>
                                        <Check size={16} /> Submit
                                    </Button.Ripple>
                                </FormGroup>
                            </Col>
                     
                    </Row>
                </CardBody>
            </Card>
            <div style={{ marginBottom: "250px" }}></div>
        </Fragment >
    );
};

export default FoodBill;
