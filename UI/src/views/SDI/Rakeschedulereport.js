import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardBody, Button, FormGroup, Col, Row } from "reactstrap";
import { useHistory } from "react-router-dom";
import { apiBaseUrl, BASE_URL } from "../../urlConstants";
import TableComponent from "../common/TableComponent";
import { CardComponent } from "../common/CardComponent";
import { useLoader } from "../../utility/hooks/useLoader";
import { apiPostMethod } from "../../helper/axiosHelper";
import { CustomDropdownInput, Yup } from "../forms/custom-form";
import { useFormik } from "formik";
import { DatePicker } from "../forms/custom-datetime";
import { errorToast } from "../../helper/appHelper";
import moment from "moment";

export const rakeColumns = [
  { name: "VA Number", selector: "ZVA_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Po Number", selector: "ZPO_NUMBER", sortable: true, minWidth: "100px" },
  { name: "Supplier Name", selector: "ZSUPPLIER_NAME", sortable: true, minWidth: "150px" },
  { name: "Wheat Variety", selector: "IDNLF", sortable: true, minWidth: "150px" },
  { name: "Loading Location", selector: "ZSUPPLIER_LOAD_POINT", sortable: true, minWidth: "200px" },
  { name: "Unloading (DG / APK)", selector: "PLANT_NAME", sortable: true, minWidth: "100px" },
  { name: "FNR Number", selector: "fnr_no", sortable: true, minWidth: "80px" },
  { name: "RR Number", selector: "VEHICAL_NO", sortable: true, minWidth: "80px" },
  { name: "Loading Date", selector: "ZSUPPLIER_LOAD_DT", sortable: true, minWidth: "80px" },
  { name: "Vehicle Type", selector: "VEHICLE_TYPE", sortable: true, minWidth: "80px" },
  { name: "Arrived Date", selector: "DateAdded", sortable: true, minWidth: "100px" },
];

export const truckContainerColumns = [
  { name: "VA Number", selector: "ZVA_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Po Number", selector: "ZPO_NUMBER", sortable: true, minWidth: "160px" },
  { name: "Supplier Name", selector: "ZSUPPLIER_NAME", sortable: true, minWidth: "100px" },
  { name: "Wheat Variety", selector: "IDNLF", sortable: true, minWidth: "120px" },
  { name: "Loading Location", selector: "ZSUPPLIER_LOAD_POINT", sortable: true, minWidth: "80px" },
  { name: "Loading Vendor", selector: "loadingvendor", sortable: true, minWidth: "200px" },
  { name: "Loading Vendor Charge", selector: "LoadingCharge", sortable: true, minWidth: "80px" },
  { name: "Unload Vendor Name", selector: "UnloadVendorName", sortable: true, minWidth: "200px" },
  { name: "Unload Vendor Charge", selector: "UnloadVendorCharge", sortable: true, minWidth: "80px" },
  { name: "Unloading loc", selector: "PLANT_NAME", sortable: true, minWidth: "80px" },
  { name: "Truck No / Container No", selector: "VEHICAL_NO", sortable: true, minWidth: "80px" },
  { name: "Vehicle Type", selector: "VEHICLE_TYPE", sortable: true, minWidth: "80px" },
  { name: "Loading Date", selector: "ZSUPPLIER_LOAD_DT", sortable: true, minWidth: "80px" },
  { name: "Port Receive Date", selector: "CONTAINER_PORT_RECEIVE", sortable: true, minWidth: "80px" },
  { name: "Arrived Date", selector: "DateAdded", sortable: true, minWidth: "80px" },
  { name: "GateInDate&Time", selector: "FormattedGateInDt", sortable: true, minWidth: "200px" },
  { name: "GateIn By", selector: "GateInByName", sortable: true, minWidth: "100px" },
  { name: "FirstWeightDate&Time", selector: "FormattedFirstWeightEntryDt", sortable: true, minWidth: "200px" },
  { name: "FirstWeight By", selector: "FirstWeightEntryByName", sortable: true, minWidth: "100px" },
  { name: "UnloadWHSubmitDate&Time", selector: "FormattedUnloadWHSubmitDt", sortable: true, minWidth: "200px" },
  { name: "UnloadWHSubmit By", selector: "UnloadWHSubmitByName", sortable: true, minWidth: "120px" },
  { name: "SecondWeightDate&Time", selector: "FormattedSecondWeightEntryDt", sortable: true, minWidth: "200px" },
  { name: "SecondWeight By", selector: "SecondWeightEntryByName", sortable: true, minWidth: "100px" },
  { name: "GateOutDate&Time", selector: "FormattedGateOutDt", sortable: true, minWidth: "200px" },
  { name: "Gate Out By", selector: "GateOutByName", sortable: true, minWidth: "100px" },
  { name: "MIGOApprovalDate&Time", selector: "FormattedMIGOApprovalDt", sortable: true, minWidth: "200px" },
  { name: "MIGOApproval By", selector: "MIGOApprovalByName", sortable: true, minWidth: "100px" },
  { name: "Bag type1", selector: "bag_type", sortable: true, minWidth: "80px" },
  { name: "Bag type2", selector: "bag_type2", sortable: true, minWidth: "80px" },
  { name: "Bag type3", selector: "bag_type3", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type1", selector: "no_bags", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type2", selector: "no_bags2", sortable: true, minWidth: "80px" },
  { name: "Totalbags Type3", selector: "no_bags3", sortable: true, minWidth: "80px" },
  { name: "FirstWeight", selector: "wb_load_wt", sortable: true, minWidth: "80px" },
  { name: "SecondWeight", selector: "wb_empty_wt", sortable: true, minWidth: "80px" },
  { name: "Net Weight", selector: "wb_net_wt", sortable: true, minWidth: "80px" },
  { name: "Gunny Weight", selector: "gunny_wt", sortable: true, minWidth: "80px" },
  { name: "MIGO Quantity", selector: "gunny_less_wt", sortable: true, minWidth: "80px" },
];

