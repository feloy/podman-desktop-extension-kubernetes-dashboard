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
import type { V1ManagedFieldsEntry, KubernetesObject } from '@kubernetes/client-node';

export function getManagedField(object: KubernetesObject, previous?: KubernetesObject): string {
  let newEntries: V1ManagedFieldsEntry[] = [];
  if (!previous) {
    newEntries = object.metadata?.managedFields ?? [];
  } else {
    newEntries =
      object.metadata?.managedFields?.filter(e => !previous.metadata?.managedFields?.some(e2 => entryEqual(e, e2))) ??
      [];
  }
  const label: (op: V1ManagedFieldsEntry) => string = op => {
    const subResource = op.subresource ? ` ${op.subresource}` : '';
    return `${op.operation}${subResource} from ${op.manager}`;
  };
  return newEntries.map(label).join(', ') ?? '';
}

function getDateString(date: unknown): string {
  if (date instanceof Date) {
    return date.toISOString().replace('.000Z', 'Z');
  }
  return date?.toString() ?? '';
}

function entryEqual(e1: V1ManagedFieldsEntry, e2: V1ManagedFieldsEntry): boolean {
  return (
    e1.operation === e2.operation &&
    e1.manager === e2.manager &&
    e1.subresource === e2.subresource &&
    getDateString(e1.time) === getDateString(e2.time)
  );
}
