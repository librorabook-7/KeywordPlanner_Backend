using Google.Ads.GoogleAds;
using Google.Ads.GoogleAds.Config;
using Google.Ads.GoogleAds.Lib;
using Google.Ads.GoogleAds.V18.Common;
using Google.Ads.GoogleAds.V18.Errors;
using Google.Ads.GoogleAds.V18.Services;
using Google.Ads.GoogleAds.V18.Resources;
using Google.Protobuf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using static Google.Ads.GoogleAds.V18.Enums.KeywordPlanNetworkEnum.Types;
using System.Configuration;
using KeywordPlannerModels;
using Google.Api.Gax;
using Google.Ads.GoogleAds.V18.Services;

namespace KeywordPlanNetwork
{
    public class DataManager
    {
        public GridData GetData(string keyArray, int ideaType, long languageId, long locationId,
            bool targetGoogleSearch, bool targetSearchNetwork, string[] excludeKeywordsList, int keywordCount,long state,
            long city,
            bool isKeyword,string pageToken, bool blnIncludeCharts = false, string strPageURL ="")
        {
            //pageToken = "CLue546s2pPpIBAKGJKs6KnKMSIWbUJwckhGbV95bkFJNWZhamJFVXo5ZyoDdjEzQFY";
            //pageToken = "CLue546s2pPpIBAeGMjz-6nKMSIWSmdndEtfVTdDaDZoSnRjTElDUExfQSoDdjEzQFY";
            GoogleAdsConfig config = new GoogleAdsConfig();
      // Load the JSON secrets.
      //ClientSecrets secrets = new ClientSecrets()
      //{
      //    ClientId = config.OAuth2ClientId,
      //    ClientSecret = config.OAuth2ClientSecret
      //};

      string refreshToken = "1//03RJuY2Nbo6oGCgYIARAAGAMSNwF-L9IrsCbnW92cg95hPjPg-Lj-OWjltsaHiCQEBVPA4_U0p_mid-FdbRpFAVcr70FvgWgth9g";

            // To make a call, set the refreshtoken to the config, and
            // create the GoogleAdsClient.
            config.OAuth2RefreshToken = refreshToken;
            string strClientCustomerId = ConfigurationManager.AppSettings["ClientCustomerId"].ToString();

            strClientCustomerId = strClientCustomerId.Replace("-", "");

            GoogleAdsClient client = new GoogleAdsClient(config);

            List<string> lstKeywords = new List<string>();

            if (!String.IsNullOrEmpty(keyArray))
            { 
                lstKeywords = keyArray.Trim().Split(',').Distinct().ToList();
            }

            //if (!String.IsNullOrEmpty(strPageURL))
            //{
            //    lstKeywords = new List<string>();
            //}

            /// exclude key parts code should be included need to do it

            List<long> lstLcations = new List<long>() { (city > 0) ? city : (state == 0) ? locationId : state };

            return Run(client, strClientCustomerId, lstLcations.ToArray(), languageId, lstKeywords.ToArray(), strPageURL, keywordCount, pageToken);

            //Run();
        }

