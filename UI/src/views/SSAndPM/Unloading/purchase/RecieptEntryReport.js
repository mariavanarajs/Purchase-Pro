import { Card, CardHeader, CardBody, Button, Row, FormGroup, Col, Label } from "reactstrap";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Badge from "reactstrap/lib/Badge";
import { useState } from "react";
import TableComponent from "../../../common/TableComponent";
import { apiBaseUrl } from "../../../../urlConstants";
import { apiGetMethod, apiPostMethod } from "../../../../helper/axiosHelper";
import { ShowToast, errorToast } from "../../../../helper/appHelper";
import { useLoader } from "../../../../utility/hooks/useLoader";
import { ElapsedTimer } from "../../../common/ElapsedTimer";
import { useSelector } from "react-redux";
// import OverAllDetails from "../../../FG/OverAllDetails";
import moment from "moment";
import { RefreshBlock1 } from "../../../common/RefreshBlock1";
import { useFormik } from "formik";
import { Yup } from "../../../forms/custom-form";
import { DatePicker } from "../../../forms/custom-datetime";
import { ArrowDown } from "react-feather";
import ReactSelect from "react-select";
import RecieptEntryScreenDetails from "./RecieptEntryScreenDetails";

export const taColumns = [
    {
        name: "S.NO",
        selector: "serialNo",
        sortable: true,
        minWidth: "50px",
    },
    {
        name: "TRUCK NO",
        selector: "vehicleNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VA NO",
        selector: "vaNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PURPOSE",
        selector: "moduleType",
        sortable: true,
        minWidth: "200px",
       
    },
    {
        name: "PO TYPE",
        selector: "poType",
        sortable: true,
        minWidth: "200px",
       
    },
    {
        name: "PLANT NAME",
        selector: "PLANT_NAME",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MIGO NUMBER",
        selector: "migoNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VENDOR CODE",
        selector: "vendorCode",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "VENDOR NAME",
        selector: "vendorName",
        sortable: true,
        minWidth: "250px",
    },
    {
        name: "INVOICE NO",
        selector: "invoiceNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE DATE",
        selector: "invoiceDate",
        sortable: true,
        minWidth: "150px",
    },
    
    {
        name: "PO NUMBER",
        selector: "poNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO Line",
        selector: "lineItem",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Material Code",
        selector: "material",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Material Desc",
        selector: "materialDescription",
        sortable: true,
        minWidth: "250px",
    },
    
    {
        name: "UOM",
        selector: "uom",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "HSN CODE",
        selector: "hsn",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO Qty",
        selector: "poQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "Before GRN QTY",
        selector: "grnQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIVE QTY",
        selector: "receivedQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TOLERANCE",
        selector: "tolerance",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OPEN QTY",
        selector: "openQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REMAIN QTY",
        selector: "remainQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PO RATE",
        selector: "poRate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STORAGE LOCATION",
        selector: "storageLocation",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PR NUMBER",
        selector: "prNumber",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PR TYPE",
        selector: "prType",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "FREIGHT",
        selector: "freightCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "PACKING",
        selector: "packingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LOADING",
        selector: "loadingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "UNLOADING",
        selector: "unloadingCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "OTHER",
        selector: "otherCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INELIGIBLE",
        selector: "ineligibleCharge",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "TAX CODE",
        selector: "rcm",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "REC NO",
        selector: "manualRecord",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MANUFACTURE DATE",
        selector: "manufacturingDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE QTY",
        selector: "invoiceQty",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "LLR NO",
        selector: "llrNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "WEIGHMENT NO",
        selector: "weighmentNo",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "POSTING DATE",
        selector: "postingDate",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIPT CREATED",
        selector: "createdAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "RECEIPT APPROVED",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE SUBMIT",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "INVOICE CONFIRM",
        selector: "mgApprovedAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "MANAGER REJECT",
        selector: "rejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STORES REJECT",
        selector: "storeRejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "ACCOUNTS REJECT",
        selector: "accountsRejectAt",
        sortable: true,
        minWidth: "150px",
    },
    {
        name: "STATUS",
        selector: "statusName",
        sortable: true,
        minWidth: "150px",
        cell: (row) => {
            return (
                <Col sm="12" md="12">
                    <FormGroup className="d-flex justify-content-center mb-0">
                        <Badge color={(row.status == 5 || row.status == 0) ? "danger" : 'primary'} pill>
                            {row.statusName}
                        </Badge>
                    </FormGroup>
                </Col>
            );
        },
    },
    {
        name: "DURATION",
        selector: "duration",
        sortable: false,
        minWidth: "170px",
    },
    {
        name: "Attachments",
        selector: "invoiceCopy",
        minWidth: "900px",
        cell: (row) => {
          return (
            <Row> {/* g-1 adds spacing between cols */}
              {row.invoiceCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
                    <Button outline color="success" size="sm">
                      Invoice
                    </Button>
                  </a>
              )}&nbsp;
              {row.bargainNote && (
                  <a target="_blank" rel="noopener noreferrer" href={row.bargainNote}>
                    <Button outline color="success" size="sm">
                      Bargain Note
                    </Button>
                  </a>
              )}&nbsp;
              {row.deliveryChallanCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.deliveryChallanCopy}>
                    <Button outline color="success" size="sm">
                      Delivery Challan
                    </Button>
                  </a>
              )}&nbsp;
              {row.ewayBillCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.ewayBillCopy}>
                    <Button outline color="success" size="sm">
                      E-Way Bill
                    </Button>
                  </a>
              )}&nbsp;
              {row.eInvoiceCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.eInvoiceCopy}>
                    <Button outline color="success" size="sm">
                      eInvoice
                    </Button>
                  </a>
              )}&nbsp;
              {row.qcCertificateInternalCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateInternalCopy}>
                    <Button outline color="success" size="sm">
                      QC Internal
                    </Button>
                  </a>
              )}&nbsp;
              {row.qcCertificateExternalCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.qcCertificateExternalCopy}>
                    <Button outline color="success" size="sm">
                      QC External
                    </Button>
                  </a>
              )}&nbsp;
              {row.externalWbCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.externalWbCopy}>
                    <Button outline color="success" size="sm">
                      External WB
                    </Button>
                  </a>
              )}&nbsp;
              {row.vendorEmailCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.vendorEmailCopy}>
                    <Button outline color="success" size="sm">
                      Vendor Email
                    </Button>
                  </a>
              )}&nbsp;
              {row.projectTeamAcknowledgement && (
                  <a target="_blank" rel="noopener noreferrer" href={row.projectTeamAcknowledgement}>
                    <Button outline color="success" size="sm">
                      Project Ack
                    </Button>
                  </a>
              )}&nbsp;
              {row.creditNoteCopy && (
                  <a target="_blank" rel="noopener noreferrer" href={row.creditNoteCopy}>
                    <Button outline color="success" size="sm">
                      Credit Note
                    </Button>
                  </a>
              )}
            </Row>
          );
        },
      }
];

