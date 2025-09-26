/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { injectable } from 'inversify';
import { KubeConfigSingleContext } from '/@/types/kubeconfig-single-context';
import { RpcExtension } from '/@common/rpc/rpc';
import { Exec, V1Status } from '@kubernetes/client-node';
import { PassThrough } from 'node:stream';
import { POD_TERMINAL_DATA } from '/@common/channels';

@injectable()
export class PodTerminalService {

  #stdin = new PassThrough();

  constructor(
    private readonly context: KubeConfigSingleContext,
    private readonly rpcExtension: RpcExtension,
  ) {}

  async startTerminal(podName: string, namespace: string, containerName: string): Promise<void> {
    console.log('startTerminal (service)', podName, namespace, containerName);
    const exec = new Exec(this.context.getKubeConfig());
    
    const stdout = new PassThrough();
    const stderr = new PassThrough();

    stdout.on('data', (data: Buffer) => {
      this.rpcExtension
        .fire(POD_TERMINAL_DATA, {
          podName,
          namespace,
          containerName,
          channel: 'stdout',
          data,
        })
        .catch(console.error);
    });
    stderr.on('data', (data: Buffer) => {
      this.rpcExtension
        .fire(POD_TERMINAL_DATA, {
          podName,
          namespace,
          containerName,
          channel: 'stderr',
          data,
        })
        .catch(console.error);
    });

    const conn = await exec.exec(
      namespace,
      podName,
      containerName,
      ['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then bash; else sh; fi'],
      stdout,
      stderr,
      this.#stdin,
      true,
      (_: V1Status) => {
        // need to think, maybe it would be better to pass exit code to the client, but on the other hand
        // if connection is idle for 15 minutes, websocket connection closes automatically and this handler
        // does not call. also need to separate SIGTERM signal (143) and normally exit signals to be able to
        // proper reconnect client terminal. at this moment we ignore status and rely on websocket close event
      },
    );
    conn.on('close', () => {
      console.log('==> terminal conn closed');
      //onClose();
      //this.#execs.delete(`${podName}-${containerName}`);
    });
  }

  async sendData(data: string): Promise<void> {
    this.#stdin.write(data);
  }

  stopTerminal(): void {}
}
