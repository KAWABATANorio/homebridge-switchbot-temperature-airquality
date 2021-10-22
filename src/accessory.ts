import {
  AccessoryConfig,
  AccessoryPlugin,
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  HAP,
  Logging,
  Service
} from "homebridge";
import _ from "lodash";
import Switchbot from "./switchbot";

let hap: HAP;

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
  hap = api.hap;
  api.registerAccessory("SwitchbotTemperatureAirquality", TemperatureAirquality);
};

class TemperatureAirquality implements AccessoryPlugin {
  readonly Temperature: any;

  private readonly log: Logging;
  private readonly name: string;

  private readonly airqualityService: Service;
  private readonly informationService: Service;

  private readonly switchbot: Switchbot;

  private threshold: any;

  constructor(log: Logging, config: AccessoryConfig, api: API) {
    this.log = log;
    this.name = config.name;
    const options: any = config.options;
    this.switchbot = new Switchbot(options.switchbot);

    this.airqualityService = new hap.Service.AirQualitySensor(this.name);

    this.threshold = _.defaults(options.threshold, {
      poor: 0.0,
      inferior: 16.0,
      fair: 18.0,
      good: 20.0,
      excellent: 22.0
    });
  
    // current state
    this.airqualityService.getCharacteristic(hap.Characteristic.AirQuality)
      .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
        callback(undefined, this.valueToStatus(this.switchbot.temperature));
      });

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, "Kawabata Farm")
      .setCharacteristic(hap.Characteristic.Model, "Switchbot Temperature Airquality");

    api.on('didFinishLaunching', () => {
      this.switchbot.start();
    }).on('shutdown', () => {
      this.switchbot.stop();
    });

    this.switchbot.on('change', (temperature) => {
      this.airqualityService.getCharacteristic(hap.Characteristic.AirQuality)
        .updateValue(this.valueToStatus(temperature));
    });

    log.info("Switchbot Temperature Airquality finished initializing!");
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify(): void {
    this.log("Identify!");
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.airqualityService
    ];
  }

  private valueToStatus(value: number): number {
    const state = hap.Characteristic.AirQuality;

    let result = state.UNKNOWN;
    if (value >= this.threshold.excellent) {
      result = state.EXCELLENT
    } else if (value >= this.threshold.good) {
      result = state.GOOD
    } else if (value >= this.threshold.fair) {
      result = state.FAIR
    } else if (value >= this.threshold.inferior) {
      result = state.INFERIOR
    } else if (value >= this.threshold.poor) {
      result = state.POOR
    }
    return result;
  }
}
