# homebridge-switchbot-temperature-airquality

Airquality accessory plugin using Switchbot Meter API for [Homebridge](https://github.com/homebridge/homebridge)

## Configuration

Example configuration:

```json
"accessories": [
   {
      "accessory": "SwitchbotTemperatureAirquality",
      "name": "Temperature quality",
      "options": {
         "threshold": {
            "poor": 0.0,
            "inferior": 16.0,
            "fair": 18.0,
            "good": 20.0,
            "excellent": 22.0
         },
         "switchbot": {
            "token": "your token here",
            "deviceId": "your device id here",
            "duration": 60000
         }
      }
   }
]
```
