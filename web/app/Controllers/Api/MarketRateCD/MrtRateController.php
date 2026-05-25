<?php

namespace App\Controllers\Api\MarketRateCD;
use App\Controllers\Api\BaseApiController;

use App\Models\MarketRateCD\MrtRateModel;

class MrtRateController extends BaseApiController
{

    public function InsertMrtRateMasterdetails()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $groceries_type = $postData->customGroceriesType;
        $existingEntry = $model->getcountGroceriesTypemaster($groceries_type);

        if ($existingEntry != '') {
            return $this->sendErrorResult("Rate for this Groceries already exists.");
        }
        //print_r($postData);exit;

        // Insert new record
        $res = $model->InsertMrtRateMasterdetails($postData);

        return $this->sendSuccessResult($res);
    } 
    public function saveGrocerydetails()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $groceries_type = $postData->customGroceriesItem;
        $existingEntry = $model->getcountGroceriesnamemaster($groceries_type);

        if ($existingEntry != '') {
            return $this->sendErrorResult("Rate for this Groceries already exists.");
        }
        //print_r($postData);exit;

        // Insert new record
        $res = $model->saveGrocerydetails($postData);

        return $this->sendSuccessResult($res);
    }
    public function getGroceriesCategory()
    {

        $model = new MrtRateModel();
        $res = $model->getGroceriesCategory();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getStates()
    {

        $model = new MrtRateModel();
        $res = $model->getStates();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getDistrictsByState($stateid = null)
    {

        // print_r($stateid);exit;
        $model = new MrtRateModel();
        $res = $model->getDistricts($stateid);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getCitiesByDistrict($districtid = null)
    {

        // print_r($districtid);exit;
        $model = new MrtRateModel();
        $res = $model->getCitiesByDistrict($districtid);
        // print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getGrocerieslist()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $movementtype = $postData->movement_type;
        $model = new MrtRateModel();
        $res = $model->getGrocerieslist($movementtype);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function InsertMrtRatedetails()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        // Extract necessary fields
        $GroceriesType = $postData->groceries_type;
        $entryDate = $postData->entry_date;

        // Extract item_city from the first table item
        $itemCity = isset($postData->tableItems[0]->item_city) ? $postData->tableItems[0]->item_city : null;

        // Load model
        $model = new MrtRateModel();

        // Check if already exists (pass all required parameters)
        $existingEntry = $model->getcountGroceriesType($GroceriesType, $entryDate, $itemCity);

        if ($existingEntry != '') {
            return $this->sendErrorResult("Rate for this Groceries already exists.");
        }

        // Insert new record
        $res = $model->InsertMrtRatedetails($postData);

        return $this->sendSuccessResult($res);
    }

    public function getmarketratedetails($date = null)
    {
        $model = new MrtRateModel();
        $res = $model->getmarketratedetails($date);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getmarketratemasterdetails()
    {
        $model = new MrtRateModel();
        $res = $model->getmarketratemasterdetails();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
     public function getmarketratemasteritems()
    {
        $postData = $this->request->getJSON();
        $model = new MrtRateModel();
        $res = $model->getmarketratemasteritems($postData->mr_id);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getmarketratedetailsforview()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $model = new MrtRateModel();
        $res = $model->getmarketratedetailsforview($postData);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    } 
    public function getmarketratedetailsbyid()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit;
        $model = new MrtRateModel();
        $res = $model->getmarketratedetailsbyid($postData->groceries_type);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function updateMrtRateMasterdetails()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterdetails($postData);

        return $this->sendSuccessResult($res);
    } 
public function updateMrtRateMasterdetailsbyid()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterdetailsbyid($postData);

        return $this->sendSuccessResult($res);
    } 
    public function updateMrtRateMasterGroceriesItem()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();

        $res = $model->updateMrtRateMasterGroceriesItem($postData);

        return $this->sendSuccessResult($res);
    }
    public function updateGroceryRates()
    {
        $postData = $this->request->getJSON();
        //print_r($postData);exit();  
        $model = new MrtRateModel();
        $res = $model->updateGroceryRates($postData);
        return $this->sendSuccessResult($res);
    }

    public function getlistoftGroceries()
    {

        $model = new MrtRateModel();
        $res = $model->getlistoftGroceries();
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }

    public function getSubGroceriesById()
    {
        $postData = $this->request->getJSON();
        $Typeid = $postData->groceries_id;
        // print_r($postData);exit;

        $model = new MrtRateModel();
        $res = $model->getSubGroceriesById($Typeid);
        //print_r($res);exit;

        return $this->sendSuccessResult($res);
        ;
    }
    public function getlistofsubcatogry()
    {

        $postData = $this->request->getJSON();
        // print_r($postData);exit;
        $subTypeid = $postData->subCategoryId;
        $todate = $postData->toDate;
        $fromdate = $postData->fromDate;
        $state = $postData->stateId;
        $district = $postData->districtId;


        $model = new MrtRateModel();
        $res = $model->getlistofsubcatogry($subTypeid, $todate, $fromdate, $state, $district);
        // print_r($res);
        // exit;

        return $this->sendSuccessResult($res);
        ;
    }
}