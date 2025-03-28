export function convertPersonalNumber(input: string | null | undefined): string {
    if (!input) {
      throw new Error("Personal number is missing.");
    }

    // Helper to validate the date string in yyyymmdd format.
    function isValidDate(yyyymmdd: string): boolean {
      const year = parseInt(yyyymmdd.slice(0, 4), 10);
      const month = parseInt(yyyymmdd.slice(4, 6), 10);
      const day = parseInt(yyyymmdd.slice(6, 8), 10);
      const date = new Date(year, month - 1, day);
      return (date.getFullYear() === year && (date.getMonth() + 1) === month && date.getDate() === day);
    }
  
    // Remove any whitespace.
    const trimmed = input.trim();
    
    let digitsOnly = trimmed.replace(/[^0-9]/g, '');
    let formatted;
  
    if (/^\d{10}$/.test(digitsOnly)) {
      // Format: yymmddxxxx
      const yy = digitsOnly.slice(0, 2);
      const mmdd = digitsOnly.slice(2, 6);
      const lastFour = digitsOnly.slice(6);
      // Determine century:
      // If the two-digit year is greater than today's last two-digit year then assume 1900,
      // otherwise 2000.
      const now = new Date();
      const currentTwoDigit = now.getFullYear() % 100;
      const century = parseInt(yy, 10) > currentTwoDigit ? '19' : '20';
      formatted = century + yy + mmdd + '-' + lastFour;
    } else if (/^\d{12}$/.test(digitsOnly)) {
      // Format: yyyymmddxxxx
      formatted = digitsOnly.slice(0, 8) + '-' + digitsOnly.slice(8);
    } else if (/^\d{8}\-?\d{4}$/.test(trimmed)) {
      // Format can be either yyyymmdd-xxxx or yyyymmddxxxx with an optional dash.
      // First, remove any extra dash if exists and then add our own.
      formatted = trimmed.replace('-', '');
      formatted = formatted.slice(0, 8) + '-' + formatted.slice(8);
    } else {
      throw new Error("Invalid Swedish personal number format.");
    }
  
    // Validate the date portion in the formatted result.
    const datePart = formatted.slice(0, 8);
    if (!isValidDate(datePart)) {
      throw new Error("Invalid date in personal number.");
    }
  
    return formatted;
  }
