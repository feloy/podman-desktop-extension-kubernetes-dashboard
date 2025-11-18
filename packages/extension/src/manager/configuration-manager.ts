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

import { configuration, ConfigurationChangeEvent } from '@podman-desktop/api';
import { injectable } from 'inversify';
import {
  CUSTOM_RESOURCE_GROUP,
  CUSTOM_RESOURCE_IS_NAMESPACED,
  CUSTOM_RESOURCE_KIND,
  CUSTOM_RESOURCE_PLURAL,
  CUSTOM_RESOURCE_VERSION,
  MANAGE_CUSTOM_RESOURCE,
  SECTION,
} from '/@/constants';
import { IDisposable } from '@kubernetes-dashboard/channels';
import { Emitter, Event } from '/@/types/emitter';
import type { ConfigurationInfo } from '@kubernetes-dashboard/channels';

@injectable()
export class ConfigurationManager implements IDisposable {
  #configuration: ConfigurationInfo | undefined = undefined;
  #subscriptions: IDisposable[] = [];

  #onConfigurationChange = new Emitter<ConfigurationInfo>();
  onConfigurationChange: Event<ConfigurationInfo> = this.#onConfigurationChange.event;

  init(): void {
    this.#subscriptions.push(
      configuration.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(SECTION)) {
          this.#configuration = this.computeConfiguration();
        }
      }),
    );
    this.#configuration = this.computeConfiguration();
  }

  computeConfiguration(): ConfigurationInfo {
    const config = configuration.getConfiguration(SECTION);
    const manage = config.get<boolean>(MANAGE_CUSTOM_RESOURCE);
    const isNamespaced = config.get<boolean>(CUSTOM_RESOURCE_IS_NAMESPACED);
    const group = config.get<string>(CUSTOM_RESOURCE_GROUP);
    const version = config.get<string>(CUSTOM_RESOURCE_VERSION);
    const plural = config.get<string>(CUSTOM_RESOURCE_PLURAL);
    const kind = config.get<string>(CUSTOM_RESOURCE_KIND);
    const newConfiguration = {
      customResource: manage
        ? {
            isNamespaced: isNamespaced ?? true,
            group: group ?? '',
            version: version ?? '',
            plural: plural ?? '',
            kind: kind ?? '',
          }
        : undefined,
    };
    this.#onConfigurationChange.fire(newConfiguration);
    return newConfiguration;
  }

  getConfiguration(): ConfigurationInfo {
    if (!this.#configuration) {
      this.#configuration = this.computeConfiguration();
    }
    return this.#configuration;
  }

  dispose(): void {
    this.#subscriptions.forEach(subscription => subscription.dispose());
  }
}
