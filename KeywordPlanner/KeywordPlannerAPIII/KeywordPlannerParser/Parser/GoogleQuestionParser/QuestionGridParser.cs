using KeywordPlannerModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace KeywordPlannerParser.Parser.GoogleQuestionParser
{
    public class QuestionGridParser
    {
        public List<string> QuestionGridModel(List<string> gridModel)
        {
            List<string> questionGridModel = new List<string>();
            foreach (string model in gridModel)
            {
                if (model.TextToQuestion() == true)
                {
                    questionGridModel.Add(model);
                }
            }
            return questionGridModel;
        }
    }
}
