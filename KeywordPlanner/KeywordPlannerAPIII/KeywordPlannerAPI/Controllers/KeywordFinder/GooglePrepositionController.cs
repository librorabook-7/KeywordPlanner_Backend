using System.Collections.Generic;
using System.Web.Http;
using KeywordPlannerParser.Parser.GooglePrepositionParser;

namespace KeywordPlannerAPI.Controllers.KeywordFinder
{
    public class GooglePrepositionController : ApiController
    {
        /// <summary>
        /// ["", "", ""]
        /// </summary>
        /// <param name="jsonModelList"></param>
        /// <returns></returns>
        public IHttpActionResult Post(LongJSONObject longJsonObject)
        {
            //List<GridModel> gridModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<GridModel>>(Newtonsoft.Json.JsonConvert.SerializeObject(jsonGridModelList));
            List<string> gridModel = Newtonsoft.Json.JsonConvert.DeserializeObject<List<string>>(longJsonObject.LongJSON);
            if (gridModel.Count == 0 || gridModel == null)
            {
                return Ok(new List<string>());
            }
            else
            {
                List<string> PrepositionGridModel = new PrepositionGridParser().PrepositionGridModel(gridModel);
                //ModelParser objGridBarParser = new GridBarParser();
                //GridBarModel gridBarModel = objGridBarParser.Parse(PrepositionGridModel);
                return Ok(PrepositionGridModel);
            }
        }
    }

    
}
