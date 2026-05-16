import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import TableComponent from "../common/TableComponent";
import Badge from "reactstrap/lib/Badge";
import { useLoader } from "../../utility/hooks/useLoader";
import { ElapsedTimer } from "../common/ElapsedTimer";
import FGGateOut from "./FGGateOut";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast } from "../../helper/appHelper";
import { apiBaseUrl } from "../../urlConstants";
import { useState } from "react";
import { useSelector } from "react-redux";
import OverAllDetails from "./OverAllDetails";

export const taColumns = [
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "120px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return <>
                <span className="fs-6">{row.moduleType == 'EVADP' ? 'IAS' : row.subModuleTypeId == 3 ? row.moduleType+' - Hand Carry' : row.moduleType}</span>
            </>
        },
    },
    {
        name: "PLANT NAME",
        selector: "plantName",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OVERALL DURATION",
        selector: "createdOn",
        sortable: false,
        minWidth: "170px",
        cell: (row) => {
            return <ElapsedTimer date={row.createdOn} />
        },

    },
    {
        name: "WAITING AT",
        selector: "StatusName",
        sortable: true,
        minWidth: "150px",
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


const SAPDocumentDetails = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    const actionsCol = {
        name: "ACTIONS",
        selector: "status",
        minWidth: "220px",
        cell: (row) => {
            return actionRendorer ? (
                actionRendorer(row)
            ) : (
                <Row>&nbsp;&nbsp;
                    <Button.Ripple color="primary" size="sm" type="button" onClick={() => onActionClick(row)}>Action</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => overAllDetails(row.gateInOutInfoId)}>View</Button.Ripple>
                    <Button.Ripple color="primary" size="sm" type="button" className='ml-1' onClick={() => print(row)}>Print</Button.Ripple>
                </Row>
            );
        },
    };

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
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21) {
            window.open(`/public/#/Purchase/SmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 13) {
            window.open(`/public/#/SDGStoSmartForm/${row.gateInOutInfoId}`)
        } else if (row.moduleTypeId == 14) {
            window.open(`/public/#/RmWaterSmartForm/${row.gateInOutInfoId}`)
        }
    }

    const onActionClick = (row) => {
        if (row.moduleTypeId == 1 || row.moduleTypeId == 2) {
            history.push(`/FG/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 4 || row.moduleTypeId == 19) {
            history.push(`/SSANDPM/loading/return/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 6 || row.moduleTypeId == 20) {
            history.push(`/SSANDPM/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 8) {
            history.push(`/RMSales/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 7) {
            history.push(`/SDGSales/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 12 || row.moduleTypeId == 15 || row.moduleTypeId == 21) {
            history.push(`/Purchase/SAPDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 13) {
            history.push(`/SDG/sto/SapDocument/${row.gateInOutInfoId}`);
        } else if (row.moduleTypeId == 5) {
            history.push(`/GatePass/SapDocument/${row.gateInOutInfoId}`);
        }
    };

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')

    const overAllDetails = (gateInOutInfoId) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const getLoadingData = () => {
        showLoader();
        console.log(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/2/0/${UserDetails.USERID}`);
        apiPostMethod(apiBaseUrl + `GatePro/Gate/getGateInInfo/0/0/2/0/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    const stoData = data.results.filter((item) => item.movementTypeId == 1);
                    // const stoData = data.results;
                    setLandingData(stoData);
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

    useEffect(() => {
        getLoadingData()
    }, [])

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Card>
                <CardHeader><h5>SAP Document Details</h5></CardHeader>
                <hr />
                <CardBody>
                    <TableComponent columns={columns} data={landingData} />
                </CardBody>
            </Card>

            {show ? <OverAllDetails setShow={setShow} show={show} gateInOutInfoId={gateInOutInfoId} /> : null}
        </div>
    );
};

export default SAPDocumentDetails;
