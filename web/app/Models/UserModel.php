<?php 
namespace App\Models;

use App\Helpers\SessionHelper;
use CodeIgniter\Model;
use CodeIgniter\Email\Email;

class UserModel extends Model
{
   protected $table = 'user_info';    

   public function canLogin($username,$password){
      $passwords =md5($password);
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username, 
                                    ROLE_NAME as role,
                                    LoginStatus,
                                    masterGateId as GATE_ID,
                                    MOBILE_NUMBER,
                                    MAIL_ID,DEPARTMENT
                                 FROM user_info, master_role  
                                 WHERE USER_ROLE_ID = RM_REFID and 
                                       LOGIN_ID ='".$username."' and 
                                       PASSWORD = '".$passwords."' and 
                                       USER_STATUS = '1'");

         $format = date('Y-m-d H:i:s');

          $uData = ["LoginStatus"=>"1","LoginTime"=>$format];

      
      $res = $query->getFirstRow();
      
   // if($res->LoginStatus == 1){
   //       return $res;
   //    }

   $this->db->table($this->table)->where("UI_ID",$res->USERID)->update($uData);

      //print_r($res);exit;
      if(isset($res)){
         $plantModel = new PlantModel();
         $userId =$res->USERID;
         $res->plantids = $plantModel->getPlantIdsByUserId($userId);

         $screenSql = "SELECT SCREEN_NAME, SCREEN_DESC, SectionId FROM view_user_screen 
                       WHERE USER_ID = $userId AND DISABLED=0 order by PRIORITY, SCREEN_NAME";

         //echo $screenSql;exit();
         $screenRes =  $this->db->query($screenSql);
         $res->screenids =  $screenRes->getResult();

         //Main Menu Load Based on User Id Rights
         $screenSql = " SELECT SectionId, SectionName 
                        FROM `master_screen_section` 
                        WHERE RecStatus='1' AND SectionId IN(
                              SELECT SectionId FROM view_user_screen 
                              WHERE USER_ID = $userId and DISABLED=0)
                        ORDER BY SortOrder ASC";

         // echo $screenSql;exit();
            $screenRes =  $this->db->query($screenSql);
            $res->Sections =  $screenRes->getResult();
         //var_dump($res->screenids);exit;
         return $res;
      }
      return null;
   }
   
   

