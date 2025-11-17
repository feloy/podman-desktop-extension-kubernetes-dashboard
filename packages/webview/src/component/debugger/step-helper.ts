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

import type { DebuggerStep, DebuggerStepResource } from '@kubernetes-dashboard/channels';
import type { CoreV1Event, KubernetesObject } from '@kubernetes/client-node';

export interface DebuggerStepBaseUI {
  index: number;
  selected: boolean;
  name: string;
  kind: string;
}
export interface DebuggerStepResourceUI extends DebuggerStepBaseUI {
  type: 'update' | 'delete' | 'add';
  object: KubernetesObject;
  previous?: KubernetesObject;
  yamlObject: string;
  yamlPrevious: string;
}

export interface DebuggerStepEventUI extends DebuggerStepBaseUI {
  type: 'event-add' | 'event-update' | 'event-delete';
  event: CoreV1Event;
  object: KubernetesObject;
}

export type DebuggerStepUI = DebuggerStepResourceUI | DebuggerStepEventUI;

export class DebuggerStepHelper {
  isResourceStep(stepInfo: DebuggerStep): stepInfo is DebuggerStepResource {
    return ['update', 'delete', 'add'].includes(stepInfo.type);
  }

  isResourceStepUI(stepInfoUI: DebuggerStepUI): stepInfoUI is DebuggerStepResourceUI {
    return stepInfoUI.type === 'update' || stepInfoUI.type === 'delete' || stepInfoUI.type === 'add';
  }

  DebuggerStepUI(step: DebuggerStep, index: number): DebuggerStepUI | undefined {
    if (this.isResourceStep(step)) {
      return {
        index,
        selected: false,
        name: step.object.metadata?.name ?? '',
        kind: step.object.kind ?? 'unknown',
        type: step.type,
        object: step.object,
        previous: step.previous,
        yamlObject: step.yamlObject,
        yamlPrevious: step.yamlPrevious,
      };
    } else {
      return {
        index,
        selected: false,
        name: step.object.metadata?.name ?? '',
        kind: step.object.kind ?? 'unknown',
        type: step.type,
        event: step.event,
        object: step.object,
      };
    }
  }
}
