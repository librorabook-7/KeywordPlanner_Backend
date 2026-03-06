import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayunique'
})
export class ArrayuniquePipe implements PipeTransform {

  transform(value: any, strPropertyName: string): any {
    // Remove the duplicate elements
    debugger;
    var art = value.map(x=>{
        return x[strPropertyName];
    });
    
    art = art.reduce((acc,ele,i)=>{
        acc = acc.concat(ele);
        return acc;
    });
    return new Set(art);
  }

}