   public function Forgot_Password($username){
      $query =  $this->db->query("SELECT 
            UI_ID as USERID, 
            FIRST_NAME as username,
            MOBILE_NUMBER as mobile_number,
            MAIL_ID as mail,
            LOGIN_ID
            FROM user_info  
            WHERE USER_STATUS = '1' 
            AND LOGIN_ID = '$username'");

      $res = $query->getFirstRow();

      if (!isset($res->USERID)) {
         return [
               "status"  => false,
               "message" => "Invalid Username"
         ];
      }

      // Generate OTP
      $otp = rand(1000, 9999);

      $userName = 'Sir/Mam';
      $ccmail = ['st12@nagamills.com'];
      $mail = [$res->mail];
      $user = $res->username;

      // Clean mobile number
      $usermobile = preg_replace('/\D/', '', trim($res->mobile_number));
      if (strlen($usermobile) === 10) {
         $usermobile = '91' . $usermobile;
      }

      // Prepare SMS
      $message="Dear ".$userName.", ".$otp." is OTP for Reset Purchase PRO Password.OTP valid for 10 Mins. Do not share this OTP with anyone Naga Limited";
      $msg=urlencode($message);
      $sender='NAGACO';

      $headers = array('Content-Type: application/json; charset=utf-8');
      $url =("http://mobicomm.dove-sms.com//submitsms.jsp?user=NAGACO&key=eee5461574XX&message=".$msg."&senderid=".$sender."&accusage=1&entityid=1201159186592875505&tempid=1207168318998965850&unicode=1&mobile=".$usermobile);

      $headers = ['Content-Type: application/json; charset=utf-8'];

      $ch = curl_init();
      curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      $curlresponse = curl_exec($ch);
      curl_close($ch);

      // Check SMS success
      $smsSuccess = ($curlresponse !== false);

      $email = \Config\Services::email();

    // FROM EMAIL from config, NAME per function
    $email->setFrom(
        config('Email')->fromEmail,
        'PURCHASE PRO LOCAL'
    );

    $email->setTo($res->mail);
    $email->setBCC(['st12@nagamills.com']);
    // $email->setBCC(['audit@nagamills.com']); // optional

    $email->setSubject('Forget Password OTP Request');

    $email->setMessage("
        <div style='font-family:Arial'>
            <h3>Welcome to Naga Limited</h3>
            <p>Hello {$res->username},</p>
            <p>Your OTP is:</p>
            <h1 style='background:#1656f7;color:#fff;padding:10px;width:fit-content'>$otp</h1>
            <p>OTP valid for 10 minutes.</p>
            <p>Regards,<br>Naga Limited</p>
        </div>
    ");

    $mailSent = $email->send();
   //  $mailSent = $email->send();
    $emailDebug = $email->printDebugger([
         'headers',
         'subject',
         'body'
      ]);
    if (!$mailSent) {
        log_message('error', $email->printDebugger());
    }

    // ------------------------------------
    // SAVE OTP
    // ------------------------------------
    if ($smsSuccess || $mailSent) {
        $this->db->table('user_info')
            ->where('UI_ID', $res->USERID)
            ->update([
                'OTP' => $otp,
            ]);
    }

    return [
        "LOGIN_ID"=>$res->LOGIN_ID,
        "status" => ($smsSuccess || $mailSent),
        "sms_status" => $smsSuccess ? "SMS Sent" : "SMS Failed",
        "email_status" => $mailSent ? "Email Sent" : "Email Failed",
        "message" => ($smsSuccess || $mailSent)
            ? "OTP sent successfully"
            : "OTP sending failed",
        'mail_debugger'=> $emailDebug
    ];
   }


   public function Verify_OTP($user_name,$otp) {

      // print_r($user_name,$otp);exit();
      $query =  $this->db->query("SELECT 
                                    UI_ID as USERID, 
                                    FIRST_NAME as username, 
                                    ROLE_NAME as role  
                                 FROM user_info, master_role  
                                 WHERE USER_ROLE_ID = RM_REFID and 
                                       LOGIN_ID = '$user_name' and 
                                       OTP = '$otp' and 
                                       USER_STATUS = '1'");
   //   print_r($query);exit;
     $res = $query->getFirstRow();
      if(isset($res)) {
         return $res; 
      }else{
         return false;
      }
   }
   public function Password_Change($username,$verify_pwd){

   $resu = $this->db->table($this->table)->select('UI_ID','LOGIN_ID')->where("LOGIN_ID","$username")->get();
   $result = $resu->getFirstRow();
   $password =md5($verify_pwd);
   $format = date('Y-m-d');
    $uData = ["PASSWORD"=>$password,"expiry_date"=>$format];
    $res = $this->db->table($this->table)->where("UI_ID", $result->UI_ID)->update($uData);
    return $res; 
   }
   public function getUserPlants() {
         $userId = SessionHelper::getUserId();
         $plantModel = new PlantModel();
         $plantList =$plantModel-> getAllPlants($userId);
         if(isset($plantList) && count($plantList)>0){
            return $plantList;
         }
         return  $plantModel-> getAllPlants();
   }

   public function getUserPlants_SILO() {
      $userId = SessionHelper::getUserId();
      $plantModel = new PlantModel();
      $plantList =$plantModel-> getAllPlants_SILO($userId);
      if(isset($plantList) && count($plantList)>0){
         return $plantList;
      }
      return  $plantModel-> getAllPlants_SILO();
}
public function UserLogOut($postData1) {

   $format = date('Y-m-d H:i:s');

    $uData = ["LoginStatus"=>"0","LogoutTime"=>$format];

    $this->db->table($this->table)->where("UI_ID", $postData1)->update($uData);
}

public function UserCount() {
   // print_r('dsa');exit();
   $inactive = $this->db->table($this->table)->where("USER_STATUS", '0')->countAllResults();
   $active = $this->db->table($this->table)->where("USER_STATUS", '1')->countAllResults();
   $session_inactive = $this->db->table($this->table)->where("LoginStatus", '0')->countAllResults();
   $session_active = $this->db->table($this->table)->where("LoginStatus", '1')->countAllResults();

   return  (["Active_User"=>$active,"Inactive_User"=>$inactive,"Session_Active_User"=>$session_active,"Session_Inactive_User"=>$session_inactive,"Total_Session_Users"=>$session_active+$session_inactive,"Total_Master_Users"=>$active+$inactive]);
}

public function UserMonthlyPasswordReset() {

   $format = date('Y-m-d H:i:s');

   $uData = ["LoginStatus"=>"0","LogoutTime"=>$format,"PASSWORD"=>'cd84d683cc5612c69efe115c80d0b7dc'];

   $this->db->table($this->table)->where("USER_STATUS", '0')->update($uData);
}


public function PasswordExpire($USER_ID) {

   $format = date('Y-m-d');
   $Sql = "SELECT definitionsName FROM definitions_list  WHERE definitionsId = 23 AND isActive = 1";
   $builder2 = $this->db->query($Sql);     
   $result =  $builder2->getResultArray();
   if($result){
      $daysToAdd = -$result[0]['definitionsName'];
      $currentDateTime = date('Y-m-d H:i:s'); 
      $endOfDay = date('Y-m-d 23:59:59', strtotime($currentDateTime));
      $expiryDate = date('Y-m-d', strtotime("$daysToAdd day", strtotime($endOfDay)));
      $builder = $this->db->table("user_info");
      $builder = $builder->where("UI_ID", $USER_ID);
      $builder = $builder->where("expiry_date<=", $expiryDate);
      $builder = $builder->where("USER_ROLE_ID NOT IN (1, 5, 14)");
      $builder = $builder->countAllResults();
      if($builder){
         return $builder;
      }else{
         return 0;
      }
   }else{
      return 0;
   }
}

}
