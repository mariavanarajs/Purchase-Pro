import { useFormik } from 'formik';
import React, { Fragment, useEffect, useState } from 'react';
import {
    Row, Col, Button, FormGroup, Input,
    CardTitle, CardBody, Card, CardHeader, Modal, ModalHeader, ModalBody
} from 'reactstrap';
import { apiBaseUrl } from '../../urlConstants';
import { CardComponent } from '../common/CardComponent';
import { apiPostMethod } from "@helpers/axiosHelper";
import { CustomTextInput, Yup, CustomDropdownInput } from '../forms/custom-form';
import { HrLine } from '../common/HrLine';
import { useLoader } from "../../utility/hooks/useLoader";
import { errorToast, ShowToast } from '../../helper/appHelper';
import { useSelector } from 'react-redux';
import moment from 'moment';
import TableComponent from '../common/TableComponent';

export const taColumns = [
    {
        name: "Date",
        selector: "entry_date",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "Groceries Type",
        selector: "groceries_type",
        sortable: true,
        minWidth: "100px",
    },
    {
        name: "State Name",
        selector: "state_name",
        sortable: true,
        minWidth: "100px",
    }
];

function RMrtRateEntry() {
    const dateFormat = "YYYY-MM-DD";
    const today = moment().format(dateFormat);
    const [data, setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const { showLoader, hideLoader } = useLoader();
    const UserDetails = useSelector((state) => (state?.auth?.userData || {}));

    useEffect(() => {
        callgetotpdata();
    }, []);

    const callgetotpdata = () => {
        apiPostMethod(apiBaseUrl + `MarketRateCD/MrtRateController/getmarketratedetails/${today}`)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    setData(data.results);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."));
    };

    const form = useFormik({
        isInitialValid: false,
        initialValues: {
            entry_date: today,
            GroceriesType: null,
            State: null
        },
        validationSchema: Yup.object().shape({}),
        onSubmit(values) { }
    });

    const fetchGroceriesTypeData = async (movementTypeLabel) => {
        try {
            showLoader();
            const res = await apiPostMethod(
                `${apiBaseUrl}MarketRateCD/MrtRateController/getGrocerieslist`,
                { movement_type: movementTypeLabel }
            );
            if (res.data.success === 1) {
                const reasons = res.data.results || [];
                const transformedData = reasons.map((item) => ({
                    name: item.groceriesitem, // from API field
                    rate: "",                 // initially empty or default
                    uom: item.uom || "KG",
                    link: "",
                    state: null,
                    district: null,
                    city: null,
                    market_place: ""
                }));

                setTableData(transformedData);
            } else {
                errorToast("Failed to fetch Groceries List");
            }
        } catch (err) {
            errorToast("Error fetching data");
        } finally {
            hideLoader();
        }
    };

    const handlesubmitButtonClick = () => {
        const formData = form.values;

        if (!formData.GroceriesType) {
            errorToast('Please select Groceries Type');
            return;
        }


        const consolidatedItemData = tableData.map((item) => ({
            item_name: item.name,
            item_rate: item.rate,
            item_uom: item.uom,
            item_link: item.link,
            item_district: item.district?.value,
            item_city: item.city?.value,
            item_market_place: item.market_place
        }));

        const postData = {
            entry_date: formData.entry_date,
            groceries_type: formData.GroceriesType?.value || "",
            state: formData.State?.value || "",
            created_by: UserDetails.USERID,
            tableItems: consolidatedItemData,
        };

        showLoader();
        apiPostMethod(apiBaseUrl + "MarketRateCD/MrtRateController/InsertMrtRatedetails", postData)
            .then((response) => {
                const { data } = response;
                if (data.success === 1) {
                    ShowToast("Saved Successfully...");
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    errorToast(data.error);
                }
            })
            .catch(() => errorToast("Something went wrong, please try again later."))
            .finally(() => hideLoader());
    };

    const handleView = async (row) => {
        setModalOpen(true);
        showLoader();
        try {
            const res = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/getmarketratedetailsforview`, {
                groceries_type: row.groceries_id,
                date: row.entry_date,
            });
            if (res.data.success) {
                setSelectedRowData(res.data.results || []);
            } else {
                errorToast("Failed to load grocery rate data");
            }
        } catch (error) {
            errorToast("Error fetching data");
        } finally {
            hideLoader();
        }
    };

    const handleSaveModalChanges = async () => {
        try {
            showLoader();
            const postData = {
                updatedItems: selectedRowData,
                updated_by: UserDetails.USERID
            };
            const response = await apiPostMethod(`${apiBaseUrl}MarketRateCD/MrtRateController/updateGroceryRates`, postData);
            if (response.data.success === 1) {
                ShowToast("Updated successfully.");
                setModalOpen(false);
                callgetotpdata();
                setTimeout(() => window.location.reload(), 2000);
            } else {
                errorToast(response.data.error || "Update failed.");
            }
        } catch (error) {
            errorToast("Error while saving changes.");
        } finally {
            hideLoader();
        }
    };

    const actionsCol = {
        name: "Actions",
        selector: "Edit",
        minWidth: "120px",
        cell: (row) => (
            <Button.Ripple color="primary" onClick={() => handleView(row)}>
                Edit
            </Button.Ripple>
        ),
    };

    const columns = [...taColumns, actionsCol];

    return (
        <div>
            <Fragment>
                <CardComponent header="Market Rate Entry Screen">
                    <Row>
                        <Col md="4" sm="12">
                            <CustomTextInput
                                label="Date"
                                form={form}
                                id="entry_date"
                                name="entry_date"
                                type="date"
                                disabled
                            />
                        </Col>

                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getGroceriesCategory`}
                                label="Groceries Category"
                                id="GroceriesType"
                                name="GroceriesType"
                                form={form}
                                onChange={(selected) => {
                                    form.setFieldValue("GroceriesType", selected);
                                    if (selected?.value) {
                                        fetchGroceriesTypeData(selected.value);
                                    }
                                }}
                            />
                        </Col>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                                label="State"
                                id="State"
                                name="State"
                                form={form}
                                onChange={(selected) => {
                                    form.setFieldValue("State", selected);
                                    // Clear all district fields when state changes
                                    const updated = [...tableData];
                                    updated.forEach(item => item.district = null);
                                    setTableData(updated);
                                }}
                            />
                        </Col>
                    </Row>

                    {tableData.length > 0 && (
                        <div className="mt-3">
                            <h5>Item Rate Details</h5>
                            <table className="table table-bordered">
                                <thead style={{ background: "#7374f0", color: "white" }}>
                                    <tr>
                                        <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Name</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '10%' }}>Rate (Rupees)</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '12%' }}>UOM</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '12%' }}>Link</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '15%' }}>District</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '15%' }}>City</th>
                                        <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Market Place</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, index) => (
                                        <tr key={index}>
                                            <td><Input value={item.name} disabled /></td>
                                            <td>
                                                <Input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => {
                                                        const updated = [...tableData];
                                                        updated[index].rate = e.target.value;
                                                        setTableData(updated);
                                                    }}
                                                />
                                            </td>
                                            <td><Input value={item.uom} disabled /></td>
                                            <td>
                                                <Input
                                                    type="text"
                                                    value={item.link}
                                                    onChange={(e) => {
                                                        const updated = [...tableData];
                                                        updated[index].link = e.target.value;
                                                        setTableData(updated);
                                                    }}
                                                />
                                            </td>
                                            <td>
                                                <CustomDropdownInput
                                                    url={
                                                        form.values.State?.value
                                                            ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${form.values.State.value}`
                                                            : ""
                                                    }
                                                    form={form}
                                                    id={`district_${index}`}
                                                    value={item.district}
                                                    onChange={(selected) => {
                                                        const updated = [...tableData];
                                                        updated[index].district = selected;
                                                        setTableData(updated);
                                                    }}
                                                    // placeholder={form.values.State?.value ? "Select District" : "Select State First"}
                                                    isDisabled={!form.values.State}
                                                />

                                            </td>
                                            <td>
                                                <CustomDropdownInput
                                                    url={
                                                        item.district?.value
                                                            ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district.value}`
                                                            : ""
                                                    }
                                                    form={form}
                                                    id={`city_${index}`}
                                                    value={item.city}
                                                    onChange={(selected) => {
                                                        const updated = [...tableData];
                                                        updated[index].city = selected;
                                                        setTableData(updated);
                                                    }}
                                                    isDisabled={!item.district?.value}
                                                />
                                            </td>
                                            <td>
                                                <Input
                                                    type="text"
                                                    value={item.market_place}
                                                    onChange={(e) => {
                                                        const updated = [...tableData];
                                                        updated[index].market_place = e.target.value;
                                                        setTableData(updated);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Col sm="12">
                        <FormGroup className="d-flex mb-0 justify-content-end mt-2">
                            <Button.Ripple color="primary" onClick={handlesubmitButtonClick}>
                                Submit
                            </Button.Ripple>
                        </FormGroup>
                    </Col>

                    <HrLine />
                </CardComponent>
            </Fragment>

            <Card>
                <CardHeader>
                    <CardTitle>Market Rate details</CardTitle>
                </CardHeader>
                <CardBody>
                    <TableComponent columns={columns} data={data} />
                </CardBody>
            </Card>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} centered size="xl">
                <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Edit Groceries Rate Details</ModalHeader>
                <ModalBody>
                    {/* STATE DROPDOWN OUTSIDE TABLE */}
                    <div>
                        <Col md="4" sm="12">
                            <CustomDropdownInput
                                url={`${apiBaseUrl}MarketRateCD/MrtRateController/getStates`}
                                label="State"
                                id="modalState"
                                form={form}
                                value={
                                    selectedRowData[0]?.state_id
                                        ? { value: selectedRowData[0].state_id, label: selectedRowData[0].state_name }
                                        : null
                                }
                                onChange={(selected) => {
                                    const updated = selectedRowData.map((item) => ({
                                        ...item,
                                        state_id: selected?.value || null,
                                        state_name: selected?.label || "",
                                        district_id: null,
                                        district_name: ""
                                    }));
                                    setSelectedRowData(updated);
                                }}
                                isClearable
                            />
                        </Col>
                    </div>

                    {/* TABLE STARTS */}
                    <table className="table table-bordered">
                        <thead style={{ background: "#7374f0", color: "white" }}>
                            <tr>
                                <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Name</th>
                                <th style={{ background: "#7374f0", color: "white", width: '10%' }}>Rate (Rupees)</th>
                                <th style={{ background: "#7374f0", color: "white", width: '12%' }}>UOM</th>
                                <th style={{ background: "#7374f0", color: "white", width: '20%' }}>Link</th>
                                <th style={{ background: "#7374f0", color: "white", width: '20%' }}>District</th>
                                <th style={{ background: "#7374f0", color: "white", width: '15%' }}>City</th>
                                <th style={{ background: "#7374f0", color: "white", width: '15%' }}>Market Place</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRowData.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <Input value={item.groceries_name} disabled />
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            value={item.groceries_rate}
                                            onChange={(e) => {
                                                const updated = [...selectedRowData];
                                                updated[index].groceries_rate = e.target.value;
                                                setSelectedRowData(updated);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Input value={item.groceries_uom} disabled />
                                    </td>
                                    <td>
                                        <Input
                                            value={item.groceries_ref_link}
                                            onChange={(e) => {
                                                const updated = [...selectedRowData];
                                                updated[index].groceries_ref_link = e.target.value;
                                                setSelectedRowData(updated);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <CustomDropdownInput
                                            url={
                                                selectedRowData[0]?.state_id
                                                    ? `${apiBaseUrl}MarketRateCD/MrtRateController/getDistrictsByState/${selectedRowData[0].state_id}`
                                                    : ""
                                            }
                                            form={form}
                                            id={`district_${index}`}
                                            value={
                                                item.district_id
                                                    ? { value: item.district_id, label: item.district_name }
                                                    : null
                                            }
                                            onChange={(selected) => {
                                                const updated = [...selectedRowData];
                                                updated[index].district_id = selected?.value || null;
                                                updated[index].district_name = selected?.label || "";
                                                setSelectedRowData(updated);
                                            }}
                                            placeholder={selectedRowData[0]?.state_id ? "Select District" : "Select State First"}
                                            isDisabled={!selectedRowData[0]?.state_id}
                                            isClearable
                                        />
                                    </td>
                                    <td>
                                        <CustomDropdownInput
                                            url={
                                                item.district_id
                                                    ? `${apiBaseUrl}MarketRateCD/MrtRateController/getCitiesByDistrict/${item.district_id}`
                                                    : ""
                                            }
                                            form={form}
                                            id={`modal_city_${index}`}
                                            value={
                                                item.city_id
                                                    ? { value: item.city_id, label: item.city_name }
                                                    : null
                                            }
                                            onChange={(selected) => {
                                                const updated = [...selectedRowData];
                                                updated[index].city_id = selected?.value || null;
                                                updated[index].city_name = selected?.label || "";
                                                setSelectedRowData(updated);
                                            }}
                                            isDisabled={!item.district_id}
                                            isClearable
                                        />
                                    </td>

                                    <td>
                                        <Input
                                            value={item.market_place}
                                            onChange={(e) => {
                                                const updated = [...selectedRowData];
                                                updated[index].market_place = e.target.value;
                                                setSelectedRowData(updated);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="text-end mt-2">
                        <Button.Ripple color="success" onClick={handleSaveModalChanges}>
                            Save Changes
                        </Button.Ripple>
                    </div>
                </ModalBody>
            </Modal>

        </div>
    );
}

export default RMrtRateEntry;
