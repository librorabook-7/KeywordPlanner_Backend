using System.Collections.Generic;
using System.Web.Http;
using KeywordPlannerParser.Parser;
using KeywordPlannerParser.Parser.GoogleQuestionParser;

namespace KeywordPlannerAPI.Controllers.KeywordFinder
{
    public class GoogleQuestionsController : ApiController
    {
        /// <summary>
        /// ["", "", ""]
        /// </summary>
        /// <param name="jsonGridModelList"></param>
        /// <returns></returns>
        [HttpPost]
        public IHttpActionResult Post(LongJSONObject longJsonObject)
        {
            //List<GridModel> gridModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<GridModel>>(Newtonsoft.Json.JsonConvert.SerializeObject(jsonGridModelList));
            //List<string> gridModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(jsonGridModelList);
            List<string> gridModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(longJsonObject.LongJSON);
            if (gridModel.Count == 0 || gridModel == null)
            {
                return Ok(new List<string>());
            }
            else
            {
                List<string> QuestionGridModel = new QuestionGridParser().QuestionGridModel(gridModel);
                //ModelParser objGridBarParser = new GridBarParser();
                //GridBarModel gridBarModel = objGridBarParser.Parse(QuestionGridModel);
                return Ok(QuestionGridModel);
            }
        }
    }
    public class LongJSONObject
    {
        public string LongJSON { get; set; }
    }
}   
