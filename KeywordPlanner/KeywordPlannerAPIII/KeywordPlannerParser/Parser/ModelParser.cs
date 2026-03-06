using KeywordPlannerModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerParser.Parser
{
    public abstract class ModelParser
    {
        public abstract dynamic Parse(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false);
        public abstract dynamic ParseYoutube(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false);
    }
}
