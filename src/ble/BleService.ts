import { BleManager, Device } from 'react-native-ble-plx';
import { BLE_UUID, TARGET_PREFIX } from './BleConstants';
import { base64Decode, base64Encode } from './BleUtils';
import { Buffer } from 'buffer';

class BleService {
  manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }

  scanForDevice(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan(
      [BLE_UUID.UART_SERVICE],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.log('Scan error:', error);
          return;
        }

        if (device?.name?.startsWith(TARGET_PREFIX)) {
          this.manager.stopDeviceScan();
          onDeviceFound(device);
        }
      },
    );
  }

  async connect(device: Device) {
    const connected = await device.connect();
    await connected.discoverAllServicesAndCharacteristics();
    return connected;
  }

  async getBatteryLevel(device: Device): Promise<number> {
    const char: any = await device.readCharacteristicForService(
      BLE_UUID.BATTERY_SERVICE,
      BLE_UUID.BATTERY_CHAR,
    );
    const battery = Buffer.from(char.value, 'base64').readUInt8(0);

    console.log('batterybatterybatterybattery', battery);
    const decoded = base64Decode(char.value || '');
    return decoded.charCodeAt(0);
  }

  subscribePlayback(device: Device, cb: (data: any) => void) {
    return device.monitorCharacteristicForService(
      BLE_UUID.UART_SERVICE,
      BLE_UUID.UART_TX,
      (error, characteristic) => {
        if (error) {
          console.log('Monitor error:', error);
          return;
        }

        try {
          const json = JSON.parse(base64Decode(characteristic?.value || ''));
          cb(json);
        } catch (e) {
          console.log('Parse error:', e);
        }
      },
    );
  }

  async sendCommand(device: Device, commandObj: any) {
    const payload = base64Encode(JSON.stringify(commandObj));

    return device.writeCharacteristicWithResponseForService(
      BLE_UUID.UART_SERVICE,
      BLE_UUID.UART_RX,
      payload,
    );
  }
}

export default new BleService();
