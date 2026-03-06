using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerModels
{
    public class GridBarModel
    {
        public long? TotalSearchVolume { get; set; }

        public string TotalTernd { get; set; }

        public decimal? TotalAverageCPC { get; set; }

        public double? AverageCompetition { get; set; }

        public string[] Xaxis { get; set; }

        public long[] Yaxis { get; set; }

        public GridBarModel()
        {
            Xaxis = new string[12];
            Yaxis = new long[12];
        }
    }
}
