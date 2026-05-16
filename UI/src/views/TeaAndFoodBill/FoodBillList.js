import { Card, CardHeader, CardTitle, CardBody, Button, Row, Col, FormGroup, Label, Input, Badge } from "reactstrap";
import React, { useState } from "react";
import TableComponent from "../common/TableComponent";
import { useHistory } from "react-router-dom";
import { ArrowDown, Circle, Delete, Edit, Printer, Trash, Trash2, X } from "react-feather";
import { Modal } from "react-bootstrap";
import { CustomDropdownInput, CustomTextInput, CustomTextInputMail, Yup, validation } from "../forms/custom-form";
import { apiGetMethod, apiPostMethod } from "../../helper/axiosHelper";
import { apiBaseUrl } from "../../urlConstants";
import { ShowToast, errorToast } from "../../helper/appHelper";
import { useLoader } from "../../utility/hooks/useLoader";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactSelect from "react-select";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import { DatePicker } from "../forms/custom-datetime";

export const taColumns = [
    
    {
        name: "Token No",
        selector: "uniqueId",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "Employee Code",
        selector: "emp_code",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Employee Name",
        selector: "emp_name",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "Department",
        selector: "emp_department",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "Shift",
        selector: "shiftName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Shift Time",
        selector: "shiftTime",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "In Time",
        selector: "inTime",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Out Time",
        selector: "outTime",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Bill Date",
        selector: "billDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Created Date",
        selector: "createdDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Created Time",
        selector: "createdTime",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Issued By",
        selector: "FIRST_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Amount",
        selector: "amount",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Status",
        selector: "statusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        {row.status == '0' &&
                        <Badge color="danger" pill>
                           {row.statusName}
                        </Badge>
                        }
                        {row.status == '1' &&
                        <Badge color="primary" pill>
                            {row.statusName}
                        </Badge> }
                        {row.status == '2' &&
                        <Badge color="success" pill>
                            {row.statusName}
                        </Badge> }
                    </FormGroup>
                </Col>
            );
        },
    },
];

