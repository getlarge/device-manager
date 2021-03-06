/*  
Aloes device-manager is an IoT ecosystem providing standardize properties to sensors and devices.

Copyright 2020 Edouard Maleix

Aloes device-manager is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

Aloes device-manager is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Aloes device-manager.  If not, see <https://www.gnu.org/licenses/>.
*/

import nodeCleanup from 'node-cleanup';
import app from './services/server';
import logger from './services/logger';
import envVariablesKeys from './initial-data/variables-keys.json';
import { version } from '../package.json';

require('dotenv').config();

// process.env.REST_API_VERSION = `v${version.substr(0,3)}`;

/**
 * Initialize application and services
 * @param {string} processId - process id
 * @fires Server.start
 */
const boot = (processId) => {
  const envVariables = {};
  envVariablesKeys.forEach((key) => {
    // eslint-disable-next-line security/detect-object-injection
    envVariables[key] = process.env[key];
  });

  const config = {
    ...envVariables,
    version,
    processId,
    // REST_API_VERSION: process.env.REST_API_VERSION,
    appRootDir: __dirname,
    scriptExtensions: ['.js', '.json', '.node', '.ejs'],
  };

  logger.publish(2, 'loopback', 'boot:res', {
    root: __dirname,
    processId,
    aloesId: config.ALOES_ID,
    aloesKey: config.ALOES_KEY,
  });
  app.emit('start', config);
};

/**
 * Watch for interrupt signal
 * @fires Server.stop
 */
nodeCleanup((exitCode, signal) => {
  if (signal && signal !== null) {
    logger.publish(1, 'loopback', 'exit:req', { exitCode, signal, pid: process.pid });
    app.emit('stop', signal);
    setTimeout(() => process.kill(process.pid, signal), 5000);
    nodeCleanup.uninstall();
    return false;
  }
  return true;
});

// todo : log license notice
// todo create init emitter and more process communication in a lib
if (!process.env.CLUSTER_MODE || process.env.CLUSTER_MODE === 'false') {
  logger.publish(1, 'loopback', 'init:single', { pid: process.pid });
  boot(0);
} else {
  logger.publish(1, 'loopback', 'init:cluster', { pid: process.pid });

  process.on('message', (packet) => {
    if (typeof packet.id === 'number' && packet.data.ready) {
      process.env.PROCESS_ID = packet.id;
      boot(packet.id);
      process.send({
        type: 'process:msg',
        data: {
          isStarted: true,
        },
      });
    }
    if (packet.data.stopped) {
      process.emit('SIGINT');
    }
  });

  process.send({
    type: 'process:msg',
    data: {
      isStarted: false,
    },
  });
}

export default app;
