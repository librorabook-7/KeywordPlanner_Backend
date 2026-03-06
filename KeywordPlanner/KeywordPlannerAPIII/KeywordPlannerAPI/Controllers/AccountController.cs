using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using System.Net.Mail;
using System.Configuration;
using System.Text;
using System.Web;
using KeywordPlannerModels;
using KeywordPlannerAPI.Helper;
using System.Web.Http.Cors;
using System.Web.SessionState;
using System.Security.Cryptography;
using System.IO;
using System.Web.Security;

namespace KeywordPlannerAPI.Controllers
{
    [EnableCors(origins: "*", headers: "*",
     methods: "*", SupportsCredentials = true)]
    public class AccountController : ApiController
    {
        [Route("api/Account/SignUp")]
        [HttpPost]
        public IHttpActionResult SignUp(AccountModel accountModel)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_Account_SignUp";
            int intID = 0;
            string strShowResults = "0";
            int intUserRemainingCredits = 0;
            bool blnIsFree = true;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            _sql.Parameters.Add(new SqlParameter("ID", accountModel.ID));
            _sql.Parameters.Add(new SqlParameter("FirstName", accountModel.FirstName));
            _sql.Parameters.Add(new SqlParameter("LastName", accountModel.LastName));
            _sql.Parameters.Add(new SqlParameter("EmailAddress", accountModel.EmailAddress));
            _sql.Parameters.Add(new SqlParameter("Password", accountModel.Password));
            _sql.Parameters.Add(new SqlParameter("Phone", accountModel.Phone));


            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            if (dataTable != null && dataTable.Rows.Count > 0)
            {
                dr = dataTable.Rows[0];
                intID = Convert.ToInt32(dr["ID"]);
            }
            if(intID != -1)
            {
                VerificationEmail(accountModel.EmailAddress);
            }
            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                ID = intID
            });


            
            

            return Ok(strReturnValue);
        }

        [Route("api/Account/SignUpSocial")]
        [HttpPost]
        public IHttpActionResult SignUpSocial(AccountModel accountModel)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_Social_Account_SignUp";
            int intID = 0;
            string strShowResults = "0";
            int intUserRemainingCredits = 0;
            bool blnIsFree = true;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            _sql.Parameters.Add(new SqlParameter("ID", accountModel.ID));
            _sql.Parameters.Add(new SqlParameter("FirstName", accountModel.FirstName));
            _sql.Parameters.Add(new SqlParameter("LastName", accountModel.LastName));
            _sql.Parameters.Add(new SqlParameter("EmailAddress", accountModel.EmailAddress));
            _sql.Parameters.Add(new SqlParameter("Password", accountModel.Password));
            _sql.Parameters.Add(new SqlParameter("Phone", accountModel.Phone));


            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            bool blnIsLoogedIn = false;

            if (dataTable != null && dataTable.Rows.Count > 0 && Convert.ToInt32(dataTable.Rows[0][0]) == -1)
            {
                string strReturnValue1 = Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    LoggedIn = blnIsLoogedIn,
                    uInfo = -1
                });

                return Ok(strReturnValue1);
            }
            else if (dataTable != null && dataTable.Rows.Count > 0)
            {
                blnIsLoogedIn = true;

                //dr = dataTable.Rows[0];

                HttpCookie objCookie = HttpContext.Current.Request.Cookies["UserInfo"];

                if (objCookie == null)
                {
                    HttpCookie cookie = new HttpCookie("UserInfo", Newtonsoft.Json.JsonConvert.SerializeObject(dataTable));
                    cookie.Expires = DateTime.Now.AddMinutes(10);
                    HttpContext.Current.Response.Cookies.Add(cookie);

                    //var cookie = new HttpCookie("UserInfo", Newtonsoft.Json.JsonConvert.SerializeObject(dr));
                    //{
                    //    Expires = DateTime.Now.AddMinutes(30)
                    //};
                }
                else
                {
                    objCookie.Expires = DateTime.Now.AddMinutes(10);
                    objCookie.Value = Newtonsoft.Json.JsonConvert.SerializeObject(dataTable);
                    HttpContext.Current.Response.Cookies.Add(objCookie);
                }


                //HttpContext.Current.Session["UserInfo"] = dataTable.Rows[0];
            }

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                LoggedIn = blnIsLoogedIn,
                uInfo = Newtonsoft.Json.JsonConvert.SerializeObject(dataTable)
            });

            return Ok(strReturnValue);
        }

        [Route("api/Account/Transaction")]
        [HttpPost]
        public IHttpActionResult Transaction(Payment payment)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_SaveTransaction";
            int intID = 0;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            _sql.Parameters.Add(new SqlParameter("@User_Id", payment.User_Id));
            _sql.Parameters.Add(new SqlParameter("@Transaction_Id", payment.Transaction_Id));
            _sql.Parameters.Add(new SqlParameter("@email", payment.Email));
            _sql.Parameters.Add(new SqlParameter("@name", payment.Name));
            _sql.Parameters.Add(new SqlParameter("@Payer_Id", payment.Payer_id));
            _sql.Parameters.Add(new SqlParameter("@phone", payment.Phone));
            _sql.Parameters.Add(new SqlParameter("@Status", payment.Status));
            _sql.Parameters.Add(new SqlParameter("@PaymentMethod", payment.PaymentMethod));
            _sql.Parameters.Add(new SqlParameter("@sPackage", payment.sPackage));
            _sql.Parameters.Add(new SqlParameter("@IsActive", true));



            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            if (dataTable != null && dataTable.Rows.Count > 0)
            {
                dr = dataTable.Rows[0];
                intID = Convert.ToInt32(dr["ID"]);
            }

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                ID = intID
            });




            return Ok(strReturnValue);
        }

        public void SaveFreeTrial(int userId)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_SaveTransaction";
            int intID = 0;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            _sql.Parameters.Add(new SqlParameter("@User_Id", userId));
            _sql.Parameters.Add(new SqlParameter("@Transaction_Id", ""));
            _sql.Parameters.Add(new SqlParameter("@email", ""));
            _sql.Parameters.Add(new SqlParameter("@name", ""));
            _sql.Parameters.Add(new SqlParameter("@Payer_Id", ""));
            _sql.Parameters.Add(new SqlParameter("@phone", ""));
            _sql.Parameters.Add(new SqlParameter("@Status", "APPROVED"));
            _sql.Parameters.Add(new SqlParameter("@PaymentMethod", "Trial"));
            _sql.Parameters.Add(new SqlParameter("@sPackage", 5));
            _sql.Parameters.Add(new SqlParameter("@IsActive", true));



            DataTable dataTable = _sqlDataAccess.Execute(_sql);
        }
        [Route("api/Account/AllTransactions")]
        [HttpGet]
        public IHttpActionResult AllTransactions()
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();
            string query = "select *,p.Name as PackageName from UserPayments up inner join dbo.Packages p on up.sPackage=p.Id order by up.id desc";
            SqlCommand _sql = _sqlDataAccess.GetCommand(query, CommandType.Text);





            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                TransactionsLst = dataTable
            });

            return Ok(dataTable);
        }

        [Route("api/Account/AllUsers")]
        [HttpGet]
        public IHttpActionResult AllUsers()
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();
            string query = "SELECT TOP (1000) [ID],[FirstName] ,[LastName],[EmailAddress],[Password],[Phone],[IsActive],[CreatedDate] FROM[KWPIO].[dbo].[AppUsers] order by createddate desc";
            SqlCommand _sql = _sqlDataAccess.GetCommand(query, CommandType.Text);





            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                users = dataTable
            });

            return Ok(dataTable);
        }
        [Route("api/Account/PaidUsers")]
        [HttpGet]
        public IHttpActionResult PaidUsers()
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();
            string query = "SELECT TOP (1000) up.[Id] ,[User_Id]	  ,concat(u.FirstName,' ',u.LastName) as [User]	  ,p.Name as Package      ,[Transaction_Id]      ,[email]      ,up.[name]      ,[Payer_Id]      ,up.[phone]      ,[Status]      ,[PaymentMethod]      ,[sPackage]      ,up.[IsActive]      ,[CreatedAt]  FROM [KWPIO].[dbo].[UserPayments] up  inner join dbo.AppUsers u on up.User_Id = u.ID  inner join dbo.Packages p on p.Id = up.sPackage order by up.CreatedAt desc";
            SqlCommand _sql = _sqlDataAccess.GetCommand(query, CommandType.Text);





            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                users = dataTable
            });

            return Ok(dataTable);
        }

        [HttpGet]
        public IHttpActionResult GetPackages()
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();
            string query = "SELECT * from dbo.packages where isactive = 1 order by (case Id when 5 then 0 else 1 end)";
            SqlCommand _sql = _sqlDataAccess.GetCommand(query, CommandType.Text);





            DataTable dataTable = _sqlDataAccess.Execute(_sql);

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                packages = dataTable
            });

            return Ok(dataTable);
        }

        [Route("api/Account/Login")]
        [HttpPost]
        public IHttpActionResult Login(AccountModel accountModel)
        {
            try
            {
                SqlDataAccess _sqlDataAccess = new SqlDataAccess();

                string execCommand = "sp_Account_LoginIn";
                int intID = 0;
                string strShowResults = "0";
                int intUserRemainingCredits = 0;
                bool blnIsFree = true;

                DataRow dr = null;
                SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

                _sql.Parameters.Add(new SqlParameter("EmailAddress", accountModel.EmailAddress));
                _sql.Parameters.Add(new SqlParameter("Password", accountModel.Password));


                DataTable dataTable = _sqlDataAccess.Execute(_sql);
                bool blnIsLoogedIn = false;

                if (dataTable != null && dataTable.Rows.Count > 0 && Convert.ToInt32(dataTable.Rows[0][0]) == -1)
                {
                    string strReturnValue1 = Newtonsoft.Json.JsonConvert.SerializeObject(new
                    {
                        LoggedIn = blnIsLoogedIn,
                        uInfo = -1
                    });

                    return Ok(strReturnValue1);
                }
                else if (dataTable != null && dataTable.Rows.Count > 0 )
                {
                    blnIsLoogedIn = true;

                    //dr = dataTable.Rows[0];

                    HttpCookie objCookie = HttpContext.Current.Request.Cookies["UserInfo"];

                    if (objCookie == null)
                    {
                        HttpCookie cookie = new HttpCookie("UserInfo", Newtonsoft.Json.JsonConvert.SerializeObject(dataTable));
                        cookie.Expires = DateTime.Now.AddMinutes(10);
                        HttpContext.Current.Response.Cookies.Add(cookie);

                        //var cookie = new HttpCookie("UserInfo", Newtonsoft.Json.JsonConvert.SerializeObject(dr));
                        //{
                        //    Expires = DateTime.Now.AddMinutes(30)
                        //};
                    }
                    else
                    {
                        objCookie.Expires = DateTime.Now.AddMinutes(10);
                        objCookie.Value = Newtonsoft.Json.JsonConvert.SerializeObject(dataTable);
                        HttpContext.Current.Response.Cookies.Add(objCookie);
                    }


                    //HttpContext.Current.Session["UserInfo"] = dataTable.Rows[0];
                }

                string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    LoggedIn = blnIsLoogedIn,
                    uInfo = Newtonsoft.Json.JsonConvert.SerializeObject(dataTable)
                });

                return Ok(strReturnValue);
            }
            catch (Exception e)
            {

                return InternalServerError(e);
            }
            
        }

        [Route("api/Account/ChangePassword")]
        [HttpPost]
        public IHttpActionResult ChangePassword(AccountModel accountModel)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_Account_Change_Password";
            int intID = 0;
            string strShowResults = "0";
            int intUserRemainingCredits = 0;
            bool blnIsFree = true;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            _sql.Parameters.Add(new SqlParameter("EmailAddress", accountModel.EmailAddress));
            _sql.Parameters.Add(new SqlParameter("Password", accountModel.Password));
            _sql.Parameters.Add(new SqlParameter("NewPassword", accountModel.NewPassword));


            DataTable dataTable = _sqlDataAccess.Execute(_sql);
            bool blnIsLoogedIn = false;


            if (dataTable != null && dataTable.Rows.Count > 0)
            {
                if (Convert.ToInt32(dataTable.Rows[0][0]) == 1)
                {
                    blnIsLoogedIn = true;
                }
            }

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                ChangePassword = blnIsLoogedIn
            });

            return Ok(strReturnValue);
        }


        [Route("api/Account/ForgotPassword")]
        [HttpPost]
        public IHttpActionResult ForgotPassword(AccountModel accountModel)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "sp_Account_IsUserNameExists";
            int intID = 0;
            string strShowResults = "0";
            int intUserRemainingCredits = 0;
            bool blnIsFree = true;

            DataRow dr = null;
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);

            string strRandomPassword = GetRandomPassword();


            _sql.Parameters.Add(new SqlParameter("EmailAddress", accountModel.EmailAddress));
            _sql.Parameters.Add(new SqlParameter("Password", strRandomPassword));



            DataTable dataTable = _sqlDataAccess.Execute(_sql);
            bool blnIsLoogedIn = false;


            if (dataTable != null && dataTable.Rows.Count > 0)
            {
                string strEmailAddress = "";
                strEmailAddress = dataTable.Rows[0]["EmailAddress"].ToString();

                blnIsLoogedIn = true;

                using (SmtpClient client = new SmtpClient("smtp.gmail.com", 587))
                {
                    try
                    {
                        bool emailsent = false;
                        using (MailMessage mail = new MailMessage())
                        {
                            mail.From = new MailAddress(ConfigurationManager.AppSettings["FromEmail"].ToString(), "KeywordPlanner");
                            mail.To.Add(strEmailAddress);
                            mail.Subject = "Keyword Planner Forgot Password";
                            mail.Body = GetEmailTemplate(strRandomPassword);
                            mail.IsBodyHtml = true;
                            //mail.Attachments.Add(new Attachment("C:\\file.zip"));

                            using (SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587))
                            {
                                smtp.UseDefaultCredentials = false;
                                //smtp.Credentials = new NetworkCredential("ppcexpokeywordplanner@gmail.com", "ABC123ssi");
                                smtp.Credentials = new NetworkCredential(ConfigurationManager.AppSettings["SMTPUserName"].ToString(), ConfigurationManager.AppSettings["SMTPPassword"].ToString());

                                smtp.EnableSsl = true;
                                //smtp.UseDefaultCredentials = true;
                                smtp.Send(mail);
                                emailsent = true;
                            }


                        }
                    }
                    catch (Exception e)
                    {
                        //throw new ApplicationException(e.Message);
                        throw e;
                    }
                }
            }

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                ChangePassword = blnIsLoogedIn
            });

            return Ok(strReturnValue);
        }

        [Route("api/Account/VerifyUserAccount")]
        [HttpGet]
        public IHttpActionResult VerifyUserAccount(string email)
        {
            SqlDataAccess _sqlDataAccess = new SqlDataAccess();

            string execCommand = "VerifyUser";
            SqlCommand _sql = _sqlDataAccess.GetCommand(execCommand, CommandType.StoredProcedure);
            _sql.Parameters.Add(new SqlParameter("email", DecryptString(ConfigurationManager.AppSettings["EncryptionKey"].ToString(), email)));
            DataTable dataTable = _sqlDataAccess.Execute(_sql);
            int result = Convert.ToInt32(dataTable.Rows[0][0]);
            string text = "";
            if (result != 0) {
                SaveFreeTrial(result);
                text = "Your account is successfull verified. Please visit Login page to access your account";
            }
            else
            {
                text = "Unable to verify your account.";
            }
            
            return Ok(text);
        }

        public void VerificationEmail(string email)
        {
            using (SmtpClient client = new SmtpClient("smtp.gmail.com", 587))
            {
                try
                {
                    string verifyURL = "https://keywordplanners.io/verifyuser?id=" + EncryptString(ConfigurationManager.AppSettings["EncryptionKey"].ToString(),email);
                    bool emailsent = false;
                    using (MailMessage mail = new MailMessage())
                    {
                        mail.From = new MailAddress(ConfigurationManager.AppSettings["NameCheapEmail"].ToString(), "KeywordPlanner");
                        mail.To.Add(email);
                        mail.Subject = "Verify Your Keyword Planner Account";
                        mail.Body = "Hi Please click the link below to verify your account.<br /><a href='"+ verifyURL + "'>Click Here For Account Activation</a>";
                        mail.IsBodyHtml = true;
                        //mail.Attachments.Add(new Attachment("C:\\file.zip"));

                        using (SmtpClient smtp = new SmtpClient("mail.privateemail.com", 587))
                        {
                            smtp.UseDefaultCredentials = false;
                            //smtp.Credentials = new NetworkCredential("ppcexpokeywordplanner@gmail.com", "ABC123ssi");
                            smtp.Credentials = new NetworkCredential(ConfigurationManager.AppSettings["NameCheapEmail"].ToString(), ConfigurationManager.AppSettings["NameCheapPassword"].ToString());

                            smtp.EnableSsl = true;
                            //smtp.UseDefaultCredentials = true;
                            smtp.Send(mail);
                            emailsent = true;
                        }


                    }
                }
                catch (Exception e)
                {
                    //throw new ApplicationException(e.Message);
                    throw e;
                }
            }
        }
        public static string EncryptString(string key, string plainText)
        {
            byte[] iv = new byte[16];
            byte[] array;

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = iv;

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream())
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter streamWriter = new StreamWriter((Stream)cryptoStream))
                        {
                            streamWriter.Write(plainText);
                        }

                        array = memoryStream.ToArray();
                    }
                }
            }

            return Convert.ToBase64String(array);
        }

        public static string DecryptString(string key, string cipherText)
        {
            byte[] iv = new byte[16];
            byte[] buffer = Convert.FromBase64String(cipherText);

            using (Aes aes = Aes.Create())
            {
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = iv;
                ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                using (MemoryStream memoryStream = new MemoryStream(buffer))
                {
                    using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader streamReader = new StreamReader((Stream)cryptoStream))
                        {
                            return streamReader.ReadToEnd();
                        }
                    }
                }
            }
        }
        [Route("api/Account/Contact")]
        [HttpPost]
        public IHttpActionResult Contact(Contact Contact)
        {
            try
            {
                using (MailMessage mail = new MailMessage())
                {
                    mail.From = new MailAddress(Contact.Email, Contact.Name);
                    mail.To.Add("support@keywordplanners.io");
                    //mail.To.Add("technisoft.asadj@gmail.com");
                    mail.Subject = Contact.Subject;
                    mail.Body = "<h3>From:"+Contact.Name+"("+Contact.Email+")"+"</h3><br />"+Contact.Message;
                    mail.IsBodyHtml = true;
                    //mail.Attachments.Add(new Attachment("C:\\file.zip"));

                    using (SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587))
                    {
                        smtp.UseDefaultCredentials = false;
                        smtp.EnableSsl = true;
                        //smtp.Credentials = new NetworkCredential("ppcexpokeywordplanner@gmail.com", "ABC123ssi");
                        smtp.Credentials = new NetworkCredential("technisoft.asadj@gmail.com", "yiwyzobyhgitkjii");


                        //smtp.UseDefaultCredentials = true;
                        smtp.Send(mail);
                    }


                }
            }
            catch (Exception e)
            {
                //throw new ApplicationException(e.Message);
                throw e;
            }


            return Ok();
        }

        [Route("api/Account/CheckUser")]
        [HttpGet]
        public IHttpActionResult CheckUser()
        {
            DataTable dt = null;

            HttpCookie objCookie = HttpContext.Current.Request.Cookies["UserInfo"];

            if (objCookie != null)
            {
                dt = Newtonsoft.Json.JsonConvert.DeserializeObject<DataTable>(objCookie.Value);
            }

            //if (HttpContext.Current.Session["UserInfo"] != null)
            //{
            //    dr = (DataRow)HttpContext.Current.Session["UserInfo"];
            //}

            string strReturnValue = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                UserInfo = dt
            });

            return Ok(strReturnValue);
        }

        [Route("api/Account/LogOut")]
        [HttpGet]
        public IHttpActionResult LogOut()
        {
            //HttpCookie objCookie = HttpContext.Current.Request.Cookies["UserInfo"];

            //if (objCookie != null)
            //{
            //    objCookie.Expires = DateTime.Now.AddMinutes(-10);
            //    objCookie.Value = null;
            //    HttpContext.Current.Response.Cookies.Add(objCookie);
            //}
            try
            {
                if (HttpContext.Current.Request.Cookies["UserInfo"] != null)
                {
                    HttpContext.Current.Response.Cookies["UserInfo"].Expires = DateTime.Now.AddDays(-1);
                }
            }
            catch (Exception e)
            {

                throw e;
            }
            
            return Ok();
        }

        private string GetEmailTemplate(string strNewPassword)
        {
            string strTemplate = "Hi, <br /> A request has been received to reset your password for account. <br />Your new password is: " + strNewPassword;
            strTemplate += "<br /><br /> Thank you, <br /> The Keyword Planner Team";


            return strTemplate;
        }

        private string GetRandomPassword()
        {
            var passwordBuilder = new StringBuilder();

            // 4-Letters lower case   
            passwordBuilder.Append(RandomString(4, true));

            // 4-Digits between 1000 and 9999  
            passwordBuilder.Append(RandomNumber(1000, 9999));

            // 2-Letters upper case  
            passwordBuilder.Append(RandomString(2));
            return passwordBuilder.ToString();
        }

        private int RandomNumber(int min, int max)
        {
            Random _random = new Random();
            return _random.Next(min, max);
        }

        private string RandomString(int size, bool lowerCase = false)
        {
            Random _random = new Random();

            var builder = new StringBuilder(size);

            // Unicode/ASCII Letters are divided into two blocks
            // (Letters 65–90 / 97–122):
            // The first group containing the uppercase letters and
            // the second group containing the lowercase.  

            // char is a single Unicode character  
            char offset = lowerCase ? 'a' : 'A';
            const int lettersOffset = 26; // A...Z or a..z: length=26  

            for (var i = 0; i < size; i++)
            {
                var @char = (char)_random.Next(offset, offset + lettersOffset);
                builder.Append(@char);
            }

            return lowerCase ? builder.ToString().ToLower() : builder.ToString();
        }
    }
}
