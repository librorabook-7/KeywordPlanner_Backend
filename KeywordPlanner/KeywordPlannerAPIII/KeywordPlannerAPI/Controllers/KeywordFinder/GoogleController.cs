using System;
using System.Collections.Generic;
using System.Web.Http;
using KeywordPlannerParser.Parser;
using System.Configuration;
using System.Collections.Specialized;
using System.Linq;
using KeywordPlannerParser.Parser.GoogleQuestionParser;
using KeywordPlannerParser.Parser.GooglePrepositionParser;
using KeywordPlannerModels;
using KeywordPlanNetwork;
using System.Web;

namespace KeywordPlannerAPI.Controllers.KeywordFinder
{
    public class GoogleController : ApiController
    {
        [HttpGet]
        public IHttpActionResult Get([FromUri] string keyArray, int ideaType, long languageId, long locationId, bool targetGoogleSearch, bool targetSearchNetwork, [FromUri] string excludeKeywordsList, bool isKeyword,
            string searchVolumeMin, string searchVolumeMax, string cpcMin, string cpcMax, string competitionMin, string competitionMax, string pageToken, bool includeChartData = true, int keywordCount = 0, long state = 0, long city = 0)
        {

            //remove duplicates from the keywordsList
            bool blnIncludeResultChart = includeChartData;

            string[] KeyArrayParts = keyArray.Trim().Split(',');
            KeyArrayParts = KeyArrayParts.Distinct().ToList().ToArray();


            //remove duplicates from the excludeKeywordsList
            string[] excludeKeyArrayParts = { };
            if (excludeKeywordsList != null && excludeKeywordsList.Length > 0)
            {
                excludeKeyArrayParts = excludeKeywordsList.Trim().Split(',');
                excludeKeyArrayParts = excludeKeyArrayParts.Distinct().ToList().ToArray();
            }

            try
            {
                int intMinSearchVolume = ParseIntValues(searchVolumeMin);
                int intMaxSearchVolume = ParseIntValues(searchVolumeMax, true);

                if (ideaType == 3)
                {
                    NameValueCollection ClientCustomersCollection = (NameValueCollection)ConfigurationManager.GetSection("ClientCustomers");

                    var gridData = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken, includeChartData);

                    //TargetingIdeaPage targetIdeaPage = new BLReport().PopulateCompetitionData(ClientCustomersCollection["Umash Marketing"], KeyArrayParts, ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword);

                    if (gridData.GridModels.Count() == 0)
                    {
                        List<GridModel> gridModel = new List<GridModel>();
                        gridModel.Add(new GridModel()); ;
                        gridModel[0].ID = -1;
                        gridData.GridModels = gridModel;
                        return Ok(gridData);
                    }
                    else
                    {
                        ModelParser p = new GridParser();
                        List<GridModel> gridModel = p.Parse(gridData.GridModels);
                        gridModel[0].ID = -1;
                        gridData.GridModels = gridModel;
                        return Ok(gridData);
                    }
                }
                else if (ideaType == 2)
                {
                    //NameValueCollection ClientCustomersCollection = (NameValueCollection)ConfigurationManager.GetSection("ClientCustomers");
                    /// Search Volume will be filtered on search level
                    //TargetingIdeaPage targetIdeaPage = new BLReport().PopulateCompetitionData(ClientCustomersCollection["Umash Marketing"], KeyArrayParts, ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword, intMinSearchVolume, intMaxSearchVolume);
                    //List<GridModel> lstGridModel = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword, false, string.Join(",", KeyArrayParts));

                    var gridData = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken, false, "");
                    if (gridData.PageToken == null || (gridData.GridModels.Count() == 0 && gridData.PageToken != ""))
                    {
                        gridData = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId,
                            locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount,
                            state, city, isKeyword, pageToken, false, "");
                    }
                    if (gridData.GridModels.Count() == 0)
                    {
                        return
                        Ok(new
                        {
                            GridModelList = new List<GridModel>(),
                            GridBarModel = new GridBarModel(),
                            GridModelListRelevant = new List<GridModel>(),
                            Questions = new List<GridModel>(),
                            Prepositions = new List<GridModel>(),
                            PageToken = gridData.PageToken
                        });
                    }
                    else
                    {
                        ModelParser p = new GridParser();


                        decimal flMinCPC = ParseDecimalValues(cpcMin);
                        decimal flMaxCPC = ParseDecimalValues(cpcMax, true);
                        int intMinCompetition = ParseIntValues(competitionMin);
                        int intMaxCompetition = ParseIntValues(competitionMax, true);

                        /// CPC and Competitio will be filtered at parsing level

                        List<GridModel> gridModel = p.Parse(gridData.GridModels, intMinSearchVolume, intMaxSearchVolume, flMinCPC, flMaxCPC, intMinCompetition, intMaxCompetition);


                        //gridModel = gridModel.Where(x => (x.SearchVolume >= intMinSearchVolume && x.SearchVolume <= intMaxSearchVolume)).ToList();
                        //gridModel = gridModel.Where(x => (x.AverageCPC >= flMinCPC && x.AverageCPC <= flMaxCPC)).ToList();
                        //gridModel = gridModel.Where(x => (x.Competition >= intMinCompetition && x.Competition <= intMaxCompetition)).ToList();



                        List<GridModel> gridModelListData = gridModel.ToList();
                        ModelParser objGridBarParser = new GridBarParser();
                        GridBarModel gridBarModel = objGridBarParser.Parse(gridModel);
                        List<String> Question = new QuestionGridParser().QuestionGridModel(gridModel.Select(m => m.KeywordText).ToList());
                        List<String> Preposition = new PrepositionGridParser().PrepositionGridModel(gridModel.Select(m => m.KeywordText).ToList());

                        for (int i = 0; i < gridModel.Count; i++)
                        {
                            for (int j = 0; j < Question.Count; j++)
                            {
                                if (gridModel[i].KeywordText.Equals(Question[j]))
                                {
                                    gridModel.RemoveAt(i);
                                    i = i - 1;
                                    break;
                                }
                            }


                        }

                        if (blnIncludeResultChart == false)
                        {
                            for (int i = 0; i < gridModel.Count; i++)
                            {
                                gridModel[i].MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                                gridModel[i].Xaxis = new string[0];
                                gridModel[i].Yaxis = new long[0];
                            }

                        }

                        if (isKeyword == true)
                        {
                            return
                            Ok(new
                            {
                                GridModelListRelevant = gridModel.Where(m => m.KeywordText.ToUpper().Contains(keyArray.ToUpper())),
                                GridModelListRelated = gridModel.Where(m => !(m.KeywordText.ToUpper().Contains(keyArray.ToUpper()))),
                                Questions = Question,
                                Prepositions = Preposition,
                                GridBarModel = gridBarModel,
                                GridModel = gridModelListData,
                                PageToken = gridData.PageToken
                            });
                        }
                        else
                        {
                            return
                            Ok(new
                            {
                                GridModelListRelevant = gridModel.Where(m => !(m.KeywordText.ToUpper().Contains(keyArray.ToUpper()))),
                                Questions = Question,
                                Prepositions = Preposition,
                                GridBarModel = gridBarModel,
                                GridModel = gridModelListData,
                                PageToken = gridData.PageToken
                            });
                        }

                    }

                }
                else if (ideaType == 4)
                {
                    //NameValueCollection ClientCustomersCollection = (NameValueCollection)ConfigurationManager.GetSection("ClientCustomers");
                    /// Search Volume will be filtered on search level
                    //TargetingIdeaPage targetIdeaPage = new BLReport().PopulateCompetitionData(ClientCustomersCollection["Umash Marketing"], KeyArrayParts, ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword, intMinSearchVolume, intMaxSearchVolume);
                    //List<GridModel> lstGridModel = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword, false, string.Join(",", KeyArrayParts));

                    var data = new DataManager().GetData("", ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken, false, string.Join(",", KeyArrayParts));

                    if (data.GridModels.Count() == 0)
                    {
                        return
                        Ok(new
                        {
                            GridModelList = new List<GridModel>(),
                            GridBarModel = new GridBarModel(),
                            GridModelListRelevant = new List<GridModel>(),
                            Questions = new List<GridModel>(),
                            Prepositions = new List<GridModel>(),
                            PageToken = data.PageToken
                        });
                    }
                    else
                    {
                        ModelParser p = new GridParser();


                        decimal flMinCPC = ParseDecimalValues(cpcMin);
                        decimal flMaxCPC = ParseDecimalValues(cpcMax, true);
                        int intMinCompetition = ParseIntValues(competitionMin);
                        int intMaxCompetition = ParseIntValues(competitionMax, true);

                        /// CPC and Competitio will be filtered at parsing level

                        List<GridModel> gridModel = p.Parse(data.GridModels, intMinSearchVolume, intMaxSearchVolume, flMinCPC, flMaxCPC, intMinCompetition, intMaxCompetition);



                        //gridModel = gridModel.Where(x => (x.SearchVolume >= intMinSearchVolume && x.SearchVolume <= intMaxSearchVolume)).ToList();
                        //gridModel = gridModel.Where(x => (x.AverageCPC >= flMinCPC && x.AverageCPC <= flMaxCPC)).ToList();
                        //gridModel = gridModel.Where(x => (x.Competition >= intMinCompetition && x.Competition <= intMaxCompetition)).ToList();



                        List<GridModel> gridModelListData = gridModel.ToList();
                        ModelParser objGridBarParser = new GridBarParser();
                        GridBarModel gridBarModel = objGridBarParser.Parse(gridModel);
                        List<String> Question = new QuestionGridParser().QuestionGridModel(gridModel.Select(m => m.KeywordText).ToList());
                        List<String> Preposition = new PrepositionGridParser().PrepositionGridModel(gridModel.Select(m => m.KeywordText).ToList());

                        for (int i = 0; i < gridModel.Count; i++)
                        {
                            for (int j = 0; j < Question.Count; j++)
                            {
                                if (gridModel[i].KeywordText.Equals(Question[j]))
                                {
                                    gridModel.RemoveAt(i);
                                    i = i - 1;
                                    break;
                                }
                            }

                            //if (blnIncludeResultChart == false)
                            //{
                            //    gridModel[i].MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                            //    gridModel[i].Xaxis = new string[0];
                            //    gridModel[i].Yaxis = new long[0];
                            //}
                        }
                        if (blnIncludeResultChart == false)
                        {
                            for (int i = 0; i < gridModel.Count; i++)
                            {
                                gridModel[i].MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                                gridModel[i].Xaxis = new string[0];
                                gridModel[i].Yaxis = new long[0];
                            }

                        }
                        if (isKeyword == true)
                        {
                            return
                            Ok(new
                            {
                                GridModelListRelevant = gridModel.Where(m => m.KeywordText.ToUpper().Contains(keyArray.ToUpper())),
                                GridModelListRelated = gridModel.Where(m => !(m.KeywordText.ToUpper().Contains(keyArray.ToUpper()))),
                                Questions = Question,
                                Prepositions = Preposition,
                                GridBarModel = gridBarModel,
                                GridModel = gridModelListData,
                                PageToken = data.PageToken
                            });
                        }
                        else
                        {
                            return
                            Ok(new
                            {
                                GridModelListRelevant = gridModel.Where(m => !(m.KeywordText.ToUpper().Contains(keyArray.ToUpper()))),
                                Questions = Question,
                                Prepositions = Preposition,
                                GridBarModel = gridBarModel,
                                GridModel = gridModelListData,
                                PageToken = data.PageToken
                            });
                        }

                    }

                }
                else if (ideaType == 1)
                {
                    //NameValueCollection ClientCustomersCollection = (NameValueCollection)ConfigurationManager.GetSection("ClientCustomers");
                    //TargetingIdeaPage targetIdeaPage = new BLReport().PopulateCompetitionData(ClientCustomersCollection["Umash Marketing"], KeyArrayParts, ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, isKeyword);
                    var gridData = new DataManager().GetData(string.Join(",", KeyArrayParts), ideaType, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken);


                    if (gridData.GridModels.Count() == 0)
                    {
                        return Ok(new GridBarModel());
                    }
                    else
                    {
                        ModelParser p = new GridBarParser();
                        GridBarModel gridBarModel = p.Parse(gridData.GridModels);
                        return Ok(gridBarModel);
                    }
                }
                else
                {
                    return BadRequest("Parameters are incorrect");
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]

