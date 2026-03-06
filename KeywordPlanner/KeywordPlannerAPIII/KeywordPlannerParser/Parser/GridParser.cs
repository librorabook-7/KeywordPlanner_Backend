using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using KeywordPlannerModels;

namespace KeywordPlannerParser.Parser
{
    public class GridParser : ModelParser
    {
        public override dynamic Parse(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            List<GridModel> model = new List<GridModel>();
            try
            {
                for (int i = 0; i < lstGridModel.Count(); i++)
                {
                    int[] trendArray = new int[12];
                    GridModel m = new GridModel();
                    GridModel objDataGridModel = lstGridModel[i];

                    m.ID = i;
                    m.KeywordText = objDataGridModel.KeywordText;
                    m.SearchVolume = objDataGridModel.SearchVolume;


                    if (objDataGridModel.AverageCPC == 0)
                    {
                        m.AverageCPC = Convert.ToDecimal(0.00);
                    }
                    else
                    {

                        m.AverageCPC = objDataGridModel.AverageCPC / Convert.ToDecimal(1000000);
                        m.AverageCPC = (Decimal?)Math.Round((Decimal)m.AverageCPC, 2);
                    }




                    //m.Competition = (Double?)(Math.Round((Double)objDataGridModel.Competition, 2) * 100);

                    m.Competition = objDataGridModel.Competition;

                    if (m.SearchVolume != 0 && m.AverageCPC >= flCPCMin && m.AverageCPC <= flCPCMax && m.Competition >= intCompetitionMin && m.Competition <= intCompetitionMax)
                    {
                        m.CompetitionLabel = objDataGridModel.CompetitionLabel;
                        m.LowestBid = objDataGridModel.LowestBid;
                        m.HighestBid = objDataGridModel.HighestBid;
                        if (blnIncludeResult == true)
                        {
                            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                            {
                                m.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();
                                m.MonthlyTargetedSearches[j].SearchVolume = objDataGridModel.MonthlyTargetedSearches[j].SearchVolume;
                                m.MonthlyTargetedSearches[j].Month = objDataGridModel.MonthlyTargetedSearches[j].Month;
                                m.MonthlyTargetedSearches[j].Year = objDataGridModel.MonthlyTargetedSearches[j].Year;
                                m.Xaxis[j] = m.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(m.MonthlyTargetedSearches[j].Year).Substring(2);
                                trendArray[j] = m.MonthlyTargetedSearches[j].Month.Value;
                                m.Yaxis[j] = m.MonthlyTargetedSearches[j].SearchVolume.Value;
                            }

                            m.Ternd = m.Yaxis.Trend();

                            Array.Reverse(m.Xaxis);
                            Array.Reverse(m.Yaxis);
                        }
                        else
                        {
                            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                            {
                                m.Xaxis[j] = objDataGridModel.MonthlyTargetedSearches[j].Month + " " + objDataGridModel.MonthlyTargetedSearches[j].Year;
                                m.Yaxis[j] = objDataGridModel.MonthlyTargetedSearches[j].SearchVolume.Value;
                            }

                            m.Ternd = m.Yaxis.Trend();

                            m.MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                        }
                        model.Add(m);
                    }

                }



                //for (int i = 0; i < targetIdeaPage.entries.Length; i++)
                //{
                //    int[] trendArray = new int[12];
                //    GridModel m = new GridModel();
                //    m.ID = i;
                //    m.KeywordText = ((AdsApi.StringAttribute)targetIdeaPage.entries[i].data[0].value).value;
                //    m.SearchVolume = ((AdsApi.LongAttribute)targetIdeaPage.entries[i].data[4].value).value;

                //    if (((AdsApi.MoneyAttribute)targetIdeaPage.entries[i].data[3].value).value == null)
                //    {
                //        m.AverageCPC = Convert.ToDecimal(0.00);
                //    }
                //    else
                //    {
                //        m.AverageCPC = Math.Round(((((AdsApi.MoneyAttribute)targetIdeaPage.entries[i].data[3].value).value.microAmount) / (Convert.ToDecimal(1000000))), 2);
                //    }

                //    m.Competition = (Math.Round(((AdsApi.DoubleAttribute)targetIdeaPage.entries[i].data[1].value).value, 2)) * 100;

                //    if (m.SearchVolume != 0 && m.AverageCPC >= flCPCMin && m.AverageCPC <= flCPCMax && m.Competition >= intCompetitionMin && m.Competition <= intCompetitionMax)
                //    {

                //        double COMPETITION_ROUNDED = Math.Round(((AdsApi.DoubleAttribute)targetIdeaPage.entries[i].data[1].value).value, 2);
                //        if (COMPETITION_ROUNDED >= 0 && COMPETITION_ROUNDED < 0.3333)
                //            m.CompetitionLabel = "LOW";
                //        else if (COMPETITION_ROUNDED >= 0.3333 && COMPETITION_ROUNDED <= 0.6667)
                //            m.CompetitionLabel = "MEDIUM";
                //        else
                //            m.CompetitionLabel = "HIGH";


                //        if (blnIncludeResult == true)
                //        {
                //            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                //            {
                //                m.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();
                //                m.MonthlyTargetedSearches[j].SearchVolume = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
                //                m.MonthlyTargetedSearches[j].Month = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month;
                //                m.MonthlyTargetedSearches[j].Year = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;
                //                m.Xaxis[j] = m.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(m.MonthlyTargetedSearches[j].Year).Substring(2);
                //                trendArray[j] = m.MonthlyTargetedSearches[j].Month.Value;
                //                m.Yaxis[j] = m.MonthlyTargetedSearches[j].SearchVolume.Value;
                //            }

                //            m.Ternd = m.Yaxis.Trend();

                //            Array.Reverse(m.Xaxis);
                //            Array.Reverse(m.Yaxis);
                //        }
                //        else
                //        {
                //            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                //            {
                //                m.Xaxis[j] = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month + " " + ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;
                //                m.Yaxis[j] = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
                //            }

                //            m.Ternd = m.Yaxis.Trend();

                //            m.MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                //            //m.Xaxis = new string[0];
                //            //m.Yaxis = new long[0];
                //        }


                //        model.Add(m);
                //    }

                //}
                return (from m in model orderby m.SearchVolume descending select m).ToList();
            }
            catch (Exception ex)
            {
                return ex.Message;
            }

        }

