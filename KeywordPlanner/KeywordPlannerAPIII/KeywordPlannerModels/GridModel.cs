using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerModels
{
    public class GridData
    {
        public List<GridModel> GridModels { get; set; }
        public string PageToken { get; set; }

        public GridData()
        {
            GridModels = new List<GridModel>();
        }
    }
    public class GridModel
    {
        public long ID{ get; set; }

        public string KeywordText { get; set; }

        public MonthlyTargetedSearches[] MonthlyTargetedSearches { get; set; }

        public long? SearchVolume { get; set; }

        public decimal? AverageCPC { get; set; }

        public long Competition { get; set; }

        public string CompetitionLabel { get; set; }

        public string[] Xaxis { get; set; }
    
        public long[] Yaxis  { get; set; }

        public string Ternd { get; set; }

        public Decimal HighestBid { get; set; }
        public Decimal LowestBid { get; set; }

        public GridModel()
        {
            MonthlyTargetedSearches = new MonthlyTargetedSearches[12];
            Xaxis = new string[12];
            Yaxis = new long[12];
        }
    }
}
