<?php

namespace App\Controllers\Api\Cron;

use App\Controllers\BaseController;
use App\Models\CourierModel;
use CodeIgniter\I18n\Time;
use DateTime;

class VehiclePendingListController extends BaseController
{
    public function VehiclePendingList()
    {
        include_once APIPATH . "/db_connection.php";
        
        $usqls = "SELECT *
        FROM gate_entry_pending_automail
        WHERE status = 1 AND type = 1
        GROUP BY id";
        $result = mysqli_query($connect, $usqls);

        $results2 = [];  
        while ($row = mysqli_fetch_assoc($result)) {
            $results2[] = $row;
        }  
        foreach ($results2 as $details) {
            
            $to_mail = [];
            $cc_mail = [];
            $bcc_mail = [];
            $plant_id = [];

         
            $to_mail = array_merge($to_mail, explode(',', $details['to_mail']));
            $cc_mail = array_merge($cc_mail, explode(',', $details['cc_mail']));
            $bcc_mail = array_merge($bcc_mail, explode(',', $details['bcc_mail']));
            $plant_id[] = $details['plant_id'];

            $to_mail = array_unique($to_mail);
            $cc_mail = array_unique($cc_mail);
            $bcc_mail = array_unique($bcc_mail);
            


                $usqls3 = "SELECT 
                gi.id,gi.userGateId,gi.vehicleNo,gi.vaNumber,gi.masterPlantId,gi.createdBy,CONCAT(mp.WERKS, '-', mp.PLANT_NAME) AS PlantDetails,gi.createdOn, CONCAT(
                TIMESTAMPDIFF(MONTH, gi.createdOn, NOW()), ' Months ', 
                MOD(TIMESTAMPDIFF(DAY, gi.createdOn, NOW()), 30), ' Days ',  -- Days (using MOD to get the remaining days after months)
                MOD(TIMESTAMPDIFF(HOUR, gi.createdOn, NOW()), 24), ' Hr ',  -- Hours (using MOD to get the remaining hours after days)
                MOD(TIMESTAMPDIFF(MINUTE, gi.createdOn, NOW()), 60), ' Mins'  -- Minutes (using MOD to get the remaining minutes after hours)
                ) AS Duration,
                mm.moduleType,
                mt.movementType,
                ui.FIRST_NAME,
                lui.FIRST_NAME as Person,
                wui.FIRST_NAME as Weighment,
                gi.moduleStatusId,
                ms.statusName,
                DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS createdOn
                FROM gate_in_out_info gi
                JOIN master_plant mp ON gi.masterPlantId=mp.ID 
                JOIN master_module mm ON gi.moduleType=mm.id
                JOIN movement_type mt ON gi.movementType=mt.id
                JOIN user_info ui ON gi.createdBy=ui.UI_ID
                JOIN module_status ms ON gi.waitingAt=ms.id
                LEFT JOIN loading_unloading_info li ON gi.loadingUnloadingInfoId=li.id
                LEFT JOIN user_info lui ON li.createdBy=lui.UI_ID
                LEFT JOIN weighment_info wi ON gi.id=wi.gateInOutInfoId
                LEFT JOIN user_info wui ON wi.createdBy=wui.UI_ID
                WHERE gi.moduleStatusId NOT IN(5,7,10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY gi.id";
                $result1 = mysqli_query($connect, $usqls3);
                $results = [];
                while ($row = mysqli_fetch_assoc($result1)) {
                    if($row['moduleStatusId'] == 0){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 1){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 2){
                        $row['contact_person']=$row['Weighment'];
                    }else if($row['moduleStatusId'] == 3 && isset($row['Person'])){
                        $row['contact_person']=$row['Person'];
                    }else if($row['moduleStatusId'] == 3){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 4){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }else if($row['moduleStatusId'] == 12){
                        $row['contact_person']=$row['FIRST_NAME'];
                    }
                    $results[] = $row;
                }

                $counts_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.masterPlantId IN ($plant_id[0])
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                ";

                $counts_result = mysqli_query($connect, $counts_sql);

                $count_data = [
                    'general' => [],
                    'status_5_10' => [],
                    'status_7' => [],
                    'pending' => []
                ];

                while ($row = mysqli_fetch_assoc($counts_result)) {
                    $count_data['general'][$row['period']][] = $row;
                }

                $counts_status_5_10_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (5, 10) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $counts_status_5_10_result = mysqli_query($connect, $counts_status_5_10_sql);

                while ($row = mysqli_fetch_assoc($counts_status_5_10_result)) {
                    $count_data['status_5_10'][$row['period']] = $row; // Store counts by period
                }

                $counts_status_7_sql = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (7) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $counts_status_7_result = mysqli_query($connect, $counts_status_7_sql);

                // Process counts for status 7
                while ($row = mysqli_fetch_assoc($counts_status_7_result)) {
                    $count_data['status_7'][$row['period']] = $row; // Store counts by period
                }
                $pending_count = "
                SELECT 'day' AS period, DATE_FORMAT(gi.createdOn, '%d-%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE DATE(gi.createdOn) = CURDATE() - INTERVAL 1 DAY AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, DATE_FORMAT(gi.createdOn, '%m-%Y') AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE (YEAR(gi.createdOn) = YEAR(CURDATE()) AND MONTH(gi.createdOn) = MONTH(CURDATE()) - 1 AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0]))
                OR (MONTH(CURDATE()) = 1 AND YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND MONTH(gi.createdOn) = 12 AND gi.masterPlantId IN ($plant_id[0]))
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, CONCAT(YEAR(gi.createdOn), '-W', WEEK(gi.createdOn, 1)) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE gi.createdOn >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY) 
                AND gi.createdOn < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY) 
                AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, YEAR(gi.createdOn) AS date_or_month, COUNT(*) AS count 
                FROM gate_in_out_info gi 
                WHERE YEAR(gi.createdOn) = YEAR(CURDATE()) - 1 AND gi.moduleStatusId IN (0, 1, 2, 3, 4, 12) AND gi.masterPlantId IN ($plant_id[0])
                GROUP BY date_or_month        
                ";

                $pending_count = mysqli_query($connect, $pending_count);

                // Process counts for status 7
                while ($row = mysqli_fetch_assoc($pending_count)) {
                    $count_data['pending'][$row['period']] = $row; // Store counts by period
                }
                $merged_data = [];

                $general = $count_data['general'];
                $status_5_10[] = $count_data['status_5_10'];
                $status_7[] = $count_data['status_7'];
                $pending[]= $count_data['pending'];      
                $merged_data = [];
                $periods = ['day', 'current_week','last_week', 'current_month','last_month', 'year', 'last_year'];

                    foreach ($periods as $period) {
                        // Initialize an array to store the merged data for the current period
                        $merged_row = [
                            'period' => ucfirst($period), // Capitalize the period name
                            'date_or_month' => '',
                            'general_count' => 0,
                            'status_5_10_count' => 0,
                            'status_7_count' => 0,
                            'pending_count' => 0
                        ];
                        
                        if (isset($count_data['general'][$period])) {
                            $merged_row['general_count'] = $count_data['general'][$period][0]['count'];
                            $merged_row['date_or_month'] = $count_data['general'][$period][0]['date_or_month'];
                        }
                        if (isset($count_data['status_5_10'][$period])) {
                            $merged_row['status_5_10_count'] = $count_data['status_5_10'][$period]['count'];
                        }
                        if (isset($count_data['status_7'][$period])) {
                            $merged_row['status_7_count'] = $count_data['status_7'][$period]['count'];
                        }
                        if (isset($count_data['pending'][$period])) {
                            $merged_row['pending_count'] = $count_data['pending'][$period]['count'];
                        }

                        // Add the merged row to the merged_data array
                        $merged_data[] = $merged_row;
                    }
                ksort($merged_data);

                $results1 = [];
                
               
                    // $ccmail = ['mariavanarajs@nagamills.com'];
                    $subject = 'Gate Entry Details - ' . $details['division'];
                    $message = '<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            /* Mobile Styles */
                            @media only screen and (max-width: 600px) {
                                table {
                                    width: 100% !important;
                                }
                                .container {
                                    width: 100% !important;
                                    padding: 0 10px;
                                }
                            }
                            .container {
                                width: 100%;
                                margin: 0 auto;
                                font-family: Arial, sans-serif;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 20px 0;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 8px;
                                text-align: center;
                            }
                            th {
                                background-color: #1656f7;
                                color: white;
                            }
                            
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1 style="text-align:center; color:#1656f7;">Dashboard Report</h1>
                            <p>Dear Team,</p>
                            <p>Please find below the summary of vehicle inward and outward:</p>';
                
                    // General Counts Section
                    $message .= '<h2>Over All Count Details</h2>
                        <table>
                        <tr><th>Period</th><th>Date or Month</th><th>Completed Count</th><th>Reject</th><th>Pending Count</th><th>Total Count</th></tr>';
                    foreach ($merged_data as $row) {
                    

                        $message .= '<tr>
                                        <td style="background-color: #a6bfed">' . $row['period'].'</td>
                                        <td style="background-color: #a6bfed">' . $row['date_or_month'] . '</td>
                                        <td style="background-color: #3bdb3b">' . $row['status_5_10_count'] . '</td>
                                        <td style="background-color: #e6e225">' . $row['status_7_count'] . '</td>
                                        <td style="background-color: #f54764">' . $row['pending_count'] . '</td>
                                        <td style="background-color: #a6bfed">' . $row['general_count'] . '</td>
                                    </tr>';
                    }
                    $message .= '</table>';
                
                    
                    // Vehicle Details Section
                    $message .= '<h2>Gate Inward Outward Pending Details</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>VA No</th>
                                    <th>Created</th>
                                    <th>Vehicle No</th>
                                    <th>Plant Name</th>
                                    <th>Module</th>
                                    <th>Duration</th>
                                    <th>Waiting At</th>
                                    <th>Entry Res. Person</th>
                                </tr>
                            </thead>
                            <tbody>';
                    foreach ($results as $row) {
                        $message .= '<tr>
                                        <td>' . htmlspecialchars($row['vaNumber']) . '</td>
                                        <td>' . htmlspecialchars($row['createdOn']) . '</td>
                                        <td>' . htmlspecialchars($row['vehicleNo']) . '</td>
                                        <td>' . htmlspecialchars($row['PlantDetails']) . '</td>
                                        <td>' . htmlspecialchars($row['moduleType']) . '</td>
                                        <td>' . htmlspecialchars($row['Duration']) . '</td>
                                        <td>' . htmlspecialchars($row['statusName']) . '</td>
                                        <td>' . htmlspecialchars($row['contact_person']) . '</td>
                                    </tr>';
                    }
                    $message .= '</tbody></table>';
                
                    // Closing message
                    $message .= '<p style="font-size: 0.9em;">For contact, please reach out to the respective person.</p>
                        <br/>
                        <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p>
                        </div>
                    </body>
                    </html>';
                        
                 

                        $email = \Config\Services::email();
                        $email->setFrom("noreply@nagamills.com", 'GATE PENDING LIST');
                        $email->setTo($to_mail);
                        $email->setBcc($bcc_mail);
                        $email->setCc($cc_mail);
                        $email->setSubject($subject);
                        $email->setMessage($message);
                        $email->send();
         
        }
  }

