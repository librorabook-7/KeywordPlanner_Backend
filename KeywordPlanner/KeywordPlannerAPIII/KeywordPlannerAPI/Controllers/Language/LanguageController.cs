using KeywordPlannerAPI.Models;
using KeywordPlannerModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace KeywordPlannerAPI.Controllers.Language
{
    public class LanguageController : ApiController
    {
        public IHttpActionResult GET()
        {
            List<LanguageModel> languageModel = LanguageHelper.LanguageHelper.LanguageInstance.GetLanguages();
            return languageModel.Count == 0 ? (IHttpActionResult) NotFound() : Ok(languageModel);
        }
    }
}
