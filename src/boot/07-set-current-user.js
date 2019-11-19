/* Copyright 2019 Edouard Maleix, read LICENSE */

import throttle from 'lodash.throttle';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isLength from 'validator/lib/isLength';
import logger from '../services/logger';
import roleManager from '../services/role-manager';

module.exports = app => {
  const setCurrentUser = async (ctx, next) => {
    try {
      const options = ctx.args.options || {};
      const headers = ctx.req.headers || {};
      const ip = ctx.req.connection && ctx.req.connection.remoteAddress;
      logger.publish(4, 'loopback', 'setCurrentUser:req', { ip, headers });

      let userId;
      if (options.accessToken && options.accessToken.userId) {
        userId = options.accessToken.userId;
      } else if (headers.authorization) {
        const accessToken = await app.models.accessToken.findById(headers.authorization);
        if (accessToken && accessToken.userId) {
          userId = accessToken.userId;
        }
      }

      if (userId) {
        const promises = await Promise.all([
          app.models.user.findById(userId),
          roleManager.getUserRoleNames(app, userId),
        ]);
        if (promises[0] && promises[0].id) {
          if (!ctx.args.options) ctx.args.options = {};
          ctx.args.options.currentUser = {
            id: userId.toString(),
            email: promises[0].email,
            roles: promises[1],
            type: 'User',
          };
          logger.publish(4, 'loopback', `setCurrentUser:res`, {
            method: ctx.methodString,
            userId,
          });
        } else {
          logger.publish(4, 'loopback', `setCurrentUser:res`, {
            method: ctx.methodString,
            userId: 'anonymous',
          });
        }
        return next();
      }

      const deviceDevEui = headers.deveui;
      if (
        deviceDevEui &&
        isLength(deviceDevEui, { min: 4, max: 32 }) &&
        isAlphanumeric(deviceDevEui)
      ) {
        const deviceApiKey = headers.apikey;

        // or device.authenticate ? with header containing 'key'
        const device = await app.models.Device.findOne({
          where: {
            and: [
              {
                devEui: {
                  // eslint-disable-next-line security/detect-non-literal-regexp
                  like: new RegExp(`.*${deviceDevEui}.*`, 'i'),
                },
              },
              { apiKey: deviceApiKey },
            ],
          },
        });
        // console.log('FOUND DEVICE', device);
        if (device && device.id) {
          if (!ctx.args.options) ctx.args.options = {};
          ctx.args.options.currentUser = {
            id: device.id.toString(),
            devEui: device.devEui,
            roles: ['user'],
            type: 'Device',
            // onwerId: device.ownerId
          };
          logger.publish(4, 'loopback', 'setCurrentUser:res', {
            method: ctx.methodString,
            devEui: device.devEui,
            userId: device.id,
          });
        }
      }

      const appId = headers.appid;
      // const appEui = headers.appeui;
      if (appId && isLength(appId, { min: 1, max: 32 }) && isAlphanumeric(appId)) {
        const appApiKey = headers.apikey;
        let auth;
        try {
          auth = await app.models.Application.authenticate(appId, appApiKey);
        } catch (e) {
          // if (e.code === 403) foundUser = appId;
          auth = null;
        }
        // console.log('FOUND Application', auth);
        if (auth && auth.application) {
          const application = auth.application;
          if (!ctx.args.options) ctx.args.options = {};
          ctx.args.options.currentUser = {
            id: application.id.toString(),
            appId: application.id.toString(),
            appEui: application.appEui,
            roles: ['user'],
            type: 'Application',
            // onwerId: application.ownerId
          };
          logger.publish(4, 'loopback', 'setCurrentUser:res', {
            method: ctx.methodString,
            userId: application.id,
            appEui: application.appEui,
          });
          return next();
        }
      }

      logger.publish(4, 'loopback', `setCurrentUser:res`, {
        method: ctx.methodString,
        userId: 'anonymous',
      });
      return next();
    } catch (error) {
      logger.publish(2, 'loopback', 'setCurrentUser:err', error);
      return next(error);
    }
  };

  const delayedSetCurrentUser = throttle(setCurrentUser, 5);

  app
    .remotes()
    .phases.addBefore('invoke', 'set-current-user')
    .use(delayedSetCurrentUser);
};
