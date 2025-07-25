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
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['packages/*/vitest.config.ts'],
    // use GitHub action reporters when running in CI
    reporters: process.env.GITHUB_ACTIONS?['github-actions', 'default']:['default'],
    coverage: {
      excludeAfterRemap: true,
      provider: 'v8',
      exclude: ['**/coverage/**'],
      reporter: process.env.GITHUB_ACTIONS ? ['html'] : ['text','lcov'],
    },
  },
});