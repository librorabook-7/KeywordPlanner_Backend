using KeywordPlannerAPI.LocationHelper;
using KeywordPlannerAPI.Models;
using KeywordPlannerModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace KeywordPlannerAPI.Controllers.Location
{
    public class LocationController : ApiController
    {
        
        public IHttpActionResult GET()
        {
            List<CountryModel> countryModels = CountryHelper.CountryInstance.GetLocations();
            return countryModels.Count == 0 ? (IHttpActionResult)NotFound() : Ok(countryModels);

        }
    }
}
