using edu.stanford.nlp.tagger.maxent;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using java.io;
using java.util;
using edu.stanford.nlp.ling;
using System.Data;

namespace KeywordPlannerModels
{
    public static class ModelHelper
    {
        public static string ToMonth(this int month)
        {
            string Month;

            switch (month)
            {
                case 1:
                    Month = "Jan";
                    break;
                case 2:
                    Month = "Feb";
                    break;
                case 3:
                    Month = "Mar";
                    break;
                case 4:
                    Month = "Apr";
                    break;
                case 5:
                    Month = "May";
                    break;
                case 6:
                    Month = "Jun";
                    break;
                case 7:
                    Month = "Jul";
                    break;
                case 8:
                    Month = "Aug";
                    break;
                case 9:
                    Month = "Sep";
                    break;
                case 10:
                    Month = "Oct";
                    break;
                case 11:
                    Month = "Nov";
                    break;
                case 12:
                    Month = "Dec";
                    break;
                default:
                    Month = "0";
                    break;
            }
            return Month;
        }

        public static long[] ToRunningSum(this long[] array)
        {
            long[] arr1 = new long[array.Length];
            for (int k = 0; k < array.Length; k++)
            {
                if (k == 0)
                {
                    arr1[k] = array[k];
                }
                else
                {
                    arr1[k] = arr1[k - 1] + array[k];
                }
            }
            return arr1;
        }

        public static double[] ToRunningAvg(this long[] array, int[] array1)
        {
            double[] arr1 = new double[array.Length];
            for (int k = 0; k < array.Length; k++)
            {
                if (array1[k] == 0)
                {
                    arr1[k] = 0;
                }
                else
                {
                    arr1[k] = array[k] / array1[k];
                }
            }
            return arr1;
        }

        public static double[] ToRunningPercentGain(this long[] array, double[] array1)
        {
            double[] arr1 = new double[array.Length];
            for (int k = 0; k < array.Length; k++)
            {
                if (array1[k] == 0)
                {
                    arr1[k] = 0;
                }
                else
                {
                    arr1[k] = Math.Round((((array[k] - array1[k]) / array1[k]) * 100), 1);
                }
            }
            return arr1;
        }

        public static int[] ToMonthArray(this string[] array)
        {
            int[] n = new int[array.Length];
            for (int i = 0; i < array.Length; i++)
            {
                n[i] = Convert.ToInt16(array[i].ToString().Substring(4));
            }
            return n;
        }

        public static bool TextToQuestion(this string text)
        {
            string[] tagsQuesStartsWith = ConfigurationManager.AppSettings["questionStartsWith"].ToString().Split(',');
            string[] tagsQuesIncludceWith = ConfigurationManager.AppSettings["questionInclude"].ToString().Split(',');
            //return true when keyword starts with the given tags.
            bool foundTagsQuesStartsWith = (
                        from tags in tagsQuesStartsWith
                        where text.StartsWith(tags)
                        select tags
                        ).Any();
            //returns true when keyword include the given tags
            bool foundTagsQuesIncludceWith = (
                        from tags in tagsQuesIncludceWith
                        where text.Contains(tags)
                        select tags
                        ).Any();
            if (text.Contains("?"))
            {
                return true;
            }
            else if (foundTagsQuesStartsWith) //(text.StartsWith("am ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("are ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("was ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("were ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("can ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("could ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("will ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("shall ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("would ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("should ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("has ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("have ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("had ", System.StringComparison.OrdinalIgnoreCase) || text.StartsWith("did ", System.StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
            else if (foundTagsQuesIncludceWith) //(text.IndexOf("when", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("which", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("what", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("who", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("whose", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("how", System.StringComparison.CurrentCultureIgnoreCase) >= 0 || text.IndexOf("where", System.StringComparison.CurrentCultureIgnoreCase) >= 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public static bool isPreposition(this string text, dynamic tagger)
        {
            string TagerResult = null;
            //var modelsDirectory = ConfigurationManager.AppSettings["PosTaggerPath"] + @"\models";
            //var tagger = new MaxentTagger(modelsDirectory + @"\wsj-0-18-bidirectional-nodistsim.tagger");
            var sentences = MaxentTagger.tokenizeText(new StringReader(text)).toArray();
            foreach (ArrayList sentence in sentences)
            {
                var taggedSentence = tagger.tagSentence(sentence);
                TagerResult = SentenceUtils.listToString(taggedSentence, false);
            }
            return TagerResult.Contains("/IN") == true ? true : false;
        }

        public static string Trend(this long[] array)
        {
            double threeMonthAverage = 0, nineMonthAverage = 0;
            string trend = String.Empty;
            for (int i = 0; i < array.Length; i++)
            {
                if (i <= 5)
                {
                    threeMonthAverage += array[i];
                }
                else
                {
                    nineMonthAverage += array[i];
                }
            }
            if (nineMonthAverage > 0)
            {
                trend = Math.Round((((threeMonthAverage - nineMonthAverage) / nineMonthAverage) * 100), 1).ToString() + " %";
            }
            else
            {
                trend = "0.0 %";
            }
            return trend;
        }
    }
}
