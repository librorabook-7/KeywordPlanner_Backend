using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace KeywordPlannerModels
{
    public class Payment
    {
        public int User_Id { get; set; }
        
        public string Transaction_Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Payer_id { get; set; }
        public string Phone { get; set; }
        public string PaymentMethod { get; set; }
        public int sPackage { get; set; }
        public string Status { get; set; }


    }
}
