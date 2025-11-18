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

import type { KubernetesListObject, KubernetesObject, V1Status } from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';

import type { KubeConfigSingleContext } from '/@/types/kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceInformer } from '/@/types/resource-informer.js';

export interface CRDDefinition {
  isNamespaced: boolean;
  group: string;
  version: string;
  plural: string;
  kind: string;
}

export class CustomResourceFactory extends ResourceFactoryBase implements ResourceFactory {
  constructor(private readonly definition: CRDDefinition) {
    super({
      resource: definition.plural,
      kind: definition.kind,
    });

    this.setPermissions({
      isNamespaced: definition.isNamespaced,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          group: definition.group,
          version: definition.version,
          resource: definition.plural,
          verb: 'watch',
        },
      ],
    });
    this.setInformer({
      createInformer: this.createInformer.bind(this),
    });
    this.setDeleteObject(this.deleteCustomResource);
  }

  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<KubernetesObject> {
    const namespace = kubeconfig.getNamespace();
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(CustomObjectsApi);
    let listFn: () => Promise<KubernetesListObject<KubernetesObject>>;
    let path: string;
    if (this.definition.isNamespaced) {
      listFn = (): Promise<KubernetesListObject<KubernetesObject>> =>
        apiClient.listNamespacedCustomObject({
          group: this.definition.group,
          version: this.definition.version,
          plural: this.definition.plural,
          namespace,
        });
      path = `/apis/${this.definition.group}/${this.definition.version}/namespaces/${namespace}/${this.definition.plural}`;
    } else {
      listFn = (): Promise<KubernetesListObject<KubernetesObject>> =>
        apiClient.listClusterCustomObject({
          group: this.definition.group,
          version: this.definition.version,
          plural: this.definition.plural,
        });
      path = `/apis/${this.definition.group}/${this.definition.version}/${this.definition.plural}`;
    }
    return new ResourceInformer<KubernetesObject>({
      kubeconfig,
      path,
      listFn,
      kind: this.definition.kind,
      plural: this.definition.plural,
    });
  }

  deleteCustomResource(
    kubeconfig: KubeConfigSingleContext,
    name: string,
    namespace: string,
  ): Promise<V1Status | KubernetesObject> {
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(CustomObjectsApi);
    if (this.definition.isNamespaced) {
      return apiClient.deleteNamespacedCustomObject({
        group: this.definition.group,
        version: this.definition.version,
        plural: this.definition.plural,
        name,
        namespace,
      });
    } else {
      return apiClient.deleteClusterCustomObject({
        group: this.definition.group,
        version: this.definition.version,
        plural: this.definition.plural,
        name,
      });
    }
  }
}
