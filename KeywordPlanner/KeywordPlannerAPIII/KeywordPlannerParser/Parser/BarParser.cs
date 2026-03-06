using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using KeywordPlannerModels;

namespace KeywordPlannerParser.Parser
{
    public class BarParser : ModelParser
    {
        public override dynamic Parse(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            BarModel model = new BarModel();

            for (int i = 0; i < lstGridModel.Count(); i++)
            {

                for (int j = 0; j < model.MonthlyTargetedSearches.Length; j++)
                {
                    model.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();

                    model.MonthlyTargetedSearches[j].SearchVolume = lstGridModel[i].MonthlyTargetedSearches[j].SearchVolume;
                    model.MonthlyTargetedSearches[j].Month = lstGridModel[i].MonthlyTargetedSearches[j].Month;
                    model.MonthlyTargetedSearches[j].Year = lstGridModel[i].MonthlyTargetedSearches[j].Year;

                    model.Xaxis[j] = model.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(model.MonthlyTargetedSearches[j].Year).Substring(2);
                    model.Yaxis[j] = model.MonthlyTargetedSearches[j].SearchVolume.Value;
                }
            }


            //for (int i = 0; i < targetIdeaPage.entries.Length; i++)
            //{
            //    for (int j = 0; j < model.MonthlyTargetedSearches.Length; j++)
            //    {
            //        model.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();

            //        model.MonthlyTargetedSearches[j].SearchVolume = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
            //        model.MonthlyTargetedSearches[j].Month = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month;
            //        model.MonthlyTargetedSearches[j].Year = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;

            //        model.Xaxis[j] = model.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(model.MonthlyTargetedSearches[j].Year).Substring(2);
            //        model.Yaxis[j] = model.MonthlyTargetedSearches[j].SearchVolume.Value;
            //    }
            //}
            return model;
        }

        public override dynamic ParseYoutube(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            BarModel model = new BarModel();

            for (int i = 0; i < lstGridModel.Count(); i++)
            {

                for (int j = 0; j < model.MonthlyTargetedSearches.Length; j++)
                {
                    model.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();

                    model.MonthlyTargetedSearches[j].SearchVolume = lstGridModel[i].MonthlyTargetedSearches[j].SearchVolume;
                    model.MonthlyTargetedSearches[j].Month = lstGridModel[i].MonthlyTargetedSearches[j].Month;
                    model.MonthlyTargetedSearches[j].Year = lstGridModel[i].MonthlyTargetedSearches[j].Year;

                    model.Xaxis[j] = model.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(model.MonthlyTargetedSearches[j].Year).Substring(2);
                    model.Yaxis[j] = model.MonthlyTargetedSearches[j].SearchVolume.Value;
                }
            }


            //for (int i = 0; i < targetIdeaPage.entries.Length; i++)
            //{
            //    for (int j = 0; j < model.MonthlyTargetedSearches.Length; j++)
            //    {
            //        model.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();

            //        model.MonthlyTargetedSearches[j].SearchVolume = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
            //        model.MonthlyTargetedSearches[j].Month = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month;
            //        model.MonthlyTargetedSearches[j].Year = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;

            //        model.Xaxis[j] = model.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(model.MonthlyTargetedSearches[j].Year).Substring(2);
            //        model.Yaxis[j] = model.MonthlyTargetedSearches[j].SearchVolume.Value;
            //    }
            //}
            return model;
        }
    }
}
