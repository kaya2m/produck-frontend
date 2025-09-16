import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'crmCurrency'
})
export class CrmCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency: string = 'USD',
    display: 'code' | 'symbol' | 'symbol-narrow' = 'symbol',
    locale: string = 'en-US'
  ): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '-';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: display as any
      }).format(numValue);
    } catch (error) {
      return `${currency} ${numValue.toFixed(2)}`;
    }
  }
}

@Pipe({
  name: 'percentage'
})
export class PercentagePipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    digitsInfo?: string,
    locale: string = 'en-US'
  ): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '-';
    }

    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numValue / 100);
    } catch (error) {
      return `${numValue.toFixed(2)}%`;
    }
  }
}