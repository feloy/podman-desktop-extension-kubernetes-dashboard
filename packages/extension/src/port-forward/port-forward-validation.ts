/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { ForwardConfig } from '/@common/model/port-forward';

/**
 * Type representing a function that checks the availability of a port.
 */
type PortChecker = (port: number) => Promise<boolean>;

/**
 * Class representing the requirements for a forward configuration.
 */
export class ForwardConfigRequirements {
  protected readonly portChecker: PortChecker;

  /**
   * Creates an instance of ForwardConfigRequirements.
   * @param portChecker - A function that checks the availability of a port.
   * @see isFreePort
   */
  constructor(portChecker: PortChecker) {
    this.portChecker = portChecker;
  }

  /**
   * Checks the runtime requirements for the given forward configuration.
   * @param config - The forwarding configuration.
   * @returns A promise that resolves when the requirements are met.
   * @throws If any requirement is not met.
   */
  async checkRuntimeRequirements(config: ForwardConfig): Promise<void> {
    if (config.name.length === 0) {
      throw new Error('Found empty resource (Pod, Deployment or Service) name.');
    }
    if (config.namespace.length === 0) {
      throw new Error('Found empty namespace.');
    }

    const available = await this.portChecker(config.forward.localPort);
    if (!available) throw new Error('port not available');
  }
}
