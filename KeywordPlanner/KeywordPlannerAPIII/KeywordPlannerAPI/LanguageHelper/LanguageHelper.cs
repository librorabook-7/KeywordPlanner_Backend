using KeywordPlannerAPI.Models;
using KeywordPlannerModels;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace KeywordPlannerAPI.LanguageHelper
{
    public sealed class LanguageHelper
    {
        private static LanguageHelper Instance = null;

        private static List<LanguageModel> ListModel { get; set; }

        private LanguageHelper()
        {

        }

        public List<LanguageModel> GetLanguages()
        {
            try
            {
                if (ListModel == null || ListModel.Count() == 0)
                {
                    var path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase).Replace("file:\\", "");
                    var t = @path + "\\LanguageHelper\\LanguageCode.json";
                    ListModel = JsonConvert.DeserializeObject<List<LanguageModel>>(File.ReadAllText(t));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return ListModel;
        }

        public static LanguageHelper LanguageInstance
        {
            get
            {
                if (Instance == null)
                {
                    Instance = new LanguageHelper();
                }
                return Instance;
            }
        }
    }
}