        public IHttpActionResult GetYoutube(string keyString, long languageId, long locationId, bool targetGoogleSearch, bool targetSearchNetwork, [FromUri] string excludeKeywordsList, bool isKeyword,
            string searchVolumeMin, string searchVolumeMax, string cpcMin, string cpcMax, string competitionMin, string competitionMax, string pageToken, bool includeChartData = true, int keywordCount = 0, long state = 0, long city = 0)
        {
            List<string> keyArray = keyString.Trim().Split(',').ToList();
            //remove duplicates from the keywordsList
            bool blnIncludeResultChart = includeChartData;

            string[] KeyArrayParts = { };//keyArray.Trim().Split(',');
            KeyArrayParts = keyArray.Distinct().ToList().ToArray();


            //remove duplicates from the excludeKeywordsList
            string[] excludeKeyArrayParts = { };
            if (excludeKeywordsList != null && excludeKeywordsList.Length > 0)
            {
                excludeKeyArrayParts = excludeKeywordsList.Trim().Split(',');
                excludeKeyArrayParts = excludeKeyArrayParts.Distinct().ToList().ToArray();
            }

            try
            {
                int intMinSearchVolume = ParseIntValues(searchVolumeMin);
                int intMaxSearchVolume = ParseIntValues(searchVolumeMax, true);

                var gridData = new DataManager().GetData(keyArray, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken, false, "");
                if (gridData.PageToken == null || (gridData.GridModels.Count() == 0 && gridData.PageToken != ""))
                {
                    gridData = new DataManager().GetData(keyArray, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeyArrayParts, keywordCount, state, city, isKeyword, pageToken, false, "");
                }
                if (gridData.GridModels.Count() == 0)
                {
                    return
                    Ok(new
                    {
                        GridModelList = new List<GridModel>(),
                        GridBarModel = new GridBarModel(),
                        GridModelListRelevant = new List<GridModel>(),
                        Questions = new List<GridModel>(),
                        Prepositions = new List<GridModel>(),
                    });
                }
                else
                {
                    ModelParser p = new GridParser();


                    decimal flMinCPC = ParseDecimalValues(cpcMin);
                    decimal flMaxCPC = ParseDecimalValues(cpcMax, true);
                    int intMinCompetition = ParseIntValues(competitionMin);
                    int intMaxCompetition = ParseIntValues(competitionMax, true);

                    /// CPC and Competitio will be filtered at parsing level

                    List<GridModel> gridModel = p.ParseYoutube(gridData.GridModels, intMinSearchVolume, intMaxSearchVolume, flMinCPC, flMaxCPC, intMinCompetition, intMaxCompetition);



                    //gridModel = gridModel.Where(x => (x.SearchVolume >= intMinSearchVolume && x.SearchVolume <= intMaxSearchVolume)).ToList();
                    //gridModel = gridModel.Where(x => (x.AverageCPC >= flMinCPC && x.AverageCPC <= flMaxCPC)).ToList();
                    //gridModel = gridModel.Where(x => (x.Competition >= intMinCompetition && x.Competition <= intMaxCompetition)).ToList();



                    List<GridModel> gridModelListData = gridModel.ToList();
                    ModelParser objGridBarParser = new GridBarParser();
                    GridBarModel gridBarModel = objGridBarParser.Parse(gridModel);
                    List<String> Question = new QuestionGridParser().QuestionGridModel(gridModel.Select(m => m.KeywordText).ToList());
                    List<String> Preposition = new PrepositionGridParser().PrepositionGridModel(gridModel.Select(m => m.KeywordText).ToList());

                    //for (int i = 0; i < gridModel.Count; i++)
                    //{
                    //    for (int j = 0; j < Question.Count; j++)
                    //    {
                    //        if (gridModel[i].KeywordText.Equals(Question[j]))
                    //        {
                    //            gridModel.RemoveAt(i);
                    //            i = i - 1;
                    //            break;
                    //        }
                    //    }


                    //}

                    //if (blnIncludeResultChart == false)
                    //{
                    //    for (int i = 0; i < gridModel.Count; i++)
                    //    {
                    //        gridModel[i].MonthlyTargetedSearches = new MonthlyTargetedSearches[0];
                    //        gridModel[i].Xaxis = new string[0];
                    //        gridModel[i].Yaxis = new long[0];
                    //    }

                    //}

                    if (isKeyword == true)
                    {
                        return
                        Ok(new
                        {
                            GridModelListRelevant = gridModel,
                            GridModelListRelated = gridModel,//.Where(m => !(m.KeywordText.ToUpper().Contains(keyArray.ToUpper()))),
                            Questions = Question,
                            Prepositions = Preposition,
                            GridBarModel = gridBarModel,
                            GridModel = gridModelListData,
                            PageToken = gridData.PageToken
                        });
                    }
                    else
                    {
                        return
                        Ok(new
                        {
                            GridModelListRelevant = gridModel,
                            Questions = Question,
                            Prepositions = Preposition,
                            GridBarModel = gridBarModel,
                            GridModel = gridModelListData,
                            PageToken = gridData.PageToken
                        });
                    }

                }

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        /// <summary>
        /// { "Keywords": "4 door wardrobe,5 drawer dresser","LanguageId": 1000,"LocationId": 2840,targetGoogleSearch": true,"targetSearchNetwork": false }
        /// </summary>
        /// <param name="keywordList"></param>
        /// <returns></returns>
        [HttpPost]
        public IHttpActionResult Post(KeywordListModel keywordList, int keywordCount = 0)
        {
            try
            {
                string[] KeywordListParts = keywordList.Keywords.Split(',').Distinct().ToList().Skip(0).Take(500).ToArray();
                string[] excludeKeyArrayParts = { };
                NameValueCollection ClientCustomersCollection = (NameValueCollection)ConfigurationManager.GetSection("ClientCustomers");

                //TargetingIdeaPage targetIdeaPage = new BLReport().PopulateCompetitionData(ClientCustomersCollection["Umash Marketing"], KeywordListParts, 3, keywordList.LanguageId, keywordList.LocationId, keywordList.TargetGoogleSearch, keywordList.TargetSearchNetwork, excludeKeyArrayParts, true);

                var gridData = new DataManager().GetData(string.Join(",", KeywordListParts), 2, keywordList.LanguageId, keywordList.LocationId, keywordList.TargetGoogleSearch, keywordList.TargetSearchNetwork, excludeKeyArrayParts, keywordCount, 0, 0, true, "", false, "");

                if (gridData.GridModels.Count() == 0)
                {
                    return Ok(new List<GridModel> { new GridModel() });
                }
                else
                {
                    ModelParser p = new GridParser();
                    List<GridModel> gridModel = p.Parse(gridData.GridModels);
                    return Ok(gridModel);
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpGet]
        public IHttpActionResult GetCities(string countryID = "")
        {

            return
                        Ok(new
                        {
                            cities = new DataManager().GetCities(countryID)

                        });
        }

        private List<GridModel> GetStaticGridModel()
        {
            List<GridModel> lstModel = new List<GridModel>();

            lstModel.Add(new GridModel
            {
                ID = 1,
                KeywordText = "How are you degree",
                SearchVolume = 33100,
                AverageCPC = 0.41m,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "-45%"

            });

            //lstModel[0].MonthlyTargetedSearches[0] = 

            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[0].Xaxis, lstModel[0].Yaxis);
            SetMonthlyTargetedSearches(lstModel[0].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[0].Xaxis, lstModel[0].Yaxis);


            lstModel.Add(new GridModel
            {
                ID = 2,
                KeywordText = "How are you degree",
                SearchVolume = 3310034,
                AverageCPC = 0.30m,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 3,
                KeywordText = "How are you degree",
                SearchVolume = 300,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[2].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 4,
                KeywordText = "masters in construction management",
                SearchVolume = 10,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[3].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 5,
                KeywordText = "recieve by me",
                SearchVolume = 50,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[4].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 6,
                KeywordText = "recieve by me",
                SearchVolume = 60,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[5].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 7,
                KeywordText = "recieve by me",
                SearchVolume = 200,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 8,
                KeywordText = "recieve by me",
                SearchVolume = 210,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 9,
                KeywordText = "recieve by me",
                SearchVolume = 220,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 10,
                KeywordText = "recieve by me",
                SearchVolume = 130,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 11,
                KeywordText = "recieve by me",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 12,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);
            SetMonthlyTargetedSearches(lstModel[1].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[1].Xaxis, lstModel[1].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 13,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[12].Xaxis, lstModel[12].Yaxis);
            SetMonthlyTargetedSearches(lstModel[12].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[12].Xaxis, lstModel[12].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 14,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[13].Xaxis, lstModel[13].Yaxis);
            SetMonthlyTargetedSearches(lstModel[13].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[13].Xaxis, lstModel[13].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 15,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "45%"
            });

            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[14].Xaxis, lstModel[14].Yaxis);
            SetMonthlyTargetedSearches(lstModel[14].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[14].Xaxis, lstModel[14].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 16,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "-30%"
            });

            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[15].Xaxis, lstModel[15].Yaxis);
            SetMonthlyTargetedSearches(lstModel[15].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[15].Xaxis, lstModel[15].Yaxis);

            lstModel.Add(new GridModel
            {
                ID = 17,
                KeywordText = "masters in construction management",
                SearchVolume = 480,
                AverageCPC = 2116724,
                Competition = 1,
                CompetitionLabel = "HIGH",
                Ternd = "-20%"
            });

            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 0, 2019, 5, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 1, 2019, 4, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 2, 2019, 3, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 3, 2019, 2, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 4, 2019, 1, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 5, 2018, 12, 320, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 6, 2018, 11, 390, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 7, 2018, 10, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 8, 2018, 9, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 9, 2018, 8, 480, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 10, 2018, 7, 590, lstModel[16].Xaxis, lstModel[16].Yaxis);
            SetMonthlyTargetedSearches(lstModel[16].MonthlyTargetedSearches, 11, 2018, 5, 590, lstModel[16].Xaxis, lstModel[16].Yaxis);


