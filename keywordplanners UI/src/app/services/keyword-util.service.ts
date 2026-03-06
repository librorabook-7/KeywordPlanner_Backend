import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class KeywordUtilService {
  toRunningSum(array: number[]): number[] {
    const arr1: number[] = [];

    for (let k = 0; k < array.length; k++) {
      if (k === 0) {
        arr1[k] = array[k];
      } else {
        arr1[k] = arr1[k - 1] + array[k];
      }
    }

    return arr1;
  }

  toMonthArray(array: string[]): number[] {
    console.log(array);
    return array.map((item) => +item.substring(4));
  }

  toRunningAvg(array: number[], array1: number[]): number[] {
    const arr1: number[] = [];

    for (let k = 0; k < array.length; k++) {
      if (array1[k] === 0) {
        arr1[k] = 0;
      } else {
        arr1[k] = array[k] / array1[k];
      }
    }

    return arr1;
  }

  toRunningPercentGain(array: number[], array1: number[]): number[] {
    const arr1: number[] = [];

    for (let k = 0; k < array.length; k++) {
      if (array1[k] === 0) {
        arr1[k] = 0;
      } else {
        arr1[k] =
          Math.round(((array[k] - array1[k]) / array1[k]) * 100 * 10) / 10; // rounding to one decimal place
      }
    }

    return arr1;
  }

  trend(array: number[]): string {
    let threeMonthAverage = 0,
      nineMonthAverage = 0;
    for (let i = 0; i < array.length; i++) {
      if (i <= 5) {
        threeMonthAverage += array[i];
      } else {
        nineMonthAverage += array[i];
      }
    }
    const trend =
      nineMonthAverage > 0
        ? `${
            Math.round(
              ((threeMonthAverage - nineMonthAverage) / nineMonthAverage) *
                100 *
                10
            ) / 10
          } %`
        : "0.0 %";
    return trend;
  }

  // You can add other array manipulation methods here
}