const FoodBillList = ({ url, actionRendorer, data, getEmployeeDetails }) => {
    const history = useHistory();

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const actionsCol = {
        name: "Actions",
        selector: "",
        minWidth: "250px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    {row.status == 1 && (UserDetails.role == 'Approver' || UserDetails.role == 'Admin') &&
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => updateEmployeeDetails(row)}><Edit size={16} /> Approve</Button.Ripple> }
                    {row.status > 0 &&
                    <Button.Ripple color="primary" size="sm" type="button" className="ml-1" onClick={() => print(row)}>
                    <Printer size={16} className="mr-1" /> Print
                  </Button.Ripple>}
                </Row>
            );
        },
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        
        onSubmit() { },
    });
    const print = (row) => {
            window.open(`/public/#/foodSmartForm/${row.id}`)  
    }
    const [show, setShow] = useState(false);
    const closeRemarksModal = () => setShow(false);
    const { showLoader, hideLoader } = useLoader();
    const columns = [...taColumns, actionsCol];
    


    const updateEmployeeDetails = (row) => {

        setShow(true)

        form.setValues({
            uniqueId: row.uniqueId,
            // vendorId: row.vendorId,
            emp_department: row.emp_department,
            createdDate:row.createdDate,
            billDate:toInputDateFormat(row.billDate),
            emp_name: row.emp_name,
            shiftTime: row.shiftTime,
            outTime: row.outTime,
            inTime:row.inTime,
            amount: row.amount,
            remark: row.remark,
            id:row.id,
            FIRST_NAME:row.FIRST_NAME,
            vendorId: { value: row.vendorId, label: row.Name },
            shiftId: { value: row.shiftId, label: row.shiftName},
            employeeId: { value: row.employeeId, label: row.emp_name + '-' + row.emp_code},
        })
    };

    const onSubmit = (status) => {
        // if (!form.isValid) {
        //     form.setSubmitting(true);
        //     form.validateForm();
        //     return;
        // }
        let formData = form.values;

        const FrmData = {
            userInfoId: UserDetails.USERID,
            shiftTime: formData.shiftTime,
            outTime: formData.outTime,
            inTime:formData.inTime,
            amount: formData.amount,
            remark: formData.remark,
            vendorId: formData.vendorId.value,
            shiftId: formData.shiftId.value,
            employeeId: formData.employeeId.value,
            status:status,
            id:formData.id,
            billDate:formData.billDate
        };
        if(!FrmData.outTime){
            errorToast('Please Select Out time')
            return
        }
        showLoader();
        apiPostMethod(apiBaseUrl + "FoodTeaTokenController/updateFoodBill", FrmData)
            .then((response) => {
                const { data } = response;
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
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(
                hideLoader()
            )
    }

    const handleEmployeeChange = async (selectedEmployee) => {
        if (!selectedEmployee) return;
      
        try {
          const postData = { employeename: selectedEmployee };
          const response = await apiPostMethod(`${apiBaseUrl}CourierMaster/getEmployeeDetails`, postData);
          const { data } = response;
      
          if (data?.length > 0) {
            const employee = data[0];
      
            // Set employee dropdown value
            form.setValues((prev) => ({
                ...prev,
                emp_department:employee.emp_department,
                employeeId: { value: selectedEmployee.value, label: selectedEmployee.label },
            }));
          } 
        } catch (error) {
          console.error("Error fetching employee details:", error);
          errorToast("Failed to fetch employee department");
        }
      };
      const handleShiftChange = (selectedShift) => {
        if (!selectedShift) return;
      
        // Set selected shift to form
        form.setFieldValue("shiftId", selectedShift);

        // ✅ Set shift time (text input)
        form.setFieldValue("shiftTime", selectedShift.shiftInTime || "");
        form.setFieldValue("amount", selectedShift.amount || "");
      };
      const toInputDateFormat = (dateStr) => {
        if (!dateStr || typeof dateStr !== "string") return "";
        const [day, month, year] = dateStr.split("-");
        return `${year}-${month}-${day}`;
      };
      const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    return (
        <div>
            {/* <Card>
                
                <CardBody> */}
                   
                    {/* <Row> */}
                    <TableComponent showDownload columns={columns} data={data} />
                    {/* </Row> */}
                {/* </CardBody>
            </Card> */}

            <Modal show={show} centered size="lg">
                <CardHeader>
                    <Row>
                        <Col sm="10" md="10">
                            <FormGroup className="d-flex justify-content-start mb-0">
                                <h4>Approve Food Token</h4>
                            </FormGroup>
                        </Col>
                        <Col sm="2" md="2">
                            <FormGroup className="d-flex justify-content-end mb-0">
                                <X color="red" onClick={closeRemarksModal} size={20} />
                            </FormGroup>
                        </Col>
                    </Row>
                </CardHeader>
                <Modal.Body>
                    <Row>
                        <Col md="6" sm="6">
                            <FormGroup>
                            <CustomTextInput
                                label={"Date"}
                                type="date"
                                id="billDate"
                                form={form}
                                min={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                max={new Date().toISOString().split("T")[0]}
                                onKeyDown={handleKeyDown}
                                />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Token No"} type="text" id="uniqueId" form={form} disabled/>
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                           <CustomDropdownInput
                                url={`${apiBaseUrl}FoodTeaTokenController/getVendor/FOOD`}
                                label={"Hotel Name"}
                                form={form}
                                id="vendorId"
                            />
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                            <CustomDropdownInput
                                url={`${apiBaseUrl}FoodTeaTokenController/GetEmployeeName/${UserDetails.plantids}`}
                                label={"Employee Name"}
                                form={form}
                                id="employeeId"
                                onChange={(selectedEmployee) => handleEmployeeChange(selectedEmployee)}
                                />
                            </FormGroup>
                        </Col>
                       
                        <Col sm="6" md="6">
                            <FormGroup>
                                <CustomTextInput label={"Department"} type="text" id="emp_department" form={form} disabled/>
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                        <FormGroup>
                            <CustomDropdownInput
                                url={`${apiBaseUrl}FoodTeaTokenController/getShift`}
                                label={"Shift"}
                                form={form}
                                id="shiftId"
                                onChange={handleShiftChange}
                            />
                            </FormGroup>
                        </Col>
                        <Col sm="6" md="6">
                            <FormGroup>
                                <CustomTextInput label={"Shift Time"} type="text" id="shiftTime" form={form} disabled/>
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"In Time"} type="time" id="inTime" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Out Time"} type="time" id="outTime" form={form} />
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Amount"} type="text" id="amount" form={form} disabled/>
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"Issued By"} type="text" id="FIRST_NAME" form={form} disabled/>
                            </FormGroup>
                        </Col>
                        <Col md="6" sm="6">
                            <FormGroup>
                                <CustomTextInput label={"remarks"} type="text" id="remark" form={form} />
                            </FormGroup>
                        </Col>
                        {/* <Col md="6" sm="6">

                        </Col> */}
                        <Col md="2" sm="2">
                            <FormGroup className='d-flex justify-content-start'>
                                <Button.Ripple color="danger" type="button" onClick={() =>onSubmit(0)}>
                                    <Circle size={16} /> Reject
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                        <Col md="10" sm="10">
                            <FormGroup className='d-flex justify-content-end'>
                                <Button.Ripple color="primary" type="button" onClick={() =>onSubmit(2)}>
                                    <Edit size={16} /> Approve
                                </Button.Ripple>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default FoodBillList;