const CRakesehedulereport = ({ title, url, actionRenderer }) => {
  const history = useHistory();
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState(rakeColumns);

  const form = useFormik({
    isInitialValid: false,
    initialValues: {},
    validationSchema: Yup.object().shape({
      rows: Yup.array().of(Yup.object().shape({})),
    }),
    onSubmit(values) {},
  });

  const { showLoader, hideLoader } = useLoader();

  const loadTableData = async () => {
    const formData = form.values;
    const fromDate = new Date(moment(formData.date.start).format("YYYY-MM-DD"));
    const toDate = new Date(moment(formData.date.end).format("YYYY-MM-DD"));
    const postdata = {
      fromDate,
      toDate,
      vehicle_type: formData.vehicle_type?.label,
    };

    if (!postdata.vehicle_type) {
      errorToast("Please Select Vehicle Type");
      return;
    }

    showLoader();
    apiPostMethod(apiBaseUrl + "GatePro/Report/getRakeseheduledetailsforreport", postdata)
      .then((response) => {
        const { data } = response;
        if (data && data.length > 0) {
          setTableData(data);
          updateColumnsBasedOnVehicleType(formData.vehicle_type.value);
        } else {
          setTableData([]);
          errorToast("No data found");
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after some time");
      })
      .finally(() => {
        hideLoader();
      });
  };

  const updateColumnsBasedOnVehicleType = (vehicleType) => {
  if (vehicleType == "2") {
    // Rake
    setColumns(rakeColumns);
  } else if (vehicleType == "1" || vehicleType == "3" || vehicleType == "4") {
    // Truck or Container
    setColumns([
      ...truckContainerColumns,
      {
        name: "Action",
        cell: (row) =>
          row?.FormattedGateOutDt ? (
            <Button
              color="primary"
              size="sm"
              onClick={() =>
                window.open(
                  `${BASE_URL}#/STOSDTSlip:${row.PI_REFID}`,
                  "_blank",
                  "width=900,height=650"
                )
              }
            >
              Print
            </Button>
          ) : null,
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        minWidth: "120px",
      },
    ]);
  }
};

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle> Rake Schedule Report </CardTitle>
        </CardHeader>
        <CardComponent>
          <Row>
            <Col md="4" sm="12">
              <DatePicker form={form} id="date" isDateRange label={"Date Range"} />
            </Col>
            <Col md="4" sm="12">
              <FormGroup>
                <CustomDropdownInput
                  url={`${apiBaseUrl}MarketData/Master/getModeOfTransport`}
                  label={"Select Vehicle Type"}
                  form={form}
                  id="vehicle_type"
                  name="vehicle_type"
                />
              </FormGroup>
            </Col>
            <Col md="12" sm="12">
              <FormGroup className="d-flex mb-0 justify-content-end">
                <Button.Ripple color="primary" type="button" onClick={loadTableData}>
                  Filter
                </Button.Ripple>
              </FormGroup>
            </Col>
          </Row>
        </CardComponent>
        <CardBody>
          <TableComponent showDownload columns={columns} data={tableData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default CRakesehedulereport;
