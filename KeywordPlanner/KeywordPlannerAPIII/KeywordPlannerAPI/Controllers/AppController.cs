using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using KeywordPlannerAPI.Helper;
using KeywordPlannerModels;

namespace KeywordPlannerAPI.Controllers
{
    [EnableCors(origins: "*", headers: "*",
        methods: "*", SupportsCredentials = true)]
    public class AppController : ApiController
    {
        private static readonly string _fileDirectoryPath = ConfigurationManager.AppSettings["uiIndexFilePath"];

        [Route("api/app/GetMetaTags")]
        [HttpGet]
        public IHttpActionResult GetMetaTags()
        {
            SqlDataAccess sqlDataAccess = new SqlDataAccess();
            string query = "select * from AppMetaTags";
            SqlCommand sql = sqlDataAccess.GetCommand(query, CommandType.Text);

            DataTable dataTable = sqlDataAccess.Execute(sql);
            return Ok(dataTable);
        }

        [Route("api/app/AddMetaTags")]
        [HttpPost]
        public IHttpActionResult AddMetaTags([FromBody] MetaTagModel tag)
        {
            try
            {
                SqlDataAccess sqlDataAccess = new SqlDataAccess();
                string query = $"INSERT INTO AppMetaTags(MetaName, Content) VALUES('{tag.MetaName}', '{tag.Content}')";

                SqlCommand sql = sqlDataAccess.GetCommand(query, CommandType.Text);

                int result = sqlDataAccess.ExecuteNonQuery(sql);
                ReWriteMetaTags();
                return Ok((result));
            }
            catch (Exception e)
            {

                throw e;
            }
            return Ok();
        }

        [Route("api/app/SyncMetaTags")]
        [HttpGet]
        public IHttpActionResult SyncMetaTags()
        {
            try
            {
                ReWriteMetaTags();
            }
            catch (Exception e)
            {

                throw e;
            }
            return Ok();
        }

        [Route("api/app/DeleteMetaTags")]
        [HttpGet]
        public IHttpActionResult DeleteMetaTags(int MetaTagID)
        {
            try
            {
                SqlDataAccess sqlDataAccess = new SqlDataAccess();
                string query = $"DELETE FROM AppMetaTags WHERE AppMetaTagsId = '{MetaTagID}'";

                SqlCommand sql = sqlDataAccess.GetCommand(query, CommandType.Text);

                sqlDataAccess.ExecuteNonQuery(sql);
                return Ok(true);
            }
            catch (Exception e)
            {
             return Ok(e.Message);
            }
        }

        #region Meta Tags Methods
        static void ReWriteMetaTags()
        {
            SqlDataAccess sqlDataAccess = new SqlDataAccess();
            string query = "select * from AppMetaTags";
            SqlCommand sql = sqlDataAccess.GetCommand(query, CommandType.Text);

            DataTable dataTable = sqlDataAccess.Execute(sql);

            List<MetaTagModel> metaTags = new List<MetaTagModel>();

            foreach (DataRow row in dataTable.Rows)
            {
                metaTags.Add(new MetaTagModel
                {
                    MetaName = row["MetaName"].ToString(),
                    Content = row["Content"].ToString()
                });
            }

            string htmlContent = File.ReadAllText(_fileDirectoryPath);

            string additionalMetaTags = ConvertMetaTagsToHtml(metaTags, htmlContent);

            if (!string.IsNullOrEmpty(additionalMetaTags))
            {
                additionalMetaTags = $"<!-- Meta Tags from Database -->\n{additionalMetaTags}<!-- Meta Tags from Database-->\n";

                string modifiedHtml = InsertMetaTags(htmlContent, additionalMetaTags);

                File.WriteAllText(_fileDirectoryPath, modifiedHtml);
            }

        }
        static string ConvertMetaTagsToHtml(List<MetaTagModel> metaTags, string existingHtml)
        {
            StringBuilder html = new StringBuilder();

            foreach (var metaTag in metaTags)
            {
                string metaTagString = $"<meta name=\"{metaTag.MetaName}\" content=\"{metaTag.Content}\">";
                if (!existingHtml.Contains(metaTagString))
                {
                    html.Append(metaTagString + "\n");
                }
            }

            return html.ToString();
        }
        static string InsertMetaTags(string htmlContent, string additionalMetaTags)
        {
            int headIndex = htmlContent.IndexOf("</head>");

            if (headIndex != -1)
            {
                StringBuilder modifiedHtml = new StringBuilder(htmlContent);
                modifiedHtml.Insert(headIndex, additionalMetaTags);

                return modifiedHtml.ToString();
            }

            return htmlContent;
        }
        #endregion
    }
}
