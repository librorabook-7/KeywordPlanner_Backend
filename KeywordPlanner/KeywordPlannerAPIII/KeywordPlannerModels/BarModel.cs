using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace KeywordPlannerModels
{
    public class BarModel
    {
        public MonthlyTargetedSearches[] MonthlyTargetedSearches { get; set; }

        public string[] Xaxis { get; set; }

        public long[] Yaxis { get; set; }

        public BarModel()
        {
            MonthlyTargetedSearches = new MonthlyTargetedSearches[12];
            Xaxis = new string[12];
            Yaxis = new long[12];
        }
    }
}
