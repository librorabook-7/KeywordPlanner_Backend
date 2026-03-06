using KeywordPlannerAPI.Models;
using KeywordPlannerModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace KeywordPlannerAPI.LocationHelper
{
    public sealed class CountryHelper
    {
        private static CountryHelper Instance = null;

        private static List<CountryModel> ListModel { get; set; }

        private CountryHelper(){}
        public List<CountryModel> GetLocations()
        {
            try
            {
                if (ListModel == null || ListModel.Count == 0)
                {
                    var path = System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase).Replace("file:\\", "").Replace("\\bin", "");
                    var t = @path + "\\LocationHelper\\CountryCode.json";
                    ListModel = JsonConvert.DeserializeObject<List<CountryModel>>(File.ReadAllText(t));
                    int count = 0;
                    foreach (var item in ListModel)
                    {
                        item.key = count;
                        count++;

                    }
                }
                


            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return ListModel;
        }

        public static CountryHelper CountryInstance
        {
            get
            {
                if (Instance == null)
                {
                    Instance = new CountryHelper();
                }
                return Instance;
            }
        }
    }
}