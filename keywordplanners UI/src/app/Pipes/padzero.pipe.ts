import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padzero'
})
export class PadzeroPipe implements PipeTransform {
  transform(base: number, exponent: number): string {
   var strNumberString = "";
   if(base != null){ 
      strNumberString = base.toString();
      if(strNumberString.indexOf('.') == -1){
         strNumberString += '.';
         for(var intIterator = 0; intIterator<exponent; intIterator++){
            strNumberString += "0";
         }

         console.log(strNumberString);
      }
      else{
         var strAfterDot = strNumberString.substring(strNumberString.indexOf('.') + 1);
      
         if(strAfterDot.length < exponent){
            var intNumberRemainig = (exponent - strAfterDot.length)

            for(var intIterator = 0; intIterator<intNumberRemainig; intIterator++){
               strNumberString += "0";
            }
         }
      }
   }
   return strNumberString;
    //return Math.pow(base, exponent);
 }

}
