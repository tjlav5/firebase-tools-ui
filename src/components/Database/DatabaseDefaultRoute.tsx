/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { AppState } from '../../store';

export interface PropsFromState {
  projectId?: string;
}

export type Props = PropsFromState;

export const DatabaseDefaultRoute: React.FC<Props> = ({ projectId }) => {
  if (!projectId) {
    return <div>Loading</div>;
  }
  // Default to the namespace named after the project id.
  return <Redirect to={`/database/${projectId}/data`} />;
};

export const mapStateToProps = ({ config }: AppState) => ({
  projectId: config.config ? config.config.projectId : undefined,
});

export default connect(mapStateToProps)(DatabaseDefaultRoute);