const RecieptEntryReport = ({ actionRendorer }) => {

    let { showLoader, hideLoader } = useLoader();
    const history = useHistory();

    // const actionsCol = {
    //     name: "Invoice Copy",
    //     selector: "status",
    //     minWidth: "250px",
    //     cell: (row) => {
    //         return actionRendorer ? (
    //             actionRendorer(row)
    //         ) : (
    //             <Row>&nbsp;&nbsp;
    //             <a target="_blank" href={row.invoiceCopy ? row.invoiceCopy : row.invoiceCopys}>
    //                 <Button outline color="success" type="button">
    //                     Invoice Copy 
    //                 </Button>
    //             </a>&nbsp;
    //             {row?.extraAttachments &&
    //             <a target="_blank" href={row.extraAttachments}>
    //                 <Button outline color="success" type="button">
    //                     Other Copy 
    //                 </Button>
    //             </a>}
    //             </Row>
    //         );
    //     },
    // };

    

    const [show, setShow] = useState(false)
    const [gateInOutInfoId, setGateInOutInfoId] = useState('')
    const [poNumbers, setPoNumbers] = useState('')

    const overAllDetails = (gateInOutInfoId,poNumbers) => {
        setShow(true)
        setGateInOutInfoId(gateInOutInfoId)
        setPoNumbers(poNumbers)

    };

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
    const [landingData, setLandingData] = useState([])

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    // useEffect(() => {
    //     getLoadingData()
    // }, [])
    const getLoadingData = () => {

        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        let moduleType = moduleTypeId != '' ? moduleTypeId : 0
        let poTypes = poTypeId != '' ? poTypeId : 0

        showLoader();
        apiPostMethod(apiBaseUrl + `MigoAutomationController/ReceiptDetailReport/${fromDateMilliSecond}/${toDateMilliSecond}/${moduleType}/${UserDetails.USERID}`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    if (data.success == true) {
                        const stoData = data.results;
                        setLandingData(stoData);
                    }
                }
                else if (data.success == false) {
                    errorToast(data.message);
                    setLandingData([])
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

    const [moduleTypeData, setModuleTypeData] = useState([])
    const [moduleType, setModuleType] = useState('');
    const [moduleTypeId, setModuleTypeId] = useState('');

    const selectModuleType = (e) => {
        const id = e.value;
        setModuleTypeId(id)
        setModuleType([e])
    }

    const getModuleType = () => {
        console.log(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
        apiGetMethod(apiBaseUrl + `GatePro/Master/getPoTypeAccess/${UserDetails.USERID}/1`)
            .then((response) => {
                const { data } = response;
                if (data.success == true) {
                    setModuleTypeData(data.results)
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


    const [poTypeData, setPoTypeData] = useState([])
    const [poType, setPoType] = useState('');
    const [poTypeId, setPoTypeId] = useState('');

    const selectPoType = (e) => {
        const id = e.value;
        setPoTypeId(id)
        setPoType([e])
    }

    const getPoType = (module_type) => {
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        console.log(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
        apiGetMethod(apiBaseUrl + `MigoAutomationController/GetVaNumbers/${fromDateMilliSecond}/${toDateMilliSecond}/${module_type}/${UserDetails.USERID}`)
            .then((response) => {
                const data = response.data;
                if (data.success == true) {
                    setPoTypeData(data.results)
                    console.log(data.results)
                } else {
                    errorToast(data.message)
                }
            })
            .catch((error) => {
                console.log(error)
                errorToast("Something went wrong, please try again after sometime");
            })
    }

    useEffect(() => {
        // getPoType()
        getModuleType()
    }, [])

    const columns = [...taColumns];

    return (
        <div>

            <Card>
                <CardHeader><h5>MIGO REPORT</h5><RefreshBlock1 /></CardHeader>
                <hr />
                <CardBody>
                    <Row>
                        <Col md="3" sm="3">
                            <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                        </Col>

                        <Col sm="3" md="3">
                            <FormGroup>
                                <Label>PO Type</Label>
                                <ReactSelect
                                    options={moduleTypeData}
                                    onChange={selectModuleType}
                                    value={moduleType}
                                />
                            </FormGroup>
                        </Col>
                       
                        <Col md="2" sm="2">
                            <FormGroup className='mt-2'>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={getLoadingData}
                                    disabled={form.values.date == undefined ? true : false}
                                > View <ArrowDown size={16} />
                                </Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {landingData != '' ?
                <Card >
                    <CardHeader><h5>Document Details</h5></CardHeader>
                    <hr />
                    <CardBody>
                        <TableComponent showDownload columns={columns} data={landingData} />
                    </CardBody>
                </Card> : null
            }

            {landingData == '' ? <div style={{ marginBottom: "330px" }}></div> : null}
        </div >
    );
};

export default RecieptEntryReport;
