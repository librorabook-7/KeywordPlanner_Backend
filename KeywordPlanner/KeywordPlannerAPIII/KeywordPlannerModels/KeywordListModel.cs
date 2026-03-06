using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KeywordPlannerModels
{
    public class KeywordListModel
    {
        public string Keywords { get; set; }

        public long LanguageId { get; set; }

        public long LocationId { get; set; }

        public bool TargetGoogleSearch { get; set; }

        public bool TargetSearchNetwork { get; set; }
    }
}