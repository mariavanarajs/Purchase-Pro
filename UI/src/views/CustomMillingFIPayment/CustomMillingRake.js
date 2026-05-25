import React, { useState, useEffect } from "react";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { apiPostMethod, apiGetMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, CardHeader,Card, CardBody, InputGroup, } from "reactstrap";
import { ArrowDown, Edit, Eye, Paperclip, Search, X } from "react-feather";
import { useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import Uploader from "../Uploader";
import { useLoader } from "../../utility/hooks/useLoader";
import confirmDialog from "../../@core/components/confirm/confirmDialog";
import Select from 'react-select';
import { DatePicker } from "../forms/custom-datetime";
import { useFormik } from "formik";
import { CustomDropdownInput, CustomTextInput, Yup } from "../forms/custom-form";
import moment from "moment";
import POCopyModal from "../POCopyModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DateComponent from "../common/dateComponent";

const CustomMillingRake = ({ }) => {

    const form = useFormik({
        isInitialValid: false,
        initialValues: {},
        validationSchema: Yup.object().shape({}),
        onSubmit() { },
    });
    useEffect(() => {
        getGateInInfo()
        // GetPODetails()
    }, [])
    useEffect(() => {
        if (form?.values?.date !== undefined) {
        getGateInInfo()
        GetPODetails()
        }
    }, [form?.values?.date])
    // console.log(form)
    const [data, setData] = useState([])
    const [show1, setShow1] = useState(false)
    const [poData, setPoData] = useState([])
    const [weighmentImages, setWeighmentImages] = useState([])
    const [materialInfo, setMaterialInfo] = useState([])
    const [isDisable, setIsDisable] = useState(false);
    const [selectAll, setSelectAll] = useState(false);

    const firstWeight = weighmentImages.filter((item) => item.moduleStatusId === 2);
    const secondWeight = weighmentImages.filter((item) => item.moduleStatusId === 3);

    const [salesDeliveryData, setSalesDeliveryData] = useState([])
    const [truckValue, setTruckValue] = useState('');
    const totalDeliveryQty = (salesDeliveryData.reduce((a, i) => a = a + Number(i.deliveryQty), 0))
    const differentWeight = Number(totalDeliveryQty) - Number(data.netWeight)

    const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));

    const getGateInInfo = () => {  
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        
        const requestData = {
            poNumbers: selectedPoNumbers, // Send the entire array of selected PO numbers
            vendorCode:selectedVendor,
            condtion:condtion,
            fromDate:fromDateMilliSecond,
            toDate:toDateMilliSecond
        };
        // if (!requestData?.poNumbers?.length) {
        //     errorToast('Please select a poNumber');
        //     return;
        // }
    
        // if (!requestData?.vendorCode) {
        //     errorToast('Please select a Vendor Code');
        //     return;
        // } 
        showLoader();
        apiPostMethod(apiBaseUrl + `SupplierDispatch/getCustomMillingMiroDetailsByIdWheatRake`, requestData)  // Send as body, not in URL
            .then((response) => {
                const { data } = response;
                console.log(data.success)
                if (data.success === true) {
                    setPoData(data.results);
                    // Optional: If you want to handle material info or other data
                    // setMaterialInfo(data.materialDetails);
                    // getWeighmentInfo(data.results[0].gateInOutInfoId);
                    setIsDisable(true);
                    InvoiceValidation();
                } else {
                    setPoData([])
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                setData(false);
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally(() => {
                hideLoader();
            });
    };
  

  

    const [attachedFiles, setAttachment] = useState({ invoice_attachment: {}});
    const [ImgData, setImgData] = useState({});


    const handleFileChange = (file,id) => {
        setAttachment({
            ...attachedFiles,
            [id]: file,
        });
    };


    const { showLoader, hideLoader } = useLoader();

 
   
    const [openImage, setOpenImage] = useState('');
    const [openPdf, setOpenPDF] = useState('');

    const closeRemarksModal = () => setShow1(false);
    const isImage = (url) => /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
    const isPDF = (url) => /\.pdf$/i.test(url);
   
  
   
    const handleCheckboxChange = (index, isChecked) => {
        const updated = [...poData];
        updated[index].selected = isChecked;
        setPoData(updated); // or your state updater
    };
    const handleSelectAll = (checked) => {
        setSelectAll(checked);
        const updated = poData.map(item => ({ ...item, selected: checked }));
        setPoData(updated);
    };
    const currentDate = new Date().toISOString().split("T")[0];
    const handleKeyDown = (e) => {
        // Prevent typing anything manually in the input field
        e.preventDefault();
    };
    const [date_control, setDate_control] = useState('');
      const InvoiceValidation = () => {
        apiPostMethod(apiBaseUrl + "Loadingunloadingcost/SAP_PostingDate")
          .then((response) => {
            const days = parseInt(response?.data?.results[0]?.miro_date ?? 0);
            const today = new Date();
            const limitedDate = new Date(today);
            limitedDate.setDate(today.getDate() - days);
      
            const formattedMin = limitedDate.toISOString().split("T")[0];
            setDate_control(formattedMin); // use as min
          });
      };

      const [selectedPoNumbers, setSelectedPoNumbers] = useState([]);

      const handlePoNumberChange = (selectedOptions) => {
        setSelectedPoNumbers(selectedOptions || []);
        console.log(selectedOptions)
        getVendorList(selectedOptions)
        ConditonType(selectedOptions)
      };

      const [poOptions, setPoOptions] = useState([]);

      const GetPODetails = () => {
        // Replace with the actual API endpoint that provides PO numbers based on userInfoId
        const formData = form.values
        const fromDate = formData.date != undefined ? new Date(moment(formData.date.start).format('YYYY-MM-DD')) : 0
        const toDate = formData.date != undefined ? new Date(moment(formData.date.end).format('YYYY-MM-DD')) : 0
        const fromDateMilliSecond = formData.date != undefined ? fromDate.getTime() : 0
        const toDateMilliSecond = formData.date != undefined ? toDate.getTime() : 0

        apiPostMethod(apiBaseUrl + `MigoAutomationController/getPoNumbersWheat/${UserDetails.USERID}/${fromDateMilliSecond}/${toDateMilliSecond}/${UserDetails.plantids}`)
          .then((response) => {
            if (response.data.success) {
              setPoOptions(response.data.results); // Directly set the PO numbers from backend response
            } else {
              errorToast(response.data.message);
            }
          })
          .catch((error) => {
            errorToast("Error fetching PO numbers:", error);
          });
      };
      const [vendorOptions, setVendorOptions] = useState([]);
      const [selectedVendor, setSelectedVendor] = useState(null);
      const [vendorOptions1, setVendorOptions1] = useState([]);
      const [selectedVendor1, setSelectedVendor1] = useState(null);
      const [condtionOptions, setCondtionOptions] = useState([]);
      const [condtion, setCondtion] = useState(null);
      const handleVendorChange = (selectedOption) => {
            setSelectedVendor(selectedOption || []);
      };
       const handleVendorChange1 = (selectedOption) => {
            setSelectedVendor1(selectedOption || []);
      };
      const handleCondtionChange = (selectedOption) => {
            setCondtion(selectedOption || []);
      };
      const getVendorList = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getVendorListWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setVendorOptions(data.results);
                    setVendorOptions1(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };
    const ConditonType = (PoNumbers) => {

        const requestData = {
            PoNumbers: PoNumbers, // Send the entire array of selected PO numbers
           
        };
        apiPostMethod(apiBaseUrl + 'MigoAutomationController/getCondtionWheat',requestData)
            .then((response) => {
                const { data } = response;
                if (data.success) {
                   
                    setCondtionOptions(data.results);
                } else {
                    errorToast(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                errorToast("Failed to fetch vendor list.");
            });
    };

    const [formValue, setFormValue] = useState({ refDocNo: '', docDate: '' });

    const [selectedPO, setSelectedPO] = useState(null);
    const [poModalOpen, setPoModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const openPOModal = (poNumber,type) => {
        setSelectedPO(poNumber);
        setSelectedType(type)
        setPoModalOpen(true);
    };
    const togglePOModal = () => setPoModalOpen(!poModalOpen);
    
    
    const exportToExcel = () => {
    console.log(poData)
    // You can export selected rows OR all rows
    const dataToExport = poData.filter(item => item.selected); 
    // If you want all rows use: const dataToExport = poData;
    const dataToExport1 = dataToExport.length === 0 ? poData : dataToExport;

    if (!dataToExport1.length) {
        alert("No data selected for export");
        return;
    }

    // Format data for Excel
    const formattedData = dataToExport1.map(item => ({
        "GL Description": item.gl + " - " + item.itemText,
        "Vendor Name": item.vendor + " - " + item.vendorName,
        "Invoice No": item.refDocNo,
        "Invoice Date": item.docDate,
        "GRN Qty": item.quantity,
        "Line": item.poItem,
        "PO NO": item.poNumber,
        "MIGO Number": item.refNo,
        "Plant Code": item.plantCode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MIRO Details");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const fileData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(fileData, "Invoice_Details.xlsx");
    };
    const [showModal, setShowModal] = useState(false);
    const OpenData = (materialData) => {
        // Populate form fields for the modal from the selected row (with safe fallbacks)
        setData(materialData);
        console.log(materialData)
        try {
            form.setValues({
                ...form.values,
                // row_count: materialData.row_count || 1,
                overall_tonnage: materialData.gunny_less_wt || 0,
                total_value: materialData.condition_amount || materialData.total_value || 0,
                invoice_value: materialData.condition_amount,
                rate: materialData.rate || 0,
                confirm_vendor: materialData.vendor || materialData.ZVENDOR || materialData.ZVENDOR_NAME || materialData.ZVENDOR_NAME || materialData.vendorName || "",
                tds_name: materialData.tds_name || "",
                vendor_invoice_no: materialData.invoice_no || materialData.refDocNo || "",
                invoice_date: materialData.invoice_date
                    ? moment(materialData.invoice_date).format("YYYY-MM-DD")
                    : materialData.docDate
                    ? moment(materialData.docDate).format("YYYY-MM-DD")
                    : "",
                remarks: materialData.remarks || "",
                gl: materialData.gl || "1312126",
                cost_center: materialData.cost_center || "FR01-WM",
            });
        } catch (e) {
            // if setValues is not available for some reason, still open the modal with data stored in state
            console.warn("Failed to set form values for modal:", e);
        }
        setShowModal(true)
    }
    const closed = () => setShowModal(false);
    const dateRestriction = DateComponent('invoice')

    return (
        <div>
            {/* <Modal show={show} centered size="xl"> */}
            <Card>
                <Row>
                  <Col md="8" sm="8">
                        <h4 className="text-primary"><u>Custom Milling FI Payment Details</u></h4><br />
                   </Col>
                </Row>
                <Row>
                <Col md="4" sm="4">
                    <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
                </Col>
                 <Col md="4" sm="4">
                    <FormGroup>
                        <h5>PO Number</h5>
                        <Select
                            isMulti
                            name="poNumbers"
                            options={poOptions}
                            classNamePrefix="select"
                            onChange={handlePoNumberChange}
                            value={selectedPoNumbers}
                            // isDisabled={isDisable}
                            placeholder="Select PO Numbers"
                            styles={{
                            // control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            // }),
                            }}
                        />
                    </FormGroup>
                    </Col>
                   
                    <Col md="4" sm="4">
                    <FormGroup>
                        <h5>Condtion Type</h5>
                            <Select
                            isMulti
                            name="itemText"
                            options={condtionOptions}
                            classNamePrefix="select"
                            onChange={handleCondtionChange}
                            value={condtion}
                            // isDisabled={isDisable}
                            placeholder="Select Condtion"
                            // styles={{
                            //     control: (provided) => ({
                            //     ...provided,
                            //     height: '38px',
                            //     fontSize: '14px',
                            //     }),
                            // }}
                            />

                        
                     </FormGroup>
                    </Col>
                    
                    <Col md="4" sm="4">
                        <FormGroup className='mt-2'>
                            <Button.Ripple color="primary" type="submit" onClick={getGateInInfo}>
                                View <ArrowDown size={16} />
                            </Button.Ripple>
                        </FormGroup>
                    </Col>
                    
                 </Row>     
                
                      
                    <br />
                <Row>

                  
                   {poData?.length > 0 &&
                   <Col md="12" sm="12" className="d-flex justify-content-end">
                   <Button
                        color="success"
                        size="sm"
                        onClick={exportToExcel}
                        className="mb-1"
                    >
                        Export to Excel
                    </Button>
                    </Col>}
                        <label></label>
                            <div
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                maxHeight: "500px",
                                overflowY: "auto",
                                border: "1px solid #ddd"
                            }}
                            >
                            <table
                                className="table table-bordered"
                                style={{
                                width: "100%",
                                minWidth: "1500px",
                                tableLayout: "fixed",
                                textAlign: "left",
                                borderCollapse: "separate"
                                }}
                            >
                                <thead>
                                <tr>
                                    {/* CHECKBOX HEADER */}
                                    {/* <th
                                    style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 3,
                                        background: "#7367f0",
                                        color: "white"
                                    }}
                                    >
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={poData.length === 0}
                                    />
                                    </th> */}

                                    {[
                                    { label: "PO No", width: "120px" },
                                    { label: "Vendor Name", width: "170px" },
                                    { label: "Plant", width: "80px" },
                                    { label: "Purchase Type", width: "100px" },
                                    { label: "Condition Type", width: "140px" },
                                    { label: "UOM", width: "80px" },
                                    { label: "Invoice No", width: "100px" },
                                    { label: "Qty In Ton", width: "80px" },
                                    { label: "Rate", width: "80px" },
                                    { label: "Condition Cost", width: "100px" },
                                    { label: "Action", width: "80px" },
                                    ].map((col, i) => (
                                    <th
                                        key={i}
                                        style={{
                                        width: col.width,
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 2,
                                        background: "#7367f0",
                                        color: "white"
                                        }}
                                    >
                                        {col.label}
                                    </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {poData?.map((materialData, index) => (
                                    <tr key={index}>
                                    {/* CHECKBOX CELL */}
                                    {/* <td
                                        style={{
                                        width: "45px",
                                        minWidth: "45px",
                                        maxWidth: "45px",
                                        padding: 0,
                                        textAlign: "center",
                                        verticalAlign: "middle"
                                        }}
                                    >
                                        <input
                                        type="checkbox"
                                        checked={materialData?.selected || false}
                                        onChange={(e) =>
                                            handleCheckboxChange(index, e.target.checked)
                                        }
                                        />
                                    </td> */}

                                    <td>{materialData?.ZPO_NUMBER}</td>
                                    <td>
                                        {materialData?.ZVENDOR_NAME}
                                    </td>

                                    <td>
                                        {/* <Input
                                        type="text"
                                        value={materialData?.refDocNo || ""}
                                        onChange={(e) =>
                                            updateValue(index, "refDocNo", e.target.value)
                                        }
                                        /> */}
                                        {materialData?.WERKS}
                                    </td>

                                    <td>
                                        {/* <Input
                                        type="date"
                                        value={materialData?.docDate || ""}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            updateValue(index, "docDate", e.target.value)
                                        }
                                        onKeyDown={(e) => e.preventDefault()}
                                        /> */}
                                        {materialData?.VEHICLE_TYPE}
                                    </td>

                                    <td>
                                        {materialData?.condition_description}
                                    </td>
                                    <td>{materialData?.uom}</td>
                                    <td>{materialData?.invoice_no}</td>
                                     <td>
                                        {materialData?.gunny_less_wt}
                                    </td>
                                    <td>
                                        {/* {<Input
                                        type="text"
                                        value={materialData?.rate || ""}
                                        onChange={(e) =>
                                            updateValue(index, "rate", e.target.value)
                                        }
                                        />} */}
                                        {materialData?.rate}
                                    </td>
                                    
                                    <td>
                                        {materialData?.condition_amount}
                                    </td>
                                    <td>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => OpenData(materialData)}
                                        >
                                            View
                                        </Button>
                                    </td>
                                    {/* <td>
                                        {materialData?.actual_amount}
                                    </td> */}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                            </div>


                {/* </CardBody> */}
                </Row>
                </Card>
                {/* <ModalBody>
                    <Row>
                    </Row>
                    <Row />
                    <Row>
                        <Col md="6" sm="6" >
                        <FormGroup className="d-flex justify-content-end mb-0">
                            <Button.Ripple color="primary" type="button"  onClick={() => AddDatasPO(0)} >Add</Button.Ripple>
                        </FormGroup>
                        </Col>
                    </Row>
                </ModalBody> */}
            {/* </Modal> */}

            <Modal show={show1} centered >
                <Modal.Header>
                    <Row>
                        <Col md="12" sm="12">
                            <FormGroup style={{ width: 460 }}>
                                <Modal.Title> <X onClick={closeRemarksModal} style={{ float: "right" }} /></Modal.Title>
                            </FormGroup>
                        </Col>
                    </Row>
                </Modal.Header>
                <Modal.Body>
                 
                    <Row>
                            {/* Show Image if available */}
                        {openImage && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <img src={encodeURI(openImage)} alt="Invoice Copy" style={{ width: "100%", maxWidth: "600px" }} />
                            </Col>
                        )}

                        {/* Show PDF if available */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center" }}>
                                <iframe src={encodeURI(openPdf)} title="PDF Preview" style={{ width: "100%", height: "600px", border: "none" }} />
                            </Col>
                        )}

                        {/* Alternative Link if PDF is blocked */}
                        {openPdf && (
                            <Col sm={12} style={{ textAlign: "center", marginTop: "10px" }}>
                                <a href={encodeURI(openPdf)} target="_blank" rel="noopener noreferrer">Open PDF in New Tab</a>
                            </Col>
                        )} 
                    </Row>
                </Modal.Body>
         </Modal >
         <Modal show={showModal} centered size="xl">
            <Modal.Header><b>Payment Confirmation</b> <X onClick={closed} style={{ float: "right" }} /></Modal.Header>
            <Modal.Body>
            <Row>
            {/* <Col md="12" sm="12"><X onClick={closed} style={{ float: "right" }} /></Col> */}
                {/* <Col md="4" sm="12">
                <CustomTextInput label={"Total Row Count"} form={form} id="row_count" type="text" disabled/>
                </Col> */}
                <Col md="4" sm="12">
                <CustomTextInput label={"Total Tonnage"} form={form} id="overall_tonnage" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Rate"} form={form} id="rate" type="text"/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Total Value"} form={form} id="total_value" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Invoice Value"} form={form} id="invoice_value" value={(form.values.rate * form.values.overall_tonnage).toFixed(2)} type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Difference"} form={form} id="difference" value = {(form.values.total_value-(form.values.rate * form.values.overall_tonnage)).toFixed(2)} type="text" disabled/>
                </Col>
                <Col md="4" sm="12" >
                    <CustomDropdownInput  
                        url={`${apiBaseUrl}/Loadingunloadingcost/getVendor`} 
                        label={"Confirm Vendor Name"}  
                        form={form} 
                        id={"confirm_vendor"}
                        // options ={warehouseoption}   
                    />
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"TDS"} form={form} id="tds_name" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"GL"} form={form} id="gl" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Cost Center"} form={form} id="cost_center" type="text" disabled/>
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Vendor Invoice No"} form={form} id="vendor_invoice_no" type="text" />
                </Col>
                <Col md="4" sm="12">
                <CustomTextInput label={"Invoice Date"} form={form} id="invoice_date" type="date" 
                min={dateRestriction.min_date} 
                max={dateRestriction.max_date} />
                </Col>
            
            
                <Col md="4" sm="12">
                <CustomTextInput label={"Remarks"} form={form} id="remarks" type="text" />
                </Col>
                <Col md="4" sm="12">
                <Uploader
                          
                            setAttachment={handleFileChange}
                            label={"Invoice Attachment"}
                            title="Pdf"
                            id={"invoice_attachment"}
                            selectedFileName={attachedFiles.invoice_attachment.name}
                        />
                </Col>
            </Row>
            <Row>
                <Col md="12" sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end">
                        {/* <Button.Ripple outline color="secondary" tag={Link} to={`/LOADUNLOADPAYMENT`} type="reset" className="mr-2">
                            Cancel
                        </Button.Ripple> */}
                            <div className="mr-1">
                            <Button.Ripple color="primary" type="button" 
                            // onClick={() => POST() /*handleShowModal(form.setValues({...form.values,CheckList}))*/}
                            >
                                Submit
                            </Button.Ripple>
                            </div>
                        </FormGroup>
                    </Col>
            </Row>
            </Modal.Body>
         </Modal>
         <POCopyModal
                isOpen={poModalOpen}
                toggle={togglePOModal}
                poNumber={selectedPO}
                type={selectedType}
        />
        </div >
    );
};

export default CustomMillingRake;
