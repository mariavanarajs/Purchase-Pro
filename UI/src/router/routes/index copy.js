import { lazy } from "react";

// ** Document title
const TemplateTitle = "%s - Purchase Pro";

// ** Default Route
const DefaultRoute = "/";

// ** Merge Routes
const Routes = [
  {
    path: "/login",
    component: lazy(() => import("../../views/Login")),
    layout: "BlankLayout",
  },
    //WARE HOUSE MODULE STARTS 
    {
      path: "/warehouse/masters/state_district",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_state_districtentry")),
    },
    {
      path: "/warehouse/masters/state_district:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_state_districtentry")),
    },
    {
      path: "/warehouse/masters/bank",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_bankentry")),
    },
    {
      path: "/warehouse/masters/bank:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_bankentry")),
    },

/***************************** 08032022   //Master Contract Type
    {
      path: "/warehouse/masters/Master_ngw_contract_typeentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_contract_typeentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_contract_typeentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_contract_typeentry")),
    },
    //Master_ngw_divisionentry
    {
      path: "/warehouse/masters/Master_ngw_divisionentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_divisionentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_divisionentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_divisionentry")),
    },
    //Master_ngw_fumigation_statusentry
    {
      path: "/warehouse/masters/Master_ngw_fumigation_statusentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_statusentry")),
    },
    
    //Master_ngw_fumigation_statusentry
    {
      path: "/warehouse/masters/Master_ngw_fumigation_statusentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_statusentry")),
    },    
    //Master_ngw_reasondeviationentry
    {
      path: "/warehouse/masters/Master_ngw_reasondeviationentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondeviationentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_reasondeviationentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondeviationentry")),
    },    
    //Master_ngw_reasondelayentry
    {
      path: "/warehouse/masters/Master_ngw_reasondelayentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondelayentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_reasondelayentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondelayentry")),
    },
    //Master_ngw_fumigation_type
    {
      path: "/warehouse/masters/Master_ngw_fumigation_typeentry",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_typeentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_fumigation_typeentry:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_typeentry")),
    },
    {
      path: "/warehouse/masters/new_warehouse",
      component: lazy(() => import("../../views/warehouse/masters/Master_new_warehouse_entry")),
    },    {
      path: "/warehouse/masters/new_warehouse:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_new_warehouse_entry")),
    },
    {
      path: "/warehouse/masters/WareHouseRenew:id",
      component: lazy(() => import("../../views/warehouse/masters/WareHouseRenew")),
    },

    // 
    {
      path: "/warehouse/Physicalstockentry",
      component: lazy(() => import("../../views/warehouse/Physicalstockentry")),
    },    {
      path: "/warehouse/Physicalstockentry:id",
      component: lazy(() => import("../../views/warehouse/Physicalstockentry")),
    },
    //
    {
      path: "/warehouse/KeyloanPledgeloanUpdate",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeloanUpdate")),
    },    {
      path: "/warehouse/masters/KeyloanPledgeloanUpdate:id",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeloanUpdate")),
    },
    //
    {
      path: "/warehouse/Warehousebagcuttingreport",
      component: lazy(() => import("../../views/warehouse/Warehousebagcuttingreport")),
    },    {
      path: "/warehouse/masters/Warehousebagcuttingreport:id",
      component: lazy(() => import("../../views/warehouse/Warehousebagcuttingreport")),
    },
    //
    {
      path: "/warehouse/KeyloanPledgeEntryScreen",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeEntryScreen")),
    },    {
      path: "/warehouse/masters/KeyloanPledgeEntryScreen:id",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeEntryScreen")),
    },

    {
      path: "/warehouse/KeyloanPledgeDOReleaseReport",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeDOReleaseReport")),
    },    {
      path: "/warehouse/masters/KeyloanPledgeDOReleaseReport:id",
      component: lazy(() => import("../../views/warehouse/KeyloanPledgeDOReleaseReport")),
    },
    {
      path: "/warehouse/DegassingConfirmationQcTeam",
      component: lazy(() => import("../../views/warehouse/DegassingConfirmationQcTeam")),
    },    {
      path: "/warehouse/masters/DegassingConfirmationQcTeam:id",
      component: lazy(() => import("../../views/warehouse/DegassingConfirmationQcTeam")),
    },
    {
      path: "/warehouse/FumigationEntrylistScreen",
      component: lazy(() => import("../../views/warehouse/FumigationEntrylistScreen")),
    },    {
      path: "/warehouse/masters/FumigationEntrylistScreen:id",
      component: lazy(() => import("../../views/warehouse/FumigationEntrylistScreen")),
    },************* 08032022 **/
    {
      path: "/warehouse/FumigationSkipscreen",
      component: lazy(() => import("../../views/warehouse/FumigationSkipscreen")),
    },
    /* 08022022 
    {
      path: "/warehouse/PhysicalStocktakingReport",
      component: lazy(() => import("../../views/warehouse/PhysicalStocktakingReport")),
    },
    {
      path: "/warehouse/masters/PhysicalStocktakingReport:id",
      component: lazy(() => import("../../views/warehouse/PhysicalStocktakingReport")),
    },
    {
      path: "/warehouse/PhysicalStockValidation",
      component: lazy(() => import("../../views/warehouse/PhysicalStockValidation")),
    },    {
      path: "/warehouse/masters/PhysicalStockValidation:id",
      component: lazy(() => import("../../views/warehouse/PhysicalStockValidation")),
    },
    {
      path: "/warehouse/BagCuttingApproval",
      component: lazy(() => import("../../views/warehouse/BagcuttingApprovalscreen")),
    }, 
    {
      path: "/warehouse/BagcuttingConfirmation",
      component: lazy(() => import("../../views/warehouse/BagcuttingConfirmation")),
    }, 
    {
      path: "/warehouse/Bagcuttingreport",
      component: lazy(() => import("../../views/warehouse/Bagcuttingreport")),
    }, 
    {
      path: "/warehouse/masters/rndlotconversion",
      component: lazy(() => import("../../views/warehouse/masters/Master_rndlotconversionform")),
    },    {
      path: "/warehouse/masters/rndlotconversion:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_rndlotconversionform")),
    },
    {
      path: "/warehouse/RndConversionEntry",
      component: lazy(() => import("../../views/warehouse/RndConversionEntry")),
    }, 
    {
      path: "/warehouse/RndConversionEntryView/:pwarehouseid?/:pplantid?/:plotid?/:psublotid?/:pwheatvarietyid?",
      component: lazy(() => import("../../views/warehouse/RndConversionEntryView")),
    }, 
    {
      path: "/warehouse/RndConvertedStockViewSummary",
      component: lazy(() => import("../../views/warehouse/RndConvertedStockViewSummary")),
    }, 
    {
      path: "/warehouse/RndConvertedStockView:id",
      component: lazy(() => import("../../views/warehouse/RndConvertedStockView")),
    }, 
    {
      path: "/warehouse/RndConvertedStockLineItemView",
      component: lazy(() => import("../../views/warehouse/RndConvertedStockLineItemView")),
    }, 

    //**** Changed By Prakash On 05-01-2022 

    {
      path: "/warehouse/FumigationStatusLineItemView",
      component: lazy(() => import("../../views/warehouse/FumigationStatusLineItemView")),
    },
    {
      path: "/warehouse/InventoryAdjustmentEntry",
      component: lazy(() => import("../../views/warehouse/InventoryAdjustmentEntry")),
    },
    {
      path: "/warehouse/InventoryAdjustmentReport",
      component: lazy(() => import("../../views/warehouse/InventoryAdjustmentReport")),
    },
    {
      path: "/warehouse/R_and_D_Lot_converted_stock_Line_item",
      component: lazy(() => import("../../views/warehouse/R_and_D_Lot_converted_stock_Line_item")),
    },
    {
      path: "/warehouse/R_and_D_LotConvertedStock",
      component: lazy(() => import("../../views/warehouse/R_and_D_LotConvertedStock")),
    },
    {
      path: "/warehouse/RelottingRequest",
      component: lazy(() => import("../../views/warehouse/RelottingRequest")),
    },
    {
      path: "/warehouse/RelottingRequest:id",
      component: lazy(() => import("../../views/warehouse/RelottingRequest")),
    },
    {
      path: "/warehouse/RelottingQcValidation",
      component: lazy(() => import("../../views/warehouse/RelottingQcValidation")),
    },
    {
      path: "/warehouse/ViewRelottingQcValidation:id",
      component: lazy(() => import("../../views/warehouse/RelottingQcValidationView")),
    },
    {
      path: "/warehouse/RelottingEntry",
      component: lazy(() => import("../../views/warehouse/RelottingEntrySummary")),
    },
    {
      path: "/warehouse/RelottingEntryScreen:id",
      component: lazy(() => import("../../views/warehouse/RelottingEntryScreen")),
    },
    {
      path: "/warehouse/RelottingApproval",
      component: lazy(() => import("../../views/warehouse/RelottingApprovalSummary")),
    },
    {
      path: "/warehouse/RelottingApprovalScreen:id",
      component: lazy(() => import("../../views/warehouse/RelottingApprovalScreen")),
    },
    {
      path: "/warehouse/TargetVsActual",
      component: lazy(() => import("../../views/warehouse/TargetVsActual")),
    },
    {
      path: "/warehouse/WMinventoryAdjustmentAccountApproval",
      component: lazy(() => import("../../views/warehouse/WMinventoryAdjustmentAccountApproval")),
    },

    //**** Added By prakash on 06-01-2022 ***
    {
      path: "/warehouse/InventoryAdjustmentApproval",
      component: lazy(() => import("../../views/warehouse/InventoryAdjustmentApproval")),
    },
    {
      path: "/warehouse/KeyloanDOReleaseEntry",
      component: lazy(() => import("../../views/warehouse/KeyloanDOReleaseEntry")),
    },
    {
      path: "/warehouse/WarehouseRentalCalculation",
      component: lazy(() => import("../../views/warehouse/WarehouseRentalCalculation")),
    },
    {
      path: "/warehouse/WHLotCapacity",
      component: lazy(() => import("../../views/warehouse/WHLotCapacity")),
    },
    {
      path: "/warehouse/WHApproval:id",
      component: lazy(() => import("../../views/warehouse/WarehouseApproval")),
    },
    {
      path: "/warehouse/WarehouseCreationCommercialTeam",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialTeam")),
    },
    {
      path: "/warehouse/WarehouseCreationCommercialTeam:id",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialTeam")),
    },    
    {
      path: "/warehouse/WarehouseCreationqualityTeam",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityTeam")),
    },
    {
      path: "/warehouse/WarehouseCreationqualityTeam:id",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityTeam")),
    },
        {
      path: "/warehouse/WarehouseDashBoard",
      component: lazy(() => import("../../views/warehouse/WarehouseDashBoard")),
    },
    {
      path: "/warehouse/WarehouseLotInformation",
      component: lazy(() => import("../../views/warehouse/WarehouseLotInformation")),
    },
    {
      path: "/warehouse/WarehouseLotInformation:id",
      component: lazy(() => import("../../views/warehouse/WarehouseLotInformation")),
    },
    {
      path: "/warehouse/wclbh",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationBHList")),
    },
    {
      path: "/warehouse/wclwmmgr",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationWMMgrList")),
    },
    {
      path: "/warehouse/wclwmmgrapprove:id",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationWMMgrApproval")),
    },
    {
      path: "/warehouse/wclqc",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationQCList")),
    },
    {
      path: "/warehouse/wclqcmgr",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationQCMgrList")),
    },
    {
      path: "/warehouse/wclqcmgrapprove:id",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityMgr")),
    },   
    {
      path: "/warehouse/wclwm",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationWMList")),
    }, 
    {
      path: "/warehouse/wcllotmgrlist",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationWMLotMgrList")),
    },
    {
      path: "/warehouse/wcllotmgrapprove:id",
      component: lazy(() => import("../../views/warehouse/WarehouseLotInformationMgrApprove")),
    },
    {
      path: "/warehouse/viewwcllotmgrapprove:id",
      component: lazy(() => import("../../views/warehouse/WarehouseLotInformationView")),
    },
    
    {
      path: "/warehouse/wclcomm",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialList")),
    },
    {
      path: "/warehouse/wclcommmgr",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialMgrList")),
    },
    {
      path: "/warehouse/wclcommmgrapprove:id",
      component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialMgr")),
    },

    {
      path: "/WMView:id/:fromPage?",
      component: lazy(() => import("../../views/warehouse/WarehouseWMApprovalView")),
    },
    {
      path: "/WHQCView:id/:fromPage?",
      component: lazy(() => import("../../views/warehouse/WarehouseWMQCView")),
    },
    {
      path: "/AllView:id/:fromPage?",
      component: lazy(() => import("../../views/warehouse/WarehouseWMAllView")),
    },
    {
      path: "/ViewWMComm:id/:fromPage?",
      component: lazy(() => import("../../views/warehouse/WarehouseWMCommercialView")),
    },
    {
      path: "/warehouse/WMInventoryAdjustmentEntry",
      component: lazy(() => import("../../views/warehouse/WMInventoryAdjustmentEntry")),
    }, {
      path: "/warehouse/WMinventoryAdjustmentApproval",
      component: lazy(() => import("../../views/warehouse/WMinventoryAdjustmentApproval")),
    },
    {
      path: "/warehouse/RelottingRequest",
      component: lazy(() => import("../../views/warehouse/RelottingEntry")),
    },
    {
      path: "/warehouse/RelottingQcValidation",
      component: lazy(() => import("../../views/warehouse/RelottingQcValidation")),
    },
    {
      path: "/warehouse/ViewRelottingQcValidation:id",
      component: lazy(() => import("../../views/warehouse/RelottingQcValidationView")),
    },
    {
      path: "/warehouse/UnloadingCompletionEntry",
      component: lazy(() => import("../../views/warehouse/UnloadingCompletionEntry")),
    },
     {
      path: "/warehouse/FumigationEntryList",
      component: lazy(() => import("../../views/warehouse/FumigationEntryList")),
    },
    {
      path: "/warehouse/FumigationTeam:id",
      component: lazy(() => import("../../views/warehouse/FumigationTeam")),
    },
    {
      path: "/warehouse/ForceFumigationTeam:id",
      component: lazy(() => import("../../views/warehouse/ForceFumigationTeam")),
    },
    {
      path: "/warehouse/FumigationQCTeam:id",
      component: lazy(() => import("../../views/warehouse/FumigationQCTeam")),
    },
    {
      path: "/warehouse/FumigationViewHistory:id",
      component: lazy(() => import("../../views/warehouse/FumigationViewHistory")),
    },
    {
      path: "/warehouse/FumigationStatusView",
      component: lazy(() => import("../../views/warehouse/FumigationStatusView")),
    },
    {
      path: "/warehouse/WarehousewiseStockDetails",
      component: lazy(() => import("../../views/warehouse/WarehousewiseStockDetails")),
    },
    {
      path: "/warehouse/STOPODeliveryCreation",
      component: lazy(() => import("../../views/warehouse/STOPODeliveryCreation")),
    },
    {
      path: "/warehouse/stopodeliverycreationadd",
      component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationEdit")),
    },
    {
      path: "/warehouse/stopodeliverycreationedit/:id",
      component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationEdit")),
    },
    {
      path: "/warehouse/stopodeliverycreationapprovaledit/:id",
      component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationApprovalEdit")),
    },
    {
      path: "/warehouse/STOPODeliveryCreationApproval",
      component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationApproval")),
    },

    {
      path: "/warehouse/masters/bag",
      component: lazy(() => import("../../views/warehouse/masters/Masterbagentry")),
    },
     {
      path: "/warehouse/masters/bag:id",
      component: lazy(() => import("../../views/warehouse/masters/Masterbagentry")),
    },
    {
      path: "/warehouse/masters/Master_ngw_Relotreason",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_Relotreasonentry")),
    },

      {
      path: "/warehouse/masters/Master_ngw_Relotreason:id",
      component: lazy(() => import("../../views/warehouse/masters/Master_ngw_Relotreasonentry")),
    },

  
 
//Testing PP
    {
      path: "/IASSWI",
      component: lazy(() => import("../../views/IAS/sending/ias-warehouse-incharge-page")),
    },
    {
      path: "/ias/:action/:location/:type/:emptyArrivalId/:fromPage?/:receivingArrivalId?",
      component: lazy(() => import("../../views/IAS/sending/gate-out/ias-sending-receiving")),
    },
    {
      path: "/STMWeightEntry",
      component: lazy(() => import("../../views/STM/STMWeightEntry")),
    },
    {
      path: "/STMWeightEntryDetails/:id?/:purchaseid?/:mode?",
      component: lazy(() => import("../../views/STM/STMWeightEntryDetails")),
    },
    {
      path: "/EVADPTruck",
      component: lazy(() => import("../../views/IAS/sending/empty-vehicle-arrival/ias-empty-truck-arrival")),
    },
***************** 08032022 ***/   

    /*{
      path: "/warehouse/BagCuttingReportForm",
      component: lazy(() => import("../../views/warehouse/BagCuttingReportForm")),
    },    {
      path: "/warehouse/masters/BagCuttingReportForm:id",
      component: lazy(() => import("../../views/warehouse/BagCuttingReportForm")),
    },*/
    /*{
      path: "/warehouse/RelottingApproval",
      component: lazy(() => import("../../views/warehouse/RelottingApproval")),
    },
   
    {
      path: "/warehouse/RelottingQcValidation",
      component: lazy(() => import("../../views/warehouse/RelottingQcValidation")),
    },
    {
      path: "/warehouse/RelottingRequest",
      component: lazy(() => import("../../views/warehouse/RelottingRequest")),
    },
    
    */
    
];

export { DefaultRoute, TemplateTitle, Routes };
