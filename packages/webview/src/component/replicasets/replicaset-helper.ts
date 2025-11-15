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
import type { ReplicaSetUI } from './ReplicasetUI';

export class ReplicaSetHelper {
  getReplicaSetUI(replicaSet: V1ReplicaSet): ReplicaSetUI {
    // Conditions (retrieving and sorting)
    // Status
    let status = 'STOPPED';
    if (replicaSet.status?.readyReplicas && replicaSet.status?.readyReplicas > 0) {
      if (replicaSet.status?.replicas === replicaSet.status?.readyReplicas) {
        status = 'RUNNING';
      } else {
        status = 'DEGRADED';
      }
    }

    return {
      kind: 'ReplicaSet',
      uid: replicaSet.metadata?.uid ?? '',
      name: replicaSet.metadata?.name ?? '',
      status: status,
      namespace: replicaSet.metadata?.namespace ?? '',
      created: replicaSet.metadata?.creationTimestamp,
      // number of replicas
      replicas: replicaSet.status?.replicas ?? 0,
      // ready pods
      ready: replicaSet.status?.readyReplicas ?? 0,
      selected: false,
    };
  }
}
