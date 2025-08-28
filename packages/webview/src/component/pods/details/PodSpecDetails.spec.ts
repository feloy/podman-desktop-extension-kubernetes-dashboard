/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import type { V1PodSpec } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import PodSpecDetails from './PodSpecDetails.svelte';

const fakePodSpec: V1PodSpec = {
  nodeName: 'node-01',
  serviceAccountName: 'default-service-account',
  restartPolicy: 'Always',
  containers: [
    {
      name: 'nginx-container',
      image: 'nginx:latest',
    },
    {
      name: 'redis-container',
      image: 'redis:latest',
    },
  ],
  // Example structure, adjust based on your actual `V1PodSpec` structure
  volumes: [
    {
      name: 'volume-01',
      emptyDir: {},
    },
    {
      name: 'volume-02',
      hostPath: {
        path: '/data',
      },
    },
  ],
};

vi.mock(import('/@/component/port-forward/KubePortsList.svelte'));

test('Renders pod spec correctly', () => {
  render(PodSpecDetails, { spec: fakePodSpec });

  // Static details
  expect(screen.getByText('Details')).toBeInTheDocument();
  expect(screen.getByText('Node Name')).toBeInTheDocument();
  expect(screen.getByText('node-01')).toBeInTheDocument();
  expect(screen.getByText('Service Account')).toBeInTheDocument();
  expect(screen.getByText('default-service-account')).toBeInTheDocument();
  expect(screen.getByText('Restart Policy')).toBeInTheDocument();
  expect(screen.getByText('Always')).toBeInTheDocument();

  expect(screen.getAllByText('nginx-container')).toHaveLength(2);
  expect(screen.getAllByText('redis-container')).toHaveLength(2);
});
