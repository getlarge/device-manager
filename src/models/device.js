import iotAgent from 'iot-agent';
import crypto from 'crypto';
//  import { promisify } from 'util';
//  import stream from 'stream';
import logger from '../services/logger';
import utils from '../services/utils';

/**
 * @module Device
 */

module.exports = function(Device) {
  const collectionName = 'Device';

  // const deviceProperties = [
  //   'devEui',
  //   'devAddr',
  //   'apiKey',
  //   'name',
  //   'type',
  //   'status',
  //   'description',
  //   'icons',
  //   'accessPointUrl',
  //   'frameCounter',
  //   'lastSignal',
  //   'qrCode',
  //   'authMode',
  //   'transportProtocol',
  //   'transportProtocolVersion',
  //   'messageProtocol',
  //   'messageProtocolVersion',
  //   'deleted',
  // ];
  const filteredProperties = ['children', 'size', 'show', 'group', 'success', 'error'];
  // async function protocolNameValidator(err) {
  //   const protocolPatternsKeys = Object.getOwnPropertyNames(handlers.protocolPatterns);
  //   if (protocolPatternsKeys.find((key) => key === this.protocolName)) return;
  //   err();
  // }

  function transportProtocolValidator(err) {
    if (
      this.transportProtocol &&
      (this.transportProtocol.toLowerCase() === 'aloesclient' ||
        this.transportProtocol.toLowerCase() === 'aloeslight' ||
        this.transportProtocol.toLowerCase() === 'mysensors' ||
        this.transportProtocol.toLowerCase() === 'lorawan')
    ) {
      return;
    }
    err();
  }

  function messageProtocolValidator(err) {
    if (
      this.messageProtocol &&
      (this.messageProtocol.toLowerCase() === 'aloesclient' ||
        this.messageProtocol.toLowerCase() === 'aloeslight' ||
        this.messageProtocol.toLowerCase() === 'mysensors' ||
        this.messageProtocol.toLowerCase() === 'cayennelpp')
    ) {
      return;
    }
    err();
  }

  function typeValidator(err) {
    if (
      this.type &&
      (this.type.toLowerCase() === 'audio-input' ||
        this.type.toLowerCase() === 'audio-output' ||
        this.type.toLowerCase() === 'bot' ||
        this.type.toLowerCase() === 'browser' ||
        this.type.toLowerCase() === 'camera' ||
        this.type.toLowerCase() === 'gateway' ||
        this.type.toLowerCase() === 'light-output' ||
        this.type.toLowerCase() === 'midi-input' ||
        this.type.toLowerCase() === 'midi-output' ||
        this.type.toLowerCase() === 'node' ||
        this.type.toLowerCase() === 'phone' ||
        this.type.toLowerCase() === 'rfid' ||
        this.type.toLowerCase() === 'switch-input' ||
        this.type.toLowerCase() === 'switch-output')
    ) {
      return;
    }
    err();
  }

  Device.validate('transportProtocol', transportProtocolValidator, {
    message: 'Wrong transport protocol name',
  });

  Device.validate('messageProtocol', messageProtocolValidator, {
    message: 'Wrong application protocol name',
  });

  Device.validate('type', typeValidator, {
    message: 'Wrong device type',
  });

  Device.validatesPresenceOf('ownerId');

  Device.validatesUniquenessOf('devEui', { scopedTo: ['ownerId'] });
  // Device.validatesDateOf("lastSignal", {message: "lastSignal is not a date"});

  /**
   * Set device QRcode access based on declared protocol and access point url
   * @method module:Device~setDeviceQRCode
   * @param {object} device - Device instance
   * returns {object} device
   */
  const setDeviceQRCode = device => {
    try {
      switch (device.transportProtocol.toLowerCase()) {
        case 'mysensors':
          if (device.accessPointUrl.endsWith('/#!1')) {
            device.qrCode = `${device.accessPointUrl}`;
          } else if (device.accessPointUrl) {
            device.qrCode = `${device.accessPointUrl}/param?mqtt_server=${
              process.env.MQTT_BROKER_HOST
            }&mqtt_port=${process.env.MQTT_BROKER_PORT}&mqtt_secure=${
              process.env.MQTT_SECURE
            }&http_server=${process.env.HTTP_SERVER_HOST}&http_port=${
              process.env.HTTP_SERVER_PORT
            }&http_secure=${process.env.HTTP_SECURE}&device_id=${device.id}&apikey=${
              device.apiKey
            }`;
          }
          break;
        case 'aloeslight':
          if (device.accessPointUrl.endsWith('/#!1')) {
            device.qrCode = `${device.accessPointUrl}`;
          } else if (device.accessPointUrl) {
            device.qrCode = `${device.accessPointUrl}/param?mqtt_server=${
              process.env.MQTT_BROKER_HOST
            }&mqtt_port=${process.env.MQTT_BROKER_PORT}&mqtt_secure=${
              process.env.MQTT_SECURE
            }&http_server=${process.env.HTTP_SERVER_HOST}&http_port=${
              process.env.HTTP_SERVER_PORT
            }&http_secure=${process.env.HTTP_SECURE}&device_id=${device.id}&apikey=${
              device.apiKey
            }`;
          }
          break;
        default:
        //  console.log(device);
      }
      return device;
    } catch (error) {
      return error;
    }
  };

  /**
   * Set device icons ( urls ) based on its type
   * @method module:Device~setDeviceIcons
   * @param {object} device - Device instance
   * returns {object} device
   */
  const setDeviceIcons = device => {
    try {
      switch (device.type) {
        case 'audio-input':
          device.icons[0] = `/icons/aloes/audio-input.png`;
          device.icons[1] = `/icons/aloes/audio-input-white.png`;
          break;
        case 'audio-output':
          device.icons[0] = `/icons/aloes/audio-output.png`;
          device.icons[1] = `/icons/aloes/audio-output-white.png`;
          break;
        case 'bot':
          device.icons[0] = `/icons/aloes/bot.png`;
          device.icons[1] = `/icons/aloes/bot-white.png`;
          break;
        case 'browser':
          device.icons[0] = `/icons/aloes/browser.png`;
          device.icons[1] = `/icons/aloes/browser-white.png`;
          break;
        case 'camera':
          device.icons[0] = `/icons/aloes/camera.png`;
          device.icons[1] = `/icons/aloes/camera-white.png`;
          break;
        case 'gateway':
          device.icons[0] = `/icons/aloes/gateway.png`;
          device.icons[1] = `/icons/aloes/gateway-white.png`;
          break;
        case 'light-output':
          device.icons[0] = `/icons/aloes/light-output.png`;
          device.icons[1] = `/icons/aloes/light-output-white.png`;
          break;
        case 'midi-input':
          device.icons[0] = `/icons/aloes/midi-input.png`;
          device.icons[1] = `/icons/aloes/midi-input-white.png`;
          break;
        case 'midi-output':
          device.icons[0] = `/icons/aloes/midi-output.png`;
          device.icons[1] = `/icons/aloes/midi-output-white.png`;
          break;
        case 'node':
          device.icons[0] = `/icons/aloes/node.png`;
          device.icons[1] = `/icons/aloes/node-white.png`;
          break;
        case 'phone':
          device.icons[0] = `/icons/aloes/phone.png`;
          device.icons[1] = `/icons/aloes/phone-white.png`;
          break;
        case 'rfid':
          device.icons[0] = `/icons/aloes/rfid.png`;
          device.icons[1] = `/icons/aloes/rfid-white.png`;
          break;
        case 'switch-input':
          device.icons[0] = `/icons/aloes/switch-input.png`;
          device.icons[1] = `/icons/aloes/switch-input-white.png`;
          break;
        case 'switch-output':
          device.icons[0] = `/icons/aloes/switch-output.png`;
          device.icons[1] = `/icons/aloes/switch-output-white.png`;
          break;
        default:
        //  console.log(device.type);
      }
      return device;
    } catch (error) {
      return error;
    }
  };

  /**
   * Event reporting that a device instance will be created or updated.
   * @event before save
   * @param {object} ctx - Express context.
   * @param {object} ctx.req - Request
   * @param {object} ctx.res - Response
   * @param {object} ctx.instance - Device instance
   */
  Device.observe('before save', async ctx => {
    try {
      if (ctx.options && ctx.options.skipPropertyFilter) return ctx;
      if (ctx.data) {
        logger.publish(5, `${collectionName}`, 'beforeSave:req', ctx.data);
        filteredProperties.forEach(p => delete ctx.data[p]);
        ctx.hookState.updateData = ctx.data;
        return ctx;
      }
      if (ctx.instance) {
        logger.publish(5, `${collectionName}`, 'beforeSave:req', ctx.instance);
        const promises = await filteredProperties.map(async prop =>
          ctx.instance.unsetAttribute(prop),
        );
        await Promise.all(promises);
        if (ctx.instance.transportProtocol && ctx.instance.transportProtocol !== null) {
          await setDeviceQRCode(ctx.instance);
        }
        //  logger.publish(3, `${collectionName}`, "beforeSave:res1", device);
        if (ctx.instance.type && ctx.instance.type !== null) {
          await setDeviceIcons(ctx.instance);
        }
        logger.publish(5, collectionName, 'beforeSave:res', ctx.instance);
        return ctx;
      }
      // else if (ctx.currentInstance) {
      //   device = ctx.currentInstance;
      // }
      return ctx;
    } catch (error) {
      logger.publish(3, `${collectionName}`, 'beforeSave:err', error);
      return error;
    }
  });

  Device.publish = async (device, method) => {
    try {
      const packet = await iotAgent.publish({
        userId: device.ownerId,
        collectionName,
        data: device,
        modelId: device.id,
        method: method || device.method,
        pattern: 'aloesClient',
      });
      if (packet && packet.topic && packet.payload) {
        logger.publish(4, `${collectionName}`, 'publish:res', {
          topic: packet.topic,
        });
        if (device.status) {
          const nativePacket = { topic: `${device.devEui}-in/1/255/255/255`, payload: '1' };
          if (nativePacket.payload && nativePacket.payload !== null) {
            await Device.app.publish(nativePacket.topic, nativePacket.payload, false, 0);
          }
          console.log('nativePacket', nativePacket.topic);
        }
        return Device.app.publish(packet.topic, packet.payload, false, 1);
      }
      throw new Error('Invalid MQTT Packet encoding');
    } catch (error) {
      return error;
    }
  };

  /**
   * Token creation helper
   * @method module:Device~createToken
   * @param {object} device - Device instance
   * returns {object} token
   */
  const createToken = async device => {
    try {
      let hwIdProp;
      if (device.devEui && device.devEui !== null) {
        hwIdProp = 'devEui';
      } else if (device.devAddr && device.devAddr !== null) {
        hwIdProp = 'devAddr';
      }
      if (!hwIdProp) throw new Error('Device hardware id not found');
      //  const token = await Device.app.models.accessToken.create({
      const token = await device.accessTokens.create({
        [hwIdProp]: device[hwIdProp],
        ttl: -1,
      });
      return token;
    } catch (error) {
      return error;
    }
  };

  /**
   * Init device depencies ( token, address )
   * @method module:Device~createDeviceProps
   * @param {object} ctx - Application context
   * @param {object} ctx.req - HTTP request
   * @param {object} ctx.res - HTTP response
   */
  const createDeviceProps = async ctx => {
    try {
      await ctx.instance.deviceAddress.create({
        street: '',
        streetNumber: null,
        streetName: null,
        postalCode: null,
        city: null,
        public: false,
      });
      const token = await createToken(ctx.instance);
      if (!ctx.instance.deviceAddress || !token) {
        await Device.destroyById(ctx.instance.id);
        throw new Error('no device address');
      }
      await ctx.instance.updateAttribute('apiKey', token.id.toString());
      await utils.mkDirByPathSync(`${process.env.FS_PATH}/${ctx.instance.id}`);
      //  logger.publish(4, `${collectionName}`, 'createDeviceProps:res', container);
      return Device.publish(ctx.instance, 'POST');
    } catch (error) {
      return error;
    }
  };

  const updateCachedSensors = async device => {
    try {
      const Sensor = Device.app.models.Sensor;
      const SensorResource = Device.app.models.SensorResource;
      const sensorsKeys = await SensorResource.keys({
        match: `deviceId-${device.id}-sensorId-*`,
      });
      const promises = await sensorsKeys.map(async key => {
        let sensor = JSON.parse(await SensorResource.get(key));
        sensor = {
          ...sensor,
          devEui: device.devEui,
          devAddr: device.devAddr,
          transportProtocol: device.transportProtocol,
          transportProtocolVersion: device.transportProtocolVersion,
          messageProtocol: device.messageProtocol,
          messageProtocolVersion: device.messageProtocolVersion,
        };
        await SensorResource.set(key, JSON.stringify(sensor));
        //  await Sensor.publish(sensor, 'HEAD');
        return sensor;
      });
      const sensors = await Promise.all(promises);
      await Sensor.syncCache(device);
      return sensors;
    } catch (error) {
      return error;
    }
  };

  /**
   * Update device depencies ( token, sensors )
   * @method module:Device~updateDeviceProps
   * @param {object} ctx - Application context
   * @param {object} ctx.req - HTTP request
   * @param {object} ctx.res - HTTP response
   */
  const updateDeviceProps = async ctx => {
    try {
      let token = await Device.app.models.accessToken.findById(ctx.instance.apiKey);
      console.log('updateDeviceProps1', token);
      //  let token = await ctx.instance.accessTokens.findById(ctx.instance.apiKey);
      //  if (!token || token === null) throw new Error('Device API key not found');
      if (!token || token === null) {
        token = await createToken(ctx.instance);
        await ctx.instance.updateAttribute('apiKey', token.id.toString());
      } else {
        let hwIdProp;
        if (ctx.instance.devEui && ctx.instance.devEui !== null) {
          hwIdProp = 'devEui';
        } else if (ctx.instance.devAddr && ctx.instance.devAddr !== null) {
          hwIdProp = 'devAddr';
        }
        if (!hwIdProp) throw new Error('Device hardware id not found');
        await token.updateAttribute(hwIdProp, ctx.instance[hwIdProp]);
      }

      logger.publish(4, `${collectionName}`, 'updateDeviceProps:req', token.id);

      const sensorsCount = await ctx.instance.sensors.count();
      if (sensorsCount && sensorsCount > 0) {
        await updateCachedSensors(ctx.instance);
      }
      logger.publish(4, `${collectionName}`, 'updateDeviceProps:res', {
        token,
      });
      return Device.publish(ctx.instance, 'PUT');
    } catch (error) {
      return error;
    }
  };

  /**
   * Event reporting that a device instance has been created or updated.
   * @event after save
   * @param {object} ctx - Express context.
   * @param {object} ctx.req - Request
   * @param {object} ctx.res - Response
   * @param {object} ctx.instance - Device instance
   */
  Device.observe('after save', async ctx => {
    try {
      if (ctx.hookState.updateData) {
        logger.publish(4, `${collectionName}`, 'afterSave:req', ctx.hookState.updateData);
        const updatedProps = Object.keys(ctx.hookState.updateData);
        if (updatedProps.some(prop => prop === 'status')) {
          return Device.publish(ctx.instance, 'PUT');
        }
      } else if (ctx.instance && Device.app) {
        logger.publish(4, `${collectionName}`, 'afterSave:req', ctx.instance);

        if (ctx.isNewInstance) {
          return createDeviceProps(ctx);
        }
        return updateDeviceProps(ctx);
      }
      return ctx;
    } catch (error) {
      logger.publish(3, `${collectionName}`, 'afterSave:err', error);
      return error;
    }
  });

  /**
   * Find sensors in the cache and add to device instance
   * @method module:Device~addCachedSensors
   * @param {object} device - device instance
   */
  const addCachedSensors = async device => {
    try {
      const SensorResource = Device.app.models.SensorResource;
      const sensorsKeys = await SensorResource.keys({
        match: `deviceId-${device.id}-sensorId-*`,
      });
      logger.publish(5, `${collectionName}`, 'addCachedSensors:req', sensorsKeys);
      const promises = await sensorsKeys.map(async key =>
        JSON.parse(await SensorResource.get(key)),
      );
      const sensors = await Promise.all(promises);
      logger.publish(5, `${collectionName}`, 'addCachedSensors:res', sensors[0]);
      if (sensors && sensors !== null) {
        device.sensors = sensors;
      }
      return device;
    } catch (err) {
      throw err;
    }
  };

  /**
   * Event reporting that a device instance has been created or updated.
   * @event after save
   * @param {object} ctx - Express context.
   * @param {object} ctx.req - Request
   * @param {object} ctx.res - Response
   * @param {object} ctx.instance - Device instance
   */
  Device.beforeRemote('**', async ctx => {
    try {
      if (
        ctx.method.name.indexOf('find') !== -1 ||
        ctx.method.name.indexOf('__get') !== -1 ||
        ctx.method.name.indexOf('get') !== -1
      ) {
        logger.publish(4, `${collectionName}`, 'beforeFind:req', {
          query: ctx.req.query,
          params: ctx.req.params,
        });

        let getSensors = false;
        let result;

        if (ctx.method.name.startsWith('__get')) {
          const methodParts = ctx.method.name.split('__');
          const modelName = methodParts[2];
          const params = ctx.req.params;
          //  console.log('[DEVICE] beforeRemote get:req', modelName, params);
          if (modelName === 'sensors' && params && params.id) {
            getSensors = true;
            const id = params.id;
            const device = await Device.findById(id);
            result = [JSON.parse(JSON.stringify(device))];
          }
        }

        if (ctx.req.query.filter) {
          const whereFilter = JSON.parse(ctx.req.query.filter);
          //  console.log('[DEVICE] beforeRemote get:req', whereFilter);
          if (whereFilter.include) {
            if (typeof whereFilter.include === 'object') {
              const index = whereFilter.include.indexOf('sensors');
              getSensors = true;
              if (index !== -1) {
                whereFilter.include.splice(index, 1);
              }
            } else if (typeof whereFilter.include === 'string') {
              if (whereFilter.include.search('sensor') !== -1) {
                getSensors = true;
                delete whereFilter.include;
              }
            } else if (
              whereFilter.include.relation &&
              typeof whereFilter.include.relation === 'string'
            ) {
              if (whereFilter.include.relation.search('sensor') !== -1) {
                getSensors = true;
                delete whereFilter.include;
              }
            }
          }
          if (whereFilter && whereFilter.id) {
            const id = whereFilter.where.id;
            const device = await Device.findById(id);
            result = [JSON.parse(JSON.stringify(device))];
          } else if (whereFilter.where && whereFilter.where.ownerId) {
            const devices = await Device.find(whereFilter);
            result = JSON.parse(JSON.stringify(devices));
          }
        }

        if (result && getSensors) {
          //  console.log('[DEVICE] beforeRemote getSensors', getSensors);
          result = await result.map(addCachedSensors);
          ctx.result = await Promise.all(result);
        } else if (result) {
          ctx.result = result;
        }
        //  logger.publish(4, `${collectionName}`, 'beforeFind:res', ctx.result.length);
        return ctx;
      }
      return ctx;
    } catch (error) {
      return error;
    }
  });

  /**
   * Event reporting that a device instance will be deleted.
   * @event before delete
   * @param {object} ctx - Express context.
   * @param {object} ctx.req - Request
   * @param {object} ctx.res - Response
   * @param {object} ctx.where.id - Device instance
   */
  Device.observe('before delete', async ctx => {
    try {
      if (ctx.where.id) {
        const instance = await ctx.Model.findById(ctx.where.id);
        logger.publish(4, `${collectionName}`, 'beforeDelete:req', instance.id);
        await Device.app.models.Address.destroyAll({
          deviceId: instance.id,
        });
        await Device.app.models.accessToken.destroyById(instance.apiKey);
        const sensors = await instance.sensors.find();
        if (sensors && sensors !== null) {
          sensors.forEach(async sensor => instance.sensors.deleteById(sensor.id));
        }
        // await Device.app.models.Sensor.destroyAll({
        //   deviceId: instance.id,
        // });

        if (instance && instance.ownerId && Device.app) {
          await Device.publish(instance, 'DELETE');
          return ctx;
        }
      }
      throw new Error('no instance to delete');
    } catch (error) {
      return error;
    }
  });

  /**
   * Find device related to incoming MQTT packet
   * @method module:Device.findByPattern
   * @param {object} pattern - IotAgent parsed pattern
   * @param {object} encoded - IotAgent parsed message
   * @returns {object} device
   */
  Device.findByPattern = async (pattern, encoded) => {
    try {
      const transportProtocol = {
        like: new RegExp(`.*${pattern.name}.*`, 'i'),
      };
      // const messageProtocol = {
      //   like: new RegExp(`.*${pattern.name}.*`, 'i'),
      // };
      const deviceFilter = {
        where: {
          and: [{ transportProtocol }],
        },
        include: {
          relation: 'sensors',
          scope: {
            where: {
              and: [
                {
                  nativeSensorId: encoded.nativeSensorId,
                },
              ],
            },
            limit: 1,
          },
        },
      };
      if (encoded.type && encoded.type !== null) {
        deviceFilter.include.scope.where.and.push({
          type: encoded.type,
        });
      }
      if (encoded.nativeNodeId && encoded.nativeNodeId !== null) {
        deviceFilter.include.scope.where.and.push({
          nativeNodeId: encoded.nativeNodeId,
        });
      }
      if (encoded.devEui && encoded.devEui !== null) {
        deviceFilter.where.and.push({
          devEui: { like: new RegExp(`.*${encoded.devEui}.*`, 'i') },
        });
      }
      if (encoded.devAddr && encoded.devAddr !== null) {
        deviceFilter.where.and.push({
          devAddr: { like: new RegExp(`.*${encoded.devAddr}.*`, 'i') },
        });
      }
      //  console.log('onPublish, filter device :', deviceFilter.where.and);
      const device = await Device.findOne(deviceFilter);
      if (!device || device === null || !device.id) {
        throw new Error('no device found');
      }
      logger.publish(4, `${collectionName}`, 'findByPattern:res', {
        deviceName: device.name,
        deviceId: device.id,
      });
      return device;
    } catch (error) {
      return error;
    }
  };

  /**
   * Find properties and dispatch to the right function
   * @method module:Device~parseMessage
   * @param {object} pattern - Pattern detected by IotAgent
   * @param {object} encoded - IotAgent parsed message
   * @returns {functions} getInstance
   * @returns {functions} createOrUpdateSensor
   */
  const parseMessage = async (pattern, encoded) => {
    try {
      logger.publish(4, `${collectionName}`, 'parseMessage:req', {
        nativeSensorId: encoded.nativeSensorId,
      });
      if (
        (encoded.devEui || encoded.devAddr) &&
        encoded.nativeSensorId &&
        (encoded.type || encoded.resource)
      ) {
        const device = await Device.findByPattern(pattern, encoded);
        if (!device || device === null) return null;
        // await device.updateAttributes({
        //   frameCounter: device.frameCounter + 1 || 1,
        //   lastSignal: encoded.lastSignal || new Date(),
        // });
        const Sensor = Device.app.models.Sensor;
        const tempSensor = await Sensor.compose(
          device,
          encoded,
        );
        if (encoded.method === 'GET') {
          pattern.params.method = 'GET';
          //  return Sensor.getInstance(pattern, tempSensor);
          return null;
        } else if (encoded.method === 'HEAD') {
          return Sensor.handlePresentation(device, tempSensor, encoded);
        } else if (encoded.method === 'POST' || encoded.method === 'PUT') {
          return Sensor.createOrUpdate(device, tempSensor, encoded);
        } else if (encoded.method === 'STREAM') {
          return Sensor.publish(tempSensor, encoded.method);
        }
        throw new Error('Unsupported method');
      }
      throw new Error('Missing params');
    } catch (error) {
      logger.publish(4, `${collectionName}`, 'parseMessage:err', error);
      return error;
    }
  };

  /**
   * Dispatch incoming MQTT packet
   * @method module:Device.onPublish
   * @param {object} pattern - Pattern detected by Iot-Agent
   * @param {object} packet - MQTT bridge packet
   * @returns {functions} parseMessage
   */
  Device.onPublish = async (pattern, packet) => {
    try {
      // logger.publish(4, `${collectionName}`, 'onPublish:req', pattern);
      if (!pattern || !pattern.params || !pattern.name) {
        throw new Error('Missing argument');
      }
      const encoded = await iotAgent.encode(packet, pattern);
      if (!encoded) throw new Error('No encoded result');
      return parseMessage(pattern, encoded);
    } catch (error) {
      logger.publish(4, `${collectionName}`, 'onPublish:err', error);
      return error;
    }
  };

  /**
   * Create new token, and update Device instance
   * @method module:Device.refreshToken
   * @param {object} device - Device instance
   * @returns {functions} device.updateAttributes
   */
  Device.refreshToken = async (ctx, device) => {
    try {
      logger.publish(4, `${collectionName}`, 'refreshToken:req', device.id);
      if (!ctx.req.accessToken) throw new Error('missing token');
      if (!device.id) throw new Error('missing device.id');
      if (ctx.req.accessToken.userId.toString() !== device.ownerId.toString()) {
        throw new Error('Invalid user');
      }
      device = await Device.findById(device.id);
      if (device && device !== null) {
        await Device.app.models.accessToken.destroyById(device.apiKey);
        const token = await device.accessTokens.create({
          devEui: device.devEui,
          devAddr: device.devAddr,
          userId: device.id,
          ttl: -1,
        });
        // publish new apiKey to target device ?
        await device.updateAttribute('apiKey', token.id.toString());
        return device;
      }
      throw new Error('Missing Device instance');
    } catch (error) {
      logger.publish(4, `${collectionName}`, 'refreshToken:err', error);
      return error;
    }
  };

  /**
   * Update device status from MQTT conection status
   * @method module:Device~updateDeviceStatus
   * @param {object} client - MQTT client
   * @param {boolean} status - MQTT conection status
   * @returns {function}
   */
  Device.updateStatus = async (client, status) => {
    try {
      let hwIdProp;
      if (client.devEui && client.devEui !== null && client.id.startsWith(client.devEui)) {
        hwIdProp = 'devEui';
      } else if (
        client.devAddr &&
        client.devAddr !== null &&
        client.id.startsWith(client.devAddr)
      ) {
        hwIdProp = 'devAddr';
      }
      if (!hwIdProp) return null;
      const device = await Device.findById(client.user);
      if (device && device !== null) {
        if (status) {
          //  await device.updateAttribute('status', true);
          await device.updateAttributes({ frameCounter: 1, status: true, lastSignal: new Date() });
        } else {
          await device.updateAttributes({ frameCounter: 0, status: false, lastSignal: new Date() });
        }
      }
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Helper for device search
   * @method module:Device~findDevice
   * @param {object} whereFilter - Device filter
   * @returns {promise} Device.find
   */
  const findDevice = async whereFilter =>
    new Promise((resolve, reject) => {
      Device.find(whereFilter, (err, devices) => (err ? reject(err) : resolve(devices)));
    });

  /**
   * Search device by location ( keyword )
   * @method module:Device.search
   * @param {object} filter - Requested filter
   * @returns {array} devies
   */
  Device.search = async (ctx, filter) => {
    logger.publish(4, `${collectionName}`, 'search:req', filter);
    try {
      if (!ctx.req.accessToken.userId || !filter.place) {
        throw new Error('Invalid request');
      }
      let whereFilter;
      if (filter.place && filter.place !== null) {
        whereFilter = {
          where: {
            fullAddress: {
              like: new RegExp(`.*${filter.place}.*`, 'i'),
            },
          },
          include: 'deviceAddress',
        };
      } else {
        throw new Error('No place selected');
      }
      const devices = await findDevice(whereFilter);
      logger.publish(2, `${collectionName}`, 'search:res', devices);
      return devices;
    } catch (error) {
      logger.publish(2, `${collectionName}`, 'search:err', error);
      return error;
    }
  };

  /**
   * Helper for reverse geocoding
   * @method module:Device~findAddresses
   * @param {object} filter - Device location filter
   * @returns {promise} Device.app.models.Address.find
   */
  const findAddresses = async filter =>
    new Promise((resolve, reject) => {
      Device.app.models.Address.find(
        {
          where: {
            public: true,
            coordinates: {
              near: filter.location,
              maxDistance: filter.maxDistance,
              unit: filter.unit,
            },
          },
        },
        (err, addresses) => (err ? reject(err) : resolve(addresses)),
      );
    });

  /**
   * Search device by location ( GPS coordinates )
   * @method module:Device.geoLocate
   * @param {object} filter - Requested filter
   * @returns {array} deviceAddresses
   */
  Device.geoLocate = async filter => {
    try {
      logger.publish(4, `${collectionName}`, 'geoLocate:req', filter);
      const addresses = await findAddresses(filter);
      //  logger.publish(4, `${collectionName}`, 'geoLocate:res', addresses);
      if (!addresses) {
        throw new Error('No match found');
      }
      const deviceAddresses = await addresses.filter(address => address.deviceId);
      let devices = [];
      logger.publish(4, `${collectionName}`, 'geoLocate:res', deviceAddresses);
      if (deviceAddresses.length > 0) {
        devices = await utils.composeGeoLocateResult(collectionName, deviceAddresses);
      }
      return devices;
    } catch (error) {
      logger.publish(2, `${collectionName}`, 'geoLocate:err', error);
      return error;
    }
  };

  Device.syncCache = async () => {
    try {
      logger.publish(4, `${collectionName}`, 'syncCache:req', '');
      const devices = await Device.find();
      if (devices && devices !== null) {
        const promises = await devices.map(async device =>
          Device.app.models.Sensor.syncCache(device),
        );
        const result = await Promise.all(promises);
        return result;
      }
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Endpoint for device authentification with APIKey
   * @method module:Device~authenticate
   * @param {object} ctx - Loopback context
   * @param {string} deviceId - Device instance id
   * @returns {object} token
   */
  // Device.authenticate = async (ctx, deviceId, apiKey) => {
  //   try {

  //   } catch(error) {
  //     return error
  //   }

  // };

  /**
   * Endpoint for device requesting their own state
   * @method module:Device~getState
   * @param {object} ctx - Loopback context
   * @param {string} deviceId - Device instance id
   * @returns {object}
   */
  Device.getState = async (ctx, deviceId) => {
    try {
      //  console.log('getstate, req : ', ctx.req.headers);
      if (!ctx.req.headers || !ctx.req.headers.apikey) throw new Error('missing token');
      if (!deviceId) throw new Error('missing device.id');
      const tokenId = ctx.req.headers.apikey.trim();
      logger.publish(4, `${collectionName}`, 'getState:req', { deviceId, tokenId });

      const device = await Device.findById(deviceId, {
        fields: {
          id: true,
          devEui: true,
          devAddr: true,
          apiKey: true,
          frameCounter: true,
          name: true,
          state: true,
        },
      });

      if (device && device !== null) {
        const foundToken = await device.accessTokens.findById(tokenId);
        //  console.log('getstate, token : ', tokenId, device.apiKey, foundToken);
        if (foundToken && foundToken !== null) {
          //  await addCachedSensors(device);
          // const res = JSON.stringify(device);
          // console.log('getstate, : ', res);
          return device;
          //  return JSON.stringify(device);
        }
        ctx.res.status(403);
        return null;
      }
      ctx.res.status(404);
      return null;
    } catch (error) {
      return error;
    }
  };

  /**
   * Update OTA if a firmware is available
   * @method module:Device~getOTAUpdate
   * @param {object} ctx - Loopback context
   * @param {string} deviceId - Device instance id
   * @param {string} version - Firmware version requested
   * @returns {object}
   */
  Device.getOTAUpdate = async (ctx, deviceId, version) => {
    try {
      // todod add APIKey in request
      //  const pipeline = promisify(stream.pipeline);

      const checkHeader = (headers, key, value = false) => {
        if (!headers[key]) {
          return false;
        }
        if (value && headers[key] !== value) {
          return false;
        }
        return true;
      };

      // const token = await device.accessTokens.findById(device.apiKey);
      // // console.log('getstate, token : ', token);
      // if (!token || token !== null) {
      //   ctx.res.status(403);
      //   throw new Error('No valid token found');
      // }

      const headers = ctx.req.headers;
      console.log('headers', headers);

      if (checkHeader(headers, 'user-agent', 'ESP8266-http-Update')) {
        if (
          !checkHeader(headers, 'x-esp8266-sta-mac') ||
          !checkHeader(headers, 'x-esp8266-ap-mac') ||
          !checkHeader(headers, 'x-esp8266-free-space') ||
          !checkHeader(headers, 'x-esp8266-sketch-size') ||
          !checkHeader(headers, 'x-esp8266-sketch-md5') ||
          !checkHeader(headers, 'x-esp8266-chip-size') ||
          !checkHeader(headers, 'x-esp8266-sdk-version') ||
          !checkHeader(headers, 'x-esp8266-mode')
        ) {
          ctx.res.status(403);
          console.log('invalid ESP8266 header');
          throw new Error('invalid ESP8266 header');
        }
        const devEui = headers['x-esp8266-sta-mac'].split(':').join('');
        const filter = {
          where: {
            id: deviceId,
            devEui: {
              like: new RegExp(`.*${devEui}.*`, 'i'),
            },
          },
        };
        const device = await Device.findOne(filter);
        //  const device = await Device.findById(deviceId);
        //  console.log('#device ', device);

        if (!device || device === null) {
          ctx.res.status(403);
          throw new Error('No device found');
        }
        console.log('devEui', devEui, device.devEui);
        if (devEui === device.devEui) {
          ctx.res.set('Content-Type', `application/octet-stream`);

          // look for meta containing firmware tag ?
          //  const fileFilter = { where: { role: {like: new RegExp(`.*firmware.*`, 'i')} } };
          //  const fileFilter = { where: { originalName: {like: new RegExp(`.*${device.name}.*`, 'i')} } };
          const fileFilter = { where: { name: { like: new RegExp(`.*bin.*`, 'i') } } };
          if (version && version !== null) {
            //  fileFilter.where.originalName = version;
          }

          const fileMeta = await device.files.findOne(fileFilter);
          console.log('#fileMeta ', fileMeta);

          ctx.res.set('Content-Disposition', `attachment; filename=${fileMeta.name}`);
          //  const path = `./storage/${device.id}/${fileMeta.name}`;
          //  const fd = fs.createReadStream(path);
          const fd = Device.app.models.container.downloadStream(
            device.id.toString(),
            fileMeta.name,
          );
          const md5sum = crypto.createHash('md5');

          // const reportProgress = new stream.Transform({
          //   transform(chunk, encoding, callback) {
          //     process.stdout.write('.');
          //     //  bodyChunks.push(chunk);
          //     callback(null, chunk);
          //   },
          // });

          //  let bodyChunks = [];
          // const pushChunks = new stream.Transform({
          //   transform(chunk, encoding, callback) {
          //     bodyChunks.push(chunk);
          //     callback(null, chunk);
          //   },
          // });
          // const pipe = await pipeline(fd, crypto.createHash('md5'), ctx.res);
          // // return fd;
          // console.log('#pipe ', pipe);

          // const endStream = new Promise((resolve, reject) => {
          //   fd.pipe(crypto.createHash('md5'))
          //     .pipe(pushChunks)
          //     .on('finish', () => {
          //       const hash = md5sum.digest('hex');
          //       console.log('#hash ', hash, headers['x-esp8266-sketch-md5']);
          //       const body = Buffer.concat(bodyChunks);
          //       ctx.res.set('Content-Length', fd.bytesRead);
          //       ctx.res.status(200);
          //       ctx.res.set('x-MD5', hash);
          //       //  console.log('file', file);
          //       console.log('Done');
          //       resolve(body);
          //     })
          //     //  .pipe(ctx.res)
          //     .on('error', reject);
          // });

          const endStream = new Promise((resolve, reject) => {
            const bodyChunks = [];
            fd.on('data', d => {
              bodyChunks.push(d);
              md5sum.update(d);
            });
            fd.on('end', () => {
              const hash = md5sum.digest('hex');
              const body = Buffer.concat(bodyChunks);
              //  console.log('#hash ', hash, headers['x-esp8266-sketch-md5']);
              // console.log('file', file);
              ctx.res.set('Content-Length', fd.bytesRead);
              ctx.res.status(200);
              ctx.res.set('x-MD5', hash);
              resolve(body);
            });
            fd.on('error', reject);
          });

          const result = await endStream;
          if (result && !(result instanceof Error)) {
            return result;
          }
          ctx.res.status(304);
          throw new Error('Error while reading stream');
        }
        ctx.res.status(304);
        throw new Error('already up to date');
      }
      ctx.res.status(403);
      throw new Error('only for ESP8266 updater');
    } catch (error) {
      return error;
    }
  };

  //  Device.createAuthLink = (account, deviceId, method) => {
  // check that this device is owned by account
  // then get device.apiKey
  // if method === "qrcode"
  // generate a url
  // if method === "nfc"
  //
  //  };
};