        public GridData GetData(List<string> lstKeywords,long languageId, long locationId,
            bool targetGoogleSearch, bool targetSearchNetwork, string[] excludeKeywordsList, int keywordCount, long state,long city,
            bool isKeyword,string pageToken, bool blnIncludeCharts = false, string strPageURL = "")
        {

            GoogleAdsConfig config = new GoogleAdsConfig();
            // Load the JSON secrets.
            //ClientSecrets secrets = new ClientSecrets()
            //{
            //    ClientId = config.OAuth2ClientId,
            //    ClientSecret = config.OAuth2ClientSecret
            //};

            string refreshToken = ConfigurationManager.AppSettings["OAuth2RefreshToken"];

            // To make a call, set the refreshtoken to the config, and
            // create the GoogleAdsClient.
            config.OAuth2RefreshToken = refreshToken;
            string strClientCustomerId = ConfigurationManager.AppSettings["ClientCustomerId"].ToString();

            strClientCustomerId = strClientCustomerId.Replace("-", "");

            GoogleAdsClient client = new GoogleAdsClient(config);

            //if (!String.IsNullOrEmpty(strPageURL))
            //{
            //    lstKeywords = new List<string>();
            //}

            /// exclude key parts code should be included need to do it

            List<long> lstLcations = new List<long>() { (city > 0) ? city : (state == 0) ? locationId : state };

            return Run(client, strClientCustomerId, lstLcations.ToArray(), languageId, lstKeywords.ToArray(), strPageURL, keywordCount,pageToken);

            //Run();
        }
        public GridData Run(GoogleAdsClient client, string customerId, long[] locationIds, long languageId, string[] keywordTexts, string pageUrl, int keywordCount = 0,string pageToken="")
        {
            List<GridModel> lstGridModel = new List<GridModel>();
            var gridData = new GridData();


            KeywordPlanIdeaServiceClient keywordPlanIdeaService = client.GetService(Services.V18.KeywordPlanIdeaService);

            // Make sure that keywords and/or page URL were specified. The request must have
            // exactly one of urlSeed, keywordSeed, or keywordAndUrlSeed set.
            if (keywordTexts.Length == 0 && string.IsNullOrEmpty(pageUrl))
            {
                throw new ArgumentException("At least one of keywords or page URL is required, " + "but neither was specified.");
            }

            // Specify the optional arguments of the request as a keywordSeed, UrlSeed,
            // or KeywordAndUrlSeed.
            int PageSize = 50;//(keywordCount == 60000 || keywordCount == 10000) ? 1000 : 5000;


            GenerateKeywordIdeasRequest request = new GenerateKeywordIdeasRequest()
            {
                CustomerId = customerId,
                PageSize = PageSize,
                PageToken = pageToken ?? ""
            };

            if (keywordTexts.Length == 0)
            {
                // Only page URL was specified, so use a UrlSeed.
                request.UrlSeed = new UrlSeed()
                {
                    Url = pageUrl
                };
            }
            else if (string.IsNullOrEmpty(pageUrl))
            {
                // Only keywords were specified, so use a KeywordSeed.
                request.KeywordSeed = new KeywordSeed();
                request.KeywordSeed.Keywords.AddRange(keywordTexts);
            }
            else
            {
                // Both page URL and keywords were specified, so use a KeywordAndUrlSeed.
                request.KeywordAndUrlSeed = new KeywordAndUrlSeed();
                request.KeywordAndUrlSeed.Url = pageUrl;
                request.KeywordAndUrlSeed.Keywords.AddRange(keywordTexts);
            }

            // Create a list of geo target constants based on the resource name of specified
            // location IDs.
            foreach (long locationId in locationIds)
            {
                request.GeoTargetConstants.Add(ResourceNames.GeoTargetConstant(locationId));
            }

            request.Language = ResourceNames.LanguageConstant(languageId);
            request.KeywordPlanNetwork = Google.Ads.GoogleAds.V18.Enums.KeywordPlanNetworkEnum.Types.KeywordPlanNetwork.GoogleSearchAndPartners;

            //request.AggregateMetrics.AggregateMetricTypes


            try
            {
                // Generate keyword ideas based on the specified parameters.
                
                var response = keywordPlanIdeaService.GenerateKeywordIdeas(request);

                //if (ideaType == 2)
                //{ 
                //    keywordPlanIdeaService.
                //}
                gridData.PageToken = response.ReadPage(PageSize).NextPageToken;
                foreach (GenerateKeywordIdeaResult result in response)
                {
                    if (gridData.GridModels.Count == PageSize)
                    {
                        break;
                    }
                    KeywordPlanHistoricalMetrics metrics = result.KeywordIdeaMetrics;

                    if (metrics != null)
                    {
                        GridModel objGridModel = new GridModel();

                        objGridModel.KeywordText = result.Text;
                        objGridModel.SearchVolume = metrics.AvgMonthlySearches;
                        objGridModel.AverageCPC = 1;
                        objGridModel.CompetitionLabel = metrics.Competition.ToString();
                        //objGridModel.Competition = Convert.ToDouble(metrics.CompetitionIndex / 100);
                        objGridModel.Competition = metrics.CompetitionIndex;
                        objGridModel.HighestBid = Convert.ToDecimal(metrics.HighTopOfPageBidMicros) / 1000000;
                        objGridModel.LowestBid = Convert.ToDecimal(metrics.LowTopOfPageBidMicros) / 1000000;



                        int i = 0;
                        foreach (MonthlySearchVolume objMonthlySearchVolume in metrics.MonthlySearchVolumes)
                        {
                            objGridModel.MonthlyTargetedSearches[i] = new MonthlyTargetedSearches();

                            objGridModel.MonthlyTargetedSearches[i].Month = ((int)objMonthlySearchVolume.Month) - 1;
                            objGridModel.MonthlyTargetedSearches[i].Year = (int)objMonthlySearchVolume.Year;
                            objGridModel.MonthlyTargetedSearches[i].SearchVolume = objMonthlySearchVolume.MonthlySearches;

                            i++;
                            //objGridModel.MonthlyTargetedSearches.
                        }

                        gridData.GridModels.Add(objGridModel);

                    }
                }


                // Iterate over the results and print its detail.
                //foreach (GenerateKeywordIdeaResult result in response)
                //{
                //    //KeywordPlanHistoricalMetrics metrics = result.KeywordIdeaMetrics;
                //    //metrics.
                //    //Console.WriteLine($"Keyword idea text '{result.Text}' has " + $"{metrics.AvgMonthlySearches} average monthly searches and competition " + $"is {metrics.Competition}.");
                //}

                return gridData;
            }
            catch (GoogleAdsException e)
            {
                return gridData;
            }

            return gridData;
        }

