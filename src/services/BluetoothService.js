
import { BluetoothManager, BluetoothEscposPrinter } from "tp-react-native-bluetooth-printer";

class BlueToothService {


  static isBlueToothEnabled(callback) {
    try {
      BluetoothManager.isBluetoothEnabled().then(
        (enabled) => {
          return callback(null, enabled)
        },
        (err) => {
          console.log(err);
          return callback(err, null)
        }
      );
    } catch (err) {
      console.log(err);
      return callback(err, null)
    }
  }

  static EnableBlueTooth(callback) {
    try {
      BluetoothManager.enableBluetooth().then(
        (r) => {
          var paired = [];
          if (r && r.length > 0) {
            for (var i = 0; i < r.length; i++) {
              try {
                paired.push(JSON.parse(r[i]));
              } catch (e) {
                return callback(e, null)
              }
            }
          }
          return callback(null, paired)
        },
        (err) => {
          return callback(err, null)
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  static DisableBlueTooth(callback) {
    try {
      BluetoothManager.disableBluetooth().then(
        () => {
          return callback(null, true);
        },
        (err) => {
          return callback(err, null);
        }
      );
    } catch (err) {

    }
  }

  static ScanDevices(callback) {
    try {
      let pairedDevies;
      let foundDevices;
      BluetoothManager.scanDevices().then(
        (scannedDevices) => {
          if (scannedDevices) {
            const devices = JSON.parse(scannedDevices);
            if (devices) {
              pairedDevies = devices.paired;
              foundDevices = devices.found;
            }
          }

          return callback(null, pairedDevies, foundDevices)
        },
        (error) => {
          return callback(error, [], [])
        }
      );
    } catch (err) {
      console.log(err);
      return callback(err, [], [])
    }
  }

  static async Connect(address) {
    try {
      if (address) {
        await BluetoothManager.connect(address);
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async ConnectToDevice(address, callback) {
    try {
      if (address) {
        BluetoothManager.connect(address) // the device address scanned.
          .then(
            (s) => {
              return callback(null, true);
            },
            (e) => {
              return callback(e, false);
            }
          );
      }
    } catch (err) {
      console.log(err);
      return callback(err, false);
    }
  }

  static async disconnectDevice(address, callback) {
    try {
      if (address) {
        BluetoothManager.unpair(address) // the device address scanned.
          .then(
            (s) => {
              return callback(null, true);
            },
            (e) => {
              return callback(e, false);
            }
          );
      }
    } catch (err) {
      console.log(err);
      return callback(err, false);
    }
  }

  static async PrintPriceLabel(barCode, productName, salePrice, mrp, index) {
    try {
      if (barCode && productName) {

        barCode = barCode.toString();

        if (index % 11 == 0) {
          await BluetoothEscposPrinter.printText(`\r\n`, {});
        }

        let productPrintName = salePrice ? `${productName}\n` : `${productName}\n\n`;

          await BluetoothEscposPrinter.printerAlign(1);
          await BluetoothEscposPrinter.printText(productPrintName, {});
          await BluetoothEscposPrinter.printerAlign(1);
          await BluetoothEscposPrinter.setBold(1);
          if (salePrice) {
            await BluetoothEscposPrinter.printText(`Rs ${salePrice}\n`, { encoding: 'UTF-8' });
          }
          await BluetoothEscposPrinter.printerAlign(1);
          await BluetoothEscposPrinter.printBarCode(barCode, 72, 3, 50, 0, 2); // barcode
          await BluetoothEscposPrinter.printText(`\r\n\r\n`, {});
      };

    } catch (err) {
      console.log(err);
    }
  }
  static async PrintLabel(barCode, labelText, index) {
    try {
      if (barCode && labelText) {

        barCode = barCode.toString();

        await BluetoothEscposPrinter.printerAlign(1);

        await BluetoothEscposPrinter.printText(`${labelText}\n`, {
          encoding: "GBK",
          codepage: 0,
          widthtimes: 1,
          heigthtimes: 1,
          fonttype: 1,
        });

        await BluetoothEscposPrinter.printerAlign(1);

        // decrease width of barcode
        await BluetoothEscposPrinter.printBarCode(barCode, 72, 2, 60, 5, 1);

        await BluetoothEscposPrinter.printText(`\r\n\r\n`, {});

      };

    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = BlueToothService;
