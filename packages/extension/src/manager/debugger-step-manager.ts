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

import type { CoreV1Event, KubernetesObject } from '@kubernetes/client-node';
import type { ResourceInformer, StepEvent } from '/@/types/resource-informer';
import type { Details } from '/@/registry/context-resource-registry';
import type { DebuggerStep, DebuggerStepEvent, DebuggerStepResource } from '@kubernetes-dashboard/channels';
import * as jsYaml from 'js-yaml';

export class DebuggerStepManager {
  #steps: DebuggerStep[] = [];

  resetSteps(): void {
    this.#steps = [];
  }

  getSteps(): DebuggerStep[] {
    return this.#steps;
  }

  shiftStep(): DebuggerStep | undefined {
    return this.#steps.shift();
  }

  receivedStep(informer: Details<ResourceInformer<KubernetesObject>>, event: StepEvent): void {
    if (informer.resourceName === 'events') {
      if (['add', 'update'].includes(event.type)) {
        this.#steps.push(this.stepEventToDebuggerStepEvent(informer.resourceName, event));
      }
    } else {
      this.#steps.push(this.stepEventToDebuggerStepResource(informer, event));
    }
  }

  protected stepEventToDebuggerStepEvent(resourceName: string, event: StepEvent): DebuggerStepEvent {
    const eventObject = event.object as CoreV1Event;
    return {
      type: `event-${event.type}`,
      resourceName: resourceName,
      object: {
        kind: eventObject.involvedObject.kind,
        apiVersion: eventObject.involvedObject.apiVersion,
        metadata: {
          name: eventObject.involvedObject.name,
          namespace: eventObject.involvedObject.namespace,
          uid: eventObject.involvedObject.uid,
          resourceVersion: eventObject.involvedObject.resourceVersion,
        },
      },
      event: eventObject,
    };
  }

  protected diffableObject(object: KubernetesObject): KubernetesObject {
    return {
      ...object,
      metadata: {
        ...object?.metadata,
        managedFields: undefined,
        generation: undefined,
        resourceVersion: undefined,
        creationTimestamp: undefined, // time format changes from time to time (bug in library?)
      },
    };
  }

  protected stepEventToDebuggerStepResource(
    informer: Details<ResourceInformer<KubernetesObject>>,
    event: StepEvent,
  ): DebuggerStepResource {
    const previousObject = event.type === 'add' ? undefined : this.getPreviousObject(informer, event.object);
    const objectNoManagedFields = this.diffableObject(event.object);
    const previousObjectNoManagedFields = previousObject ? this.diffableObject(previousObject) : undefined;
    const yamlObject = jsYaml.dump(objectNoManagedFields, { sortKeys: true });
    const yamlPrevious = jsYaml.dump(previousObjectNoManagedFields, { sortKeys: true });
    return {
      ...event,
      previous: previousObject,
      resourceName: informer.resourceName,
      yamlObject,
      yamlPrevious,
    };
  }

  protected getPreviousObject(
    informer: Details<ResourceInformer<KubernetesObject>>,
    object: KubernetesObject,
  ): KubernetesObject | undefined {
    if (object.metadata?.name === undefined) {
      return undefined;
    }
    for (let index = this.#steps.length - 1; index >= 0; index--) {
      const step = this.#steps[index];
      if (
        step.resourceName === informer.resourceName &&
        step.object.metadata?.name === object.metadata.name &&
        step.object.metadata?.namespace === object.metadata.namespace
      ) {
        return step.object;
      }
    }
    return informer.value.getCache()?.get(object.metadata.name, object.metadata.namespace);
  }
}
