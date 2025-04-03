export function convertPersonalNumber(input: string | null | undefined): string {
  console.log('verifing: ' + input)
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

    // Validate allowed characters (digits and max one dash)
    if (!/^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(trimmed)) {
      throw new Error("Social security number must contain only digits and possibly one dash(-).");
    }
    
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

  export function getBirthdateFromPersonNumber(personNumber: string): string{
    const regex = /^(\d{4})(\d{2})(\d{2})-\d{4}$/;
    const match = personNumber.match(regex);
  
    if (!match) {
      throw new Error('Personal number is in a invalid format'); // Invalid format
    }
  
    const [_, year, month, day] = match;
    return `${year}-${month}-${day}`; // ISO format
  }



export function convertOrgNumber(input: string | null | undefined): string {
  if (!input) {
    throw new Error("Organization number is missing.");
  }

  // Remove any whitespace.
  const trimmed = input.trim();

  // Validate allowed characters (digits and max one dash)
  if (!/^\d{10,12}$|^\d{8}-\d{4}|^\d{6}-\d{4}$/.test(trimmed)) {
    throw new Error("Organization number must contain only digits and possibly one dash(-).");
  }
  
  // Remove dash
  const digitsOnly = trimmed.replace(/[^0-9]/g, '');
  let formatted;

  if (/^\d{10}$/.test(digitsOnly)) {
    // Format: yymmddxxxx
    const yy = digitsOnly.slice(0, 2);
    const mmdd = digitsOnly.slice(2, 6);
    const lastFour = digitsOnly.slice(6);
    formatted = '16' + yy + mmdd + '-' + lastFour;
  } else if (/^\d{12}$/.test(digitsOnly)) {
    // Format: yyyymmddxxxx
    if (trimmed.slice(0,2) !== '16') {
      throw new Error("Organization number must start with 16.");
    }
    formatted = digitsOnly.slice(0, 8) + '-' + digitsOnly.slice(8);
  }else {
    throw new Error("Invalid Swedish organization number format.");
  }

  return formatted;
}