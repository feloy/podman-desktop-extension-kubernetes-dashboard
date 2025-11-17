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

import type { V1EndpointSlice } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { EndpointSliceHelper } from './endpointslice-helper';

let endpointSliceHelper: EndpointSliceHelper;

beforeEach(() => {
  vi.clearAllMocks();
  endpointSliceHelper = new EndpointSliceHelper();
});

test('expect basic UI conversion', async () => {
  const endpointSlice = {
    metadata: {
      name: 'my-endpoint-slice',
      namespace: 'test-namespace',
    },
    ports: [
      {
        name: 'http',
        port: 80,
        protocol: 'TCP',
      },
      {
        port: 443,
        protocol: 'TCP',
      },
    ],
  } as V1EndpointSlice;
  const endpointSliceUI = endpointSliceHelper.getEndpointSliceUI(endpointSlice);
  expect(endpointSliceUI.kind).toEqual('EndpointSlice');
  expect(endpointSliceUI.name).toEqual('my-endpoint-slice');
  expect(endpointSliceUI.namespace).toEqual('test-namespace');
  expect(endpointSliceUI.ports).toEqual([
    'http',
    '443/TCP',
  ]);
});
