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

import { describe, expect, test, vi } from 'vitest';
import { type ForwardConfig, WorkloadKind } from '/@common/model/port-forward';
import { ForwardConfigRequirements } from './port-forward-validation';

describe('ForwardConfigRequirements', () => {
  const validConfig: ForwardConfig = {
    id: 'fake-id',
    name: 'validName',
    namespace: 'validNamespace',
    kind: WorkloadKind.POD,
    forward: { localPort: 8080, remotePort: 80 },
  };

  test('should pass all requirements', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);

    await expect(requirements.checkRuntimeRequirements(validConfig)).resolves.toBeUndefined();
    expect(portChecker).toHaveBeenCalledWith(8080);
  });

  test('should fail with empty resource name', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);
    const invalidConfig = { ...validConfig, name: '' };

    await expect(requirements.checkRuntimeRequirements(invalidConfig)).rejects.toThrow(
      'Found empty resource (Pod, Deployment or Service) name.',
    );
  });

  test('should fail with empty namespace', async () => {
    const portChecker = vi.fn().mockResolvedValue(true);
    const requirements = new ForwardConfigRequirements(portChecker);
    const invalidConfig = { ...validConfig, namespace: '' };

    await expect(requirements.checkRuntimeRequirements(invalidConfig)).rejects.toThrow('Found empty namespace.');
  });

  test('should fail if port is not available', async () => {
    const portChecker = vi.fn().mockRejectedValue(new Error('Port is already in use.'));
    const requirements = new ForwardConfigRequirements(portChecker);

    await expect(requirements.checkRuntimeRequirements(validConfig)).rejects.toThrow();
  });

  test('should propagate port check failures', async () => {
    const portChecker = vi.fn().mockRejectedValue(new Error(`Port 8081 is not available`));
    const requirements = new ForwardConfigRequirements(portChecker);
    const multiPortConfig = {
      ...validConfig,
      forward: { localPort: 8080, remotePort: 80 },
    };

    await expect(requirements.checkRuntimeRequirements(multiPortConfig)).rejects.toThrow('Port 8081 is not available');
  });
});
