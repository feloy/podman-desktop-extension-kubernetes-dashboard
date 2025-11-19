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

import type { V1CustomResourceDefinition, V1CustomResourceDefinitionList } from '@kubernetes/client-node';
import type { KubeConfigSingleContext } from '/@/types/kubeconfig-single-context.js';
import type { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryBase } from './resource-factory.js';
import { ResourceInformer } from '/@/types/resource-informer.js';
import { ObjectApiextensionsV1Api } from '@kubernetes/client-node/dist/gen/types/ObjectParamAPI.js';

export class CRDResourceFactory extends ResourceFactoryBase implements ResourceFactory {
  constructor() {
    super({
      resource: 'customresourcedefinitions',
      kind: 'CustomResourceDefinition',
    });

    this.setPermissions({
      isNamespaced: false,
      permissionsRequests: [
        {
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        {
          verb: 'watch',
          group: 'apiextensions.k8s.io',
          version: 'v1',
          resource: 'customresourcedefinitions',
        },
      ],
    });
    this.setInformer({
      createInformer: this.createInformer.bind(this),
    });
  }

  createInformer(kubeconfig: KubeConfigSingleContext): ResourceInformer<V1CustomResourceDefinition> {
    const apiClient = kubeconfig.getKubeConfig().makeApiClient(ObjectApiextensionsV1Api);
    const listFn = (): Promise<V1CustomResourceDefinitionList> => apiClient.listCustomResourceDefinition();
    const path = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
    return new ResourceInformer<V1CustomResourceDefinition>({
      kubeconfig,
      path,
      listFn,
      kind: this.kind,
      plural: 'customresourcedefinitions',
    });
  }
}
