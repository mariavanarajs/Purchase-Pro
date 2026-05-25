import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../common/TableComponent";
import { apiBaseUrl } from "../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../helper/axiosHelper";
import { errorToast } from "../../../helper/appHelper";
import { useLoader } from "../../../utility/hooks/useLoader";
import { useSelector } from "react-redux";
import { DatePicker } from "../../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, Yup, validation } from "../../forms/custom-form";
import moment from "moment";
import { ArrowDown } from "react-feather";
import { RefreshBlock1 } from "../../common/RefreshBlock1";
import Select from 'react-select'
import OverAllDetails from "../OverAllDetails";
import { ElapsedTimer } from "../../common/ElapsedTimer";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "MOVEMENT TYPE",
        selector: "movementType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VA NUMBER",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SHIPMENT NO",
        selector: "shipmentOrderNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MOBILE NO",
        selector: "driverMobileNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRIPSHEET NO",
        selector: "tripSheetNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRUCK TYPE",
        selector: "truckType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VEHICLE TYPE",
        selector: "vehicleType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TRUCK CAPACITY",
        selector: "truckCapacity",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "FIRST WEIGHT",
        selector: "firstWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "SECOND WEIGHT",
        selector: "secondWeight",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "NET WEIGHT",
        selector: "netWeight",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MIGO NO",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "FIRST WEIGHT DATE",
        selector: "firstWeightDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "SECOND WEIGHT DATE",
        selector: "secondWeightDateStamp",
        sortable: true,
        minWidth: "200px",
    },
    {
        name: "GATE IN DATE",
        selector: "gateInDateStamp",
        sortable: true,
        minWidth: "180px",
    },
    {
        name: "GATE OUT DATE",
        selector: "gateOutDateStamp",
        sortable: true,
        minWidth: "170px",
    },
    {
        name: "OVERALL DURATION",
        selector: "DateAdded",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.gateInDateStamp} date1={row.gateOutDateStamp} />
        },

    },
    {
        name: "WAITING AT",
        selector: "waitingStatus",
        sortable: true,
        minWidth: "200px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color="primary" pill>
                            {row.waitingStatus}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
];

const GateInOutReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "150px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });

    const print = (row) => {
        if (row.moduleTypeId == 1) {
            window.open(`/public/#/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 2) {
            window.open(`/public/#/StoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 3 || row.moduleTypeId == 9) {
            window.open(`/public/#/FgReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            window.open(`/public/#/SsAndPmReturnSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 5 || row.moduleTypeId == 22) {
            window.open(`/public/#/GatePassSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            window.open(`/public/#/SsAndPmSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 7) {
            window.open(`/public/#/SDGSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 8) {
            window.open(`/public/#/RMSalesSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21 || row.moduleTypeId == 16){
            window.open(`/public/#/Purchase/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 13) {
            window.open(`/public/#/SDGStoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 14) {
            window.open(`/public/#/RmWaterSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const [data, setData] = useState([]);
    const [type, setType] = useState('');
    const [selectedValue, setSelectedValue] = useState('')
    const [movementTypeData, setMovementTypeData] = useState([]);
    const [moduleTypeId, setModuleTypeId] = useState(0);

    const selectType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setType([e])
    }

    const getGateInOutReport = () => {

        const formData = form.values
        const fromDate = new Date(moment(formData.date.start).format('YYYY-MM-DD'));
        const toDate = new Date(moment(formData.date.end).format('YYYY-MM-DD'));

        const fromDateMilliSecond = fromDate.getTime()
        const toDateMilliSecond = toDate.getTime()

        let moduleType = moduleTypeId != undefined ? moduleTypeId : 0
        let userPlant = form.values.masterPlantId != undefined ? form.values.masterPlantId.value : 0

        showLoader();
        console.log(apiBaseUrl + `GatePro/Report/getGateInOutReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${userPlant}/${UserDetails.USERID}`)
        apiPostMethod(apiBaseUrl + `GatePro/Report/getGateInOutReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${userPlant}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setLandingData(data.results);
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData("")
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

    const selectMovementType = () => {
        apiGetMethod(apiBaseUrl + `GatePro/Master/getMovementType`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setMovementTypeData(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const selectModuleType = (e) => {
        selectType(0)
        setSelectedValue(e)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getModuleType/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setData(data.results)
                }
                else if (data.success == false) {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    const [userPlant, setUserGate] = useState([])

    const getUserPlant = () => {
        console.log(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`);
        apiGetMethod(apiBaseUrl + `GatePro/Master/getUserPlant/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setUserGate(data.results)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        selectMovementType()
        selectModuleType()
        getUserPlant()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <>
            <Card>
                <CardHeader><h5>Report</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>
                        <Col sm="4" md="4">
                            <FormGroup>
                                <Label>Module Type</Label>
                                <Select
                                    options={data}
                                    onChange={selectType}
                                    value={type}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <CustomDropdownInput
                                    options={userPlant}
                                    label={"Plant"}
                                    form={form}
                                    id="masterPlantId"
                                />
                            </FormGroup>
                        </Col>

                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'> 
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getGateInOutReport}
                                    disabled={form.values.date == undefined ? true : false}
                                > View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != "" ?
                <Card>
                    <CardHeader><h5>Report List</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}

            <div style={{ marginBottom: "270px" }}></div>
        </>
    );
};

export default GateInOutReport;