        public override dynamic ParseYoutube(List<GridModel> lstGridModel, int intMinSearchVolume = 0, int intMaxSearchVolume = 9999999, decimal flCPCMin = 0, decimal flCPCMax = 9999999,
            int intCompetitionMin = 0, int intCompetitionMax = 9999999, bool blnIncludeResult = false)
        {
            List<GridModel> model = new List<GridModel>();
            try
            {
                for (int i = 0; i < lstGridModel.Count(); i++)
                {
                    int[] trendArray = new int[12];
                    GridModel m = new GridModel();
                    GridModel objDataGridModel = lstGridModel[i];

                    m.ID = i;
                    m.KeywordText = objDataGridModel.KeywordText;
                    m.SearchVolume = objDataGridModel.SearchVolume;


                    if (objDataGridModel.AverageCPC == 0)
                    {
                        m.AverageCPC = Convert.ToDecimal(0.00);
                    }
                    else
                    {

                        m.AverageCPC = objDataGridModel.AverageCPC / Convert.ToDecimal(1000000);
                        m.AverageCPC = (Decimal?)Math.Round((Decimal)m.AverageCPC, 2);
                    }




                    //m.Competition = (Double?)(Math.Round((Double)objDataGridModel.Competition, 2) * 100);

                    m.Competition = objDataGridModel.Competition;

                    if (m.SearchVolume != 0 && m.AverageCPC >= flCPCMin && m.AverageCPC <= flCPCMax && m.Competition >= intCompetitionMin && m.Competition <= intCompetitionMax)
                    {
                        m.CompetitionLabel = objDataGridModel.CompetitionLabel;
                        m.LowestBid = objDataGridModel.LowestBid;
                        m.HighestBid = objDataGridModel.HighestBid;
                        if (blnIncludeResult == true)
                        {
                            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                            {
                                m.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();
                                m.MonthlyTargetedSearches[j].SearchVolume = objDataGridModel.MonthlyTargetedSearches[j].SearchVolume;
                                m.MonthlyTargetedSearches[j].Month = objDataGridModel.MonthlyTargetedSearches[j].Month;
                                m.MonthlyTargetedSearches[j].Year = objDataGridModel.MonthlyTargetedSearches[j].Year;
                                m.Xaxis[j] = m.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(m.MonthlyTargetedSearches[j].Year).Substring(2);
                                trendArray[j] = m.MonthlyTargetedSearches[j].Month.Value;
                                m.Yaxis[j] = m.MonthlyTargetedSearches[j].SearchVolume.Value;
                            }

                            m.Ternd = m.Yaxis.Trend();

                            Array.Reverse(m.Xaxis);
                            Array.Reverse(m.Yaxis);
                        }
                        else
                        {
                            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                            {
                                m.Xaxis[j] = objDataGridModel.MonthlyTargetedSearches[j].Month + " " + objDataGridModel.MonthlyTargetedSearches[j].Year;
                                m.Yaxis[j] = objDataGridModel.MonthlyTargetedSearches[j].SearchVolume.Value;
                            }

                            m.Ternd = m.Yaxis.Trend();

                            m.MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                        }
                        model.Add(m);
                    }

                }



                //for (int i = 0; i < targetIdeaPage.entries.Length; i++)
                //{
                //    int[] trendArray = new int[12];
                //    GridModel m = new GridModel();
                //    m.ID = i;
                //    m.KeywordText = ((AdsApi.StringAttribute)targetIdeaPage.entries[i].data[0].value).value;
                //    m.SearchVolume = ((AdsApi.LongAttribute)targetIdeaPage.entries[i].data[4].value).value;

                //    if (((AdsApi.MoneyAttribute)targetIdeaPage.entries[i].data[3].value).value == null)
                //    {
                //        m.AverageCPC = Convert.ToDecimal(0.00);
                //    }
                //    else
                //    {
                //        m.AverageCPC = Math.Round(((((AdsApi.MoneyAttribute)targetIdeaPage.entries[i].data[3].value).value.microAmount) / (Convert.ToDecimal(1000000))), 2);
                //    }

                //    m.Competition = (Math.Round(((AdsApi.DoubleAttribute)targetIdeaPage.entries[i].data[1].value).value, 2)) * 100;

                //    if (m.SearchVolume != 0 && m.AverageCPC >= flCPCMin && m.AverageCPC <= flCPCMax && m.Competition >= intCompetitionMin && m.Competition <= intCompetitionMax)
                //    {

                //        double COMPETITION_ROUNDED = Math.Round(((AdsApi.DoubleAttribute)targetIdeaPage.entries[i].data[1].value).value, 2);
                //        if (COMPETITION_ROUNDED >= 0 && COMPETITION_ROUNDED < 0.3333)
                //            m.CompetitionLabel = "LOW";
                //        else if (COMPETITION_ROUNDED >= 0.3333 && COMPETITION_ROUNDED <= 0.6667)
                //            m.CompetitionLabel = "MEDIUM";
                //        else
                //            m.CompetitionLabel = "HIGH";


                //        if (blnIncludeResult == true)
                //        {
                //            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                //            {
                //                m.MonthlyTargetedSearches[j] = new MonthlyTargetedSearches();
                //                m.MonthlyTargetedSearches[j].SearchVolume = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
                //                m.MonthlyTargetedSearches[j].Month = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month;
                //                m.MonthlyTargetedSearches[j].Year = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;
                //                m.Xaxis[j] = m.MonthlyTargetedSearches[j].Month.Value.ToMonth() + " " + Convert.ToString(m.MonthlyTargetedSearches[j].Year).Substring(2);
                //                trendArray[j] = m.MonthlyTargetedSearches[j].Month.Value;
                //                m.Yaxis[j] = m.MonthlyTargetedSearches[j].SearchVolume.Value;
                //            }

                //            m.Ternd = m.Yaxis.Trend();

                //            Array.Reverse(m.Xaxis);
                //            Array.Reverse(m.Yaxis);
                //        }
                //        else
                //        {
                //            for (int j = 0; j < m.MonthlyTargetedSearches.Length; j++)
                //            {
                //                m.Xaxis[j] = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].month + " " + ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].year;
                //                m.Yaxis[j] = ((AdsApi.MonthlySearchVolumeAttribute)targetIdeaPage.entries[i].data[2].value).value[j].count;
                //            }

                //            m.Ternd = m.Yaxis.Trend();

                //            m.MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                //            //m.Xaxis = new string[0];
                //            //m.Yaxis = new long[0];
                //        }


                //        model.Add(m);
                //    }

                //}
                return model.ToList();
            }
            catch (Exception ex)
            {
                return ex.Message;
            }

        }
    }
}
