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

import type { CoreV1Event, KubernetesObject, V1ManagedFieldsEntry } from '@kubernetes/client-node';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

export function getAgeAndCount(event: CoreV1Event): string {
  if ((event.count ?? 0) > 1) {
    return `${event.count}x over ${humanizeDuration(moment().diff(event.firstTimestamp), { round: true, largest: 1 })}`;
  }
  return '';
}

export function getNewManagedFields(object: KubernetesObject, previous?: KubernetesObject): V1ManagedFieldsEntry[] {
  let newEntries: V1ManagedFieldsEntry[] = [];
  if (!previous) {
    newEntries = object.metadata?.managedFields ?? [];
  } else {
    newEntries =
      object.metadata?.managedFields?.filter(e => !previous.metadata?.managedFields?.some(e2 => entryEqual(e, e2))) ??
      [];
  }
  return newEntries;
}

function entryEqual(e1: V1ManagedFieldsEntry, e2: V1ManagedFieldsEntry): boolean {
  return (
    e1.operation === e2.operation &&
    e1.manager === e2.manager &&
    e1.subresource === e2.subresource &&
    getDateString(e1.time) === getDateString(e2.time)
  );
}

function getDateString(date: unknown): string {
  if (date instanceof Date) {
    return date.toISOString().replace('.000Z', 'Z');
  }
  return date?.toString() ?? '';
}
