# BLE Testing & Debugging Guide

**For:** India Development Team
**Project:** Dara Smart Doll Mobile App
**Date:** 2026-03-16

---

## 🎯 **Quick Testing Checklist**

Before any release, verify these BLE functions work correctly:

### **Basic Connection Test**
- [ ] App discovers Dara Smart Doll device
- [ ] Connection establishes successfully
- [ ] Device information reads correctly (manufacturer, model, etc.)
- [ ] Battery level displays and updates

### **Critical BLE Functions**
- [ ] Connection status notifications work
- [ ] Playback control commands respond
- [ ] Content sync status updates properly
- [ ] Disconnection handled gracefully
- [ ] Reconnection works without app restart

---

## 🔧 **Debug Console Commands**

### **Enable Detailed BLE Logging**
Add this to your development build to see all BLE activity:

```javascript
// In BluetoothContext.tsx, add more detailed logging
console.log('[BLE-DEBUG] Device discovered:', device.name, device.id);
console.log('[BLE-DEBUG] Service found:', service.uuid);
console.log('[BLE-DEBUG] Characteristic:', characteristic.uuid, characteristic.properties);
console.log('[BLE-DEBUG] CCCD write attempt for:', charUUID);
console.log('[BLE-DEBUG] Notification data received:', decodedData);
```

### **Test BLE Connection Manually**
```javascript
// Test connection in development console
const { connectToDevice } = useBluetooth();
await connectToDevice('device-id-here');
```

### **Test Characteristic Reading**
```javascript
// Test reading device information
const deviceInfo = await device.readCharacteristicForService(
  '0000180A-0000-1000-8000-00805F9B34FB', // Device Info Service
  '00002A29-0000-1000-8000-00805F9B34FB'  // Manufacturer Name
);
console.log('Manufacturer:', decodeFromBase64(deviceInfo.value));
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Device connects but no data received"**
**Symptoms:** Connection successful, but no notifications from doll
**Cause:** CCCD not properly enabled
**Solution:** Verify `enableNotifySafe()` function is called for all characteristics

**Debug Steps:**
1. Check console for "CCCD write successful" messages
2. Verify CCCD UUID is correct: `00002902-0000-1000-8000-00805f9b34fb`
3. Ensure `[0x01, 0x00]` is used for enable value

### **Issue: "Connection drops frequently"**
**Symptoms:** Device disconnects randomly during use
**Debugging:**
```javascript
// Add connection monitoring
device.onDisconnected((error, device) => {
  console.log('[BLE] Disconnected:', device?.id, 'Error:', error);
  // Implement reconnection logic here
});
```

### **Issue: "Commands not working"**
**Symptoms:** Playback/control commands sent but doll doesn't respond
**Check:** Command format matches hardware guide exactly

**Example Correct Command:**
```javascript
const command = {
  command: 'play',
  content_id: 'story_001',
  volume: 75,
  timestamp: Date.now()
};
await device.writeCharacteristicWithResponseForService(
  DOLL_CONTROL_SERVICE_UUID,
  PLAYBACK_CONTROL_CHAR,
  encodeToBase64(JSON.stringify(command))
);
```

### **Issue: "Battery always shows 0%"**
**Check:** Battery characteristic notifications enabled
```javascript
// Ensure this is called during connection
await enableNotifySafe(device, BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR,
  (error, characteristic) => {
    const batteryLevel = characteristic?.value ? parseInt(decodeFromBase64(characteristic.value)) : 0;
    setBatteryLevel(batteryLevel);
  }
);
```

---

## 📊 **Hardware Testing Scenarios**

### **Scenario 1: Fresh Doll Connection**
1. Power on Dara Smart Doll
2. Open app and scan for devices
3. Connect to doll
4. Verify all services and characteristics discovered
5. Check battery level appears correctly
6. Test basic playback command

**Expected Results:**
- Connection time < 10 seconds
- Battery level between 0-100%
- Device info populated correctly
- First playback command succeeds

### **Scenario 2: Reconnection After Disconnect**
1. Establish connection (Scenario 1)
2. Turn off doll or move out of range
3. App should detect disconnection
4. Turn on doll or move back in range
5. App should reconnect automatically

**Expected Results:**
- Disconnection detected within 30 seconds
- Reconnection succeeds without app restart
- All functionality restored after reconnection

### **Scenario 3: Content Sync Test**
1. Connect to doll
2. Initiate content sync from app
3. Monitor sync progress
4. Verify completion status

**Expected Results:**
- Sync progress updates in real-time
- No timeouts during large transfers
- Success/error status reported correctly

---

## 🔍 **Advanced Debugging**

### **Bluetooth Permissions Check**
```javascript
// Android - Check all required permissions
const permissions = [
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.BLUETOOTH_CONNECT'
];

// Verify all permissions granted
```

### **Service Discovery Debugging**
```javascript
// Log all discovered services and characteristics
const services = await device.discoverAllServicesAndCharacteristics();
for (const service of services.services) {
  console.log('Service:', service.uuid);
  for (const char of service.characteristics) {
    console.log('  Characteristic:', char.uuid, char.properties);
  }
}
```

### **Connection State Monitoring**
```javascript
// Monitor BLE adapter state
manager.onStateChange((state) => {
  console.log('[BLE] Adapter state:', state);
  if (state !== 'PoweredOn') {
    // Handle Bluetooth not ready
  }
});
```

---

## ⚡ **Performance Optimization**

### **Reduce Connection Time**
- Cache device information after first connection
- Implement service discovery caching
- Use connection timeout handling

### **Optimize Notifications**
- Only enable notifications for actively used characteristics
- Batch notification processing
- Implement proper cleanup on disconnection

### **Memory Management**
```javascript
// Always cleanup subscriptions
useEffect(() => {
  return () => {
    monitorSubscriptions.current.forEach(subscription => {
      subscription?.remove();
    });
    activeMonitors.current.clear();
  };
}, []);
```

---

## 📝 **Testing Automation**

### **Unit Tests for BLE Functions**
```javascript
describe('BLE Connection', () => {
  test('CCCD enablement works', async () => {
    const mockDevice = createMockDevice();
    await enableNotifySafe(mockDevice, serviceUUID, charUUID, mockCallback);
    expect(mockDevice.writeDescriptorForCharacteristic).toHaveBeenCalledWith(
      serviceUUID, charUUID, CCCD_UUID, expectedValue
    );
  });
});
```

### **Integration Tests**
1. Test complete connection flow
2. Test command sending and response handling
3. Test disconnection and reconnection
4. Test error scenarios

---

## 🆘 **Emergency Debugging**

If BLE completely breaks:

1. **Check React Native BLE PLX version** - Ensure compatibility
2. **Verify Android permissions** - All BLE permissions must be granted
3. **Check hardware guide compliance** - UUIDs and commands must match exactly
4. **Enable native BLE logs** - Use Android Studio to see lower-level BLE activity
5. **Test with BLE scanner apps** - Verify doll hardware is advertising correctly

**Key Files for Emergency Fixes:**
- `src/components/BluetoothContext.tsx` - Main BLE implementation
- `android/app/src/main/AndroidManifest.xml` - BLE permissions
- `BLE_DEVELOPER_HANDOFF.md` - Complete implementation guide

---

**Remember:** The BLE implementation is COMPLETE and WORKING. Preserve the `enableNotifySafe()` function and CCCD implementation exactly as documented.