    public List<Tuple<string, string>> GetCities(string countryID)
    {
      List<Tuple<string, string>> citiesList = new List<Tuple<string, string>>();
      GoogleAdsConfig config = new GoogleAdsConfig();

      // Get OAuth2 refresh token from configuration.
      string refreshToken = "1//03RJuY2Nbo6oGCgYIARAAGAMSNwF-L9IrsCbnW92cg95hPjPg-Lj-OWjltsaHiCQEBVPA4_U0p_mid-FdbRpFAVcr70FvgWgth9g";
      config.OAuth2RefreshToken = refreshToken;

      // Get the Client Customer ID.
      string strClientCustomerId = ConfigurationManager.AppSettings["ClientCustomerId"];
      strClientCustomerId = strClientCustomerId.Replace("-", "");

      // Initialize the Google Ads client.
      GoogleAdsClient client = new GoogleAdsClient(config);

      try
      {
        // Construct the query to fetch cities, filtered by countryID and target_type = 'CITY'.
        string query = $@"
            SELECT 
                geo_target_constant.id, 
                geo_target_constant.name 
            FROM geo_target_constant 
            WHERE geo_target_constant.parent_geo_target = 'geoTargetConstants/{countryID}'
            AND geo_target_constant.target_type = 'CITY'";

        // Create the request object.
        var request = new SearchGoogleAdsRequest()
        {
          Query = query,
          CustomerId = strClientCustomerId
        };

        // Execute the query request.
        GoogleAdsServiceClient googleAdsService = client.GetService(Services.V18.GoogleAdsService);
        var response = googleAdsService.Search(request);

        // Iterate through the response and add the city info to the list.
        if (response != null)
        {
          foreach (GoogleAdsRow row in response)
          {
            // Add city name and ID to the list.
            citiesList.Add(new Tuple<string, string>(row.GeoTargetConstant.Name, row.GeoTargetConstant.Id.ToString()));
          }
        }
      }
      catch (GoogleAdsException ex)
      {
        Console.WriteLine($"Google Ads API request failed. Exception: {ex.Message}");
      }

      // Return the list of cities.
      return citiesList;
    }

  }
}
