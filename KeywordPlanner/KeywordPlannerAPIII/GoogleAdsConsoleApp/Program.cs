using Google.Ads.GoogleAds;
using Google.Ads.GoogleAds.Config;
using Google.Ads.GoogleAds.Lib;
using Google.Ads.GoogleAds.V18.Common;
using Google.Ads.GoogleAds.V18.Errors;
using Google.Ads.GoogleAds.V18.Services;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Util.Store;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Configuration;
using Google.Ads.GoogleAds.V18.Services;

namespace GoogleAdsConsoleApp
{
    class Program
    {
        private const string GOOGLE_ADS_API_SCOPE = "https://www.googleapis.com/auth/adwords";
        static void Main(string[] args)
        {
            Console.Write("Finding Nemo");
            // Create a Google Ads client.
            //GoogleAdsClient client = new GoogleAdsClient();

            //// Create the required service.
            //CampaignServiceClient campaignService = client.GetService(Services.V18.CampaignService);

            GoogleAdsConfig config = new GoogleAdsConfig();
            // Load the JSON secrets.
            ClientSecrets secrets = new ClientSecrets()
            {
                ClientId = config.OAuth2ClientId,
                ClientSecret = config.OAuth2ClientSecret
            };

            // Authorize the user using desktop application flow.
            //Task<UserCredential> task = GoogleWebAuthorizationBroker.AuthorizeAsync(
            //    secrets,
            //    new string[] { GOOGLE_ADS_API_SCOPE },
            //    String.Empty,
            //    CancellationToken.None,
            //    new NullDataStore()
            //);

            //UserCredential credential = task.Result;

            // Store this token for future use.
            //string refreshToken = credential.Token.RefreshToken;
            string refreshToken = ConfigurationManager.AppSettings["OAuth2RefreshToken"];

            // To make a call, set the refreshtoken to the config, and
            // create the GoogleAdsClient.
            config.OAuth2RefreshToken = refreshToken;
            string strClientCustomerId = ConfigurationManager.AppSettings["ClientCustomerId"].ToString();

            strClientCustomerId = strClientCustomerId.Replace("-", "");

            GoogleAdsClient client = new GoogleAdsClient(config);

            List<string> lstKeywords = new List<string>() { "laptop" };
            List<long> lstLcations = new List<long>() { 2840 };

            //List<long> lstLcations = new List<long>();


            Program.Run(client, strClientCustomerId, lstLcations.ToArray(), 1000, lstKeywords.ToArray(), "");

            //new Program().RunHist(client, Convert.ToInt64(strClientCustomerId));


            Console.Read();
        }



        public static void Run(GoogleAdsClient client, string customerId, long[] locationIds, long languageId, string[] keywordTexts, string pageUrl)
        {
            KeywordPlanIdeaServiceClient keywordPlanIdeaService = client.GetService(Services.V18.KeywordPlanIdeaService);

            // Make sure that keywords and/or page URL were specified. The request must have
            // exactly one of urlSeed, keywordSeed, or keywordAndUrlSeed set.
            if (keywordTexts.Length == 0 && string.IsNullOrEmpty(pageUrl))
            {
                throw new ArgumentException("At least one of keywords or page URL is required, " + "but neither was specified.");
            }

            // Specify the optional arguments of the request as a keywordSeed, UrlSeed,
            // or KeywordAndUrlSeed.
            GenerateKeywordIdeasRequest request = new GenerateKeywordIdeasRequest()
            {
                CustomerId = customerId,
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
            // Set the network. To restrict to only Google Search, change the parameter below to
            // KeywordPlanNetwork.GoogleSearch.
            request.KeywordPlanNetwork = Google.Ads.GoogleAds.V18.Enums.KeywordPlanNetworkEnum.Types.KeywordPlanNetwork.GoogleSearchAndPartners;

            //request.AggregateMetrics.AggregateMetricTypes


            try
            {
                
                // Generate keyword ideas based on the specified parameters.
                var response = keywordPlanIdeaService.GenerateKeywordIdeas(request);


                // Iterate over the results and print its detail.
                foreach (GenerateKeywordIdeaResult result in response)
                {
                    KeywordPlanHistoricalMetrics metrics = result.KeywordIdeaMetrics;


                    //metrics.
                    //Console.WriteLine($"Keyword idea text '{result.Text}' has " + $"{metrics.AvgMonthlySearches} average monthly searches and competition " + $"is {metrics.Competition}.");

                    Console.WriteLine($"Keyword idea text '{result.Text}' has " + $"{metrics.AvgMonthlySearches} average monthly searches and competition " + $"is {metrics.Competition}." + $"High Top {metrics.HighTopOfPageBidMicros}." +  $"Low Top {metrics.LowTopOfPageBidMicros}");
                }
            }
            catch (GoogleAdsException e)
            {
                Console.WriteLine("Failure:");
                Console.WriteLine($"Message: {e.Message}");
                Console.WriteLine($"Failure: {e.Failure}");
                Console.WriteLine($"Request ID: {e.RequestId}");
                throw;
            }
        }
    }
}
