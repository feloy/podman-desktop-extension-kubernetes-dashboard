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

import { inject, injectable } from 'inversify';
import { IDisposable } from '/@common/types/disposable';
import { PodTerminalsApi } from '/@common/interface/pod-terminals-api';
import { PodTerminalService } from '../pod-terminal/pod-terminal-service';
import { ContextsManager } from './contexts-manager';
import { RpcExtension } from '/@common/rpc/rpc';

type PodTerminalInstance = {
  counter: number;
  service: PodTerminalService;
};

@injectable()
export class PodTerminalsApiImpl implements PodTerminalsApi, IDisposable {
  #instances: Map<string, PodTerminalInstance> = new Map();

  constructor(
    @inject(ContextsManager) private contextsManager: ContextsManager,
    @inject(RpcExtension) private rpcExtension: RpcExtension,
  ) {}

  async startTerminal(podName: string, namespace: string, containerName: string): Promise<void> {
    console.log('startTerminal (api)', podName, namespace, containerName);
    if (!this.contextsManager.currentContext) {
      throw new Error('No current context found');
    }
    const instance = this.#instances.get(this.getKey(podName, namespace, containerName)) ?? {
      counter: 0,
      service: new PodTerminalService(this.contextsManager.currentContext, this.rpcExtension),
    };
    instance.counter++;
    if (instance.counter === 1) {
      await instance.service.startTerminal(podName, namespace, containerName);
    }
    this.#instances.set(this.getKey(podName, namespace, containerName), instance);
  }

  async sendData(podName: string, namespace: string, containerName: string, data: string): Promise<void> {
    const instance = this.#instances.get(this.getKey(podName, namespace, containerName));
    if (instance) {
      await instance.service.sendData(data);
    }
  }

  getKey(podName: string, namespace: string, containerName: string): string {
    return `${podName}|${namespace}|${containerName}`;
  }
  
  dispose(): void {
    this.#instances.forEach(instance => instance.service.stopTerminal());
    this.#instances.clear();
  }
}
