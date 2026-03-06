using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Google.Api;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;
using KeywordPlannerModels;
using Newtonsoft.Json.Linq;
using static Google.Apis.Requests.BatchRequest;

namespace KeywordPlannerAPI.Controllers.KeywordFinder
{
    public class YoutubeDataAPIController : ApiController
    {
        public IHttpActionResult Get(string YoutubeSearchKeyword, long languageId, long locationId, bool targetGoogleSearch, bool targetSearchNetwork, [FromUri]string excludeKeywordsList, bool isKeyword,
            string searchVolumeMin, string searchVolumeMax, string cpcMin, string cpcMax, string competitionMin, string competitionMax,string pageToken, bool includeChartData = false, long state = 0, long city = 0)
        {
            //remove duplicates from the keywordsList
            //string[] KeyArrayParts = keyArray.Trim().Split(',');
            //KeyArrayParts = KeyArrayParts.Distinct().ToList().ToArray();

            //remove duplicates from the excludeKeywordsList


            
            try
            {
                /********************************** Removing Youtube Searching **********************************************/


                var youtubeService = new YouTubeService(new BaseClientService.Initializer()
                {
                    ApiKey = System.Configuration.ConfigurationManager.AppSettings["YoutubeDataAPIKey"].ToString(),
                    ApplicationName = System.Configuration.ConfigurationManager.AppSettings["YoutubeDataAPPName"].ToString()
                });

                var strOrignalSearchTerm = YoutubeSearchKeyword.Substring(0, YoutubeSearchKeyword.IndexOf(","));
                var strSuggestions = YoutubeSearchKeyword.Substring(YoutubeSearchKeyword.IndexOf(",") + 1);

                var searchListRequest = youtubeService.Search.List("snippet");
                //searchListRequest.Q = "elmah.io";
                searchListRequest.Q = YoutubeSearchKeyword; // Replace with your search term.
                searchListRequest.MaxResults = 10;
                searchListRequest.Type = "video";
                searchListRequest.VideoCaption = SearchResource.ListRequest.VideoCaptionEnum.ClosedCaption;
                //searchListRequest.RelevanceLanguage = "en";
                //searchListRequest.RegionCode = "US";


                var searchListResponse = searchListRequest.Execute();





                //youtubeService.Videos.List()

                List<string> lstKeywords = new List<string>();
                //List<string> videos = new List<string>();
                //List<string> channels = new List<string>();
                //List<string> playlists = new List<string>();

                // Add each result to the appropriate list, and then display the lists of
                // matching videos, channels, and playlists.

                //List<GridModel> lstGridModel = new List<GridModel>();

                //string strVideoIds = "";
                //List<string> lstDescriptions = new List<string>();
                //string SearchString="";
                
                foreach (var searchResult in searchListResponse.Items)
                {
                    switch (searchResult.Id.Kind)
                    {
                        case "youtube#video":
                            lstKeywords.Add(Regex.Replace(searchResult.Snippet.Title, @"\p{Cs}", String.Empty));
                            break;

                    }
                }
                //lstKeywords.AddRange(searchListResponse.Items.Select(video => new YouTubeVideo
                //{
                //    Thumbnail = video.Snippet.Thumbnails.High.Url,
                //    Title = video.Snippet.Title,
                //    VideoId = video.Id.VideoId,
                //}));



                //SearchString = TruncateCommas(Regex.Replace(SearchString, "[^0-9A-Za-z ,]", ","));//RemoveSpecialCharacters(SearchString);

                /// these lines needs to be converted
                dynamic objResultSuggestion = GetTargetIdeaObjects(YoutubeSearchKeyword, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeywordsList, isKeyword,
                searchVolumeMin, searchVolumeMax, cpcMin, cpcMax, competitionMin, competitionMax, pageToken, includeChartData, state, city);

                return Ok(new { Result = objResultSuggestion.Content });

                //return Ok();
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }
        private static string TruncateCommas(string input)
        {
            return Regex.Replace(input, @",+", ",");
        }

        public class YouTubeVideo
        {
            public string Thumbnail { get; internal set; }
            public string Title { get; internal set; }
            public string VideoId { get; internal set; }
        }


        /// <summary>
        /// this function had to be converted
        /// </summary>
        /// <param name="strValue"></param>
        /// <param name="blnIsMax"></param>
        /// <returns></returns>

        private dynamic GetTargetIdeaObjects(string keyArray, long languageId, long locationId, bool targetGoogleSearch, bool targetSearchNetwork, [FromUri] string excludeKeywordsList, bool isKeyword,
            string searchVolumeMin, string searchVolumeMax, string cpcMin, string cpcMax, string competitionMin, string competitionMax,string pageToken, bool includeChartData = false, long state = 0, long city = 0)
        {
            try
            {
                GoogleController objController = new GoogleController();
                dynamic data = objController.GetYoutube(keyArray, languageId, locationId, targetGoogleSearch, targetSearchNetwork, excludeKeywordsList, isKeyword,
                    searchVolumeMin, searchVolumeMax, cpcMin, cpcMax, competitionMin, competitionMax,pageToken, includeChartData,0, state,city);

                return data;
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
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

        public string RemoveSpecialCharacters(string str)
        {
            StringBuilder sb = new StringBuilder();
            foreach (char c in str)
            {
                if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '.' || c == '_' || c == ',')
                {
                    sb.Append(c);
                }
            }
            return sb.ToString();
        }
        [HttpGet]
        public async Task<IHttpActionResult> GetSugessions(string keyword,string location)
        {
            string baseUrl = "https://suggestqueries.google.com/complete/search";
            string callback = "JSON_CALLBACK";
            string client = "firefox";
            string hl = "en";
            string endpoint = $"{baseUrl}?callback={callback}&client={client}&hl={hl}&ds=yt&q={keyword}&gl=0&callback=ng_jsonp_callback_0";

            var result = await GetApiResponse(endpoint);

            string pattern = @"\[.*?\]";

            // Use Regex to find the matching pattern in the input string
            Match match = Regex.Match(result, pattern);
            var suggessions = "";

            if (match.Success)
            {
                // Extract the matched JSON array
                var jsonArray = match.Value.Split('[');
                suggessions = jsonArray[2].Replace("]","").Replace("\"", "");

            }
            return Ok(suggessions);
        }

        public static async Task<string> GetApiResponse(string endpoint)
        {
            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(endpoint);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsStringAsync();
                }
                else
                {
                    throw new HttpRequestException($"Error: {response.StatusCode} - {response.ReasonPhrase}");
                }
            }
        }


    }
}

