
using KeywordPlannerModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerParser.Parser
{
    public class GridBarParser : ModelParser
    {
        public override dynamic Parse(List<GridModel> gridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            //List<GridModel> gridModel = gridModel1;
            GridBarModel gridbarmodel = new GridBarModel();
            try
            {
                gridbarmodel.TotalSearchVolume = gridModel.Sum(m => m.SearchVolume);
                gridbarmodel.AverageCompetition = gridModel.Average(m => m.Competition);
                gridbarmodel.TotalAverageCPC = Math.Round(Convert.ToDecimal(gridModel.Average(m => m.AverageCPC)), 2);
                if (gridModel.Count > 0)
                {
                    for (int j = 0; j < gridModel[0].Xaxis.Length; j++)
                    {
                        gridbarmodel.Xaxis[j] = gridModel[0].Xaxis[j];
                    }
                    for (int j = 0; j < gridModel.Count; j++)
                    {
                        for (int i = 0; i < 12; i++)
                        {
                            gridbarmodel.Yaxis[i] += gridModel[j].Yaxis[i];
                        }
                    }
                    long[] arr1 = gridbarmodel.Yaxis.ToRunningSum();
                    double[] arr2 = arr1.ToRunningAvg(gridbarmodel.Xaxis.ToMonthArray());
                    double[] arr3 = gridbarmodel.Yaxis.ToRunningPercentGain(arr2);
                    gridbarmodel.TotalTernd = Convert.ToString(arr3.Last()) + " " + "%";
                }
                else
                {
                    Console.WriteLine("No Data Found");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            
            return gridbarmodel;
        }
        public override dynamic ParseYoutube(List<GridModel> gridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            //List<GridModel> gridModel = gridModel1;
            GridBarModel gridbarmodel = new GridBarModel();
            try
            {
                gridbarmodel.TotalSearchVolume = gridModel.Sum(m => m.SearchVolume);
                gridbarmodel.AverageCompetition = gridModel.Average(m => m.Competition);
                gridbarmodel.TotalAverageCPC = Math.Round(Convert.ToDecimal(gridModel.Average(m => m.AverageCPC)), 2);
                if (gridModel.Count > 0)
                {
                    for (int j = 0; j < gridModel[0].Xaxis.Length; j++)
                    {
                        gridbarmodel.Xaxis[j] = gridModel[0].Xaxis[j];
                    }
                    for (int j = 0; j < gridModel.Count; j++)
                    {
                        for (int i = 0; i < 12; i++)
                        {
                            gridbarmodel.Yaxis[i] += gridModel[j].Yaxis[i];
                        }
                    }
                    long[] arr1 = gridbarmodel.Yaxis.ToRunningSum();
                    double[] arr2 = arr1.ToRunningAvg(gridbarmodel.Xaxis.ToMonthArray());
                    double[] arr3 = gridbarmodel.Yaxis.ToRunningPercentGain(arr2);
                    gridbarmodel.TotalTernd = Convert.ToString(arr3.Last()) + " " + "%";
                }
                else
                {
                    Console.WriteLine("No Data Found");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return gridbarmodel;
        }
    }
}
