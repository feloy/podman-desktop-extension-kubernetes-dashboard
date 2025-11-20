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

import type { ConfigurationCustomResource, ContextResourceItems } from '@kubernetes-dashboard/channels';
import type { KubernetesObjectUI } from '/@/component/objects/KubernetesObjectUI';
import type {
  V1CustomResourceColumnDefinition,
  V1CustomResourceDefinition,
  V1ObjectMeta,
} from '@kubernetes/client-node';

export interface KubernetesObjectUICustomResource extends KubernetesObjectUI {
  metadata: V1ObjectMeta;
  spec: Record<string, unknown>;
  statusOriginal: Record<string, unknown>;
  namespace?: string;
}

export function getPrinterColumns(
  crdResources: ContextResourceItems,
  ccr: ConfigurationCustomResource,
): V1CustomResourceColumnDefinition[] | undefined {
  const crd = crdResources.items.find(
    item => item.metadata?.name === `${ccr.plural}.${ccr.group}`,
  ) as V1CustomResourceDefinition;
  if (!crd) {
    return;
  }
  return crd.spec.versions.find(version => version.name === ccr.version)?.additionalPrinterColumns;
}
