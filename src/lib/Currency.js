require('intl'); // import intl object
  require('intl/locale-data/jsonp/en-IN'); // load the required locale details

/**
 * Format currency in Indian format
 *
 * @param {*} price
 */

class Currency {
  
    static IndianFormat(amount) {
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
      let formattedValue = formatter.format(amount);
      formattedValue = formattedValue.replace(/\u00A0/g, '');
      return formattedValue;
    }
  
  
  static Get(price) {
    if (price !== null) {
      return parseFloat(price);
    } else {
      return "0.00";
    }
  }
  static GetWithNoDecimal(price) {
    if (price !== null && !isNaN(price)) {
      const roundedValue = Math.round(price);
      return roundedValue.toString(); 
    } else {
      return "";
    }
  }
  
  

  static getFormatted(amount) {
    if (amount !== null && !isNaN(amount)) {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0, // Set minimumFractionDigits to 0 to avoid showing decimal places
    });
    
    let value =parseFloat(amount)
    let formattedValue = formatter.format(value);
    formattedValue = formattedValue.replace(/\u00A0/g, '');
    return formattedValue;
  }else{
    return "";
  }
  }
  static roundOff(number) {
    if (number && number !== "undefined" && number !== undefined && number !=="" && number !=="null") {
      let data =  Math.round(number);
      const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0, // Set minimumFractionDigits to 0 to avoid showing decimal places
      });
      
      let value =parseFloat(data)
      let formattedValue = formatter.format(value);
      formattedValue = formattedValue.replace(/\u00A0/g, '');
      return formattedValue;
      
    } else {
      return null;
    }
  }
}


export default Currency;

export function Decimal(data) {
  let price = data;
  let amount =
    price.indexOf(".") >= 0
      ? price.substr(0, price.indexOf(".")) +
      price.substr(price.indexOf("."), 3)
      : price;
  return amount;
}

export function Percentage(data) {
  let price = data;
  if (price) {
    return `${price}%`;
  } else {
    return "0%";
  }
}