  public function MigoPendingList()
  {
      include_once APIPATH . "/db_connection.php";
      
      $usqls = "SELECT *
      FROM gate_entry_pending_automail
      WHERE status = 1 AND type = 2 AND po_type IS NOT NULL
      GROUP BY id";
      $result = mysqli_query($connect, $usqls);
      $results2 = [];  
      while ($row = mysqli_fetch_assoc($result)) {
          $results2[] = $row;
      }  

      foreach ($results2 as $details) {
          
          $to_mail = [];
          $cc_mail = [];
          $bcc_mail = [];
          $plant_id = [];
          $poType = [];
       
          $to_mail = array_merge($to_mail, explode(',', $details['to_mail']));
          $cc_mail = array_merge($cc_mail, explode(',', $details['cc_mail']));
          $bcc_mail = array_merge($bcc_mail, explode(',', $details['bcc_mail']));
          $plant_id[] = $details['plant_id'];
          $poType[] = $details['po_type'];

          $to_mail = array_unique($to_mail);
          $cc_mail = array_unique($cc_mail);
          $bcc_mail = array_unique($bcc_mail);
          


              $usqls3 = "SELECT 
              po.id,gi.vehicleNo,gi.vaNumber,gi.masterPlantId,gi.createdBy,CONCAT(mp.WERKS, '-', mp.PLANT_NAME) AS PlantDetails,
              mm.moduleType,
              po.poNumber,
              po.invoiceNo,
              po.vendorCode,
              po.vendorName,
              po.migoNumber,
              gi.moduleStatusId,
              ms.statusName,
              CONCAT(pt.type, '-', pt.name) AS po_type,
              DATE_FORMAT(po.dateStamp, '%d-%m-%Y') AS createdOn,
              DATE_FORMAT(gi.gateInDateStamp, '%d-%m-%Y %H:%i:%s') AS gateInDateStamp,
              DATE_FORMAT(gi.gateOutDateStamp, '%d-%m-%Y %H:%i:%s') AS gateOutDateStamp,
              DATE_FORMAT(po.documentDate, '%d-%m-%Y') AS poDate,
              DATE_FORMAT(po.migoDate, '%d-%m-%Y') AS migoDate
              FROM purchase_order po
              JOIN gate_in_out_info gi ON po.loadingUnloadingInfoId=gi.loadingUnloadingInfoId 
              JOIN master_plant mp ON gi.masterPlantId=mp.ID 
              JOIN master_module mm ON gi.moduleType=mm.id
              JOIN movement_type mt ON gi.movementType=mt.id
              JOIN user_info ui ON gi.createdBy=ui.UI_ID
              JOIN po_type pt ON po.poType=pt.id
              JOIN module_status ms ON gi.waitingAt=ms.id
              LEFT JOIN loading_unloading_info li ON gi.loadingUnloadingInfoId=li.id
              LEFT JOIN user_info lui ON li.createdBy=lui.UI_ID
              LEFT JOIN weighment_info wi ON gi.id=wi.gateInOutInfoId
              LEFT JOIN user_info wui ON wi.createdBy=wui.UI_ID
              WHERE gi.moduleStatusId NOT IN(7,10) AND gi.masterPlantId IN ($plant_id[0]) AND po.poType IN ($poType[0]) AND po.dateStamp > '2024-07-01' 
              GROUP BY po.id";

              $result1 = mysqli_query($connect, $usqls3);
              $results = [];
              while ($row = mysqli_fetch_assoc($result1)) {
                $results[] = $row;
              }

              $counts_sql = "SELECT 'day' AS period, 
              DATE_FORMAT(gi.dateStamp, '%d-%m-%Y') AS date_or_month, 
              COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE DATE(gi.dateStamp) = CURDATE() - INTERVAL 1 DAY
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_month' AS period, 
                        DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
                AND MONTH(gi.dateStamp) = MONTH(CURDATE())
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_month' AS period, 
                        DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE 
                    go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                AND (
                    (YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1)
                    OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)
                )
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'current_week' AS period, 
                        CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_week' AS period, 
                        CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
                AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'year' AS period, 
                        YEAR(gi.dateStamp) AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                GROUP BY date_or_month
                
                UNION ALL
                
                SELECT 'last_year' AS period, 
                        YEAR(gi.dateStamp) AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1
                AND go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                AND gi.dateStamp > '2024-07-01'
                GROUP BY date_or_month";
              $counts_result = mysqli_query($connect, $counts_sql);

              $count_data = [
                  'general' => [],
                  'status_5_10' => [],
                  'status_7' => [],
                  'pending' => []
              ];

              while ($row = mysqli_fetch_assoc($counts_result)) {
                  $count_data['general'][$row['period']][] = $row;
              }

              $counts_status_5_10_sql = "SELECT 'day' AS period, 
              DATE_FORMAT(gi.dateStamp, '%d-%m-%Y') AS date_or_month, 
              COUNT(*) AS count
              FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE DATE(gi.dateStamp) = CURDATE() - INTERVAL 1 DAY
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'current_month' AS period, 
                  DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND MONTH(gi.dateStamp) = MONTH(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_month' AS period, 
                        DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE 
                    go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                AND go.moduleStatusId IN (10)
                AND (
                    (YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1)
                    OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)
                )
                GROUP BY date_or_month

              UNION ALL

              SELECT 'current_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
              AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND gi.dateStamp > '2024-07-01'
              AND go.moduleStatusId IN (10)
              GROUP BY date_or_month       
              ";

              $counts_status_5_10_result = mysqli_query($connect, $counts_status_5_10_sql);

              while ($row = mysqli_fetch_assoc($counts_status_5_10_result)) {
                  $count_data['status_5_10'][$row['period']] = $row; // Store counts by period
              }

              $counts_status_7_sql = "
              SELECT 'day' AS period, 
              DATE_FORMAT(gi.dateStamp, '%d-%m-%Y') AS date_or_month, 
              COUNT(*) AS count
              FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE DATE(gi.dateStamp) = CURDATE() - INTERVAL 1 DAY
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'current_month' AS period, 
                  DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND MONTH(gi.dateStamp) = MONTH(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_month' AS period, 
                        DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE 
                    go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                AND go.moduleStatusId IN (7)
                AND (
                    (YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1)
                    OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)
                )
                GROUP BY date_or_month

              UNION ALL

              SELECT 'current_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
              AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND gi.dateStamp > '2024-07-01'
              AND go.moduleStatusId IN (7)
              GROUP BY date_or_month        
              ";
            //   print_r($counts_status_7_sql);exit;

              $counts_status_7_result = mysqli_query($connect, $counts_status_7_sql);

              // Process counts for status 7
              while ($row = mysqli_fetch_assoc($counts_status_7_result)) {
                  $count_data['status_7'][$row['period']] = $row; // Store counts by period
              }
              $pending_count = "
              SELECT 'day' AS period, 
              DATE_FORMAT(gi.dateStamp, '%d-%m-%Y') AS date_or_month, 
              COUNT(*) AS count
              FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE DATE(gi.dateStamp) = CURDATE() - INTERVAL 1 DAY
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'current_month' AS period, 
                  DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND MONTH(gi.dateStamp) = MONTH(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_month' AS period, 
                        DATE_FORMAT(gi.dateStamp, '%m-%Y') AS date_or_month, 
                        COUNT(*) AS count
                FROM purchase_order gi
                JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
                WHERE 
                    go.masterPlantId IN ($plant_id[0])
                AND gi.poType IN ($poType[0])
                AND go.moduleStatusId IN (0,1,2,3,4,12,5)
                AND (
                    (YEAR(gi.dateStamp) = YEAR(CURDATE()) AND MONTH(gi.dateStamp) = MONTH(CURDATE()) - 1)
                    OR (MONTH(CURDATE()) = 1 AND YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1 AND MONTH(gi.dateStamp) = 12)
                )
                GROUP BY date_or_month

              UNION ALL

              SELECT 'current_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_week' AS period, 
                  CONCAT(YEAR(gi.dateStamp), '-W', WEEK(gi.dateStamp, 1)) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE gi.dateStamp >= DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY)
              AND gi.dateStamp < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE())) DAY)
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE())
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month

              UNION ALL

              SELECT 'last_year' AS period, 
                  YEAR(gi.dateStamp) AS date_or_month, 
                  COUNT(*) AS count
                  FROM purchase_order gi
              JOIN gate_in_out_info go ON gi.loadingUnloadingInfoId = go.loadingUnloadingInfoId
              WHERE YEAR(gi.dateStamp) = YEAR(CURDATE()) - 1
              AND go.masterPlantId IN ($plant_id[0])
              AND gi.poType IN ($poType[0])
              AND gi.dateStamp > '2024-07-01'
              AND go.moduleStatusId IN (0,1,2,3,4,12,5)
              GROUP BY date_or_month        
              ";
              //print_r($pending_count);exit;

              $pending_count = mysqli_query($connect, $pending_count);

              // Process counts for status 7
              while ($row = mysqli_fetch_assoc($pending_count)) {
                  $count_data['pending'][$row['period']] = $row; // Store counts by period
              }
              $merged_data = [];

              $general = $count_data['general'];
              $status_5_10[] = $count_data['status_5_10'];
              $status_7[] = $count_data['status_7'];
              $pending[]= $count_data['pending'];      
              $merged_data = [];
              $periods = ['day', 'current_week','last_week', 'current_month','last_month', 'year', 'last_year'];

                  foreach ($periods as $period) {
                      // Initialize an array to store the merged data for the current period
                      $merged_row = [
                          'period' => ucfirst($period), // Capitalize the period name
                          'date_or_month' => '',
                          'general_count' => 0,
                          'status_5_10_count' => 0,
                          'status_7_count' => 0,
                          'pending_count' => 0
                      ];
                      
                      if (isset($count_data['general'][$period])) {
                          $merged_row['general_count'] = $count_data['general'][$period][0]['count'];
                          $merged_row['date_or_month'] = $count_data['general'][$period][0]['date_or_month'];
                      }
                      if (isset($count_data['status_5_10'][$period])) {
                          $merged_row['status_5_10_count'] = $count_data['status_5_10'][$period]['count'];
                      }
                      if (isset($count_data['status_7'][$period])) {
                          $merged_row['status_7_count'] = $count_data['status_7'][$period]['count'];
                      }
                      if (isset($count_data['pending'][$period])) {
                          $merged_row['pending_count'] = $count_data['pending'][$period]['count'];
                      }

                      // Add the merged row to the merged_data array
                      $merged_data[] = $merged_row;
                  }
              ksort($merged_data);

              $results1 = [];
              
             
                  // $ccmail = ['mariavanarajs@nagamills.com'];
                  $subject = 'MIGO Entry Details - ' . $details['division'];
                  $message = '<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                          /* Mobile Styles */
                          @media only screen and (max-width: 600px) {
                              table {
                                  width: 100% !important;
                              }
                              .container {
                                  width: 100% !important;
                                  padding: 0 10px;
                              }
                          }
                          .container {
                              width: 100%;
                              margin: 0 auto;
                              font-family: Arial, sans-serif;
                          }
                          table {
                              width: 100%;
                              border-collapse: collapse;
                              margin: 20px 0;
                          }
                          th, td {
                              border: 1px solid #ddd;
                              padding: 8px;
                              text-align: center;
                          }
                          th {
                              background-color: #1656f7;
                              color: white;
                          }
                          
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h1 style="text-align:center; color:#1656f7;">PO Report</h1>
                          <p>Dear Team,</p>
                          <p>Please find below the summary of PO inward and outward:</p>';
              
                  // General Counts Section
                  $message .= '<h2>Over All Count Details</h2>
                      <table>
                      <tr><th>Period</th><th>Date or Month</th><th>Completed Count</th><th>Reject</th><th>Pending Count</th><th>Total Count</th></tr>';
                  foreach ($merged_data as $row) {
                  

                      $message .= '<tr>
                                      <td style="background-color: #a6bfed">' . $row['period'].'</td>
                                      <td style="background-color: #a6bfed">' . $row['date_or_month'] . '</td>
                                      <td style="background-color: #3bdb3b">' . $row['status_5_10_count'] . '</td>
                                      <td style="background-color: #e6e225">' . $row['status_7_count'] . '</td>
                                      <td style="background-color: #f54764">' . $row['pending_count'] . '</td>
                                      <td style="background-color: #a6bfed">' . $row['general_count'] . '</td>
                                  </tr>';
                  }
                  $message .= '</table>';
              
                  
                  // Vehicle Details Section
                  $message .= '<h2>PO Inward Outward Pending Details</h2>
                      <table>
                          <thead>
                              <tr>
                                  <th>VA No</th>
                                  <th>GATE IN DATE</th>
                                  <th>GATE OUT DATE</th>
                                  <th>PO NUMBER</th>
                                  <th>TRUCK NO</th>
                                  <th>INVOICE NO</th>
                                  <th>VENDOR CODE</th>
                                  <th>VENDOR NAME</th>
                                  <th>WAITING AT</th>
                              </tr>
                          </thead>
                          <tbody>';
                  foreach ($results as $row) {
                      $message .= '<tr>
                                      <td>' . htmlspecialchars($row['vaNumber']) . '</td>
                                      <td>' . htmlspecialchars($row['gateInDateStamp']) . '</td>
                                      <td>' . htmlspecialchars($row['gateOutDateStamp']) . '</td>
                                      <td>' . htmlspecialchars($row['poNumber']) . '</td>
                                      <td>' . htmlspecialchars($row['vehicleNo']) . '</td>
                                      <td>' . htmlspecialchars($row['invoiceNo']) . '</td>
                                      <td>' . htmlspecialchars($row['vendorCode']) . '</td>
                                      <td>' . htmlspecialchars($row['vendorName']) . '</td>
                                      <td>' . htmlspecialchars($row['statusName']) . '</td>
                                  </tr>';
                  }
                  $message .= '</tbody></table>';
              
                  // Closing message
                  $message .= '<p style="font-size: 0.9em;">For contact, please reach out to the respective person.</p>
                      <br/>
                      <p style="font-size: 0.9em;">Regards,<br /> Naga Limited</p>
                      </div>
                  </body>
                  </html>';
                //   print_r($message);exit;
                      $email = \Config\Services::email();
                      $email->setFrom("noreply@nagamills.com", 'MIGO Entry Details');
                      $email->setTo($to_mail);
                      $email->setBcc($bcc_mail);
                      $email->setCc($cc_mail);
                      $email->setSubject($subject);
                      $email->setMessage($message);
                      $email->send();
        }
    }
    public function TruckContainerPosition()
    {
        $model = new CourierModel();
        $latestDetail = $model->TruckContainerPosition();
        $mailData = $model->getsilotruckandcontainermail();
       
        // Step 1: Extract relevant data 
        $to_mail = [];
        $cc_mail = [];
        $bcc_mail = [];

        $to_mail = array_merge($to_mail, explode(',', $mailData[0]['to_mail']));
        $cc_mail = array_merge($cc_mail, explode(',', $mailData[0]['cc_mail']));
        $bcc_mail = array_merge($bcc_mail, explode(',', $mailData[0]['bcc_mail']));

        $to_mail = array_unique($to_mail);
        $cc_mail = array_unique($cc_mail);
        $bcc_mail = array_unique($bcc_mail);

        $lastFourDaysData = $latestDetail['last_4_days'];
        $oldDataSummary = $latestDetail['more_than_4_days'];
        $specialCountsLast4 = $latestDetail['arrived_countl4'];
        $specialCountsMore4 = $latestDetail['arrived_countm4'];

        // Step 2: Sort data by DateAdded in descending order 
        usort($lastFourDaysData, function ($a, $b) {
            return strtotime($b['DateAdded']) - strtotime($a['DateAdded']);
        });

        // Step 3: Initialize data structure 
        $groupedData = [];
        $containerData = [];
        $specialContainerCount = [];
        $dates = [];

        $today = new DateTime();
        for ($i = 0; $i < 4; $i++) {
            $dateKey = 'day' . ($i + 1);
            $dates[$dateKey] = $today->format('Y-m-d');
            $groupedData[$dateKey] = ['waiting_in' => 0, 'gate_out' => 0, 'migo_approval' => 0];
            $containerData[$dateKey] = ['waiting_in' => 0, 'gate_out' => 0, 'migo_approval' => 0];
            $specialContainerCount[$dateKey] = 0; // Initialize special count
            $today->modify('-1 day');
        }

        // Step 4: Process each record and map it to the correct day 
        foreach ($lastFourDaysData as $detail) {
            $recordDate = date('Y-m-d', strtotime($detail['DateAdded']));
            foreach ($dates as $dayKey => $date) {
                if ($recordDate === $date) {
                    $groupedData[$dayKey]['waiting_in'] += $detail['truck_gate_in_waiting'];
                    $groupedData[$dayKey]['gate_out'] += $detail['truck_gate_out'];
                    $groupedData[$dayKey]['migo_approval'] += $detail['truck_migo_approval'];

                    $containerData[$dayKey]['waiting_in'] += $detail['container_gate_in_waiting'];
                    $containerData[$dayKey]['gate_out'] += $detail['container_gate_out'];
                    $containerData[$dayKey]['migo_approval'] += $detail['container_migo_approval'];
                }
            }
        }

        // Process Special Container Count for last 4 days
        foreach ($specialCountsLast4 as $countData) {
            $recordDate = $countData['date_modified'];
            foreach ($dates as $dayKey => $date) {
                if ($recordDate === $date) {
                    $specialContainerCount[$dayKey] = $countData['container_special_count_last4'];
                }
            }
        }
        $specialContainerCountMore4 = $specialCountsMore4['container_special_count_more4']?? 0;
        $subject = 'Vehicle Details - ' . $mailData[0]['division'];
        // Step 5: Generate HTML Email Template 
        $message = '<!DOCTYPE html> 
    <html lang="en"> 
    <head> 
        <meta charset="UTF-8"> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <style> 
            table { width: 100%; border-collapse: collapse; border: 1px solid #ccc; } 
            th, td { border: 1px solid #ddd; padding: 6px; text-align: center; } 
            th { background-color: #1656f7; color: white; } 
        </style> 
    </head> 
    <body> 
        <p style="font-size: 1.1em;">Dear Team,</p> 
        <p>Please find below the Truck & Container Position details for the last 4 days.</p> 
     
        <h3>Truck Positions</h3> 
        <table> 
            <thead> 
                <tr> 
                    <th>Position</th> 
                    <th>Day 1 (' . $dates['day1'] . ')</th> 
                    <th>Day 2 (' . $dates['day2'] . ')</th> 
                    <th>Day 3 (' . $dates['day3'] . ')</th> 
                    <th>Day 4 (' . $dates['day4'] . ')</th> 
                    <th>More than 4 Days</th> 
                </tr> 
            </thead> 
            <tbody> 
                <tr> 
                    <td><strong>Waiting In</strong></td> 
                    <td>' . $groupedData['day1']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day2']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day3']['waiting_in'] . '</td> 
                    <td>' . $groupedData['day4']['waiting_in'] . '</td> 
                    <td>' . $oldDataSummary['truck_gate_in_waiting_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Gate Out Completed</strong></td> 
                    <td>' . $groupedData['day1']['gate_out'] . '</td> 
                    <td>' . $groupedData['day2']['gate_out'] . '</td> 
                    <td>' . $groupedData['day3']['gate_out'] . '</td> 
                    <td>' . $groupedData['day4']['gate_out'] . '</td> 
                    <td>' . $oldDataSummary['truck_gate_out_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Migo Approval Completed</strong></td> 
                    <td>' . $groupedData['day1']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day2']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day3']['migo_approval'] . '</td> 
                    <td>' . $groupedData['day4']['migo_approval'] . '</td> 
                    <td>' . $oldDataSummary['truck_migo_approval_more4'] . '</td> 
                </tr> 
            </tbody> 
        </table> 
     
        <h3>Container Positions</h3> 
        <table> 
            <thead> 
                <tr> 
                    <th>Position</th> 
                    <th>Day 1 (' . $dates['day1'] . ')</th> 
                    <th>Day 2 (' . $dates['day2'] . ')</th> 
                    <th>Day 3 (' . $dates['day3'] . ')</th> 
                    <th>Day 4 (' . $dates['day4'] . ')</th> 
                    <th>More than 4 Days</th> 
                </tr> 
            </thead> 
            <tbody> 
                <tr> 
                    <td><strong>Arrived at Tutiorin	</strong></td> 
                    <td>' . $specialContainerCount['day1'] . '</td>
                <td>' . $specialContainerCount['day2'] . '</td>
                <td>' . $specialContainerCount['day3'] . '</td>
                <td>' . $specialContainerCount['day4'] . '</td>
                <td>' . $specialContainerCountMore4 . '</td>
                </tr> 
                 <tr> 
                    <td><strong>Waiting In</strong></td> 
                    <td>' . $containerData['day1']['waiting_in'] . '</td> 
                    <td>' . $containerData['day2']['waiting_in'] . '</td> 
                    <td>' . $containerData['day3']['waiting_in'] . '</td> 
                    <td>' . $containerData['day4']['waiting_in'] . '</td> 
                    <td>' . $oldDataSummary['container_gate_in_waiting_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Gate Out Completed</strong></td> 
                    <td>' . $containerData['day1']['gate_out'] . '</td> 
                    <td>' . $containerData['day2']['gate_out'] . '</td> 
                    <td>' . $containerData['day3']['gate_out'] . '</td> 
                    <td>' . $containerData['day4']['gate_out'] . '</td> 
                    <td>' . $oldDataSummary['container_gate_out_more4'] . '</td> 
                </tr> 
                <tr> 
                    <td><strong>Migo Approval Completed</strong></td> 
                    <td>' . $containerData['day1']['migo_approval'] . '</td> 
                    <td>' . $containerData['day2']['migo_approval'] . '</td> 
                    <td>' . $containerData['day3']['migo_approval'] . '</td> 
                    <td>' . $containerData['day4']['migo_approval'] . '</td> 
                    <td>' . $oldDataSummary['container_migo_approval_more4'] . '</td> 
                </tr> 
            </tbody> 
        </table> 
    </body> 
    </html>';
        // print_r($message);
        // exit;

        // Step 6: Send email 
        $email = \Config\Services::email();
        $email->setFrom("noreply@nagamills.com", 'Vehicle Info');
        $email->setTo($to_mail);
        $email->setBcc($bcc_mail);
        $email->setCc($cc_mail);
        $email->setSubject($subject);
        $email->setMessage($message);
        $email->send();
      
    }
}
