export function formatINR(amount: number): string {
  if (amount === undefined || amount === null) return '₹0';
  
  const absAmount = Math.abs(amount);
  let formatted: string;
  
  if (absAmount >= 10000000) {
    formatted = (absAmount / 10000000).toFixed(2) + ' Cr';
  } else if (absAmount >= 100000) {
    formatted = (absAmount / 100000).toFixed(2) + ' L';
  } else {
    formatted = absAmount.toLocaleString('en-IN');
  }
  
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${formatted}`;
}

export function formatINRFull(amount: number): string {
  if (amount === undefined || amount === null) return '₹0';
  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);
  return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
}

export function formatIndianNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatPriceChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}₹${Math.abs(value).toFixed(2)}`;
}

export function formatVolume(volume: number): string {
  if (volume >= 10000000) return (volume / 10000000).toFixed(2) + ' Cr';
  if (volume >= 100000) return (volume / 100000).toFixed(2) + ' L';
  if (volume >= 1000) return (volume / 1000).toFixed(1) + 'K';
  return volume.toString();
}

export function formatINRPrecise(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatLargeNumber(value: number): string {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}
