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

import type { V1ReplicaSet } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { ReplicaSetHelper } from './replicaset-helper';

let replicaSetHelper: ReplicaSetHelper;

beforeEach(() => {
  vi.clearAllMocks();
  replicaSetHelper = new ReplicaSetHelper();
});

test('expect basic UI conversion', async () => {
  const replicaSet = {
    metadata: {
      name: 'my-replica-set',
      namespace: 'test-namespace',
    },
    status: {
      replicas: 4,
      readyReplicas: 2,
    },
  } as V1ReplicaSet;
  const replicaSetUI = replicaSetHelper.getReplicaSetUI(replicaSet);
  expect(replicaSetUI.kind).toEqual('ReplicaSet');
  expect(replicaSetUI.name).toEqual('my-replica-set');
  expect(replicaSetUI.namespace).toEqual('test-namespace');
  expect(replicaSetUI.replicas).toEqual(4);
  expect(replicaSetUI.ready).toEqual(2);
});
