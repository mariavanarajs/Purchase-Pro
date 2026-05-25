<?php

namespace App\Controllers\Api\Warehouse;

use App\Controllers\Api\BaseApiController;
use App\Helpers\SapUrlHelper;
use App\Models\Warehouse\RelotModel;
use App\Models\Warehouse\MasterModel;

class Relot extends BaseApiController
{
  
  public function updateRelot(){
    $postData = $this->request->getJSON();
    $session = session();
    $SessionUser=$_SESSION["USERID"];
    $CurrentDateTime=date("Y-m-d H:i:s");

    $model = new RelotModel();
    $Data=$postData->Data;
   // var_dump($Data);exit();
    if($postData->ScreenType=="QCVALIDATION"){
      $Data->qcrelotby=$SessionUser;
      $Data->qcrelotdate=$CurrentDateTime;
    }

    if($postData->ScreenType=="RETLOTENTRY"){
      $Data->wirelotby=$SessionUser;
      $Data->wirelotdate=$CurrentDateTime;
    }

    if($postData->ScreenType=="RETLOTAPPROVAL"){
      $Data->wmrelotby=$SessionUser;
      $Data->wmrelotdate=$CurrentDateTime;
    }
    //var_dump($Data);exit();

    $res = $model->updateRelot($postData->id,$Data);

    if($postData->ScreenType=="RETLOTAPPROVAL"){
      
      $res = $model->getRelotDetails($postData->id);
      //$modelMaster = new MasterModel();
      //$FromLotInfo = $modelMaster->getLotInformation($res[0]['fromlotid'], $res[0]['WheatVarietyId']);
      //$ToLotInfo = $modelMaster->getLotInformation($res[0]['tolotid'],$res[0]['WheatVarietyId']);
      //echo $res[0]['fromlotid']." ".$res[0]['QtyInMTS']." " .$res[0]['tolotid'];
      $tolotid = $res[0]['tolotid'];
      $QtyInMTS = $res[0]['QtyInMTS'];
      $WheatVarietyId = $res[0]['WheatVarietyId'];
      
      $res=$model->updateSublot($res[0]['fromlotid'],$WheatVarietyId,($res[0]['QtyInMTS']*-1));
      $res=$model->updateSublot($tolotid,$WheatVarietyId, $QtyInMTS);
     }

    return  $this->sendSuccessResult($res);
  }

  public function getRelotDetails(){
    $postData = $this->request->getJSON();
    
    $model = new RelotModel();
    $res = $model->getRelotDetails($postData->id);

    $model = new MasterModel();
    $FromLotInfo = $model->getLotInformation($res[0]['fromlotid'], $res[0]['WheatVarietyId']);
    $ToLotInfo = $model->getLotInformation($res[0]['tolotid'],$res[0]['WheatVarietyId']);

   // $PlantList = $model->getWHplantList($res[0]['fromwarehouseid']);
   // $LotList = $model->getWHLotList($res[0]['fromplantid']);
   // $WheatList = $model->getWHWheatvarietyList($res[0]['fromlotid']);


    return  $this->respond(["results" => $res,
    "FromLotInfo"=>$FromLotInfo,
    "ToLotInfo"=>$ToLotInfo,
   
    "success"=>1]);
  }
  public function getRelotReportlist(){
    $postData = $this->request->getJSON();
    
    $model = new RelotModel();
    //var_dump($postData);
    $res = $model->getRelotReportlist($postData->Data->warehouseid->value, $postData->Data->plantid->value, $postData->Data->lotid->value, $postData->Data->fromdate, $postData->Data->todate);
    $total =  sizeof($res);
    //return  $this->respond(["success"=>1,"results" => $res]);
    return json_encode(["success" => 1, "results" => $res, "count" => $total]);
  }
  
   public function SAP_Lotwise_StockDetails()
    {
      $postData = $this->request->getJSON();
      if (!$postData) {
        return $this->response->setStatusCode(400)->setJSON(['success' => 0, 'message' => 'Invalid or missing JSON body']);
      }

      $WHCODE = $postData->warehouseid ?? '';
      $plantId = $postData->plantId ?? '';
      $locationId = $postData->storagelocationid ?? '';
      $lotId = $postData->lotId ?? '';
      $wheat = $postData->WheatVariety ?? '';

      $model = new RelotModel();

      if ($WHCODE !== '') {
        $res = $model->getWhcodeId($WHCODE);
        if (!empty($res) && isset($res[0]['WH_CODE'])) {
          $WHCODE = $res[0]['WH_CODE'];
        }
      }
      if ($plantId !== '') {
        $res = $model->getPlantId($plantId);
        if (!empty($res) && isset($res[0]['WERKS'])) {
          $plantId = $res[0]['WERKS'];
        }
      }

      $urlPath = "zwh_stocks/stock?sap-client=900&Warehouse_code=" . urlencode($WHCODE) . "&Plant=" . urlencode($plantId) . "&Stoage_Location=" . urlencode($locationId) . "&Lot=" . urlencode($lotId) . "&Segment=" . urlencode($wheat);
      $sapResult = SapUrlHelper::getWhDatas($urlPath);

      $sapResultArray = is_string($sapResult) ? json_decode($sapResult, true) : $sapResult;
      if (!is_array($sapResultArray)) {
        $sapResultArray = [];
      }

      if ($wheat !== '' && empty($sapResultArray[0]['WAREHOUSE_CODE'])) {
        $urlPath = "zwh_stocks/stock?sap-client=900&Warehouse_code=" . urlencode($WHCODE) . "&Plant=" . urlencode($plantId) . "&Stoage_Location=" . urlencode($locationId) . "&Lot=" . urlencode($lotId) . "&Segment=";
        $sapResult = SapUrlHelper::getWhDatas($urlPath);
        $sapResultArray = is_string($sapResult) ? json_decode($sapResult, true) : $sapResult;
        if (!is_array($sapResultArray)) {
          $sapResultArray = [];
        }
        if (!empty($sapResultArray) && $wheat !== '') {
          $filteredData = array_filter($sapResultArray, function ($item) use ($wheat) {
            return isset($item['SEGMENT']) && stripos($item['SEGMENT'], $wheat) !== false;
          });
          $finalResult = !empty($filteredData) ? array_values($filteredData) : $sapResultArray;
          $sapResult = json_encode($finalResult);
        }
      } else {
        $sapResult = is_string($sapResult) ? $sapResult : json_encode($sapResultArray);
      }

      $results = is_string($sapResult) ? json_decode($sapResult) : $sapResult;
      if ($results === null) {
        $results = [];
      }
      return $this->response->setJSON(['success' => 1, 'results' => $results]);
    } 
}
