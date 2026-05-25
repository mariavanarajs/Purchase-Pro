<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Models\Warehouse\InventoryAdjustmentModel;
use App\Models\Warehouse\ReportsModel;
use App\Helpers\SapUrlHelper;


class Reports extends BaseApiController
{

  public function getBagCuttingReport()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();
    $res = $model->getBagCuttingReport($postData->lotid, $postData->WheatVarietyId, $postData->whId, $postData->plantid);
    return  $this->sendSuccessResult($res);
  }

  public function getfumigationlist()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();
    $res = $model->getfumigationlist($postData);
    return  $this->respond([
      "results" => $res,


      "success" => 1
    ]);
  }

  public function getSublotlist()
  {
    $postData = $this->request->getJSON();
    $model = new ReportsModel();
    //Update Next Fumigation Date
    $res = $model->getSublotlist($postData);
    return  $this->respond([
      "results" => $res,
      "success" => 1
    ]);
  }

  public function getWhReport()
  {
    $postData = $this->request->getJSON();
    if (!$postData || !isset($postData->Data)) {
      return $this->sendErrorResult('Data required');
    }
    $data = $postData->Data;
    $warehouseid = is_object($data->warehouseid ?? null) ? ($data->warehouseid->value ?? null) : ($data->warehouseid ?? null);
    $WHCODE = !empty($warehouseid) ? $warehouseid : 'W01';
    $plantId = is_object($data->plantId ?? null) ? ($data->plantId->label ?? '') : ($data->plantId ?? '');
    $locationId = is_object($data->storagelocationid ?? null) ? ($data->storagelocationid->label ?? '') : ($data->storagelocationid ?? '');
    $lotId = is_object($data->lotid ?? null) ? ($data->lotid->label ?? '') : ($data->lotid ?? '');
    $urlPath = "zwh_stocks/stock?sap-client=900&Warehouse_code=" . urlencode($WHCODE) . "&Plant=" . urlencode($plantId) . "&Stoage_Location=" . urlencode($locationId) . "&Lot=" . urlencode($lotId);
    try {
      $sapHelper = new SapUrlHelper();
      $sapResult = $sapHelper->getWhDatas($urlPath);
      $decoded = is_string($sapResult) ? json_decode($sapResult, true) : $sapResult;
      if (json_last_error() === JSON_ERROR_NONE && $decoded !== null) {
        return $this->respond($decoded);
      }
      return $this->respond($sapResult);
    } catch (\Throwable $e) {
      log_message('error', 'getWhReport: ' . $e->getMessage());
      return $this->sendErrorResult('Report failed: ' . $e->getMessage());
    }
  }
  public function getPictorialView(){
    $postData = $this->request->getJSON();
    $model = new ReportsModel();
    //Update Next Fumigation Date
    $res = $model->getPictorialViewLot($postData);

    $Array = array();
    $total = count($res);
    $TotRow = ceil($total / 5);
    $Start = 0;
    $Len = 5;

    $MaxRow = $model->getTotalRows($postData);
    $TotRow = $MaxRow[0]['TotalRow'];
    $MaximunCol = 0;

    for ($i = 0; $i < $TotRow; $i++) {
      $R = $i + 1;
      $Row = $model->getPictorialViewLot_Limit($postData, $R);

      $WarehouseDet = $model->getWarehouseDet($postData);
      $WalkwayAfterColumn = $WarehouseDet[0]['WalkwayAfterColumn'];
      //exit();

      $RowMaxColumnArray = $model->getMaxColumn($postData, $R);
      $RowMaxColumn = $RowMaxColumnArray[0]['MaxColumn'];
      if ($MaximunCol < $RowMaxColumn) {
        $MaximunCol = $RowMaxColumn;
      }
      $Array[$i] = $Row;
      $Start = $Start + 5;
    }
    //exit();
    $res1 = $model->getPictorialViewSubLot($postData);
    //  var_dump($postData->Data->warehouseid->value); exit();
    if ($postData->Data->warehouseid->value != null) {
      return  $this->respond([
        "results" => $Array,
        "Sublot" => $res1,
        "MaximumColumn" => $MaximunCol,
        "WalkwayAfterColumn" => $WalkwayAfterColumn,
        "TotRow" => $TotRow,
        "success" => 1
      ]);
    }
    // echo "Test";exit();
  }
  public function wmTargetVsActual()
  {
    $postData = $this->request->getJSON();

    $model = new ReportsModel();

    $res = $model->getPlanVsTarget($postData);

    $Dates = $model->getPlanVsTargetDates($postData);

    $ActualData = $model->getPlanVsTargetDetails($postData, $Dates);

    return  $this->respond([
      "results" => $res,
      "ActualData" => $ActualData,
      "Dates" => $Dates,
      "success" => 1
    ]);
  }
}
