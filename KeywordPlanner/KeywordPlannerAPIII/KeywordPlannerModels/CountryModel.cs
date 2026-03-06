using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KeywordPlannerModels
{
    public class CountryModel
    {
        public string CountryID { get; set; }

        public string Name { get; set; }

        public string Language { get; set; }

        public string LanguageID { get; set; }

        public string CountryLanguage { get; set; }

        public string CCLC { get; set; }

        public string Image { get; set; }

        public string Hl { get; set; }

        public int key { get; set; }
    }
}