            return lstModel;
        }

        private GridBarModel GetBarModel()
        {

            GridBarModel objBarModel = new GridBarModel
            {
                TotalSearchVolume = 99840,
                TotalAverageCPC = 1517134,
                AverageCompetition = 0.49412302798369362,
                TotalTernd = "-20 %"

            };


            objBarModel.Xaxis = new string[12] { "May 19", "Apr 19", "Mar 19", "Feb 19", "Jan 19", "Dec 18", "Nov 18", "Oct 18", "Sep 18", "Aug 18", "Jul 18", "Jun 18" };
            objBarModel.Yaxis = new long[12] { 98430, 98890, 101540, 101410, 108410, 92950, 96770, 99470, 97360, 101320, 102480, 98810 };





            return objBarModel;
        }

        private void SetMonthlyTargetedSearches(MonthlyTargetedSearches[] arrMonthlyTargetedSearches, int intIndex, int intYear, int? intMonth, long? searchVolume, string[] xAxis, long[] yAxis)
        {
            arrMonthlyTargetedSearches[intIndex] = new MonthlyTargetedSearches();
            arrMonthlyTargetedSearches[intIndex].Year = intYear;
            arrMonthlyTargetedSearches[intIndex].Month = intMonth;
            arrMonthlyTargetedSearches[intIndex].SearchVolume = searchVolume;

            xAxis[intIndex] = intMonth.ToString() + " " + intYear;
            yAxis[intIndex] = Convert.ToInt32(searchVolume);
        }

        private int ParseIntValues(string strValue, bool blnIsMax = false)
        {
            int intLocalValue = 0;

            //if (blnIsMax) intLocalValue = 9999999;

            if (!int.TryParse(strValue, out intLocalValue))
            {
                if (blnIsMax) intLocalValue = 9999999;
            }
            return intLocalValue;
        }

        private decimal ParseDecimalValues(string strValue, bool blnIsMax = false)
        {
            decimal intLocalValue = 0;

            if (blnIsMax) intLocalValue = 9999999;

            if (!decimal.TryParse(strValue, out intLocalValue))
            {
                if (blnIsMax) intLocalValue = 9999999;
            }
            return intLocalValue;
        }


    }
}
