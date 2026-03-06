using edu.stanford.nlp.tagger.maxent;
using KeywordPlannerModels;
using System.Collections.Generic;
using System.Configuration;
using System.Web;

namespace KeywordPlannerParser.Parser.GooglePrepositionParser
{
    public class PrepositionGridParser
    {
        public List<string> PrepositionGridModel(List<string> gridModel)
        {
            var modelsDirectory = ConfigurationManager.AppSettings["PosTaggerPath"] + @"\models";
            var path = System.Web.HttpContext.Current.Server.MapPath(modelsDirectory + @"\wsj-0-18-bidirectional-nodistsim.tagger");
            
            var tagger = new MaxentTagger(path);//(modelsDirectory + @"\wsj-0-18-bidirectional-nodistsim.tagger");
            //List<GridModel> prepositionGridModel = new List<GridModel>();
            List<string> prepositionGridModel = new List<string>();
            foreach (string model in gridModel)
            {
                if (model.isPreposition(tagger) == true)
                {
                    prepositionGridModel.Add(model);
                }
            }
            return prepositionGridModel;
        }
    }
}
